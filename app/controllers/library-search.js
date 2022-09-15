import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import {
  SEARCH_CONTEXT,
  CONTENT_TYPES,
  ROLES,
  TEACHER,
  STUDENTS
} from 'gooru-web/config/config';
export default Ember.Controller.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service(),

  /**
   * @type {Controller} Application controller
   */
  appController: Ember.inject.controller('application'),

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

  // -------------------------------------------------------------------------
  // Attributes

  queryParams: [
    'libraryId',
    'type',
    'profileId',
    'isBack',
    'term',
    'activeContentType',
    'isDeepLink'
  ],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * A link to the parent application controller
   * @see controllers/application.js
   * @property {ClassesModel}
   */
  myClasses: Ember.computed.alias('appController.myClasses'),

  /**
   * @property {Object} library
   */
  library: null,

  /**
   * @property {Boolean} isLoading
   */
  isLoading: false,

  /**
   * @property {Array[]}
   */
  selectedResourceTypes: Ember.A([]),

  /**
   * @property {Array[]}
   */
  selectedQuestionTypes: Ember.A([]),

  /**
   * @property {Class[]} Active class with and without course
   */
  activeClasses: Ember.computed(
    'appController.myClasses.classes.[]',
    function() {
      const classes = this.get('appController.myClasses');
      return classes
        ? classes.getTeacherActiveClasses(this.get('session.userId'))
        : [];
    }
  ),

  isSearch: false,
  /**
   * Current user id
   */
  currentUserId: Ember.computed.alias('session.userId'),

  /**
   * @property {Boolean} isTeacher
   */
  isTeacher: Ember.computed.equal('session.role', ROLES.TEACHER),

  /**
   * Indicates if the user is seeing his own profile
   * @property {isMyProfile}
   * @see {Class} profile
   * @returns {bool}
   */
  isMyProfile: Ember.computed('profile', function() {
    let controller = this;
    return controller.get('profileId') === controller.get('currentUserId');
  }),

  /**
   * Maintains the current page number of search
   * @type {Number}
   */
  page: 0,

  /**
   * Maintains the current offset number of search
   * @type {Number}
   */
  offset: 0,

  /**
   * Maintains the value of default search page size.
   * @type {Number}
   */
  defaultPageSize: 20,

  /**
   * @property {Object} unCheckedItems
   * Property to hold unCheckedItems of taxonomy standards
   */
  unCheckedItem: null,

  /**
   * @property {Array} selectedFilters
   */
  selectedFilters: Ember.A([]),

  /**
   * @property {Array} searchResults
   */
  searchResults: Ember.A([]),

  selectedCount: 0,

  isSearchContent: false,

  actions: {
    /**
     * Action get triggered when search button is clicked
     */
    doSearch(searchTerm, isSeachItem = false) {
      const controller = this;
      controller.set('searchTerm', searchTerm);
      controller.set('selectedCount', 0);
      controller.storeSelectedFilter();
      if (isSeachItem) {
        if (
          controller.get('searchTerm') !== undefined &&
          controller.get('searchTerm') !== null &&
          controller.get('searchTerm') !== ''
        ) {
          controller.set('isSearchContent', true);
          controller.storeSelectedFilter();
          controller.fetchContent();
        } else if (controller.get('isSearchContent')) {
          controller.set('isSearchContent', false);
          controller.storeSelectedFilter();
          controller.fetchContent();
        }
      } else {
        controller.storeSelectedFilter();
        controller.fetchContent();
      }
    },

    onSelectBox(checkbox) {
      const controller = this;
      let searchResults = controller.get('searchResults');
      if (searchResults) {
        searchResults.forEach(function(searchResult) {
          searchResult.set('isCheckBoxChecked', checkbox);
        });
        controller.set('selectedCount', checkbox ? searchResults.length : 0);
      }
    },

    onSubmit() {
      const controller = this;
      let searchResults = controller.get('searchResults');
      let filterData = searchResults.filter(searchResult => {
        return searchResult.isCheckBoxChecked;
      });
      if (filterData) {
        let listData = Ember.A([]);
        let baseUrl = `${window.location.origin}`;
        filterData.forEach(function(result) {
          const list = {
            launchTarget: 'LaunchCatalog',
            url: `${baseUrl}/api/nucleus-lti/v1/lti/v1p3/launch`,
            contentType: result.format,
            contentId: result.id,
            contentTitle: result.title
          };
          listData.pushObject(list);
        });
        controller.get('libraryService').postLtiData(listData);
        searchResults.forEach(function(searchResult) {
          searchResult.set('isCheckBoxChecked', false);
        });
        controller.set('selectedCount', 0);
      }
    },

    onSelectSingleBox(content) {
      const controller = this;
      let searchResults = controller.get('searchResults');
      let selectedUser = searchResults.findBy('id', content.id);
      if (selectedUser) {
        selectedUser.set('isCheckBoxChecked', !selectedUser.isCheckBoxChecked);
      }
      let filterData = searchResults.filter(searchResult => {
        return searchResult.isCheckBoxChecked;
      });
      if (filterData) {
        controller.set('selectedCount', filterData.length);
      } else {
        controller.set('selectedCount', 0);
      }
    },

    /**
     * Remix course action, when clicking remix at the course card
     * @param {Content/Course}
     */
    remixCourse: function(course) {
      this.send('showModal', 'content.modals.gru-course-remix', course);
    },

    /**
     * Triggers the refresh of user classes
     */
    updateClass: function() {
      this.send('updateUserClasses');
    },

    onShowModal(type) {
      const className =
        type === 'content.modals.gru-resource-new' ? 'gru-resource-new' : '';
      this.send('showModal', type, null, null, className);
    },

    /**
     * On card remix question button click
     * @param {Question} question
     */
    remixQuestion(question) {
      var remixModel = {
        content: question
      };
      this.send('showModal', 'content.modals.gru-question-remix', remixModel);
    },

    /**
     * Action will trigger when scroll reaches at bottom
     * @param {Question} question
     */
    doPaginate() {
      const controller = this;
      if (
        controller.get('selectedFilters').length > 0 ||
        controller.get('searchTerm') ||
        controller.get('selectedQuestionTypes').length > 0 ||
        controller.get('selectedResourceTypes').length > 0 ||
        controller.get('type') === SEARCH_CONTEXT.GOORU_CATALOG
      ) {
        controller.loadMoreDataForSearch();
      } else {
        if (controller.get('type') === SEARCH_CONTEXT.LIBRARY) {
          controller.loadMoreDataForLibrary();
        } else {
          controller.loadMoreDataForMyContent();
        }
      }
    }
  },

  /**
   * Method is used to search contents by the params
   */
  searchByParams(term) {
    const controller = this;
    if (term) {
      controller.send('doSearch', term);
    }
  },

  /**
   * Method is used to fetch contents based on context
   */
  fetchContent() {
    const controller = this;
    controller.get('searchResults').clear();
    controller.set('noMoreDataAvailable', false);
    if (
      controller.get('selectedFilters').length > 0 ||
      controller.get('searchTerm') ||
      controller.get('selectedQuestionTypes').length > 0 ||
      controller.get('selectedResourceTypes').length > 0 ||
      controller.get('type') === SEARCH_CONTEXT.GOORU_CATALOG
    ) {
      controller.set('isSearch', true);
      controller.fetchSearchContent();
    } else {
      controller.set('isSearch', false);
      if (controller.get('type') === SEARCH_CONTEXT.LIBRARY) {
        controller.fetchLibraryContent();
      } else {
        controller.fetchMyContent();
      }
    }
  },

  /**
   * Method is used to store selected filter
   */
  storeSelectedFilter() {
    const component = this;
    if (component.get('profile.id')) {
      const selectedFilters = component.get('selectedFilters');
      let storeObject = {};
      if (component.get('searchTerm')) {
        storeObject.searchTerm = component.get('searchTerm');
      }
      storeObject.selectedFilters = selectedFilters;
      let localStorage = window.localStorage;
      let itemId = `${component.get('profile.id')}_search_filter`;
      localStorage.setItem(itemId, JSON.stringify(storeObject));
    }
  },

  /**
   * Method is used to init the selected filter
   */
  initializeSelectedFilter() {
    const component = this;
    let localStorage = window.localStorage;
    let storedObject = JSON.parse(
      localStorage.getItem(`${component.get('profile.id')}_search_filter`)
    );
    if (storedObject) {
      component.set('searchTerm', storedObject.searchTerm);
      if (storedObject.selectedFilters) {
        storedObject.selectedFilters.map(searchFilter => {
          component
            .get('selectedFilters')
            .pushObject(Ember.Object.create(searchFilter));
        });
      }
    }
  },

  /**
   * Method is used to fetch Search contents
   */
  fetchSearchContent() {
    const controller = this;
    controller.set('isLoading', true);
    controller.set('page', 0);
    Ember.RSVP.hash({
      searchResults: controller.getSearchService()
    }).then(({ searchResults }) => {
      if (!controller.isDestroyed) {
        controller.set('isLoading', false);
        controller.set('searchResults', searchResults);
      }
    });
  },

  /**
   * Method is used to fetch my contents
   */
  fetchMyContent() {
    const controller = this;
    controller.set('isLoading', true);
    controller.set('page', 0);
    Ember.RSVP.hash({
      searchResults: controller.getMyContentService()
    }).then(({ searchResults }) => {
      if (!controller.isDestroyed) {
        controller.set('isLoading', false);
        controller.set('searchResults', searchResults);
      }
    });
  },

  /**
   * Method is used to fetch library contents
   */
  fetchLibraryContent() {
    let controller = this;
    controller.set('isLoading', true);
    controller.set('page', 0);
    Ember.RSVP.hash({
      searchResults: controller.getLibraryService()
    }).then(function(result) {
      if (result) {
        let libraryContent = result.searchResults.libraryContent;
        let content = libraryContent[Object.keys(libraryContent)[0]];
        let owners = libraryContent[Object.keys(libraryContent)[1]];
        controller.set('searchResults', controller.mapOwners(content, owners));
      }
      controller.set('isLoading', false);
    });
  },

  /**
   * Method is used to fetch more search contents
   */
  loadMoreDataForSearch() {
    let controller = this;
    if (
      !controller.get('isPaginate') &&
      !controller.get('noMoreDataAvailable')
    ) {
      controller.set('isPaginate', true);
      let page = controller.get('page') + 1;
      controller.set('page', page);
      Ember.RSVP.hash({
        searchResults: controller.getSearchService()
      }).then(({ searchResults }) => {
        if (!controller.isDestroyed) {
          controller.set('isPaginate', false);
          if (searchResults.length < 1) {
            controller.set('noMoreDataAvailable', true);
          }
          let searchResult = controller.get('searchResults');
          controller.set('searchResults', searchResult.concat(searchResults));
        }
      });
    }
  },

  /**
   * Method is used to fetch more my contents
   */
  loadMoreDataForMyContent() {
    let controller = this;
    if (
      !controller.get('isPaginate') &&
      !controller.get('noMoreDataAvailable')
    ) {
      controller.set('isPaginate', true);
      let page = controller.get('page') + 1;
      controller.set('page', page);
      Ember.RSVP.hash({
        searchResults: controller.getMyContentService()
      }).then(({ searchResults }) => {
        if (!controller.isDestroyed) {
          controller.set('isPaginate', false);
          let searchResult = controller.get('searchResults');
          if (searchResults.length < 1) {
            controller.set('noMoreDataAvailable', true);
          }
          controller.set('searchResults', searchResult.concat(searchResults));
        }
      });
    }
  },

  /**
   * Method is used to fetch more library contents
   */
  loadMoreDataForLibrary() {
    let controller = this;
    if (
      !controller.get('isPaginate') &&
      !controller.get('noMoreDataAvailable')
    ) {
      controller.set('isPaginate', true);
      let page = controller.get('page') + 1;
      controller.set('page', page);
      Ember.RSVP.hash({
        searchResults: controller.getLibraryService()
      }).then(function(result) {
        if (result) {
          let libraryContent = result.searchResults.libraryContent;
          let content = libraryContent[Object.keys(libraryContent)[0]];
          let owners = libraryContent[Object.keys(libraryContent)[1]];
          if (content.length < 1) {
            controller.set('noMoreDataAvailable', true);
          }
          let searchResult = controller.get('searchResults');
          controller.set(
            'searchResults',
            searchResult.concat(controller.mapOwners(content, owners))
          );
        }
        controller.set('isPaginate', false);
      });
    }
  },

  /**
   * Method is used to get library service
   */
  getLibraryService() {
    let controller = this;
    const libraryId = controller.get('library.id');
    let activeContentType = controller.get('activeContentType');
    const pagination = {
      offset: controller.get('page') * controller.get('defaultPageSize'),
      pageSize: controller.get('defaultPageSize')
    };
    return controller
      .get('libraryService')
      .fetchLibraryContent(libraryId, activeContentType, pagination);
  },

  /**
   * Method is used to get my content service
   */
  getMyContentService() {
    let controller = this;
    let activeContentType = controller.get('activeContentType');
    let profile = controller.get('profile');
    const params = {
      page: controller.get('page'),
      pageSize: controller.get('defaultPageSize'),
      isCrosswalkApplicable: controller.get('isCrosswalkApplicable'),
      userPreferenceFreamwork: controller.get('userPreferenceFreamwork')
    };
    if (profile) {
      if (activeContentType === CONTENT_TYPES.COLLECTION) {
        return controller
          .get('profileService')
          .readCollections(profile.get('id'), params);
      } else if (activeContentType === CONTENT_TYPES.ASSESSMENT) {
        return controller
          .get('profileService')
          .readAssessments(profile.get('id'), params);
      } else if (activeContentType === CONTENT_TYPES.COURSE) {
        return controller
          .get('profileService')
          .getCourses(profile, null, params);
      } else if (activeContentType === CONTENT_TYPES.RESOURCE) {
        return controller
          .get('profileService')
          .readResources(profile.get('id'), params);
      } else if (activeContentType === CONTENT_TYPES.QUESTION) {
        return controller
          .get('profileService')
          .readQuestions(profile.get('id'), params);
      } else if (activeContentType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        return controller
          .get('profileService')
          .readOfflineActivities(profile.get('id'), params);
      } else {
        return controller
          .get('profileService')
          .readRubrics(profile.get('id'), params);
      }
    } else {
      return this.get('searchResults');
    }
  },

  /**
   * Method is used to get search service
   */
  getSearchService() {
    let controller = this;
    let activeContentType = controller.get('activeContentType');
    let params = controller.getSearchParams();
    let term = controller.getSearchTerm() ? controller.getSearchTerm() : '*';
    if (activeContentType === CONTENT_TYPES.COLLECTION) {
      return controller.get('searchService').searchCollections(term, params);
    } else if (activeContentType === CONTENT_TYPES.ASSESSMENT) {
      return controller.get('searchService').searchAssessments(term, params);
    } else if (activeContentType === CONTENT_TYPES.COURSE) {
      return controller.get('searchService').searchCourses(term, params);
    } else if (activeContentType === CONTENT_TYPES.RESOURCE) {
      return controller.get('searchService').searchResources(term, params);
    } else if (activeContentType === CONTENT_TYPES.QUESTION) {
      return controller.get('searchService').searchQuestions(term, params);
    } else if (activeContentType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
      return controller
        .get('searchService')
        .searchOfflineActivity(term, params);
    } else {
      return controller.get('searchService').searchRubrics(term, params);
    }
  },

  /**
   * Method is used to get search text
   */
  getSearchTerm() {
    let controller = this;
    return controller.get('searchTerm');
  },

  /**
   * Method is used to get search params
   */
  getSearchParams() {
    let controller = this;
    let params = {
      page: controller.get('page'),
      pageSize: controller.get('defaultPageSize'),
      isDefaultShowFW: controller.get('isCrosswalkApplicable'),
      classFramework: controller.get('userPreferenceFreamwork')
    };
    let filters = controller.filterBuilder();

    if (controller.get('type') === SEARCH_CONTEXT.LIBRARY) {
      filters.scopeKey = 'open-library';
      filters.scopeTargetNames = controller.get('library.shortName');
      filters['flt.publishStatus'] = 'published,unpublished';
    } else if (controller.get('type') === SEARCH_CONTEXT.MY_CONTENT) {
      filters.scopeKey = 'my-content';
      filters['flt.publishStatus'] = 'published,unpublished';
      if (!controller.get('isMyProfile')) {
        filters['flt.creatorId'] = controller.get('profile.id');
      }
    } else {
      filters.scopeKey = 'open-all';
    }

    if (controller.get('activeContentType') === CONTENT_TYPES.RESOURCE) {
      params.formats = controller.get('selectedResourceTypes');
    }

    if (controller.get('activeContentType') === CONTENT_TYPES.QUESTION) {
      params.formats = controller.get('selectedQuestionTypes');
    }
    filters['flt.audience'] = `${TEACHER},${STUDENTS}`;

    params.filters = filters;
    return params;
  },

  /**
   * Method is used to build the filters
   */
  filterBuilder() {
    const controller = this;
    let filters = {};
    filters['flt.audience'] = controller.filterSelectedItems(
      'filter',
      'flt.audience'
    );
    filters['flt.educationalUse'] = controller.filterSelectedItems(
      'filter',
      'flt.educational'
    );
    filters['flt.language'] = controller.filterSelectedItems(
      'filter',
      'flt.language'
    );
    filters['flt.audience'] = controller.filterSelectedItems(
      'filter',
      'flt.audience'
    );
    filters['flt.standard'] = controller.filterSelectedItems(
      'filter',
      'flt.standard'
    );
    filters['flt.creator'] = controller.get('selectedFilters')[
      'flt.authorName'
    ];
    filters['flt.taxGrade'] = controller.filterSelectedItems(
      'filter',
      'flt.taxGrade'
    );
    filters['flt.fwCode'] = controller.filterSelectedItems(
      'filter',
      'flt.fwCode'
    );
    filters['flt.subject'] = controller.filterSelectedItems(
      'filter',
      'flt.subject'
    );
    filters['flt.domain'] = controller.filterSelectedItems(
      'filter',
      'flt.domain'
    );
    return filters;
  },

  /**
   * Method is used to filter out selected items
   */
  filterSelectedItems(keyField, keyValue) {
    const controller = this;
    let filterList = controller
      .get('selectedFilters')
      .filterBy(keyField, keyValue);
    let keyName =
      keyValue === 'flt.standard' ||
      keyValue === 'flt.fwCode' ||
      keyValue === 'flt.subject' ||
      keyValue === 'flt.domain'
        ? 'id'
        : 'name';
    return controller.toArray(filterList, keyName);
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

  /**
   * Map each collection to their corresponding owner
   * @param {Collection[]} collection list
   * @param {Owner[]} owner list
   */
  mapOwners: function(contents, owners) {
    let ownerMap = {};
    owners.forEach(function(owner) {
      ownerMap[owner.id] = owner;
    });
    let mappedContents = contents.map(function(content) {
      content.owner = content.ownerId
        ? ownerMap[content.ownerId]
        : ownerMap[content.owner];
      return content;
    });
    return mappedContents;
  },

  /**
   * Method is used to reset properties
   */
  resetProperties() {
    const controller = this;
    controller.get('selectedFilters').clear();
    controller.set('activeContentType', 'course');
    controller.set('searchTerm', null);
    controller.set('profile', null);
    controller.set('library', null);
    controller.get('searchResults').clear();
    controller.set('userPreferenceFreamwork', null);
    controller.set('isCrosswalkApplicable', false);
  }
});
