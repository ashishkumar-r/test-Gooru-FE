import Ember from 'ember';
import LearningJourneyMixin from 'gooru-web/mixins/learning-journey-mixin';
import {
  ROLES,
  PLAYER_EVENT_SOURCE,
  CLASS_SKYLINE_INITIAL_DESTINATION,
  CONTENT_TYPES
} from 'gooru-web/config/config';
import ContextMixin from 'gooru-web/mixins/quizzes/context';

export default Ember.Component.extend(LearningJourneyMixin, ContextMixin, {
  // ----------------------------------------------------
  // Attributes

  classNames: ['learner-path'],

  // ---------------------------------------------------------
  // Dependencies

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * It has the current user session object
   */
  session: Ember.inject.service(),

  /**
   * @type {PerformanceService} Service to retrieve class performance summary
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * route0 Service to perform route0 data operations
   */
  route0Service: Ember.inject.service('api-sdk/route0'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  // -------------------------------------------------------
  // Properties

  /**
   * @property {Object} currentClass help to hold class datas
   */
  currentClass: null,

  /**
   * @property {Object} userLocation help to hold user location status
   */
  userLocation: null,

  /**
   * @property {Array} units help to hold class units
   */
  units: Ember.A([]),

  /**
   * @property {Object} course help to hold the current class course
   */
  course: null,

  /**
   * @property {Boolean} isAllContentsAreRescoped
   */
  isAllContentsAreRescoped: false,

  /**
   * @property {String} classId help to hold current class id
   */
  classId: Ember.computed('currentClass', function() {
    return this.get('currentClass.id');
  }),

  /**
   * @property {String} classId help to hold current class preference value
   */
  preference: Ember.computed('currentClass', function() {
    return this.get('currentClass.preference');
  }),

  /**
   * @property {boolean} isMilestoneView help to know milestone or course map
   */
  isMilestoneView: Ember.computed('currentClass', function() {
    const currentClass = this.get('currentClass');
    return this.isMilestoneViewEnabled(
      currentClass.preference,
      currentClass.setting
    );
  }),

  /**
   * @property {boolean} isPremiumCourse help to know current class is premium or not
   */
  isPremiumCourse: Ember.computed('currentClass', function() {
    let setting = this.get('currentClass.setting');
    return setting
      ? setting['course.premium'] && setting['course.premium'] === true
      : false;
  }),

  /**
   * @property {boolean} route0Applicable help to know class has route 0 content
   */
  route0Applicable: Ember.computed('currentClass', function() {
    return this.get('currentClass.route0Applicable');
  }),

  hasRouteSuggestion: Ember.computed('courseMapRoute0', function() {
    const component = this;
    const route0 = component.get('courseMapRoute0');
    let isCourseSetup = component.get('isPremiumCourse');
    let showRoute0Suggestion =
      route0.status === 'pending' || route0.status === 'rejected';
    return isCourseSetup && showRoute0Suggestion;
  }),

  showRoute0Suggestion: Ember.computed('courseMapRoute0', function() {
    const component = this;
    const route0 = component.get('courseMapRoute0');
    let isCourseSetup = component.get('isPremiumCourse');
    let showRoute0Suggestion = route0.status === 'accepted';
    return isCourseSetup && showRoute0Suggestion;
  }),

  /**
   * @property {Array} milestones holding the milestone list
   */
  milestones: Ember.A(),

  /**
   * @property {Array} milestoneRoute0 holding the route 0 milestone list
   */
  milestoneRoute0: Ember.A(),

  /**
   * @property {Array} courseMapRoute0 holding the route 0 course map list
   */
  courseMapRoute0: Ember.A(),

  /**
   * @property {boolean} isLoading help to know api loaded or not
   */
  isLoading: false,

  /**
   * @property {String} courseMapLocation help to hold the course map location
   */
  courseMapLocation: false,

  hasLocation: false,

  contentVisibility: null,

  destination: null,

  inCompleteClass: false,

  isStudyPlayer: false,

  isDiagnosticEnd: false,

  diagnosticDetails: null,

  resetPerformance: false,

  // -------------------------------------------------------------------------
  // Observers

  /**
   * Observer current class
   */
  observeCurrentClass: Ember.observer('skippedContents', function() {
    let component = this;
    let units = component.get('units');
    let skippedUnitContents = units.filterBy('isSkipped', true);
    if (skippedUnitContents) {
      let activeUnitContents = units.filterBy('isSkipped', false);
      let activeUnit = activeUnitContents.get('firstObject');
      if (activeUnit) {
        component.set('courseMapLocation', activeUnit.id);
        activeUnit.set('isResumeUnit', true);
      }
    }
  }),

  // ------------------------------------------------------
  // Hooks

  didInsertElement() {
    if (
      this.get('destination') !==
        CLASS_SKYLINE_INITIAL_DESTINATION.classSetupInComplete &&
      this.get('course') &&
      this.get('course.id')
    ) {
      this.set('isLoading', true);
      this.initialLoad();
    } else {
      this.set('inCompleteClass', true);
    }
  },

  // -----------------------------------------------------
  // Actions

  actions: {
    goCourseMap() {
      this.get('router').transitionTo('student.class.course-map');
    },

    studyPlayer(type, unitId, lessonId, item) {
      const component = this;
      const currentClass = component.get('currentClass');
      const classId = currentClass.get('id');
      const courseId = currentClass.get('courseId');
      item.set('minScore', currentClass.get('minScore'));

      component.startCollectionStudyPlayer(
        classId,
        courseId,
        unitId,
        lessonId,
        item
      );
    },

    onLocationUpdate(location) {
      this.set('courseMapLocation', location);
    },

    courseRouteSuggestAction: function() {
      let component = this;
      if (component.get('target.router')) {
        component.get('target.router').refresh();
      }
    },

    onSelectItem() {
      this.sendAction('onSelectItem');
    },

    //Action triggered in init for check all the milestone contents are rescoped
    checkAllContentsAreRescoped(milestoneData) {
      const milestones = milestoneData;
      const rescopeMilestone = milestones.filterBy('rescope', true);
      let isAllContentsAreRescoped =
        milestones.length === rescopeMilestone.length;
      this.set('isAllContentsAreRescoped', isAllContentsAreRescoped);
    }
  },

  // --------------------------------------------------------
  // Methods

  initialLoad() {
    let component = this;
    const milestoneViewApplicable = component.get(
      'currentClass.milestoneViewApplicable'
    );
    const classId = component.get('classId');
    const courseId = component.get('currentClass.courseId');
    const userId = component.get('session.userId');
    let units = component.get('units');
    const userLocationObj = component.get('userLocation');
    const isPremiumCourse = component.get('isPremiumCourse');
    if (
      isPremiumCourse &&
      milestoneViewApplicable &&
      component.get('isMilestoneView')
    ) {
      component.fetchMilestoneDetails();
    } else {
      let userLocation = '';
      if (userLocationObj) {
        const isRoute0Applicable = component.get('route0Applicable');
        let unitId = userLocationObj.get('unitId');
        let lessonId = userLocationObj.get('lessonId');
        let collectionId = userLocationObj.get('collectionId');
        let activeUnit = units.findBy('id', unitId);
        if (activeUnit) {
          units.forEach(unit => unit.set('isResumeUnit', false));
          activeUnit.set('isResumeUnit', true);
        } else if (isRoute0Applicable) {
          Ember.RSVP.hash({
            route0: component.fetchCourseMapRoute0Content(classId, courseId)
          }).then(({ route0 }) => {
            route0.milestones.map(milestone => {
              milestone.units.map(unit => {
                if (unit.id === unitId) {
                  unit.set('isResumeUnit', true);
                  unit.lessons.map(lesson => {
                    if (lesson.lessonId === lessonId) {
                      lesson.isResumeLesson = true;
                    }
                  });
                } else {
                  unit.set('isResumeUnit', false);
                }
              });
            });
            component.set('courseMapRoute0', route0);
            component.set('isLoading', false);
          });
        }
        userLocation = `${unitId}+${lessonId}+${collectionId}`;
        component.set('courseMapLocation', userLocation);
      } else {
        if (units.length) {
          let activeUnit = units.get('firstObject');
          component.set('courseMapLocation', activeUnit.id);
          activeUnit.set('isResumeUnit', true);
        }
      }
      component.fetchUnitsPerformance(userId, classId, courseId, units);
    }
  },

  fetchMilestoneDetails() {
    let component = this;
    const classId = component.get('classId');
    const courseId = component.get('currentClass.courseId');
    const fwCode = component.get('preference.framework') || 'GUT';
    const isRoute0Applicable = component.get('route0Applicable');
    let route0Promise = Ember.RSVP.resolve([]);
    const courseIdContext = {
      courseId,
      classId
    };
    let contentPromise = component
      .get('courseService')
      .getCourseMilestones(courseId, fwCode);
    if (isRoute0Applicable) {
      route0Promise = component.checkAndRetrieveRoute0ContentsByStatus(
        courseIdContext
      );
    }
    Ember.RSVP.hash({
      milestone: contentPromise,
      milestoneRoute0: route0Promise
    }).then(({ milestone, milestoneRoute0 }) => {
      component.set('hasLocation', true);
      component.set('milestones', milestone);
      component.set('milestoneRoute0', milestoneRoute0);
      component.set('isLoading', false);
    });
  },

  fetchUnitsPerformance(userId, classId, courseId, units) {
    let component = this;
    Ember.RSVP.hash({
      ucPerformance: component
        .get('performanceService')
        .findStudentPerformanceByCourse(userId, classId, courseId, units, {
          collectionType: CONTENT_TYPES.COLLECTION
        }),
      uaPerformance: component
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
      component.set('hasLocation', true);
      component.set('isLoading', false);
    });
  },

  fetchCourseMapRoute0Content(classId, courseId) {
    let component = this;
    var route0Promise = {};
    let premiumCourse = this.get('isPremiumCourse');
    let isRoute0Applicable = component.get('route0Applicable');
    if (premiumCourse & isRoute0Applicable) {
      route0Promise = component.get('route0Service').fetchInClass({
        courseId,
        classId
      });
    } else {
      route0Promise = new Ember.RSVP.Promise(function(resolve) {
        resolve({
          status: '401'
        }); // This is a dummy status
      });
    }
    return route0Promise;
  },

  checkAndRetrieveRoute0ContentsByStatus(courseIdContext) {
    const component = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      component
        .get('route0Service')
        .fetchInClass(courseIdContext)
        .then(route0Contents => {
          resolve(route0Contents.milestones);
        }, reject);
    });
  },

  /**
   * Navigates to collection
   * @param {string} classId
   * @param {string} courseId
   * @param {string} unitId
   * @param {string} lessonId
   * @param {Collection} collection
   */
  startCollectionStudyPlayer: function(
    classId,
    courseId,
    unitId,
    lessonId,
    collection
  ) {
    let route = this;
    let role = ROLES.STUDENT;
    let source = PLAYER_EVENT_SOURCE.COURSE_MAP;
    let collectionId = collection.get('id');
    let collectionType = collection.get('collectionType');
    let collectionSubType = collection.get('collectionSubType');
    let minScore = collection.get('minScore');
    let pathId = collection.get('pathId') || 0;
    let pathType = collection.get('pathType') || '';
    let ctxPathId = collection.get('ctxPathId') || 0;
    let ctxPathType = collection.get('ctxPathType') || '';
    let userLocation = route.get('userLocation');
    let isCompletedLocation =
      userLocation &&
      userLocation.status === 'complete' &&
      userLocation.collectionId === collectionId;
    let queryParams = {
      classId,
      unitId,
      lessonId,
      collectionId,
      role,
      source,
      type: collectionType,
      subtype: collectionSubType,
      pathId,
      minScore,
      collectionSource: collection.source || 'course_map',
      isStudyPlayer: true,
      pathType,
      isIframeMode: true,
      ctxPathId,
      ctxPathType
    };

    if (isCompletedLocation) {
      queryParams.courseId = courseId;
      route.loadReportView(queryParams, collection).then(contextParams => {
        let playerUrl = route
          .get('router')
          .generate('reports.study-student-collection', {
            queryParams: contextParams
          });
        route.sendAction('playContent', playerUrl, collection);
      });
    } else {
      let suggestionPromise = null;
      // Verifies if it is a suggested Collection/Assessment
      if (collectionSubType) {
        suggestionPromise = route
          .get('navigateMapService')
          .startSuggestion(
            courseId,
            unitId,
            lessonId,
            collectionId,
            collectionType,
            collectionSubType,
            pathId,
            classId,
            pathType,
            null,
            ctxPathId,
            ctxPathType
          );
      } else {
        suggestionPromise = route
          .get('navigateMapService')
          .startCollection(
            courseId,
            unitId,
            lessonId,
            collectionId,
            collectionType,
            classId,
            pathId,
            pathType,
            null,
            ctxPathId,
            ctxPathType
          );
      }
      suggestionPromise.then(function() {
        let playerUrl = route.get('router').generate('study-player', courseId, {
          queryParams
        });
        route.sendAction('playContent', playerUrl, collection);
      });
    }
  }
});
