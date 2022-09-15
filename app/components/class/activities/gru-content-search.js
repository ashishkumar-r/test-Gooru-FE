import Ember from 'ember';
import {
  CONTENT_TYPES,
  KEY_CODES,
  SCREEN_SIZES,
  CLASS_ACTIVITIES_SEARCH_TABS
} from 'gooru-web/config/config';
import { isCompatibleVW, getObjectsDeepCopy } from 'gooru-web/utils/utils';

import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  classNames: ['class-activities', 'gru-content-search'],

  /**
   * @requires service:api-sdk/search
   */
  searchService: Ember.inject.service('api-sdk/search'),

  /**
   * @type {ProfileService} Profile service object
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @type {libraryService} Library service object
   */
  libraryService: Ember.inject.service('api-sdk/library'),

  session: Ember.inject.service('session'),

  didInsertElement() {
    const component = this;
    // send API will trigger the action inside the component
    component.send(
      'onSelectContentSource',
      component
        .get('contentSources')
        .findBy('id', component.get('activeContentSource'))
    );
    component.searchHandler();
  },

  actions: {
    goBackToTenantLibraries() {
      this.set('isShowContentSelector', false);
      this.sendAction('goBackToTenantLibraries');
    },

    onClearSearch() {
      const component = this;
      component.set('contentSearchTerm', '');
      if (component.get('isSearchTermApplied')) {
        component.set('page', 0);
        component.loadContents(true);
        component.set('isSearchTermApplied', false);
      }
    },

    onSelectExternalActivity() {
      const component = this;
      component.sendAction('onSelectExternalActivity');
    },

    onSelectContentSource(contentSource) {
      const component = this;
      const contentSourceKey = contentSource.get('id');
      component.set('activeContentSource', contentSourceKey);
      component.set('page', 0); //Reset get contents offset
      let isShowContentSelector = true;
      let contentSearchTerm = component.get('contentSearchTerm');
      if (contentSourceKey === 'tenant-library') {
        isShowContentSelector = false;
        contentSearchTerm = null;
        component.loadTenantLibraries();
      } else if (
        contentSourceKey === 'my-content' ||
        contentSourceKey === 'gooru-catalog'
      ) {
        component.loadContents(true);
      } else {
        contentSearchTerm = null;
        isShowContentSelector = false;
        component.sendAction('onShowCourseMap');
      }
      component.set('contentSearchTerm', contentSearchTerm);
      component.set('isShowContentSelector', isShowContentSelector);
    },

    onSelectContentType(contentType) {
      const component = this;
      component.set('activeContentType', contentType.get('value'));
      component.set('page', 0);
      component.loadContents(true);
    },

    onClickFilterIcon() {
      const component = this;
      component.toggleProperty('isShowFilter');
      if (!component.get('isFilterLoaded')) {
        component.set('isFilterLoaded', true);
      }
    },

    onApplyFilter() {
      const component = this;
      component.set('page', 0);
      component.loadContents();
    },

    /**
     * Action get triggered when clear button is clicked
     */
    clearFilter(item) {
      const component = this;
      component.get('selectedFilters').removeObject(item);
      component.send('onApplyFilter');
      component.set('isShowFilter', false);
    },

    onTogglePanel() {
      this.sendAction('onTogglePanel');
    }
  },

  isShowContentSelector: true,

  isFilterEnabled: Ember.computed.alias(
    'configuration.GRU_FEATURE_FLAG.searchFilter'
  ),

  /**
   * @property {Boolean} isFilterLoaded
   * Property to check whether the filter component is loaded or not
   * Initially it will be loaded conditionally
   */
  isFilterLoaded: false,

  removedFilterItem: null,

  /**
   * @property {Boolean} isShowListView
   * Property to toggle between list/grid view
   */
  isShowListView: isCompatibleVW(SCREEN_SIZES.MEDIUM),

  /**
   * @property {Boolean} showAsDropdown
   * Property to show content sources as dropdown or not
   */
  showAsDropdown: isCompatibleVW(SCREEN_SIZES.XS_SMALL),

  /**
   * @property {Number} selectedFiltersLimit
   * Property to hold limit of selected filters to show
   */
  selectedFiltersLimit: Ember.computed('isShowListView', function() {
    return this.get('isShowListView') ? 1 : 2;
  }),

  /**
   * @property {Array} selectedFilters
   */
  selectedFilters: Ember.A([]),

  /**
   * @property {Observe} onSelectFilter
   */
  onSelectFilter: Ember.observer('selectedFilters.[]', function() {
    let component = this;
    let selectedFilters = component.get('selectedFilters');
    let selectedFiltersLimit = component.get('selectedFiltersLimit');
    if (selectedFilters.length < selectedFiltersLimit) {
      component.set('filters', selectedFilters);
    } else {
      component.set('filters', selectedFilters.slice(0, selectedFiltersLimit));
      component.set(
        'moreFilters',
        selectedFilters.slice(selectedFiltersLimit, selectedFilters.length)
      );
    }
  }),

  contentSearchTerm: '',

  activeContentType: 'collection',

  activeContentSource: Ember.computed(function() {
    return this.get('defaultContentSource') || 'gooru-catalog';
  }),

  contentTypes: Ember.computed(function() {
    return Ember.A([
      Ember.Object.create({
        label: 'Collection',
        value: CONTENT_TYPES.COLLECTION
      }),
      Ember.Object.create({
        label: 'Assessment',
        value: CONTENT_TYPES.ASSESSMENT
      }),
      Ember.Object.create({
        label: 'Offline Activity',
        value: CONTENT_TYPES.OFFLINE_ACTIVITY
      })
    ]);
  }),

  /**
   * TODO lesson plan replaced with course map until LP content get ready
   */

  contentSources: Ember.computed(function() {
    return getObjectsDeepCopy(CLASS_ACTIVITIES_SEARCH_TABS);
  }),

  page: 0,

  searchContentLimit: 20,

  /**
   * @property {Number} scrollEndHitCount
   * Property for the scroll paginated count
   */
  scrollEndHitCount: 0,

  observeLibraryChange: Ember.observer('activeTenantLibrary', function() {
    const component = this;
    component.set('isShowContentSelector', true);
    component.set('page', 0);
    component.fetchLibraryContentByType().then(function(libraryContents) {
      component.sendAction('onShowFilteredContents', libraryContents);
    });
  }),

  // Observe scroll hit end at parent
  observeScrollEndHits: Ember.observer('scrollEndHitCount', function() {
    const component = this;
    if (component.get('scrollEndHitCount')) {
      component.incrementProperty('page');
      component.loadContents();
    }
  }),

  loadContents(refreshContents = false) {
    const component = this;
    const activeContentSource = component.get('activeContentSource');
    let filteredContentPromise;
    if (
      activeContentSource === 'gooru-catalog' ||
      component.get('selectedFilters').length > 0 ||
      component.getSearchTerm()
    ) {
      filteredContentPromise = component.fetchCatalogContentByType();
    } else if (activeContentSource === 'tenant-library') {
      filteredContentPromise = component.fetchLibraryContentByType();
    } else {
      filteredContentPromise = component.fetchMyContentByType();
    }
    Ember.RSVP.hash({
      filteredContentList: filteredContentPromise
    }).then(({ filteredContentList }) => {
      component.sendAction(
        'onShowFilteredContents',
        filteredContentList,
        refreshContents
      );
    });
  },

  loadTenantLibraries() {
    const component = this;
    component
      .get('libraryService')
      .fetchLibraries()
      .then(tenantLibraries => {
        component.sendAction('onShowTenantLibraries', tenantLibraries);
      });
  },

  fetchCatalogContentByType() {
    let component = this;
    let activeContentType = component.get('activeContentType');
    let queryParams = component.getSearchRequestBody();
    let term = component.getSearchTerm() ? component.getSearchTerm() : '*';
    if (activeContentType === CONTENT_TYPES.COLLECTION) {
      return component
        .get('searchService')
        .searchCollections(term, queryParams);
    } else if (activeContentType === CONTENT_TYPES.ASSESSMENT) {
      return component
        .get('searchService')
        .searchAssessments(term, queryParams);
    } else {
      return component
        .get('searchService')
        .searchOfflineActivity(term, queryParams);
    }
  },

  fetchMyContentByType() {
    let component = this;
    let userId = component.get('session.userId');
    let activeContentType = component.get('activeContentType');
    let params = {
      page: component.get('page'),
      pageSize: component.get('searchContentLimit')
    };
    let term = component.getSearchTerm();
    if (term) {
      params.searchText = term;
    }
    if (activeContentType === CONTENT_TYPES.COLLECTION) {
      return component.get('profileService').readCollections(userId, params);
    } else if (activeContentType === CONTENT_TYPES.ASSESSMENT) {
      return component.get('profileService').readAssessments(userId, params);
    } else {
      return component
        .get('profileService')
        .readOfflineActivities(userId, params);
    }
  },

  fetchLibraryContentByType() {
    const component = this;
    const activeContentType = component.get('activeContentType');
    const activeTenantLibraryId = component.get('activeTenantLibrary.id');
    const pagination = {
      offset: component.get('page') * component.get('searchContentLimit'),
      pageSize: component.get('searchContentLimit')
    };
    return Ember.RSVP.hash({
      libraryData: component
        .get('libraryService')
        .fetchLibraryContent(
          activeTenantLibraryId,
          activeContentType,
          pagination
        )
    }).then(({ libraryData }) => {
      const libraryContents = libraryData.get('libraryContent');
      const contents =
        activeContentType === 'assessment'
          ? libraryContents.get('assessments')
          : activeContentType === 'collection'
            ? libraryContents.get('collections')
            : libraryContents.get('offline_activities');
      contents.map(content => {
        content.format = activeContentType;
      });
      return contents;
    });
  },

  getSearchTerm() {
    const component = this;
    const contentSearchTerm = component.get('contentSearchTerm');
    return contentSearchTerm;
  },

  searchHandler() {
    let component = this;
    component.$('#search-content').on('keyup', function(e) {
      const contentSearchTerm = component.get('contentSearchTerm');
      if (e.which === KEY_CODES.ENTER && contentSearchTerm.length >= 3) {
        component.set('page', 0);
        component.loadContents(true);
        component.set('isSearchTermApplied', true);
      }
    });

    component.$('.search-icon i.search').click(function() {
      const contentSearchTerm = component.get('contentSearchTerm');
      if (contentSearchTerm.length >= 3) {
        component.set('page', 0);
        component.loadContents(true);
        component.set('isSearchTermApplied', true);
      }
    });
  },

  getSearchRequestBody() {
    let component = this;
    let params = {
      taxonomies: null,
      page: component.get('page'),
      pageSize: component.get('searchContentLimit')
    };
    let filters = component.filterBuilder();
    let searchTerm = component.get('contentSearchTerm');
    const activeContentSource = component.get('activeContentSource');
    if (activeContentSource === 'my-content') {
      filters.scopeKey = 'my-content';
      filters['flt.publishStatus'] = 'published,unpublished';
    } else if (activeContentSource === 'tenant-library') {
      filters.scopeKey = 'open-library';
      filters.scopeTargetNames = component.get('activeTenantLibrary.shortName');
      filters['flt.publishStatus'] = 'published,unpublished';
    } else {
      filters.scopeKey = 'open-all';
      filters['flt.publishStatus'] = 'published';
    }
    let subject = component.get('course.subject');
    let competencyData = component.get('competencyData');
    let primaryLanguage = component.get('class.primaryLanguage');
    let gutCode = competencyData ? competencyData.get('competencyCode') : null;
    if (!component.get('selectedFilters').length && !searchTerm) {
      if (subject) {
        filters['flt.subject'] = subject;
      }

      if (gutCode) {
        filters['flt.gutCode'] = gutCode;
      }

      if (primaryLanguage) {
        filters['flt.languageId'] = primaryLanguage;
      }
    }
    params.filters = filters;
    return params;
  },

  filterBuilder() {
    const component = this;
    let filters = {};
    filters['flt.audience'] = component.filterSelectedItems(
      'filter',
      'flt.audience'
    );
    filters['flt.educationalUse'] = component.filterSelectedItems(
      'filter',
      'flt.educational'
    );
    filters['flt.language'] = component.filterSelectedItems(
      'filter',
      'flt.language'
    );
    filters['flt.audience'] = component.filterSelectedItems(
      'filter',
      'flt.audience'
    );
    filters['flt.standard'] = component.filterSelectedItems(
      'filter',
      'flt.standard'
    );
    filters['flt.creator'] = component.get('selectedFilters')['flt.authorName'];
    return filters;
  },

  filterSelectedItems(keyField, keyValue) {
    const component = this;
    let filterList = component
      .get('selectedFilters')
      .filterBy(keyField, keyValue);
    let keyName = keyValue === 'flt.standard' ? 'id' : 'name';
    return component.toArray(filterList, keyName);
  },

  toArray(filterList, key) {
    let params = filterList.map(filter => {
      return filter[key];
    });
    return params.length > 0 ? params.join(',') : null;
  }
});
