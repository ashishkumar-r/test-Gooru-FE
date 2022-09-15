import Ember from 'ember';
import {
  CONTENT_TYPES,
  SCREEN_SIZES,
  PLAYER_EVENT_SOURCE,
  SUGGESTION_FILTER_BY_CONTENT_TYPES,
  KEY_CODES,
  SIGNATURE_CONTENTS
} from 'gooru-web/config/config';
import TaxonomyTag from 'gooru-web/models/taxonomy/taxonomy-tag';
import TaxonomyTagData from 'gooru-web/models/taxonomy/taxonomy-tag-data';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['backdrop-pull-ups', 'teacher-suggestion-pull-up'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/search
   */
  searchService: Ember.inject.service('api-sdk/search'),

  /**
   * @requires service:api-sdk/search
   */
  suggestService: Ember.inject.service('api-sdk/suggest'),

  /**
   * @requires service:api-sdk/navigate-map
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  /**
   * @type {libraryService} Library service object
   */
  libraryService: Ember.inject.service('api-sdk/library'),

  /**
   * @type {ProfileService} Profile service object
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * Session object of logged in user
   * @type {Object}
   */
  session: Ember.inject.service(),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * Class Activities Service
   */
  classActivitiesService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @property {Service} taxonomy service API SDK
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

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
  filterContentType: SUGGESTION_FILTER_BY_CONTENT_TYPES,

  /**
   * Maintains maximum number of search results
   * @type {Number}
   */
  maxSearchResult: 6,

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
   * Maintains list of students selected for  suggest
   * @type {Array}
   */
  students: Ember.A([]),

  /**
   * Maintains  suggest confirmation state
   * @type {Boolean}
   */
  showSuggestConfirmation: false,

  /**
   * Suggest selected collection
   * @type {Collection}
   */
  suggestSelectedCollection: null,

  /**
   * Maintains the context data
   * @type {Object}
   */
  context: null,

  /**
   * Collection details
   * @type {Collection}
   */
  collection: null,

  /**
   * Maintains state of the context
   * @type {Boolean}
   */
  isFromSearch: false,

  isMenuEnabled: false,

  /**
   * @property {TaxonomyTag[]} List of taxonomy tags
   */
  tags: Ember.computed(
    'collection.standards.[]',
    'competencyData.standards.[]',
    function() {
      let standards =
        this.get('competencyData.standards') ||
        this.get('collection.standards');
      if (standards) {
        standards = standards.filter(function(standard) {
          // Filter out learning targets (they're too long for the card)
          return !TaxonomyTagData.isMicroStandardId(standard.get('id'));
        });
        return TaxonomyTag.getTaxonomyTags(standards);
      }
    }
  ),

  /**
   * defaultSuggestContentType
   * @type {String}
   */
  defaultSuggestContentType: 'collection',

  /**
   * suggestionOrigin
   * @type {String}
   */
  suggestionOrigin: PLAYER_EVENT_SOURCE.COURSE_MAP,

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
   * Maintains the list of  menu items
   * @type {Array}
   */
  menuItems: Ember.computed('courseId', function() {
    let courseId = this.get('courseId');
    let menuItems = Ember.A([]);
    let isCatalogSelecred = courseId ? !this.get('isDiagnosticContent') : true;
    if (this.get('isEnableCaBaseline')) {
      menuItems.pushObject(
        this.createMenuItem('suggested', 'common.suggested', true)
      );
      menuItems.pushObject(
        this.createMenuItem('catalog', 'common.gooru-catalog', false)
      );
      menuItems.pushObject(
        this.createMenuItem('myContent', 'common.myContent', false)
      );
      menuItems.pushObject(
        this.createMenuItem('tenantLibrary', 'common.tenantLibrary', false)
      );
    } else {
      menuItems.pushObject(
        this.createMenuItem(
          'signatureContent',
          'common.signature-content',
          isCatalogSelecred
        )
      );
    }

    if (courseId) {
      menuItems.pushObject(
        this.createMenuItem(
          'courseMap',
          'common.course-map',
          this.get('isDiagnosticContent')
        )
      );
    }
    return menuItems;
  }),

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
   * It will compute the selected menu item on changes of menu item selection or data change.
   * @type {String}
   */
  selectedMenuItem: Ember.computed('menuItems.@each.selected', function() {
    let menuItems = this.get('menuItems');
    return menuItems.findBy('selected', true);
  }),

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

  selectedCompetency: Ember.computed('competencyData.standards.[]', function() {
    let standards = this.get('competencyData.standards');
    if (standards) {
      let competency = standards.get('firstObject');
      return competency;
    }
  }),

  profileCount: 11,

  studentsCount: Ember.computed('students', function() {
    let students = this.get('students');
    let profileCount = this.get('profileCount');
    return students.length > profileCount
      ? students.length - profileCount
      : null;
  }),

  relatedGutCode: null,

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
     * Action get triggered when filter button is clicked
     */
    toggleSearchFilter() {
      let component = this;
      component.toggleProperty('isShow');
    },

    /**
     * Choose the menu item
     */
    onChooseMenuItem(selectedItem) {
      let component = this;
      component.toggleMenuItem(selectedItem);
    },
    /**
     * Toggle menu list based on the recent selection of the menu.
     */
    toggleMenuList() {
      this.toggleProperty('isMenuEnabled');
      return false;
    },

    /**
     * Action triggered when the user close the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    /**
     * Action get triggered when clear button is clicked
     */
    clearFilter(item) {
      const component = this;
      if (item.filter === 'flt.standard') {
        component.set('unCheckedItem', item);
      }
      component.get('selectedFilters').removeObject(item);
      component.send('doSearch');
    },

    /**
     * Evengt get triggered when filter by content type menu is selected
     * @param  {String} contentType
     */
    onSelectFilterBy(contentType) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_IS_CHART_REPORT_SUGGESTION_REPORT
      );
      this.set('activeContentType', contentType);
      this.loadData();
    },

    /**
     * Action get triggered when search button is clicked
     */
    doSearch() {
      const component = this;
      component.loadData();
    },

    /**
     * Action get triggered when add suggest icon got clicked
     */
    onSuggestCollection(collection) {
      this.set('suggestSelectedCollection', collection);
      this.set('showSuggestConfirmation', true);
    },

    /**
     * Action get triggered when add + icon got clicked
     */
    onAddCollectionToDCA(collection) {
      let component = this;
      let classId = component.get('context.classId');
      let contentType = collection.get('format');
      let contentId = collection.get('id');
      let date = moment().format('YYYY-MM-DD');
      component
        .get('classActivitiesService')
        .addActivityToClass(classId, contentId, contentType, date)
        .then(newContentId => {
          let content = collection;
          const activityClasses = content.get('activityClasses') || Ember.A([]);
          let activityClass = Ember.Object.create({
            id: classId,
            activity: Ember.Object.create({
              id: newContentId,
              date: date
            })
          });
          activityClasses.pushObject(activityClass);
          content.set('activityClasses', activityClasses);
          component.saveUsersToCA(newContentId);
          content.set('isAdded', true);
          content.set('isScheduledActivity', true);
          component.set('newlyAddedActivity', content);
        });
    },

    /**
     * Trigger when cancel suggest  popup
     */
    onCancelSuggest() {
      this.set('showSuggestConfirmation', false);
    },

    /**
     * Trigger when confirm suggest  popup
     */
    onConfirmSuggest() {
      const component = this;
      const suggestionOrigin = component.get('suggestionOrigin');
      if (suggestionOrigin === PLAYER_EVENT_SOURCE.COURSE_MAP) {
        component.suggestForCourseMap();
      } else if (suggestionOrigin === PLAYER_EVENT_SOURCE.CLASS_ACTIVITY) {
        component.suggestForClassActivity();
      }
    },

    backToSuggestion() {
      let component = this;
      component.set('isFromSearch', false);
      component.$('#suggestion-search').val('');
      component.set(
        'activeContentType',
        component.get('defaultSuggestContentType')
      );
      component.loadData();
    },

    /**
     * Action get triggered when schedule content to CA got clicked
     */
    onScheduleContentToDCA(content) {
      let component = this;
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      datepickerEle.show();
      component.set('selectedContentForSchedule', content);
      component.set('endDate', null);
    },

    /**
     * Action triggered when the user click on close
     */
    onCloseDatePicker() {
      let datepickerEle = Ember.$('.ca-datepicker-schedule-container');
      datepickerEle.hide();
    },

    /**
     * It will takes care of content will schedule for the specific date.
     * @param  {String} scheduleDate
     */
    onScheduleDate(scheduleDate, scheduleEndDate) {
      let component = this;
      let classId = component.get('context.classId');
      let contentType = component.get('selectedContentForSchedule.format');
      let contentId = component.get('selectedContentForSchedule.id');
      let datepickerEle = component.$('.ca-datepicker-schedule-container');
      datepickerEle.hide();
      let forMonth = moment(scheduleDate).format('MM');
      let forYear = moment(scheduleDate).format('YYYY');
      component
        .get('classActivitiesService')
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
          let content = component.get('selectedContentForSchedule');
          const activityClasses = content.get('activityClasses') || Ember.A([]);
          let activityClass = Ember.Object.create({
            id: classId,
            activity: Ember.Object.create({
              id: newContentId,
              date: scheduleDate,
              forMonth,
              forYear
            })
          });
          activityClasses.pushObject(activityClass);
          content.set('activityClasses', activityClasses);
          let studentList = component.get('students');
          component.saveUsersToCA(newContentId, studentList);
          content.set('isScheduled', true);
          content.set('isScheduledActivity', true);
          component.set('newlyAddedActivity', content);
        });
    },

    //Action trigger when click student heading
    showStudentList() {
      let component = this;
      component.$('.sc-student-dropdown-list-container').slideToggle(500);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    const component = this;
    component.$('[data-toggle="popover"]').popover({
      trigger: 'hover'
    });
    component.initializePopover();
    component.handleAppContainerScroll();
  },

  didDestroyElement() {
    const component = this;
    component.handleAppContainerScroll();
  },

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    let component = this;
    component.set('activeContentType', this.get('defaultSuggestContentType'));
    component.openPullUp();
    component.handleSearchBar();
    component.set('selectedFilters', Ember.A([])); //initialize
    let standards = component.get('collection.standards');
    let competencyCode;
    if (standards && standards.length) {
      competencyCode = standards.map(standard => standard.get('id'));
    }
    const framework = component.get('classFramework');
    if (competencyCode && framework) {
      Ember.RSVP.hash({
        gutCode: component
          .get('taxonomyService')
          .fetchCrosswalkCompetency(competencyCode, framework)
      }).then(({ gutCode }) => {
        if (gutCode && gutCode.length) {
          let gut = gutCode.get('firstObject');
          component.set('relatedGutCode', gut.sourceTaxonomyCodeId);
        }
        component.loadData();
      });
    } else {
      component.loadData();
    }
  },

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

  //--------------------------------------------------------------------------
  // Methods

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
    component.loadData();
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

  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp', true);
        }
      }
    );
  },

  handleAppContainerScroll() {
    let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
      .length;
    if (activePullUpCount > 0) {
      Ember.$(document.body).addClass('no-vertical-scroll');
    } else if (activePullUpCount === 0) {
      Ember.$(document.body).removeClass('no-vertical-scroll');
    }
  },

  createMenuItem(key, label, selected) {
    return Ember.Object.create({
      key: key,
      label: label,
      selected: selected
    });
  },

  handleSearchBar() {
    let component = this;
    component.$('#suggestion-search').on('keyup', function(e) {
      if (e.which === KEY_CODES.ENTER) {
        component.set('isFromSearch', true);
        component.loadData();
      }
    });

    component.$('#suggest-search .search').click(function() {
      let term = component.getSearchTerm();
      if (term.length > 0) {
        component.set('isFromSearch', true);
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
    if (label === 'common.signature-content') {
      searchService = component.getSignatureContentByType();
    } else if (
      label === 'common.course-map' ||
      label === 'common.gooru-catalog' ||
      component.get('selectedFilters').length > 0 ||
      component.getSearchTerm() ||
      label === 'common.myContent' ||
      label === 'common.tenantLibrary'
    ) {
      searchService = component.getSearchServiceByType();
    } else if (label === 'common.suggested') {
      let params = component.getSearchParams();
      params.classFramework = component.get('classFramework');
      params.isDefaultShowFW = component.get('isDefaultShowFW');
      let primaryLanguage = component.get('class')
        ? component.get('class.primaryLanguage')
        : null;
      if (primaryLanguage) {
        params.filters['flt.languageId'] = primaryLanguage;
      }
      let term = component.getSearchTerm() ? component.getSearchTerm() : '*';
      let actionKey;
      if (component.get('activeContentType') === 'assessment') {
        actionKey = 'searchAssessments';
      } else {
        actionKey = 'searchCollections';
      }
      searchService = component
        .get('searchService')
        .searchCollectionsOpenAllKey(actionKey, params, term, null, true);
    }
    return searchService;
  },

  getSearchServiceByType() {
    let component = this;
    let activeContentType = component.get('activeContentType');
    let params = component.getSearchParams();
    params.classFramework = component.get('classFramework');
    params.isDefaultShowFW = component.get('isDefaultShowFW');
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

  getSignatureContentByType() {
    let component = this;
    let activeContentType = component.get('activeContentType');
    let signatureContent =
      activeContentType === CONTENT_TYPES.COLLECTION
        ? SIGNATURE_CONTENTS.SIGNATURE_COLLECTION
        : SIGNATURE_CONTENTS.SIGNATURE_ASSESSMENT;
    let isCollection = activeContentType === CONTENT_TYPES.COLLECTION;
    let contentType = [activeContentType, signatureContent];
    let standards = component.get('collection.standards');
    let competencyCode;
    if (standards && standards.length) {
      competencyCode = standards.map(standard => standard.get('id')).toString();
    }
    let classFramework = component.get('classFramework');
    let isDefaultShowFW = component.get('isDefaultShowFW');
    let params = {
      page: component.get('page'),
      pageSize: component.get('defaultSearchPageSize'),
      contentType: contentType,
      competencyCode: competencyCode,
      isCollection: isCollection,
      classFramework: classFramework,
      isDefaultShowFW: isDefaultShowFW,
      isSuggestion: true
    };
    let term = component.getSearchTerm() ? component.getSearchTerm() : '*';
    return component.get('searchService').searchSignatureContent(term, params);
  },

  getSearchParams() {
    let component = this;
    let params = {
      taxonomies: null,
      page: component.get('page'),
      pageSize: component.get('defaultSearchPageSize'),
      isSuggestion: true
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
    } else if (label === 'common.course-map') {
      filters['flt.courseId'] = component.get('courseId');
      filters['flt.publishStatus'] = 'published,unpublished';
    } else {
      filters.scopeKey = 'open-all';
      filters['flt.publishStatus'] = 'published';
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
    let relatedGutCode = component.get('relatedGutCode');
    if (relatedGutCode) {
      filters['flt.relatedGutCode'] = relatedGutCode;
    }
    params.taxonomies =
      taxonomies != null && taxonomies.length > 0 && !relatedGutCode
        ? taxonomies
        : null;
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

  getSearchTerm() {
    let searchText = this.$('#suggestion-search').val();
    return searchText;
  },

  getFilters() {
    let component = this;
    let maxSearchResult = component.get('maxSearchResult');
    let params = {
      taxonomies: null,
      pageSize: maxSearchResult
    };
    return params;
  },

  getSuggestFiltersAndTerm() {
    let component = this;
    let maxSearchResult = component.get('maxSearchResult');
    let collection = component.get('collection');
    let primaryLanguage = component.get('class.primaryLanguage');
    let tags = component.get('tags');
    let taxonomies = null;
    if (tags) {
      taxonomies = tags.map(tag => {
        return tag.data.id;
      });
    }
    let params = {
      taxonomies:
        taxonomies != null && taxonomies.length > 0 ? taxonomies : null,
      pageSize: maxSearchResult,
      filters: {}
    };
    if (primaryLanguage) {
      params.filters['flt.languageId'] = primaryLanguage;
    }
    let term =
      taxonomies != null && taxonomies.length > 0
        ? '*'
        : collection.get('title');
    return {
      term: term,
      filters: params
    };
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

  suggestForCourseMap() {
    const component = this;
    let collection = component.get('suggestSelectedCollection');
    let userIds = component.get('students').map(student => {
      return student.get('id');
    });
    let contextParams = {
      ctx_user_ids: userIds,
      ctx_class_id: component.get('context.classId'),
      ctx_course_id: component.get('context.courseId'),
      ctx_unit_id: component.get('context.unitId'),
      ctx_lesson_id: component.get('context.lessonId'),
      ctx_collection_id: component.get('collection.id'),
      suggested_content_id: collection.get('id'),
      suggested_content_type: component.get('activeContentType'),
      ctx_path_id: component.get('context.ctxPathId'),
      ctx_path_type: component.get('context.ctxPathType')
    };
    component
      .get('navigateMapService')
      .teacherSuggestions(contextParams)
      .then(() => {
        component.set('students', Ember.A([]));
        component.set('showSuggestConfirmation', false);
        component.set('showPullUp', false);
        component.sendAction('onCloseSuggest');
      });
  },

  resetMenuItems() {
    let menuItems = this.get('menuItems');
    menuItems.forEach(item => {
      item.set('selected', false);
      if (item.get('key') === 'signatureContent') {
        item.set('selected', true);
      }
    });
  },

  suggestForClassActivity() {
    const component = this;
    let collection = component.get('suggestSelectedCollection');
    let userIds = component.get('students').map(student => {
      return student.get('id');
    });
    userIds.map(userId => {
      let contextParams = {
        user_id: userId,
        collection_id: component.get('context.collectionId'),
        class_id: component.get('context.classId'),
        suggested_content_id: collection.get('id'),
        suggestion_origin: component.get('context.suggestionOrigin'),
        suggestion_originator_id: component.get(
          'context.suggestionOriginatorId'
        ),
        suggestion_criteria: 'performance',
        suggested_content_type: component.get('activeContentType'),
        suggested_to: component.get('context.suggestionTo'),
        suggestion_area: component.get('context.suggestionArea'),
        tx_code: null,
        tx_code_type: null,
        ca_id: component.get('context.caContentId')
      };
      collection.set('isSuggested', true);
      return component.get('suggestService').suggestContent(contextParams);
    });

    Ember.RSVP.all(userIds).then(function() {
      component.set('students', Ember.A([]));
      component.set('showSuggestConfirmation', false);
      component.set('showPullUp', false);
      component.sendAction('onCloseSuggest');
    });
  },

  saveUsersToCA(newContentId) {
    let component = this;
    let classId = component.get('context.classId');
    let contentId = newContentId;
    let students = component.get('students');
    let users = students.map(student => {
      return student.get('id');
    });
    component
      .get('classActivitiesService')
      .addUsersToActivity(classId, contentId, users);
  }
});
