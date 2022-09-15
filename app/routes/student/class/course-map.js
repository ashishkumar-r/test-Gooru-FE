import Ember from 'ember';
import {
  ROLES,
  PLAYER_EVENT_SOURCE,
  CLASS_SKYLINE_INITIAL_DESTINATION,
  CONTENT_TYPES
} from 'gooru-web/config/config';
import LearningJourneyMixin from 'gooru-web/mixins/learning-journey-mixin';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
import ContextMixin from 'gooru-web/mixins/quizzes/context';

export default Ember.Route.extend(
  LearningJourneyMixin,
  UIHelperMixin,
  ContextMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    session: Ember.inject.service('session'),
    /**
     * @type {ClassService} Service to retrieve class information
     */
    classService: Ember.inject.service('api-sdk/class'),
    /**
     * @type {CourseService} Service to retrieve course information
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * @type {UnitService} Service to retrieve unit information
     */
    unitService: Ember.inject.service('api-sdk/unit'),
    /**
     * @type {PerformanceService} Service to retrieve class performance summary
     */
    performanceService: Ember.inject.service('api-sdk/performance'),

    i18n: Ember.inject.service(),

    profileService: Ember.inject.service('api-sdk/profile'),
    /**
     * @requires service:api-sdk/analytics
     */
    analyticsService: Ember.inject.service('api-sdk/analytics'),

    /**
     * @property {NavigateMapService}
     */
    navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

    route0Service: Ember.inject.service('api-sdk/route0'),

    quizzesAttemptService: Ember.inject.service('quizzes/attempt'),

    courseMapService: Ember.inject.service('api-sdk/course-map'),

    // -------------------------------------------------------------------------
    // Attributes

    // -------------------------------------------------------------------------
    // Actions

    actions: {
      studyNow: function() {
        const route = this;
        const currentClass = route.modelFor('student.class').class;
        const classId = currentClass.get('id');
        const courseId = currentClass.get('courseId');

        route.continueCourseStudyPlayer(classId, courseId);
      },

      /**
       * Open the player with the specific collection/assessment
       *
       * @function actions:playItem
       * @param {string} unitId - Identifier for a unit
       * @param {string} lessonId - Identifier for lesson
       * @param {string} item - collection, assessment, lesson or resource
       */
      studyPlayer: function(type, unitId, lessonId, item) {
        const route = this;
        const currentClass = route.modelFor('student.class').class;
        const classId = currentClass.get('id');
        const courseId = currentClass.get('courseId');
        item.set('minScore', currentClass.get('minScore'));

        if (type === 'lesson') {
          route.startLessonStudyPlayer(
            classId,
            courseId,
            unitId,
            lessonId,
            item.pathType,
            item,
            item.ctxPathType
          );
        } else if (type === 'resource') {
          route.startResourceStudyPlayer(classId, courseId, item);
        } else {
          route.startCollectionStudyPlayer(
            classId,
            courseId,
            unitId,
            lessonId,
            item
          );
        }
      },

      updateCourseMap: function() {
        this.refresh(true);
      }
    },

    // -------------------------------------------------------------------------
    // Methods
    beforeModel(trans) {
      const route = this;
      let isPremiumCourse = route.modelFor('student.class').isPremiumCourse;
      const currentClass = route.modelFor('student.class').class;

      let isResourceLaunch = trans.queryParams.isResourceLaunch;

      if (isResourceLaunch) {
        return route.transitionTo('student.class.dashboard');
      }

      if (isPremiumCourse) {
        const isMilestoneViewEnabledForTenant = route.isMilestoneViewEnabled(
          currentClass.preference,
          currentClass.setting
        );
        if (
          currentClass.get('milestoneViewApplicable') &&
          isMilestoneViewEnabledForTenant
        ) {
          if (
            trans &&
            trans.queryParams &&
            trans.queryParams.milestoneId &&
            trans.queryParams.milestoneId.length > 0
          ) {
            let queryParams = {
              location: trans.queryParams.location
            };
            return route.transitionTo('student.class.milestone', {
              queryParams
            });
          } else {
            return route.transitionTo('student.class.milestone');
          }
        } else {
          let skylineInitialState = route.modelFor('student.class')
            .skylineInitialState;
          let destination = skylineInitialState.get('destination');
          if (
            destination ===
            CLASS_SKYLINE_INITIAL_DESTINATION.classSetupInComplete
          ) {
            return route.transitionTo('student.class.setup-in-complete');
          } else if (
            destination === CLASS_SKYLINE_INITIAL_DESTINATION.showDirections ||
            destination === CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress
          ) {
            return route.transitionTo('student.class.proficiency');
          } else if (
            destination === CLASS_SKYLINE_INITIAL_DESTINATION.diagnosticPlay
          ) {
            return route.transitionTo('student.class.diagnosis-of-knowledge');
          }
        }
      }
    },

    model: function() {
      const route = this;
      const currentClass = route.modelFor('student.class').class;
      route.setTitle('Learning Journey - Course map', currentClass.title);
      const course = route.modelFor('student.class').course;
      let units = route.modelFor('student.class').units;
      const unit0Content = route.modelFor('student.class').unit0Content;
      units = Ember.A([...unit0Content, ...units]);
      const userId = route.get('session.userId');
      const isPremiumCourse = route.modelFor('student.class').isPremiumCourse;
      const classMembers = currentClass.get('members');
      const courseId = course.get('id');
      if (!courseId) {
        return false;
      }
      const classId = currentClass.get('id');
      route.fetchUnitsPerformance(userId, classId, courseId, units);
      //Pass courseId as query param for student current location
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
      const userLocation = route
        .get('analyticsService')
        .getUserCurrentLocation(
          currentClass.get('id'),
          userId,
          locationQueryParam
        );
      var route0Promise = {};
      let setting = currentClass.get('setting');
      let premiumCourse = setting
          ? setting['course.premium'] && setting['course.premium'] === true
          : false,
        isRoute0Applicable = currentClass.get('route0Applicable');
      if (premiumCourse & isRoute0Applicable) {
        route0Promise = route.get('route0Service').fetchInClass({
          courseId: course.id,
          classId: currentClass.id
        });
      } else {
        route0Promise = new Ember.RSVP.Promise(function(resolve) {
          resolve({
            status: '401'
          }); // This is a dummy status
        });
      }
      const diagnosticPromise = route
        .get('courseMapService')
        .fetchCourseMapAlternatePath(courseId, {
          classId,
          userId
        });
      /*
     status: 'pending', //'accepted' , 'regected', 'na= not applicable, already complted' , 'na = not avalible, course does not have anything to offer'
    */
      return Ember.RSVP.hash({
        userLocation: userLocation,
        course: course,
        units: units,
        currentClass: currentClass,
        classMembers: classMembers,
        route0: route0Promise,
        isPremiumCourse: isPremiumCourse,
        courseAlternatPath: diagnosticPromise
      });
    },
    /**
     * Set all controller properties from the model
     * @param controller
     * @param model
     */
    setupController: function(controller, model) {
      let userLocation = '';
      if (model.userLocation) {
        controller.set('userLocationData', model.userLocation);
        let unitId = model.userLocation.get('unitId');
        let lessonId = model.userLocation.get('lessonId');
        let collectionId = model.userLocation.get('collectionId');
        userLocation = `${unitId}+${lessonId}+${collectionId}`;
      }

      controller.set('currentClass', model.currentClass);
      controller.set('userLocation', userLocation);
      controller.set('units', model.units);
      controller.set('course', model.course);
      controller.set('classMembers', model.classMembers);
      controller.set('route0', model.route0);
      controller.get('studentClassController').selectMenuItem('course-map');
      controller.set('isPremiumCourse', model.isPremiumCourse);
      controller.init();
      controller.changeLanguage();
      if (model && model.course) {
        controller.loadSelfGradeItems();
      }
    },

    resetController(controller) {
      controller.set('tab', null);
      controller.set('demo', false);
    },

    studyPlayerContent(
      collectionSubType,
      courseId,
      unitId,
      lessonId,
      collectionId,
      collectionType,
      pathId,
      classId,
      pathType,
      ctxPathId,
      ctxPathType,
      queryParams,
      collection
    ) {
      let route = this;
      let suggestionPromise = null;
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
        route.controller.set(
          'playerUrl',
          route.get('router').generate('study-player', courseId, {
            queryParams
          })
        );
        route.controller.set('isOpenPlayer', true);
        route.controller.set('playerContent', collection);
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
      let userLocation = route.controller.get('userLocationData');
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
          const userId = route.get('session.userId');
          route
            .get('quizzesAttemptService')
            .getAttemptIds(contextParams.contextId, userId)
            .then(attemptIds => {
              if (attemptIds && attemptIds.length) {
                route.controller.set(
                  'playerUrl',
                  route
                    .get('router')
                    .generate('reports.study-student-collection', {
                      queryParams: contextParams
                    })
                );
                route.controller.set('isOpenPlayer', true);
                route.controller.set('playerContent', collection);
              } else {
                route.studyPlayerContent(
                  collectionSubType,
                  courseId,
                  unitId,
                  lessonId,
                  collectionId,
                  collectionType,
                  pathId,
                  classId,
                  pathType,
                  ctxPathId,
                  ctxPathType,
                  queryParams,
                  collection
                );
              }
            });
        });
      } else {
        route.studyPlayerContent(
          collectionSubType,
          courseId,
          unitId,
          lessonId,
          collectionId,
          collectionType,
          pathId,
          classId,
          pathType,
          ctxPathId,
          ctxPathType,
          queryParams,
          collection
        );
      }
    },

    /**
     * Navigates to the next lesson collection
     * @param {string} classId
     * @param {string} courseId
     * @param {string} unitId
     * @param {string} lessonId
     * @param {string} pathType
     * @param {string} collection
     * @param {string} pathType
     */
    startLessonStudyPlayer: function(
      classId,
      courseId,
      unitId,
      lessonId,
      pathType,
      collection,
      ctxPathType
    ) {
      const route = this;
      const role = ROLES.STUDENT;
      const queryParams = {
        classId,
        unitId,
        lessonId,
        role,
        source: PLAYER_EVENT_SOURCE.COURSE_MAP,
        pathType,
        isIframeMode: true,
        ctxPathType
      };

      route
        .get('navigateMapService')
        .startLesson(
          courseId,
          unitId,
          lessonId,
          classId,
          pathType,
          null,
          ctxPathType
        )
        .then(function() {
          route.controller.set(
            'playerUrl',
            route.get('router').generate('study-player', courseId, {
              queryParams
            })
          );
          route.controller.set('isOpenPlayer', true);
          route.controller.set('playerContent', collection);
        });
    },

    /**
     * Resumes or start the course study player
     * @param {string} classId
     * @param {string} courseId
     */
    continueCourseStudyPlayer: function(classId, courseId) {
      const route = this;
      const queryParams = {
        role: ROLES.STUDENT,
        source: PLAYER_EVENT_SOURCE.COURSE_MAP,
        classId,
        isIframeMode: true
      };
      route
        .get('navigateMapService')
        .continueCourse(courseId, classId)
        .then(() =>
          route.transitionTo('study-player', courseId, {
            queryParams
          })
        );
    },

    /**
     * Navigates to resourse
     * @param {string} classId
     * @param {string} courseId
     * @param {Resource} resource
     */
    startResourceStudyPlayer: function(classId, courseId, resource) {
      const route = this;
      let queryParams = {
        unitId: resource.get('unitId'),
        lessonId: resource.get('lessonId'),
        collectionId: resource.get('assessmentId'),
        source: PLAYER_EVENT_SOURCE.COURSE_MAP,
        pathId: resource.get('pathId'),
        pathType: resource.get('pathType') || '',
        ctxPathId: resource.get('ctxPathId'),
        ctxPathType: resource.get('ctxPathType') || ''
      };
      route
        .get('navigateMapService')
        .startResource(
          courseId,
          queryParams.unitId,
          queryParams.lessonId,
          queryParams.collectionId,
          resource.get('id'),
          queryParams.pathId,
          classId,
          queryParams.pathType,
          queryParams.ctxPathId,
          queryParams.ctxPathType
        )
        .then(function() {
          if (classId) {
            queryParams.classId = classId;
          }
          route.transitionTo('resource-player', courseId, resource.id, {
            queryParams
          });
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
  }
);
