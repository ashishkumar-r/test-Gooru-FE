import Ember from 'ember';
import { toLocal } from 'gooru-web/utils/utils';
import { ASSESSMENT_SHOW_VALUES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import ReportMixin from 'gooru-web/mixins/reports/player-report-mixin';

/**
 *
 * Controls the access to the analytics data for a
 * student related to a collection of resources
 *
 */

export default Ember.Controller.extend(ConfigurationMixin, ReportMixin, {
  queryParams: [
    'classId',
    'courseId',
    'unitId',
    'lessonId',
    'collectionId',
    'userId',
    'type',
    'role',
    'backUrl'
  ],
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Ember.Service} Service to retrieve an assessment result
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @property {Ember.Service} Service to update analytics report.
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    selectAttempt: function(attempt) {
      if (attempt === this.get('lastAttempt')) {
        this.set('showChangeScore', true);
      } else {
        this.set('showChangeScore', false);
      }
      const session = this.get('completedSessions')[attempt - 1];
      this.set('isChangeScoreEnabled', false);
      this.loadSession(session);
    },

    onUpdateQuestionScore: function(data) {
      this.updateQuestionScore(data);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {boolean} areAnswersHidden - Should answer results be hidden?
   */
  areAnswersHidden: Ember.computed(
    'collection.isAssessment',
    'collection.showFeedback',
    function() {
      return (
        this.get('collection.isAssessment') &&
        this.get('collection.showFeedback') === ASSESSMENT_SHOW_VALUES.NEVER
      );
    }
  ),

  /**
   * @property {boolean} isAnswerKeyHidden - Should the answer key be hidden?
   */
  isAnswerKeyHidden: Ember.computed(
    'collection.isAssessment',
    'collection.showKey',
    function() {
      return (
        this.get('collection.isAssessment') && !this.get('collection.showKey')
      );
    }
  ),

  /**
   * @property {Collection}
   */
  collection: null,

  /**
   * @property {AssessmentResult}
   */
  assessmentResult: null,

  /**
   * @property {UserSession[]}
   */
  completedSessions: [],

  /**
   * @property {Context}
   */
  context: null,

  /**
   * @property {Lesson}
   */
  lesson: null,

  /**
   * @property {string} indicates if it is collection or assessment
   */
  type: null,

  /**
   * @property {string} indicates if it is a student or teacher view
   */
  role: null,

  /**
   * @property {string} backUrl is  to store the previous route
   */
  backUrl: null,

  /**
   * Indicates if the student is playing the collection
   * @property {boolean}
   */
  isStudent: Ember.computed.equal('role', 'student'),

  /**
   * Indicates if the teacher is playing this collection
   * @property {boolean}
   */
  isTeacher: Ember.computed.not('isStudent'),

  /**
   * indicates if it is assessment type
   * @property {boolean}
   */
  isAssessment: Ember.computed.equal('type', 'assessment'),

  /**
   * indicates if it is collection type
   * @property {boolean}
   */
  isCollection: Ember.computed.not('isAssessment'),

  /**
   * indicates the session id of collection
   * @property {string}
   */
  collectionSessionId: null,
  /**
   * Indicates which is the url to go back when pressing the button
   * this is useful when coming from the player out of the context of a class
   * this needs to be improved so it works when refreshing the page
   * @property {string}
   */

  /**
   * Indicates if the back navigation is visible
   * @property {boolean} showBackLink
   */
  showBackLink: Ember.computed.alias(
    'features.collections.player.showBackLink'
  ),

  /**
   * Indicates the visibility of change score button
   * @property {Boolean}
   */
  isChangeScoreEnabled: false,

  /**
   * Indicates whether change score button need to show or not
   * @type {Boolean}
   */
  showChangeScore: true,

  /**
   * last attempt value
   * @return {Boolean}
   */
  lastAttempt: Ember.computed('completedSessions', function() {
    return this.get('completedSessions').length;
  }),

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
  loadSession: function(session) {
    const controller = this;
    const context = controller.get('context');
    if (session) {
      //collections has no session
      context.set('sessionId', session.sessionId);
    }
    const performanceService = controller.get('performanceService');
    return performanceService
      .findAssessmentResultByCollectionAndStudent(context)
      .then(function(assessmentResult) {
        controller.setAssessmentResult(assessmentResult, session);
      });
  },

  showExemplarText: function() {
    const controller = this;
    let context = controller.get('context');
    if (context) {
      const classId = context.get('classId');
      return Ember.RSVP.hash({
        classData: classId ? controller.getClassData(classId) : null
      }).then(({ classData }) => {
        return controller.isShowExemplarText(classData);
      });
    } else {
      return true;
    }
  },

  setAssessmentResult: function(assessmentResult, session) {
    const controller = this;
    const collection = controller.get('collection');
    const totalAttempts = controller.get('completedSessions.length'); //TODO this is coming wrong from BE
    assessmentResult.merge(collection);
    assessmentResult.set('totalAttempts', totalAttempts);
    if (session && session.eventTime) {
      assessmentResult.set('submittedAt', toLocal(session.eventTime));
    }
    controller.set('assessmentResult', assessmentResult);
  },

  resetValues: function() {
    this.set('assessmentResult', null);
    this.set('completedSessions', []);
    this.set('context', null);
    this.set('lesson', null);
    this.set('type', undefined);
    this.set('classId', undefined);
    this.set('courseId', undefined);
    this.set('unitId', undefined);
    this.set('lessonId', undefined);
    this.set('collectionId', undefined);
    this.set('userId', undefined);
    this.set('role', undefined);
    this.set('backUrl', undefined);
    this.set('isChangeScoreEnabled', false);
    this.set('showChangeScore', true);
  },

  updateQuestionScore: function(questionScoreUpdateData) {
    let controller = this;
    const context = controller.get('context');
    let data = controller.buildQuestionScoreUpdatePayLoad(
      questionScoreUpdateData
    );
    controller
      .get('analyticsService')
      .updateQuestionScore(data)
      .then(() => {
        let completeSession = controller.get('completedSessions');
        let session = completeSession.findBy(
          'sessionId',
          context.get('sessionId')
        );
        controller
          .loadSession(session)
          .then(() => controller.set('isChangeScoreEnabled', false));
      });
  },

  buildQuestionScoreUpdatePayLoad: function(questionScoreUpdateData) {
    let controller = this;
    let context = controller.get('context');
    let updateData = Ember.Object.create({
      student_id: context.get('userId'),
      session_id: context.get('sessionId'),
      unit_id: context.get('unitId'),
      collection_id: context.get('collectionId'),
      class_id: context.get('classId'),
      collection_type: context.get('collectionType'),
      lesson_id: context.get('lessonId'),
      course_id: context.get('courseId'),
      resources: questionScoreUpdateData,
      content_source: 'coursemap' // TO-DO Have to replace actual content source, right now default set as coursemap
    });
    return updateData;
  }
});
