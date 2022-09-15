import Ember from 'ember';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {searchService} Search service object
   */
  searchService: Ember.inject.service('api-sdk/search'),

  /**
   * @type {libraryService} Library service object
   */
  libraryService: Ember.inject.service('api-sdk/library'),

  /**
   * @type {classService} classService
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {courseService} courseService
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {ProfileService} Profile service object
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {Controller} Class Controller
   */
  classController: Ember.inject.controller('teacher.class'),

  /**
   * @property {Controller} Application Controller
   */
  applicationController: Ember.inject.controller('application'),

  session: Ember.inject.service('session'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  /**
   * @dependency {i18nService} Service to retrieve translations information
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Events
  init() {
    let controller = this;
    controller.set('isLoading', true);
    controller.fetchFeaturedCourses();
    controller.fetchLibraries();
  },
  //Action triggered when add premium course
  updateGapProfile(classId) {
    let controller = this;
    let classDeatils = controller.get('class');
    let updateDeatils = Ember.Object.create({
      grade_current: classDeatils.get('gradeCurrent'),
      grade_lower_bound: classDeatils.get('gradeLowerBound'),
      grade_upper_bound: classDeatils.get('gradeUpperBound'),
      preference: classDeatils.get('preference'),
      route0: true
    });
    controller.get('classService').classSettings(classId, updateDeatils);
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    paginateNext() {
      this.incrementProperty('page');
      this.searchCourses('*', this.get('scopeKey')).then(libraryContents => {
        let a = this.get('libraryCourses').concat(libraryContents);
        this.set('libraryCourses', a);
      });
    },
    // Action triggered when add a course
    onAddCourse(courseId, course) {
      let controller = this;
      controller.set('isShowpopup', false);
      const popupTabIndex = course && course.tabindex ? course.tabindex : 10001;
      this.set('popupTabIndex', popupTabIndex);
      let classId = controller.get('classId');
      let isPremiumClass = controller.get('isPremiumClass');
      controller.addCourseToClass(courseId).then(function(data) {
        if (data && data.status === 400) {
          controller.set('isShowpopup', true);
          return;
        }
        if (isPremiumClass) {
          controller.updateGapProfile(classId);
        }
        controller
          .get('classService')
          .updateContentVisibility(
            classId,
            null,
            controller.get('isShowContentVisibility')
          );
        controller.get('classController').loadCourseContentVisibility(courseId);
        controller.transitionToRoute('teacher.class.course-map', classId, {
          queryParams: { refresh: true }
        });
      });
    },

    onShowPop() {
      this.set('isShowpopup', false);
    },

    //Action triggered when remix a course
    onRemixCourse(courseId, course) {
      let controller = this;
      controller.set('isShowpopup', false);
      let classId = controller.get('classId');
      const popupTabIndex = course && course.tabindex ? course.tabindex : 10001;
      this.set('popupTabIndex', popupTabIndex);
      controller.remixCourse(courseId).then(function(data) {
        if (data && data.status === 400) {
          controller.set('isShowpopup', true);
          return;
        }
        controller.transitionToRoute('teacher.class.course-map', classId, {
          queryParams: { refresh: true }
        });
      });
    },

    //Action triggered when select a catalog type
    onSelectCatalog(catalogLibrary, tabindex) {
      let controller = this;
      let dataSource = catalogLibrary.id;
      const customTabIndex = tabindex ? tabindex : 10001;
      if (dataSource === 'catalog') {
        controller.searchCourses().then(function(searchCourses) {
          controller.set('libraryCourses', searchCourses);
        });
      } else if (dataSource === 'content') {
        controller.searchCourses('*', 'my-content').then(function(userCourses) {
          controller.set('libraryCourses', userCourses);
        });
      } else {
        controller
          .fetchLibraryCourses(catalogLibrary)
          .then(function(libraryCourses) {
            controller.set('libraryCourses', libraryCourses);
          });
      }
      controller.set('actionTabIndex', customTabIndex);
      controller.set('isShowSearchCoursePullUp', true);
      controller.set('selectedCatalog', catalogLibrary);
    },

    // Action triggered when search course with a text
    onSearchCourse(searchText) {
      let controller = this;
      let selectedCatalog = controller.get('selectedCatalog');
      let isCatalogSearch = selectedCatalog.id === 'catalog';
      if (isCatalogSearch) {
        controller.searchCourses(searchText).then(function(searchCourses) {
          controller.set('libraryCourses', searchCourses);
        });
      }
    },

    //Action triggered when click show more results
    showMoreResults() {
      let controller = this;
      let contentCatalogs = controller.get('contentCatalogs');
      controller.set('catalogListToShow', contentCatalogs);
      controller.set('isShowMoreCatalogs', false);
    }
  },

  // Observe libraries property changes
  observeLibraries: Ember.observer('libraries', function() {
    let controller = this;
    let libraries = controller.get('libraries');
    let contentCatalogs = controller.get('contentCatalogs');
    contentCatalogs = contentCatalogs.concat(libraries);
    controller.set('contentCatalogs', contentCatalogs);
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isShowSearchCoursePullUp
   */
  isShowSearchCoursePullUp: false,

  /**
   * @property {Number} actionTabIndex
   */
  actionTabIndex: null,

  /**
   * @property {Number} popupTabIndex
   */
  popupTabIndex: null,

  /**
   * @property {Class}
   */
  class: Ember.computed.alias('classController.class'),

  /**
   * @property {classId}
   */
  classId: Ember.computed.alias('class.id'),

  /**
   * @property {UUID} userId
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * @property {Array} contentCatalogs
   */
  contentCatalogs: Ember.computed('applicationController', function() {
    let controller = this;
    let tenantLogo = controller.get('tenantLogo');
    let userAvatar = controller.get('userDetails.avatarUrl');
    return Ember.A([
      {
        id: 'catalog',
        name: 'Gooru Catalog',
        image: tenantLogo
      },
      {
        id: 'content',
        name: 'My Content',
        image: userAvatar
      }
    ]);
  }),

  /**
   * @property {Array} catalogListToShow
   */
  catalogListToShow: Ember.computed('contentCatalogs', function() {
    let controller = this;
    let catalogListToShow = controller.get('contentCatalogs');
    if (catalogListToShow.length > 4) {
      catalogListToShow = catalogListToShow.slice(0, 4);
      controller.set('isShowMoreCatalogs', true);
    }
    return catalogListToShow;
  }),

  /**
   * @property {Number} classGrade
   */
  classGrade: Ember.computed('class', function() {
    let controller = this;
    let classData = controller.get('class');
    return classData.grade;
  }),
  page: 0,
  pagesize: 20,
  /**
   * @property {tenantLogo}
   */
  tenantLogo: Ember.computed.alias(
    'applicationController.tenant.theme.header.logo'
  ),

  /**
   * @property {Object} userDetails
   */
  userDetails: Ember.computed.alias('applicationController.profile'),

  /**
   * @property {Boolean} isShowMoreCatalogs
   */
  isShowMoreCatalogs: false,

  /**
   * @property {Object} classPreference
   */
  classPreference: Ember.computed.alias('class.preference'),

  /**
   * The class is premium or not
   * @property {Boolean}
   */
  isPremiumClass: Ember.computed('class', function() {
    let controller = this;
    const currentClass = controller.get('class');
    let setting = currentClass.get('setting');
    return setting ? setting['course.premium'] : false;
  }),

  isMyContentNonPremium: Ember.computed(function() {
    let tenantSettings = JSON.parse(
      this.get('tenantService').getStoredTenantSetting()
    );

    return (
      tenantSettings &&
      tenantSettings.class_add_course_filter_out_non_premium &&
      tenantSettings.class_add_course_filter_out_non_premium === 'on'
    );
  }),
  isShowContentVisibility: Ember.computed(function() {
    let tenantSetting = this.get('tenantService').getStoredTenantSetting();
    let parsedTenantSettings = JSON.parse(tenantSetting);
    if (
      parsedTenantSettings &&
      parsedTenantSettings.default_class_course_content_visibility !== undefined
    ) {
      return (
        parsedTenantSettings &&
        parsedTenantSettings.default_class_course_content_visibility
      );
    } else {
      return 'off';
    }
  }),

  isShowpopup: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Map each course to their corresponding owner
   * @param {Course[]} course list
   * @param {Owner[]} owner list
   */
  mapOwners: function(courses, owners) {
    let ownerMap = {};
    owners.forEach(function(owner) {
      ownerMap[owner.id] = owner;
    });
    let mappedCourses = courses.map(function(course) {
      course.owner = ownerMap[course.ownerId];
      return course;
    });
    return mappedCourses;
  },

  /**
   * @function fetchFeaturedCourses
   * Method to fetch featured courses
   */
  fetchFeaturedCourses() {
    let controller = this;
    let searchService = controller.get('searchService');
    let classGrade = controller.get('classGrade');
    let isPremiumClass = controller.get('isPremiumClass');
    let subject = this.get('classPreference.subject') || null;
    let framework = this.get('classPreference.framework') || null;
    let filters = {};
    if (this.get('isMyContentNonPremium')) {
      filters['flt.version'] = 'premium';
    }
    if (isPremiumClass) {
      filters['flt.subject'] = `${framework}.${subject}`;
      filters['flt.grade'] = classGrade;
    } else {
      if (subject && framework) {
        filters['flt.subject'] = `${framework}.${subject}`;
      } else if (subject) {
        filters['flt.subject'] = `${subject}`;
      }
    }
    return Ember.RSVP.hash({
      featuredCourses: Ember.RSVP.resolve(
        searchService.searchFeaturedCourses('*', filters)
      )
    }).then(({ featuredCourses }) => {
      controller.set('featuredCourses', featuredCourses);
      controller.set('isLoading', false);
    });
  },

  /**
   * @function copyCourse
   * Method to copy a course
   */
  copyCourse(courseId) {
    let controller = this;
    let courseService = controller.get('courseService');
    return Ember.RSVP.hash({
      newCourseId: Ember.RSVP.resolve(courseService.copyCourse(courseId))
    }).then(({ newCourseId }) => {
      return newCourseId;
    });
  },

  /**
   * @function remixCourse
   * Method to remix a course
   */
  remixCourse(courseId) {
    let controller = this;
    return controller.copyCourse(courseId).then(function(copiedCourseId) {
      return controller.addCourseToClass(copiedCourseId);
    });
  },

  /**
   * @function addCourseToClass
   * Method to add a course to a class
   */
  addCourseToClass(courseId) {
    let controller = this;
    let classId = controller.get('classId');
    let classService = controller.get('classService');
    return Ember.RSVP.resolve(
      classService.associateCourseToClass(courseId, classId)
    );
  },

  /**
   * @function fetchLibraries
   * Method to fetch libraries
   */
  fetchLibraries() {
    let controller = this;
    let libraryService = controller.get('libraryService');
    return Ember.RSVP.hash({
      libraries: Ember.RSVP.resolve(libraryService.fetchLibraries())
    }).then(({ libraries }) => {
      controller.set('libraries', libraries);
    });
  },

  /**
   * @function searchCourses
   * Method to search courses
   */

  searchCourses(filters = '*', scopeKey = 'gooru-catalog') {
    let controller = this;
    let searchService = controller.get('searchService');
    let subject = this.get('classPreference.subject') || null;
    let framework = this.get('classPreference.framework') || null;
    let isPremiumClass = this.get('isPremiumClass');
    let page = this.get('page');
    let pagesize = this.get('pagesize');
    this.set('scopeKey', scopeKey);
    let filter = {
      scopeKey: scopeKey,
      page: page,
      pageSize: pagesize
    };
    if (this.get('isMyContentNonPremium')) {
      filter['flt.version'] = 'premium';
    }
    if (isPremiumClass) {
      filter['flt.subject'] = `${framework}.${subject}`;
    }
    return Ember.RSVP.hash({
      catalogCourses: Ember.RSVP.resolve(
        searchService.searchCourses(filters, { page: page }, false, filter)
      )
    }).then(({ catalogCourses }) => {
      return catalogCourses;
    });
  },

  /**
   * @function fetchLibraryCourses
   * Method to fetch library courses
   */
  fetchLibraryCourses(library) {
    let controller = this;
    let searchService = controller.get('searchService');
    let subject = this.get('classPreference.subject') || null;
    let framework = this.get('classPreference.framework') || null;
    let isPremiumClass = this.get('isPremiumClass');
    let filter = {
      scopeKey: 'open-library',
      scopeTargetNames: library.get('shortName')
    };
    if (this.get('isMyContentNonPremium')) {
      filter['flt.version'] = 'premium';
    }
    if (isPremiumClass) {
      filter['flt.subject'] = `${framework}.${subject}`;
    }
    return Ember.RSVP.hash({
      libraryContents: Ember.RSVP.resolve(
        searchService.searchCourses('*', {}, false, filter)
      )
    }).then(({ libraryContents }) => {
      return libraryContents;
    });
  }
});
