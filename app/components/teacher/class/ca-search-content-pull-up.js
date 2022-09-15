import Ember from 'ember';
import {
  SEARCH_FILTER_BY_CONTENT_TYPES,
  KEY_CODES,
  SCREEN_SIZES,
  PLAYER_EVENT_SOURCE,
  CONTENT_TYPES
} from 'gooru-web/config/config';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['backdrop-pull-ups', 'teacher-class-search-content-pull-up'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/search
   */
  searchService: Ember.inject.service('api-sdk/search'),

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @type {ProfileService} Profile service object
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @type {libraryService} Library service object
   */
  libraryService: Ember.inject.service('api-sdk/library'),

  setupComponent: Ember.on('didInsertElement', function() {
    $(
      '.ca-course-map-container, .search-list-container, .tenant-libraries'
    ).click(function() {
      $('.search-filter-container-list').removeClass('active');
    });
  }),
  /**
   * Session object of logged in user
   * @type {Object}
   */
  session: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * Maintains the state of active content type (C/A/R/Q), default collection
   * @type {String}
   */
  activeContentType: 'collection',

  /**
   * Allowed filter content types
   * @type {Array}
   */
  filterContentType: SEARCH_FILTER_BY_CONTENT_TYPES,

  /**
   * Maintains the search result data
   * @type {Array}
   */
  searchResults: Ember.A([]),

  /**
   * Maintains the state of data loading
   * @type {Boolean}
   */
  isLoading: false,

  /**
   * Maintains the context data
   * @type {Object}
   */
  context: null,

  showFilter: Ember.computed.alias(
    'configuration.GRU_FEATURE_FLAG.searchFilter'
  ),

  /**
   * Class Id extract from context
   * @type {String}
   */
  classId: Ember.computed.alias('context.classId'),

  /**
   * class Object extract from context
   * @type {String}
   */
  class: Ember.computed.alias('context.class'),

  /**
   * course Object extract from context
   * @type {String}
   */
  course: Ember.computed.alias('context.course'),

  /**
   * courseId Object extract from context
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed('collection.standards.[]', function() {
    let standards = this.get('collection.standards');
    if (standards) {
      standards = standards.filter(function(standard) {
        // Filter out learning targets (they're too long for the card)
        return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
      });
      return TaxonomyTag.getTaxonomyTags(standards);
    }
  }),

  /**
   * Maintains the state of selected  content type for search
   * @type {String}
   */
  selectedSearchContentType: 'collection',

  /**
   * Maintains the state of more data exists or not
   * @type {Boolean}
   */
  isMoreDataExists: false,

  /**
   * Maintains the current page number of search
   * @type {Number}
   */
  page: 0,

  /**
   * Maintains the value of default search page size.
   * @type {Number}
   */
  defaultSearchPageSize: 20,

  /**
   * Maintains the list of  menu items
   * @type {Array}
   */
  menuItems: Ember.computed('courseId', function() {
    let courseId = this.get('courseId');
    let menuItems = Ember.A([]);
    menuItems.pushObject(
      this.createMenuItem('catalog', 'common.gooru-catalog', true)
    );
    menuItems.pushObject(
      this.createMenuItem('myContent', 'common.myContent', false)
    );
    menuItems.pushObject(
      this.createMenuItem('tenantLibrary', 'common.tenantLibrary', false)
    );
    if (courseId) {
      menuItems.pushObject(
        this.createMenuItem('courseMap', 'common.course-map', false)
      );
    }
    return menuItems;
  }),

  /**
   * It will compute the selected menu item on changes of menu item selection or data change.
   * @type {String}
   */
  selectedMenuItem: Ember.computed('menuItems.@each.selected', function() {
    let menuItems = this.get('menuItems');
    return menuItems.findBy('selected', true);
  }),

  /**
   * Maintains the state of menu list visibility
   * @type {Boolean}
   */
  isMenuEnabled: false,

  /**
   * Maintains the list of added collection ids from today's class activities
   * @type {Object}
   */
  addedCollectionIdsInTodayClassActivities: Ember.computed(
    'todaysClassActivities',
    function() {
      let classActivities = this.get('todaysClassActivities');
      let collectionIds = Ember.A([]);
      if (classActivities) {
        collectionIds = classActivities.map(classActivity => {
          return classActivity.get('collection.id');
        });
      }
      return collectionIds;
    }
  ),

  /**
   * Maintains the list of search result set.
   * @type {Array}
   */
  searchResultSet: Ember.computed('searchResults.[]', function() {
    let searchResults = this.get('searchResults');
    let collectionIds = this.get('addedCollectionIdsInTodayClassActivities');
    collectionIds.forEach(id => {
      let result = searchResults.findBy('id', id);
      if (result) {
        result.set('isAdded', true);
      }
    });
    return searchResults;
  }),

  /**
   * @property {Object} competencyData
   * Property to hold selected competency data
   */
  competencyData: null,

  /**
   * @property {Boolean} isShowListView
   * Property to toggle between list/grid view
   */
  isShowListView: isCompatibleVW(SCREEN_SIZES.MEDIUM),

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
   * @property {Object} unCheckedItems
   * Property to hold unCheckedItems of taxonomy standards
   */
  unCheckedItem: null,

  isShow: false,

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
   * @property {Boolean} isClassPreferenceMapped
   */
  isClassPreferenceMapped: Ember.computed('classPreference', function() {
    let component = this;
    let classPreference = component.get('classPreference');
    return classPreference
      ? classPreference.subject && classPreference.framework
      : false;
  }),

  /**
   * @property {Boolean} isShowMoreEnabled
   */
  isShowMoreEnabled: true,

  /**
   * Maintains the value of currently selected menu name.
   * @return {String}
   */
  selectedMenuName: Ember.computed(
    'menuItems.[]',
    'menuItems.@each.selected',
    function() {
      let menuItem = this.get('menuItems').findBy('selected', true);
      return menuItem.get('key');
    }
  ),

  // -------------------------------------------------------------------------
  // actions

  actions: {
    goBackToTenantLibraries() {
      let component = this;
      component.set('showTenantLibraries', true);
      component.set('selectedTenantLibrary', null);
    },

    onSelectLibrary(library) {
      let component = this;
      component.set('selectedTenantLibrary', library);
      component.set('showTenantLibraries', false);
      component.loadData();
    },
    /**
     * Action triggered when the user click on close
     */
    onCloseDatePicker() {
      let component = this;
      component.sendAction('closeDatePicker');
    },

    /**
     * Action triggered when the user preview content
     */
    onPreviewContent(content) {
      this.sendAction('onPreviewContent', content);
    },
    /**
     * Action triggered when the user close the pull up.
     **/
    onPullUpClose() {
      this.closePullUp();
    },

    /**
     * Action get triggered when filter button is clicked
     */
    toggleSearchFilter() {
      let component = this;
      component.toggleProperty('isShow');
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
    },

    /**
     * Action get triggered when search button is clicked
     */
    doSearch() {
      const component = this;
      component.loadData();
    },

    /**
     * Event get triggered when filter by content type menu is selected
     * @param  {String} contentType
     */
    onSelectFilterBy(contentType) {
      this.set('activeContentType', contentType);
      this.loadData();
    },

    /**
     * Action get triggered when add content to DCA got clicked
     */
    onAddContentToDCA(content) {
      let component = this;
      let classId = component.get('classId');
      let contentType =
        content.get('format') || component.get('activeContentType');
      let contentId = content.get('id');
      let date = moment().format('YYYY-MM-DD');
      component
        .get('classActivityService')
        .addActivityToClass(classId, contentId, contentType, date)
        .then(newContentId => {
          let data = component.serializerSearchContent(
            content,
            newContentId,
            date
          );
          content.set('isAdded', true);
          let classSetting = this.get('class.setting'),
            allowMasteryAccrual = classSetting['mastery.applicable'];
          if (allowMasteryAccrual && allowMasteryAccrual === 'true') {
            component
              .get('classActivityService')
              .updateMasteryAccrualClassActivity(classId, newContentId, true)
              .then(() => {
                component.sendAction(
                  'addedContentToDCA',
                  data,
                  date,
                  null,
                  null,
                  true
                );
              });
          }
          component.sendAction('addedContentToDCA', data, date);
        });
    },

    /**
     * Action get triggered when schedule content  added to DCA
     */
    addedScheduleContentToDCA(content, newContentId, addedDate) {
      let component = this;
      let data = component.serializerSearchContent(
        content,
        newContentId,
        addedDate
      );
      component.sendAction('addedContentToDCA', data, addedDate);
    },

    /**
     * Toggle menu list based on the recent selection of the menu.
     */
    toggleMenuList() {
      this.toggleProperty('isMenuEnabled');
      return false;
    },

    /**
     * Choose the menu item
     */
    onChooseMenuItem(selectedItem) {
      let component = this;
      component.toggleMenuItem(selectedItem);
    },

    /**
     * It will takes care of content will schedule for the specific date.
     * @param  {String} scheduleDate
     */
    onScheduleDate(scheduleDate, scheduleEndDate) {
      let component = this;
      let classId = component.get('classId');
      let contentType =
        component.get('selectedContentForSchedule.format') ||
        component.get('activeContentType');
      let contentId = component.get('selectedContentForSchedule.id');
      let content = component.get('selectedContentForSchedule');
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      datepickerEle.hide();
      let forMonth = moment(scheduleDate).format('MM');
      let forYear = moment(scheduleDate).format('YYYY');
      component
        .get('classActivityService')
        .addActivityToClass(
          classId,
          contentId,
          contentType,
          scheduleDate,
          forMonth,
          forYear,
          scheduleEndDate
        )
        .then(newContentId => {
          if (!component.isDestroyed) {
            let data = component.serializerSearchContent(
              content,
              newContentId,
              scheduleDate,
              forMonth,
              forYear,
              scheduleEndDate
            );
            content.set('isScheduled', true);
            component.sendAction('addedContentToDCA', data, scheduleDate);
          }
        });
    },

    /**
     * It will takes care of content will schedule for the specific month.
     * @param  {Moment} Month
     * @param  {Moment} Year
     */
    onScheduleForMonth(forMonth, forYear) {
      let component = this;
      let classId = component.get('classId');
      let contentType =
        component.get('selectedContentForSchedule.format') ||
        component.get('activeContentType');
      let contentId = component.get('selectedContentForSchedule.id');
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      datepickerEle.hide();
      component
        .get('classActivityService')
        .addActivityToClass(
          classId,
          contentId,
          contentType,
          null,
          forMonth,
          forYear
        )
        .then(() => {
          if (!component.isDestroyed) {
            component.sendAction('refreshUnScheduleItem', forMonth, forYear);
          }
        });
    },

    /**
     * Action get triggered when schedule content to CA got clicked
     */
    onScheduleContentToDCA(content, event) {
      let component = this;
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      let selectedContentEle = component.$(event.target);
      if (!selectedContentEle.hasClass('active')) {
        selectedContentEle.addClass('active');
        datepickerEle.show();
      } else {
        selectedContentEle.removeClass('active');
        datepickerEle.hide();
      }
      component.set('selectedContentForSchedule', content);
      component.set(
        'allowTwoDateRangePicker',
        content.get('format') === PLAYER_EVENT_SOURCE.OFFLINE_CLASS
      );
      component.set('endDate', null);
    },

    //Action triggered when click + icon in the pullup
    onClickCreateOfflineActivity() {
      this.set('isShowCreateOfflineActivity', true);
    },

    //Action triggered after created offline activity and add it to dca
    onAddExternalCollectionToDCA(
      activityData,
      activityDate,
      scheduledMonth,
      scheduledYear
    ) {
      const component = this;
      component.set('activeContentType', 'collection');
      let selectedItem = component.get('menuItems').findBy('key', 'myContent');
      component.toggleMenuItem(selectedItem, true);
      component.sendAction(
        'addedContentToDCA',
        activityData,
        activityDate,
        scheduledMonth,
        scheduledYear
      );
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    let component = this;
    component.set(
      'activeContentType',
      component.get('selectedSearchContentType')
    );
    component.resetMenuItems();
    component.loadData();
    component.openPullUp();
    component.handleSearchBar();
    component.closeCADatePickerOnScroll();
    component.set('selectedFilters', Ember.A([])); //initialize
  },

  didRender() {
    let component = this;
    component.initializePopover();
    component.handleShowMoreData();
  },
  //--------------------------------------------------------------------------
  // Methods

  initializePopover() {
    let component = this;
    component.$('.more-pointer').popover({
      html: true,
      trigger: 'click',
      animation: true,
      placement: 'auto',
      content: () => {
        return component.$('.more-filters').html();
      }
    });

    component.$(document).click(function(event) {
      if (event.target.className !== 'more-pointer') {
        if (component.$('.more-pointer')) {
          component.$('.more-pointer').popover('hide');
        }
      }
    });
  },

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  closePullUp() {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
      }
    );
  },

  handleSearchBar() {
    let component = this;
    component.$('#search-content').on('keyup', function(e) {
      if (e.which === KEY_CODES.ENTER) {
        component.loadData();
      }
    });

    component.$('.search-icon .search').click(function() {
      let term = component.getSearchTerm();
      if (term.length > 0) {
        component.loadData();
      }
    });
  },

  loadData() {
    let component = this;
    component.set('isLoading', true);
    component.set('page', 0);
    component.set('isMoreDataExists', false);
    component.set('isShow', false);
    Ember.RSVP.hash({
      searchResults: component.getSearchService()
    }).then(({ searchResults }) => {
      if (!component.isDestroyed) {
        component.set('isLoading', false);
        component.set('searchResults', searchResults);
        component.$('.search-list-container').scrollTop(0);
        if (
          searchResults &&
          searchResults.length === component.get('defaultSearchPageSize') &&
          component.get('isShowMoreEnabled')
        ) {
          component.set('isMoreDataExists', true);
        }
      }
    });
  },

  loadMoreData() {
    let component = this;
    component.set('isLoading', true);
    let page = component.get('page') + 1;
    component.set('page', page);
    Ember.RSVP.hash({
      searchResults: component.getSearchService()
    }).then(({ searchResults }) => {
      if (!component.isDestroyed) {
        component.set('isLoading', false);
        let searchResult = component.get('searchResults');
        component.set('searchResults', searchResult.concat(searchResults));
        if (
          searchResults &&
          searchResults.length === component.get('defaultSearchPageSize')
        ) {
          component.set('isMoreDataExists', true);
        }
      }
    });
  },

  getSearchService() {
    let component = this;
    let searchService = null;
    let label = component.get('selectedMenuItem.label');
    if (
      label === 'common.gooru-catalog' ||
      component.get('selectedFilters').length > 0 ||
      component.getSearchTerm()
    ) {
      searchService = component.getSearchServiceByType();
    } else if (label === 'common.myContent') {
      searchService = component.getMyContentByType();
    } else if (
      label === 'common.tenantLibrary' &&
      !component.get('showTenantLibraries')
    ) {
      searchService = component.getLibraryServiceByType();
    }
    return searchService;
  },

  getSearchServiceByType() {
    let component = this;
    let activeContentType = component.get('activeContentType');
    let params = component.getSearchParams();
    let term = component.getSearchTerm() ? component.getSearchTerm() : '*';
    if (activeContentType === CONTENT_TYPES.COLLECTION) {
      return component.get('searchService').searchCollections(term, params);
    } else if (activeContentType === CONTENT_TYPES.ASSESSMENT) {
      return component.get('searchService').searchAssessments(term, params);
    } else if (activeContentType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
      return component.get('searchService').searchOfflineActivity(term, params);
    }
  },

  getMyContentByType() {
    let component = this;
    let currentUserId = component.get('session.userId');
    let activeContentType = component.get('activeContentType');
    let params = component.getMyContentParams();
    let term = component.getSearchTerm();
    if (term) {
      params.searchText = term;
    }
    if (activeContentType === CONTENT_TYPES.COLLECTION) {
      return component
        .get('profileService')
        .readCollections(currentUserId, params);
    } else if (activeContentType === CONTENT_TYPES.ASSESSMENT) {
      return component
        .get('profileService')
        .readAssessments(currentUserId, params);
    } else if (activeContentType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
      return component
        .get('profileService')
        .readOfflineActivities(currentUserId, params);
    }
  },

  getSearchTerm() {
    let component = this;
    let searchText = component.$('#search-content').val();
    return searchText;
  },

  /**
   * Method is used to get library service
   */
  getLibraryServiceByType() {
    const component = this;
    const libraryId = component.get('selectedTenantLibrary.id');
    const activeContentType = component.get('activeContentType');
    const pagination = {
      offset: component.get('page') * component.get('defaultSearchPageSize'),
      pageSize: component.get('defaultPageSize')
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      return component
        .get('libraryService')
        .fetchLibraryContent(libraryId, activeContentType, pagination)
        .then(
          result => {
            let content;
            if (result) {
              let libraryContent = result.libraryContent;
              content = libraryContent[Object.keys(libraryContent)[0]];
            }
            resolve(content);
          },
          error => {
            reject(error);
          }
        );
    });
  },

  getSearchParams() {
    let component = this;
    let params = {
      taxonomies: null,
      page: component.get('page'),
      pageSize: component.get('defaultSearchPageSize')
    };
    let filters = component.filterBuilder();
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
    let subject = component.get('course.subject');
    let competencyData = component.get('competencyData');
    let primaryLanguage = component.get('class.primaryLanguage');
    let gutCode = competencyData ? competencyData.get('competencyCode') : null;
    if (!component.get('selectedFilters').length && !term) {
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
  },

  getMyContentParams() {
    let component = this;
    let params = {
      page: component.get('page'),
      pageSize: component.get('defaultSearchPageSize')
    };
    return params;
  },

  serializerSearchContent(
    content,
    contentId,
    startDate,
    forMonth,
    forYear,
    endDate
  ) {
    let format = content.get('format');
    if (!format) {
      content.set('format', this.get('activeContentType'));
    } else {
      content.set('collectionType', format);
    }
    return Ember.Object.create({
      id: contentId,
      added_date: startDate,
      end_date: endDate || startDate,
      activityDate: startDate,
      collection: content,
      usersCount: -1,
      isActive: false,
      forMonth: parseInt(forMonth),
      forYear: parseInt(forYear)
    });
  },

  handleShowMoreData() {
    let component = this;
    let container = component.$('.search-list-container');
    component.$(container).scroll(function() {
      let scrollTop = Ember.$(container).scrollTop();
      let listContainerHeight = Ember.$(container).height() + 60;
      let isScrollReachedBottom =
        scrollTop ===
        component.$(container).prop('scrollHeight') - listContainerHeight;
      if (
        isScrollReachedBottom &&
        !component.get('isLoading') &&
        component.get('isMoreDataExists')
      ) {
        component.loadMoreData();
      }
    });
  },

  loadTenantLibraries() {
    const component = this;
    component.set('isLoading', true);
    component
      .get('libraryService')
      .fetchLibraries()
      .then(libraries => {
        component.set('libraries', libraries);
        component.set('isLoading', false);
      });
  },

  resetMenuItems() {
    let menuItems = this.get('menuItems');
    menuItems.forEach(item => {
      item.set('selected', false);
      if (item.get('key') === 'catalog') {
        item.set('selected', true);
      }
    });
  },

  closeCADatePickerOnScroll() {
    let component = this;
    component.$('.search-list-container').on('scroll', function() {
      if (Ember.$('.ca-datepicker-popover-container').is(':visible')) {
        Ember.$('.ca-datepicker-popover-container').hide();
        Ember.$('.ca-datepicker-popover').removeClass('active');
      }
    });
  },

  createMenuItem(key, label, selected) {
    return Ember.Object.create({
      key: key,
      label: label,
      selected: selected
    });
  },

  /**
   * @function toggleMenuItem
   * Method to toggle selected menu item
   */
  toggleMenuItem(selectedItem, skipToggle) {
    const component = this;
    let menuItems = component.get('menuItems');
    menuItems.forEach(item => {
      item.set('selected', false);
      if (selectedItem.get('label') === item.get('label')) {
        item.set('selected', true);
      }
    });
    const showTenantLibraries = selectedItem.get('key') === 'tenantLibrary';
    if (showTenantLibraries) {
      component.loadTenantLibraries();
    }
    component.set('selectedTenantLibrary', null);
    component.set('showTenantLibraries', showTenantLibraries);
    if (!skipToggle) {
      component.toggleProperty('isMenuEnabled');
    }
    if (selectedItem.get('key') !== 'courseMap') {
      component.loadData();
    }
  }
});
