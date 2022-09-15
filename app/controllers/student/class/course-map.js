import Ember from 'ember';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import Language from 'gooru-web/mixins/language';
import { CONTENT_TYPES } from 'gooru-web/config/config';

/**
 * Content map controller
 *
 * Controller responsible of the logic for the course map page
 */
export default Ember.Controller.extend(TenantSettingsMixin, Language, {
  // -------------------------------------------------------------------------
  // Dependencies

  studentClassController: Ember.inject.controller('student.class'),

  /**
   * Rescope Service to perform rescope data operations
   */
  rescopeService: Ember.inject.service('api-sdk/rescope'),

  /**
   * Route0
   */
  route0Service: Ember.inject.service('api-sdk/route0'),

  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @type {PerformanceService} Service to retrieve class performance summary
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * Logged in user session object
   * @type {Session}
   */
  session: Ember.inject.service(),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @property {Number} barChartData
   */
  barChartData: Ember.computed(function() {
    return this.get('studentClassController.barChartData');
  }),

  performancePercentage: Ember.computed(function() {
    return this.get('studentClassController.performancePercentage');
  }),

  // -------------------------------------------------------------------------
  // Attributes

  queryParams: ['location', 'tab', 'demo'],

  /**
   * Combination of unit, lesson and resource (collection or assessment)
   * separated by a plus sign
   * @example
   * location='uId001+lId002+cId003'
   */
  location: null,

  tab: null,

  isFirstLoad: true,

  resetPerformance: false,

  demo: false,

  mileStone: Ember.computed(function() {
    return {
      iconClass: 'msaddonTop',
      offset: {
        left: '-30px',
        top: '9px'
      }
    };
  }),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Update 'location' (bound query param)
     *
     * @function
     * @param {String} newLocation - String of the form 'unitId[+lessonId[+resourceId]]'
     * @returns {undefined}
     */
    updateLocation: function(newLocation) {
      this.set('location', newLocation);
    },

    mileStoneHandler: function() {
      this.transitionToRoute('student-locate', {
        queryParams: {
          classId: this.get('class.id'),
          courseId: this.get('course.id')
        }
      });
    },

    updateUserLocation: function(newLocation) {
      this.set('userLocation', newLocation);
    },
    /**
     * Locate the user in is actual location
     *
     * @function
     * @param {String} location'
     * @returns {undefined}
     */
    locateMe: function(location) {
      this.set('location', location);
      this.set('showLocation', true);
      this.set('toggleLocation', !this.get('toggleLocation'));
    },

    /**
     * Action triggered when the user toggle between complete course-map / rescope
     */
    onToggleRescope(isChecked) {
      let controller = this;
      if (!isChecked) {
        controller.processSkippedContents();
      } else {
        let skippedContents = controller.get('skippedContents');
        controller.toggleSkippedContents(skippedContents);
      }
    },

    /**
     * Action triggered when the user click an accordion item
     */
    onSelectItem() {
      let controller = this;
      if (controller.get('isPremiumClass')) {
        let skippedContents = controller.get('skippedContents');
        let isSkippedContentsAvailable = skippedContents
          ? controller.isSkippedContentsEmpty(skippedContents)
          : false;
        if (isSkippedContentsAvailable) {
          controller.toggleSkippedContents(skippedContents);
        }
      }
    },

    onClearCustomizeMsg() {
      Ember.$('.custom-msg').hide(800);
    },

    courseRouteSuggestAction: function() {
      let controller = this;
      if (controller.get('target.router')) {
        controller.get('target.router').refresh();
      }
    },
    studyCoursePlayer: function(type, unitId, lessonId, item) {
      let controller = this;
      controller.send('studyPlayer', type, unitId, lessonId, item);
    },

    closePullUp() {
      const component = this;
      component.set('isOpenPlayer', false);
      component.set('resetPerformance', true);
      component.getUserCurrentLocation();
      component.get('studentClassController').send('reloadData');
    },

    /**
     * Action triggered when the user click an report
     */
    onToggleReportPeriod() {
      this.set('isShowStudentProgressReport', true);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init: function() {
    const controller = this;
    controller._super(...arguments);
    let tab = controller.get('tab');
    Ember.run.scheduleOnce('afterRender', controller, function() {
      $('[data-toggle="tooltip"]').tooltip();
    });
    if (tab && tab === 'report') {
      controller.openStudentCourseReport();
    }
    const context = {
      classId: controller.get('currentClass.id'),
      courseId: controller.get('currentClass.courseId')
    };
    controller
      .get('parseEventService')
      .postParseEvent(PARSE_EVENTS.VIEW_COURSE_MAP, context);
  },

  // -------------------------------------------------------------------------
  // Properties

  changeLanguage() {
    const controller = this;
    let classes = controller.get('class');
    controller.changeLanguages(classes);
  },

  /**
   * @property {boolean} toggleLocation - indicates the toggle location state to scroll down
   */
  toggleLocation: false,

  /**
   * @prop {String} userLocation - Location of a user in a course
   * String of the form 'unitId[+lessonId[+resourceId]]'
   */
  userLocation: null,

  /**
   * A link to the parent class controller
   * @see controllers/class.js
   * @property {Class}
   */
  class: Ember.computed.alias('studentClassController.class'),

  /**
   *Show the current location
   */
  showLocation: true,

  /**
   * A link to the content visibility from class controller
   * @see controllers/class.js
   * @property {ClassContentVisibility}
   */
  contentVisibility: Ember.computed.alias(
    'studentClassController.contentVisibility'
  ),

  openingLocation: Ember.computed('location', function() {
    if (this.get('isFirstLoad')) {
      this.set('isFirstLoad', false);
      var location = this.get('location') || this.get('userLocation');
      this.set('location', location);
      return location;
    } else {
      return this.get('location') || '';
    }
  }),

  /**
   * @type {JSON}
   * Property to store list of skipped rescope content
   */
  skippedContents: null,

  /**
   * @type {Boolean}
   * Property to toggle checkbox visibility
   */
  isChecked: false,

  /**
   * @type {Boolean}
   * Property to check whether a class is rescoped
   */
  isPremiumClass: Ember.computed('class', function() {
    let controller = this;
    const currentClass = controller.get('class');
    let setting = currentClass.get('setting');
    return setting ? setting['course.premium'] : false;
  }),

  isPremiumCourse: Ember.computed('class', function() {
    let controller = this;
    const currentClass = controller.get('class');
    let setting = currentClass.get('setting');
    return setting
      ? setting['course.premium'] && setting['course.premium'] === true
      : false;
  }),

  hasRouteSuggestion: Ember.computed('class', function() {
    let controller = this;
    const route0 = controller.get('route0');
    let isCourseSetup = controller.get('isPremiumCourse');
    let showRoute0Suggestion =
      route0.status === 'pending' || route0.status === 'rejected';
    return isCourseSetup && showRoute0Suggestion;
  }),

  showRoute0Suggestion: Ember.computed('class', function() {
    let controller = this;
    const route0 = controller.get('route0');
    let isCourseSetup = controller.get('isPremiumCourse');
    let showRoute0Suggestion = route0.status === 'accepted';
    return isCourseSetup && showRoute0Suggestion;
  }),

  /**
   * @property {UUID} userId
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * @property {Array} selfGradeItems
   * List of items to be graded
   */
  selfGradeItems: Ember.A([]),

  /**
   * @property {Object} activeReportPeriod
   */
  activeReportPeriod: Ember.computed(function() {
    const component = this;
    return Ember.Object.create({
      text: component.get('i18n').t('common.progress-report'),
      value: 'progress-report',
      type: 'default'
    });
  }),

  /**
   * Set course activated date
   **/
  courseStartDate: Ember.computed('course.createdDate', function() {
    if (this.get('course.createdDate')) {
      return moment(this.get('course.createdDate')).format('YYYY-MM-DD');
    }
    return moment()
      .subtract(1, 'M')
      .format('YYYY-MM-DD');
  }),

  /**
   * A link to the parent class controller
   * @see controllers/class.js
   * @property {studentTimespentData}
   */
  studentTimespentData: Ember.computed.alias(
    'studentClassController.studentTimespentData'
  ),

  /**
   * @property {Boolean}
   */
  isPublicClass: Ember.computed.alias('class.isPublic'),

  // -------------------------------------------------------------------------
  // Observers

  /**
   * Observer current class
   */
  observeCurrentClass: Ember.observer('currentClass', function() {
    let controller = this;
    //Initially load rescope data
    if (controller.get('isPremiumClass')) {
      controller.processSkippedContents();
    }
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function processSkippedContents
   * Method to fetch and process the skipped contents
   */
  processSkippedContents() {
    let controller = this;
    controller.getSkippedContents().then(function(skippedContents) {
      let isContentAvailable = !!skippedContents;
      let isSkippedContentAvailable = skippedContents
        ? controller.isSkippedContentsEmpty(skippedContents)
        : false;
      controller.set('isContentAvailable', isContentAvailable);
      if (isSkippedContentAvailable) {
        controller.toggleSkippedContents(skippedContents);
        controller.set('isChecked', false);
      }
      if (!skippedContents) {
        controller.set('isChecked', true);
      }
    });
  },

  /**
   * @function getSkippedContents
   * Method to get skipped contents
   */
  getSkippedContents() {
    let controller = this;
    let currentClass = controller.get('currentClass');
    let filter = {
      classId: currentClass.get('id'),
      courseId: currentClass.get('courseId')
    };
    let skippedContentsPromise = Ember.RSVP.resolve(
      controller.get('rescopeService').getSkippedContents(filter)
    );
    return Ember.RSVP.hash({
      skippedContents: skippedContentsPromise
    })
      .then(function(hash) {
        controller.set('skippedContents', hash.skippedContents);
        return hash.skippedContents;
      })
      .catch(function() {
        controller.set('skippedContents', null);
      });
  },

  /**
   * @function getFormattedContentsByType
   * Method to get formatted content type
   */
  getFormattedContentsByType(contents, types) {
    let controller = this;
    let formattedContents = Ember.A([]);
    types.map(type => {
      let flag = type.charAt(0);
      formattedContents = formattedContents.concat(
        controller.parseSkippedContents(contents[`${type}`], flag)
      );
    });
    return formattedContents;
  },

  /**
   * @function fetchOaItemsToGradeByStudent
   * Method to fetch OA items to be graded by student
   * @return {Promise}
   */
  fetchOaItemsToGradeByStudent() {
    const controller = this;
    const requestParam = {
      classId: controller.get('class.id'),
      type: 'oa',
      source: 'coursemap',
      courseId: controller.get('course.id'),
      userId: controller.get('userId')
    };
    return controller.get('rubricService').getOaItemsToGrade(requestParam);
  },

  /**
   * @function toggleSkippedContents
   * Method to toggle skippedContents
   */
  toggleSkippedContents(skippedContents) {
    let controller = this;
    let contentTypes = Object.keys(skippedContents);
    let formattedContents = controller.getFormattedContentsByType(
      skippedContents,
      contentTypes
    );
    controller.toggleContentVisibility(formattedContents);
  },

  /**
   * @function parseSkippedContents
   * Method to parse fetched rescoped contents
   */
  parseSkippedContents(contentIds, flag) {
    let parsedContentIds = Ember.A([]);
    contentIds.map(id => {
      parsedContentIds.push(`.${flag}-${id}`);
    });
    return parsedContentIds;
  },

  /**
   * @function toggleContentVisibility
   * Method to toggle content visibility
   */
  toggleContentVisibility(contentClassnames) {
    let controller = this;
    let isChecked = controller.get('isChecked');
    const $contentComponent = Ember.$(contentClassnames.join());
    if (isChecked) {
      $contentComponent.show().addClass('rescoped-content');
    } else {
      $contentComponent.hide();
    }
  },

  /**
   * @function isSkippedContentsEmpty
   * Method to toggle rescoped content visibility
   */
  isSkippedContentsEmpty(skippedContents) {
    let keys = Object.keys(skippedContents);
    let isContentAvailable = false;
    keys.some(key => {
      isContentAvailable = skippedContents[`${key}`].length > 0;
      return isContentAvailable;
    });
    return isContentAvailable;
  },

  openStudentCourseReport() {
    let controller = this;
    controller.set('showCourseReport', true);
    let params = Ember.Object.create({
      userId: controller.get('session.userId'),
      classId: controller.get('class.id'),
      class: controller.get('class'),
      courseId: controller.get('course.id'),
      course: controller.get('course'),
      isTeacher: false,
      isStudent: true,
      loadUnitsPerformance: false
    });
    controller.set('studentCourseReportContext', params);
  },
  onClosePullUp() {
    let controller = this;
    controller.set('showCourseReport', false);
  },
  updateParent(objData) {
    if (this.attrs && this.attrs.updateModel) {
      this.attrs.updateModel(objData);
    }
  },

  /**
   * @function loadSelfGradeItems
   * Method to load self grade items
   */
  loadSelfGradeItems() {
    const controller = this;
    controller.fetchOaItemsToGradeByStudent().then(function(selfGradeItems) {
      controller.set('selfGradeItems', selfGradeItems.get('gradeItems'));
    });
  },

  getUserCurrentLocation() {
    const controller = this;
    let currentClass = controller.get('currentClass');
    let classId = currentClass.get('id');
    let userId = controller.get('userId');
    let courseId = currentClass.get('courseId');
    let units = controller.get('units');
    controller.fetchUnitsPerformance(userId, classId, courseId, units);
    let locationQueryParam = {
      courseId
    };
    if (
      currentClass.milestoneViewApplicable &&
      currentClass.milestoneViewApplicable === true &&
      currentClass.preference &&
      currentClass.preference.framework
    ) {
      locationQueryParam.fwCode = currentClass.preference.framework;
    }

    controller
      .get('analyticsService')
      .getUserCurrentLocation(classId, userId, locationQueryParam)
      .then(userLocationObj => {
        let userLocation = '';
        if (userLocationObj) {
          let unitId = userLocationObj.get('unitId');
          let lessonId = userLocationObj.get('lessonId');
          let collectionId = userLocationObj.get('collectionId');
          userLocation = `${unitId}+${lessonId}+${collectionId}`;
          controller.set('userLocation', userLocation);
          controller.set('location', userLocation);
          controller.set('showLocation', true);
          controller.set('toggleLocation', !controller.get('toggleLocation'));
        }
      });
  },

  fetchUnitsPerformance(userId, classId, courseId, units) {
    let route = this;
    Ember.RSVP.hash({
      ucPerformance: route
        .get('performanceService')
        .findStudentPerformanceByCourse(userId, classId, courseId, units, {
          collectionType: CONTENT_TYPES.COLLECTION
        }),
      uaPerformance: route
        .get('performanceService')
        .findStudentPerformanceByCourse(userId, classId, courseId, units, {
          collectionType: CONTENT_TYPES.ASSESSMENT
        })
    }).then(({ ucPerformance, uaPerformance }) => {
      units.forEach(unit => {
        let unitPerformanceAssessment = uaPerformance.findBy(
          'id',
          unit.get('id')
        );
        if (
          !unitPerformanceAssessment ||
          unitPerformanceAssessment.score === null
        ) {
          unitPerformanceAssessment = ucPerformance.findBy(
            'id',
            unit.get('id')
          );
        }
        if (unitPerformanceAssessment) {
          unit.set('performance', unitPerformanceAssessment);
        }
      });
    });
  }
});
