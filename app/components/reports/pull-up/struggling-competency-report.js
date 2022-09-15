import Ember from 'ember';
import {
  CONTENT_TYPES,
  SUGGESTION_FILTER_BY_CONTENT_TYPES
} from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  //--------------------------------------------------------
  //Attributes
  classNames: ['pull-up', 'struggling-competency-report'],

  //--------------------------------------------------------
  //Dependencies
  session: Ember.inject.service('session'),

  /**
   * @property {service} searchService
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

  /**
   * Struggling compentency service
   */
  strugglingCompetencyService: Ember.inject.service(
    'api-sdk/struggling-competency'
  ),

  /**
   * @requires service:api-sdk/search
   */
  suggestService: Ember.inject.service('api-sdk/suggest'),

  //--------------------------------------------------------
  // Properties

  /**
   * @property {String} classId
   */
  classId: Ember.computed.alias('class.id'),

  /**
   * @property {Object} selectedCompetency
   * property hold selected competency
   */
  selectedCompetency: null,

  /**
   * @property {Array} studentsPerformanceList
   * property hold student performance list
   */
  studentsPerformanceList: [],

  /**
   * @property {Array} studentsPerformanceList
   * property hold student count exceed max 5
   */
  studentsCount: 0,

  /**
   * @property {Array} collectionContents
   * property hold collection based on competency code
   */
  collectionContents: [],

  /**
   * @property {Array} menuItems
   * property hold menu list that are showing in dropdown
   */
  menuItems: [],

  /**
   * @property {Object} selectedMenuItem
   * property hold selected menu item
   */
  selectedMenuItem: null,

  /**
   * @property {Array} libraries
   * property hold the library content
   */
  libraries: [],

  /**
   * @property {Boolean} showTenantLibraries
   * property used to show library list in competency pullup
   */
  showTenantLibraries: false,

  /**
   * @property {Boolean} showLibraryCollection
   * property used to show library collection list in competency pullup
   */
  showLibraryCollection: false,

  /**
   * @property {Object} selectedLibrary
   */
  selectedLibrary: null,

  /**
   * @property {boolean} showSuggestConfirmation
   */
  showSuggestConfirmation: false,

  /**
   * @property {Object} suggestedCollection
   */
  suggestedCollection: null,
  /**
   * Maintains the current page number of search
   * @type {Number}
   */
  startAt: 0,
  /**
   * Maintains the value of default search page size.
   * @type {Number}
   */
  pageSize: 5,

  /**
   * @property {Boolean} isShowMoreButton
   */
  isShowMoreButton: false,

  /**
   * @property {Boolean} isLoading
   */
  isLoading: true,
  /**
   * Allowed filter content types
   * @type {Array}
   */
  filterContentType: SUGGESTION_FILTER_BY_CONTENT_TYPES,
  /**
   * Maintains the state of active content type (collection/Assessment), default collection
   * @type {String}
   */
  activeContentType: 'collection',
  /**
   * Maintains the selected Filters result data
   * @type {Array}
   */
  selectedFilters: Ember.A([]),
  /**
   * Propery to hide the search box and selected Filters
   * @property {showLibraryFilter}
   */
  showLibraryFilter: false,
  /**
   * Propery to hide the selected Filters
   * @property {showSearchFilter}
   */
  showSearchFilter: false,

  /**
   * Maintains the when enter search box get data
   *  @type {String}
   */
  suggestionSearchText: '',
  /**
   * @property {Boolean} hasCollectionContent
   */
  hasCollectionContent: Ember.computed(
    'collectionContents.[]',
    'showLibraryCollection',
    'showTenantLibraries',
    'isLoading',

    function() {
      let showTenantLibraries = this.get('showTenantLibraries');
      let showLibraryCollection = this.get('showLibraryCollection');
      let isLoading = this.get('isLoading');
      let collectionContents = this.get('collectionContents');

      return (
        (!showTenantLibraries || showLibraryCollection) &&
        !collectionContents.length &&
        !isLoading
      );
    }
  ),
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

  /**
   * Maintains the value of popover position
   * @type {String}
   */
  tagPopoverDefaultPosition: 'bottom',

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  //-------------------------------------------------------
  //Actions
  actions: {
    //Action trigger when click student heading
    showStudentList() {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_SEARCH_STUDENT);
      component.$('.sc-student-dropdown-list-container').slideToggle(500);
    },

    // Action trigger when click close
    onClosePullUp(isCloseAll = false) {
      let component = this;
      component.set('isShowStrugglingCompetencyReport', false);
      component.$().slideUp({
        complete: function() {
          component.sendAction('closePullUp', isCloseAll);
        }
      });
    },
    /**
     * Action triggered when the user play collection
     * It'll open the player in new tab
     */
    onPlayCollection(collection) {
      const component = this;
      component.sendAction('onPreviewContent', collection);
    },

    /**
     * Action triggered when add collection to dca.
     * @param  {Object} collection
     */
    onAddContentToDCA(collection) {
      const component = this;
      let studentList = component.get('studentsPerformanceList');
      component.sendAction('onAddContentToDCA', collection, studentList);
    },

    /**
     * Action get triggered when schedule content to CA got clicked
     */
    onScheduleContentToDCA(content) {
      let studentList = this.get('studentsPerformanceList');
      this.sendAction('onScheduleContentToDCA', content, studentList);
    },

    /*
     * Action triggered when click search dropdown from competency pullup
     */
    onSelectDropdown(component = this) {
      component.$('.search-filter-container-list').slideToggle(500);
    },
    /**
     * Evengt get triggered when filter by content type menu is selected
     * @param  {String} contentType
     */
    onSelectFilterBy(contentType) {
      this.set('activeContentType', contentType);
      this.set('collectionContents', []);
      this.set('startAt', 0);
      this.set('isLoading', true);
      this.fetchSuggestedCollection();

      if (contentType === 'collection') {
        if (this.get('itemLabel') === 'common.suggested') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_COLLECTION
          );
        } else if (this.get('itemLabel') === 'common.myContent') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_MYCONTENT_COLLECTION
          );
        } else if (this.get('itemLabel') === 'common.gooru-catalog') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_GOORU_CATALOG_COLLECTION
          );
        }
      } else if (contentType === 'assessment') {
        if (this.get('itemLabel') === 'common.suggested') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_ASSESSMENT
          );
        } else if (this.get('itemLabel') === 'common.myContent') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_MYCONTENT_ASSESSMENT
          );
        } else if (this.get('itemLabel') === 'common.gooru-catalog') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_GOORU_CATALOG_ASSESSMENT
          );
        }
      }
    },

    /**
     * Action triggered when click menu list from dropdown
     */
    onSelectMenuItems(item) {
      const component = this;
      component.set('collectionContents', []);
      let preSelectedMenu = component
        .get('menuItems')
        .findBy('isSelected', true);
      if (preSelectedMenu) {
        preSelectedMenu.set('isSelected', false);
      }
      item.set('isSelected', true);
      component.set('showTenantLibraries', false);
      component.set('selectedMenuItem', item);
      component.set('startAt', 0);
      component.set('isShowMoreButton', false);
      component.set('isLoading', true);
      component.set('showLibraryCollection', false);
      component.actions.onSelectDropdown(component);
      component.fetchSuggestedCollection();
      component.set('showLibraryFilter', false);
      component.set('itemLabel', item.label);

      if (item.label === 'common.tenantLibrary') {
        component.set('showContentTypeFilter', true);
      } else if (
        item.label === 'common.gooru-catalog' ||
        item.label === 'common.myContent' ||
        item.label === 'common.suggested'
      ) {
        component.set('showContentTypeFilter', false);
      }
      if (
        item.label === 'common.gooru-catalog' ||
        item.label === 'common.myContent'
      ) {
        component.set('showSearchFilter', true);
      } else if (
        item.label === 'common.tenantLibrary' ||
        item.label === 'common.suggested'
      ) {
        component.set('showSearchFilter', false);
      }

      if (item.label === 'common.suggested') {
        if (this.get('activeContentType') === 'collection') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_COLLECTION
          );
        } else {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_ASSESSMENT
          );
        }
      } else if (item.label === 'common.tenantLibrary') {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_GROWTH_TENANT_LIBRARY
        );
      } else if (item.label === 'common.myContent') {
        if (this.get('activeContentType') === 'collection') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_MYCONTENT_COLLECTION
          );
        } else {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_MYCONTENT_ASSESSMENT
          );
        }
      } else if (item.label === 'common.gooru-catalog') {
        if (this.get('activeContentType') === 'collection') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_GOORU_CATALOG_COLLECTION
          );
        } else {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_GROWTH_GOORU_CATALOG_ASSESSMENT
          );
        }
      }
    },

    // Action triggered when click on library
    onSelectLibrary(library) {
      let component = this;
      component.set('selectedLibrary', library);
      component.set('showLibraryCollection', true);
      component.set('showTenantLibraries', false);
      component.set('showLibraryFilter', true);
      component.set('isLoading', true);
      component.set('showContentTypeFilter', false);
      component.fetchSuggestedCollection();
    },

    // Action triggered when click on back button in library
    backToLibrary() {
      this.set('showLibraryCollection', false);
      this.set('startAt', 0);
      this.set('isShowMoreButton', false);
      this.set('showContentTypeFilter', true);
      this.set('showSearchFilter', false);
      this.set('showLibraryFilter', false);
    },

    // Action call when click suggestion button
    onSuggestContent(collection) {
      this.set('suggestedCollection', collection);
      this.set('showSuggestConfirmation', true);
    },
    // Action trigger when click cancel button in suggest
    onCancelSuggest() {
      const component = this;
      component.set('showSuggestConfirmation', false);
    },

    // Action trigger when click confirm button in suggest pullup
    onConfirmSuggest() {
      const component = this;
      const collection = component.get('suggestedCollection');
      const competencyCode = component.get('selectedCompetency.code')
        ? component.get('selectedCompetency.code')
        : component.get('selectedCompetency.competencyCode');
      component.set('showSuggestConfirmation', false);
      collection.set('isSuggested', true);
      let studentList = component.get('studentsPerformanceList');
      if (studentList.length) {
        studentList.map(student => {
          component.suggestContent(
            student.get('id') ? student.get('id') : student.get('userId'),
            collection,
            component.get('activeContentType'),
            competencyCode
          );
        });
      }
    },

    // Action trigger when click show more on competency pull up
    onShowMore() {
      let component = this;
      component.set('isLoading', true);
      component.fetchSuggestedCollection();
    },
    /**
     * Action get triggered when filter button is clicked
     */
    toggleSearchFilter() {
      let component = this;
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_GROWTH_SUGGESTION_FILTER
      );
      component.toggleProperty('isShow');
    },
    /**
     * Action get triggered when search button is clicked
     */
    doSearch() {
      const component = this;
      component.set('startAt', 0);
      component.set('collectionContents', []);
      component.fetchSuggestedCollection();
    },
    /**
     * Action get triggered when search icon is clicked
     */
    suggestSearchFilter() {
      const component = this;
      component.set('startAt', 0);
      let term = component.getSearchTerm();
      if (term.length > 0) {
        component.set('collectionContents', []);
        component.fetchSuggestedCollection();
      }
    },
    /**
     * Action get triggered when enter the search box
     */
    filterSearch() {
      const component = this;
      component.set('startAt', 0);
      let term = component.getSearchTerm();
      if (term.length > 0) {
        component.set('collectionContents', []);
        component.fetchSuggestedCollection();
      }
    },
    /**
     * Action get triggered when clear button is clicked
     */
    clearFilter(item) {
      const component = this;
      if (item.get('filter') === 'flt.standard') {
        component.set('unCheckedItem', item);
      }
      component.get('selectedFilters').removeObject(item);
      component.send('doSearch');
    }
  },

  //---------------------------------------------------------------------
  // Hooks
  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    let component = this;
    if (component.get('selectedCompetency')) {
      component.set('collectionContents', []);
      component.set('isShowMoreButton', false);
      let selectedCompetency = component.get('selectedCompetency');
      component.fetchStudentsPerfomance(selectedCompetency);
      component.fetchSuggestedCollection();
      component.openPullUp();
      component.createMenuItems();
    }
    component.set('activeContentType', 'collection');
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    component.setupTooltip();
  },

  //---------------------------------------------------------------------
  // Method
  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().slideDown();
  },

  /**
   * @function createMenuItems
   * Method used to create menu list that are show in dropdown
   */
  createMenuItems() {
    let component = this;
    let menuList = Ember.A([
      Ember.Object.create({
        label: 'common.gooru-catalog'
      }),
      Ember.Object.create({
        label: 'common.myContent'
      }),
      Ember.Object.create({
        label: 'common.tenantLibrary'
      }),
      Ember.Object.create({
        label: 'common.suggested',
        isSelected: true
      })
    ]);
    component.set('selectedMenuItem', menuList.findBy('isSelected', true));
    component.set('menuItems', menuList);
  },

  /**
   * @function fetchStudentsPerfomance
   * Method used to fetch student performance
   */
  fetchStudentsPerfomance(selectedCompetency) {
    let component = this;
    let studentPerformance = component.get('studentsPerformanceList');
    let params = {
      competency: selectedCompetency.get('code'),
      classId: component.get('classId'),
      month: moment().format('MM'),
      year: moment().format('YYYY')
    };
    Ember.RSVP.hash({
      studentsPerfomance: component
        .get('strugglingCompetencyService')
        .fetchStudentsPerfomance(params)
    }).then(({ studentsPerfomance }) => {
      if (studentsPerfomance.length) {
        component.set('studentsPerformanceList', studentsPerfomance);
      } else {
        component.set('studentsPerformanceList', studentPerformance);
      }

      let isMobile = window.matchMedia('only screen and (max-width: 768px)');
      let profileCount = isMobile.matches ? 5 : 9;
      component.set('profileCount', profileCount);
      if (studentsPerfomance.length > profileCount) {
        component.set(
          'studentsCount',
          studentsPerfomance.length - profileCount
        );
      }
    });
  },

  /**
   * @function fetchSuggestedCollection
   * Method used to fetch suggested collections
   */
  fetchSuggestedCollection() {
    let component = this;
    Ember.RSVP.hash({
      collections: component.getSearchServiceByType()
    }).then(({ collections }) => {
      if (!component.isDestoryed) {
        let collectionContents = component.get('collectionContents');
        let collectionList = collections;
        component.set('isShowMoreButton', false);
        if (collectionList.length) {
          let startAt = component.get('startAt');
          component.set('startAt', startAt + 1);
          if (
            collectionList.length === 5 &&
            component.get('selectedMenuItem').label !== 'common.suggested'
          ) {
            component.set('isShowMoreButton', true);
          }
          collectionList.map(collection => {
            collectionContents.pushObject(collection);
          });
        }
        component.set('isLoading', false);
      }
    });
  },
  /**
   * @function loadTenantLibraries
   * Method used to load library
   */
  loadTenantLibraries() {
    const component = this;
    component
      .get('libraryService')
      .fetchLibraries()
      .then(libraries => {
        if (!component.isDestoryed) {
          component.set('isLoading', false);
          component.set('libraries', libraries);
        }
      });
  },

  /**
   * @function suggestContent
   * Method used to post suggest content
   */
  suggestContent(userId, collection, collectionType, competencyCode) {
    const component = this;
    let contextParams = {
      user_id: userId,
      class_id: component.get('classId'),
      suggested_content_id: collection.get('id'),
      suggestion_origin: 'teacher',
      suggestion_originator_id: component.get('session.userId'),
      suggestion_criteria: 'performance',
      suggested_content_type: collectionType,
      suggested_to: 'student',
      suggestion_area: 'proficiency',
      tx_code: competencyCode,
      tx_code_type: 'competency'
    };
    component.get('suggestService').suggestContent(contextParams);
  },
  /**
   * Method is used to get search text
   */
  getSearchTerm() {
    let component = this;
    let searchText = component.get('suggestionSearchText');
    return searchText;
  },
  /**
   * @function getSearchServiceByType
   * Method used to show collection or assessment data based on filter
   */
  getSearchServiceByType(defaultparams = null) {
    let component = this;
    let item = component.get('selectedMenuItem');
    let params = defaultparams ? defaultparams : component.getSearchParams();
    let isDefaultShowFW = component.get('isDefaultShowFW');
    let classFramework = component.get('classFramework');
    params.classFramework = classFramework;
    params.isDefaultShowFW = isDefaultShowFW;
    let selectedService = Ember.RSVP.resolve([]);
    if (!item || item.label === 'common.suggested') {
      let term = component.getSearchTerm() ? component.getSearchTerm() : '*';
      let actionKey;
      if (component.get('activeContentType') === 'assessment') {
        actionKey = 'searchAssessments';
      } else {
        actionKey = 'searchCollections';
      }
      selectedService = component
        .get('searchService')
        .searchCollectionsOpenAllKey(actionKey, params, term, null, true);
    } else if (item.label === 'common.gooru-catalog') {
      params.filters.scopeKey = 'open-all';
      selectedService = component.getFiltersDetails(params);
    } else if (item.label === 'common.myContent') {
      params.filters.scopeKey = 'my-content';
      params.filters['flt.publishStatus'] = 'published,unpublished';
      selectedService = component.getFiltersDetails(params);
    } else if (item.label === 'common.tenantLibrary') {
      if (component.get('showTenantLibraries')) {
        params.filters.scopeKey = 'open-library';
        params.filters['flt.publishStatus'] = 'published,unpublished';
        params.filters.scopeTargetNames = component.get(
          'selectedLibrary.shortName'
        );
        selectedService = component.getFiltersDetails(params);
      } else {
        component.loadTenantLibraries();
        component.set('showTenantLibraries', true);
      }
    }
    return selectedService;
  },
  /**
   * Method is used to show return search params with filter data
   */
  getFiltersDetails(params) {
    let component = this;
    let activeContentType = component.get('activeContentType');
    let term = component.getSearchTerm() ? component.getSearchTerm() : '*';
    if (activeContentType === CONTENT_TYPES.COLLECTION) {
      return component.get('searchService').searchCollections(term, params);
    } else if (activeContentType === CONTENT_TYPES.ASSESSMENT) {
      return component.get('searchService').searchAssessments(term, params);
    }
  },
  /**
   * Method is used to get search params
   */
  getSearchParams() {
    let component = this;
    let competencyCode = component.get('selectedCompetency.code')
      ? component.get('selectedCompetency.code')
      : component.get('selectedCompetency.competencyCode');
    let params = {
      taxonomies: null,
      page: component.get('startAt'),
      pageSize: component.get('pageSize')
    };
    let filters = component.filterBuilder();
    filters['flt.relatedGutCode'] = competencyCode;

    let term = component.getSearchTerm();
    let label = component.get('selectedMenuItem.label');
    if (label === 'common.myContent') {
      filters.scopeKey = 'my-content';
      filters['flt.publishStatus'] = 'published,unpublished';
    } else if (label === 'common.tenantLibrary') {
      filters.scopeKey = 'open-library';
      filters.scopeTargetNames = component.get(
        'selectedTenantLibrary.shortName'
      );
      filters['flt.publishStatus'] = 'published,unpublished';
    } else {
      filters.scopeKey = 'open-all';
      filters['flt.publishStatus'] = 'published';
    }

    let primaryLanguage = component.get('class.primaryLanguage');

    if (primaryLanguage) {
      filters['flt.languageId'] = primaryLanguage;
    }

    let subject = component.get('course.subject');
    let competencyData = component.get('competencyData');
    let tags = component.get('tags');
    let taxonomies = null;
    if (tags) {
      taxonomies = tags.map(tag => {
        return tag.data.id;
      });
    }
    params.taxonomies =
      taxonomies != null && taxonomies.length > 0 ? taxonomies : null;
    let gutCode = competencyData ? competencyData.get('competencyCode') : null;
    if (!component.get('selectedFilters').length && !term) {
      if (subject) {
        filters['flt.subject'] = subject;
      }

      if (gutCode) {
        filters['flt.gutCode'] = gutCode;
      }
    }
    params.filters = filters;
    return params;
  },
  /**
   * Method is used to build the filters
   */
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
  /**
   * Method is used to filter out selected items
   */
  filterSelectedItems(keyField, keyValue) {
    const component = this;
    let filterList = component
      .get('selectedFilters')
      .filterBy(keyField, keyValue);
    let keyName = keyValue === 'flt.standard' ? 'id' : 'name';
    return component.toArray(filterList, keyName);
  },
  /**
   * Method is used to join values by comma seperator
   */
  toArray(filterList, key) {
    let params = filterList.map(filter => {
      return filter[key];
    });
    return params.length > 0 ? params.join(',') : null;
  },

  setupTooltip: function() {
    let component = this;
    let $anchor = this.$('.lo-content');
    let isMobile = window.matchMedia('only screen and (max-width: 768px)');
    let tagPopoverDefaultPosition = this.get('tagPopoverDefaultPosition');
    $anchor.attr('data-html', 'true');
    $anchor.popover({
      placement: tagPopoverDefaultPosition,
      content: function() {
        return component.$('.tag-tooltip').html();
      },
      trigger: 'manual',
      container: 'body'
    });

    if (isMobile.matches) {
      $anchor.on('click', function() {
        let $this = $(this);
        if (!$this.hasClass('list-open')) {
          // Close all tag tooltips by simulating a click on them
          $('.struggling-competency-report > .content.list-open').click();
          $this.addClass('list-open').popover('show');
        } else {
          $this.removeClass('list-open').popover('hide');
        }
      });
    } else {
      $anchor.on('mouseenter', function() {
        $(this).popover('show');
      });

      $anchor.on('mouseleave', function() {
        $(this).popover('hide');
      });
    }
  }
});
