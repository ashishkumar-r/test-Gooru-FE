import Ember from 'ember';
import Context from 'gooru-web/models/result/context';
import { CONTENT_TYPES } from 'gooru-web/config/config';
/**
 *
 * Summary data report of Rubric Grading for an OE Question
 * Gathers and passes the necessary information to the controller
 *
 * @module
 * @augments ember/Route
 */
export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Ember.Service} Service to retrieve an assessment result
   */
  userSessionService: Ember.inject.service('api-sdk/user-session'),

  /**
   * @type {RubricService} Service to retrieve rubric information
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @type {ProfileService} Service to retrieve question information
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @property {Ember.Service} Service to retrieve an assessment result
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Returns to Analytics Report
     * @function actions:goBack
     */
    goBack: function() {
      const route = this;
      const controller = route.get('controller');
      const context = controller.get('context');
      var role = 'teacher';

      if (controller.get('isStudent')) {
        role = 'student';
      }

      const queryParams = {
        collectionId: context.get('collectionId'),
        type: context.get('collectionType'),
        userId: context.get('userId'),
        classId: context.get('classId'),
        sessionId: context.get('sessionId'),
        courseId: context.get('courseId'),
        unitId: context.get('unitId'),
        lessonId: context.get('lessonId'),
        role: role,
        backUrl: controller.get('backUrl')
      };

      route.transitionTo('reports.student-collection-analytics', {
        queryParams: queryParams
      });
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Get model for the controller
   */
  model: function(params) {
    const route = this;
    const context = route.getContext(params);
    const classId = params.classId;
    const courseId = params.courseId;
    const collectionId = params.collectionId;
    const questionId = params.questionId;
    const sessionId = params.sessionId;
    const studentId = params.studentId;

    const questionPromise = route
      .get('questionService')
      .readQuestion(questionId);
    const summaryPromise = route
      .get('rubricService')
      .getRubricQuestionSummary(
        studentId,
        classId,
        courseId,
        collectionId,
        questionId,
        sessionId
      );

    return Ember.RSVP.hash({
      question: questionPromise,
      context,
      summary: summaryPromise,
      sessionId
    });
  },

  afterModel: function(model) {
    const route = this;
    const context = model.context;
    const questionId = model.question.get('id');
    const isCollection =
      model.context.collectionType === CONTENT_TYPES.COLLECTION;
    const session = !isCollection ? model.sessionId : null;

    if (session) {
      context.set('sessionId', session);
    }

    const performanceService = route.get('performanceService');
    return performanceService
      .findAssessmentResultByCollectionAndStudent(context)
      .then(function(assessmentResult) {
        const questionResults = assessmentResult.resourceResults;
        const questionResult = questionResults.findBy('resourceId', questionId);
        model.questionResult = questionResult;
      });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.set(
      'questionText',
      model.question.get('description') || model.question.get('title')
    );
    controller.set('questionThumbnail', model.question.get('thumbnail'));
    controller.set('question', model.question);
    controller.set('rubric', model.question.get('rubric'));
    controller.set('questionSummary', model.summary);
    controller.set('context', model.context);
    controller.set('questionResult', model.questionResult);
  },

  /**
   * Get the player context
   * @param params
   * @returns {Context}
   */
  getContext: function(params) {
    const collectionType = params.collectionType;
    const classId = params.classId;
    const courseId = params.courseId;
    const collectionId = params.collectionId;
    const userId = params.studentId;
    const unitId = params.unitId;
    const lessonId = params.lessonId;

    return Context.create({
      collectionType,
      userId,
      collectionId,
      courseId,
      classId,
      unitId,
      lessonId
    });
  }
});
