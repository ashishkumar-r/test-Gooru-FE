import Ember from 'ember';
import Context from 'gooru-web/models/result/context';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import { CONTENT_TYPES } from 'gooru-web/config/config';
/**
 *
 * Analytics data for a student related to a collection of resources
 * Gathers and passes the necessary information to the controller
 *
 * @module
 * @augments ember/Route
 */
export default Ember.Route.extend(PrivateRouteMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  /**
   * @property {Ember.Service} Service to retrieve an assessment result
   */
  userSessionService: Ember.inject.service('api-sdk/user-session'),

  /**
   * @property {AssessmentService} Service to retrieve an assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {CollectionService} Service to retrieve a collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @property {LessonService} Service to retrieve a lesson
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  /**
   * @property {Ember.Service} Service to retrieve an assessment result
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @property {Ember.Service} Service to retrieve an assessment result from LI
   */
  learnerService: Ember.inject.service('api-sdk/learner'),

  /**
   * @property {Service} profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    goBack: function() {
      const route = this;
      const controller = route.get('controller');
      const context = controller.get('context');
      let toRoute = controller.get('backUrl');
      if (context.get('lessonId')) {
        if (controller.get('isTeacher')) {
          toRoute ? route.transitionTo(toRoute) : route.backToCourseMap();
        } else {
          route.backToData();
        }
      } else {
        toRoute = toRoute || 'index'; //index when refreshing the page, TODO fix
        route.transitionTo(toRoute);
      }
    },

    /**
     * Open the Open ended question summary report
     * @function actions:viewOEReport
     * @param questionId {String}
     */
    viewOEReport: function(questionId) {
      const route = this;
      const controller = route.get('controller');
      const context = controller.get('context');
      var sessionId = context.get('sessionId');
      const isCollection = controller.get('collection.isCollection');

      if (isCollection) {
        sessionId = controller.get('collectionSessionId');
      }

      const queryParams = {
        collectionId: context.get('collectionId'),
        collectionType: context.get('collectionType'),
        studentId: context.get('userId'),
        classId: context.get('classId'),
        sessionId: sessionId,
        courseId: context.get('courseId'),
        unitId: context.get('unitId'),
        lessonId: context.get('lessonId'),
        questionId,
        role: controller.get('role'),
        backUrl: controller.get('backUrl')
      };

      route.transitionTo('reports.student-open-ended-summary', {
        queryParams: queryParams
      });
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @param {{ assessmentId: string, resourceId: string }} params
   */
  model(params) {
    const route = this;
    const context = route.getContext(params);
    const type = params.type || 'collection';

    const lessonPromise = context.get('courseId')
      ? route
        .get('lessonService')
        .fetchById(
          context.get('courseId'),
          context.get('unitId'),
          context.get('lessonId')
        )
      : null;

    const isCollection = type === 'collection';
    const collectionPromise = isCollection
      ? route.get('collectionService').readCollection(params.collectionId)
      : route.get('assessmentService').readAssessment(params.collectionId);
    const completedSessionsPromise = isCollection
      ? []
      : context.get('classId')
        ? route.get('userSessionService').getCompletedSessions(context)
        : route.get('learnerService').fetchLearnerSessions(context);

    return Ember.RSVP.hash({
      collection: collectionPromise,
      completedSessions: completedSessionsPromise,
      lesson: lessonPromise,
      context: context,
      profile:
        context.userId !== 'anonymous'
          ? route.get('profileService').readUserProfile(context.userId)
          : {}
    });
  },

  afterModel: function(model) {
    const controller = this;
    const context = model.context;
    var completedSessions = model.completedSessions;
    const totalSessions = completedSessions.length;
    const session = totalSessions ? completedSessions[totalSessions - 1] : null;

    if (session) {
      //collections has no session
      context.set('sessionId', session.sessionId);
    }

    if (context.get('classId')) {
      const performanceService = controller.get('performanceService');
      return performanceService
        .findAssessmentResultByCollectionAndStudent(context)
        .then(function(assessmentResult) {
          model.assessmentResult = assessmentResult;
        });
    } else {
      const learnerService = controller.get('learnerService');
      return learnerService
        .fetchCollectionPerformance(context)
        .then(function(assessmentResult) {
          model.assessmentResult = assessmentResult;
        });
    }
  },

  /**
   *
   * @param controller
   * @param model
   * @returns {Promise.<T>}
   */
  setupController: function(controller, model) {
    controller.set('collection', model.collection.toPlayerCollection());
    controller.set('lesson', model.lesson);
    controller.set('completedSessions', model.completedSessions);
    controller.set('context', model.context);
    controller.set('profile', model.profile);
    const isCollection = controller.get('collection.isCollection');

    if (model.assessmentResult) {
      if (isCollection) {
        controller.set('collectionSessionId', model.assessmentResult.sessionId);
      }
      controller.setAssessmentResult(model.assessmentResult);
    }
  },

  /**
   * Get the player context
   * @param params
   * @returns {Context}
   */
  getContext: function(params) {
    const route = this;
    let userId = route.get('session.userId');
    const role = params.role;
    if (role === 'teacher') {
      /*
        for teachers, it could be the teacher playing a collection or a teacher seeing its students report
        for student should use always the session id
       */
      userId = params.userId || userId;
    }
    const collectionId = params.collectionId;
    const courseId = params.courseId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;

    return Context.create({
      collectionType: params.type,
      userId: userId,
      collectionId: collectionId,
      courseId: courseId,
      classId: params.classId,
      unitId: unitId,
      lessonId: lessonId
    });
  },

  /**
   * Take the user back to data page
   */
  backToData: function() {
    const route = this;
    const controller = route.get('controller');
    const context = controller.get('context');

    if (context.get('classId')) {
      route.transitionTo('student.class.performance', context.get('classId'), {
        queryParams: {
          filterBy: CONTENT_TYPES.ASSESSMENT
        }
      });
    } else {
      route.transitionTo(
        'student.independent.performance',
        context.get('courseId'),
        {
          queryParams: {
            filterBy: CONTENT_TYPES.ASSESSMENT
          }
        }
      );
    }
  },

  /**
   * Take the user back to course map page
   */
  backToCourseMap: function() {
    const route = this;
    const controller = route.get('controller');
    const context = controller.get('context');
    const unitId = context.get('unitId');
    const lessonId = context.get('lessonId');
    route.transitionTo('teacher.class.course-map', context.get('classId'), {
      queryParams: {
        location: `${unitId}+${lessonId}`
      }
    });
  },

  deactivate: function() {
    this.get('controller').resetValues();
  }
});
