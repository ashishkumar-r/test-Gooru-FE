import Ember from 'ember';
import {
  correctPercentage,
  totalCompleted,
  totalNotStarted
} from 'gooru-web/utils/question-result';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'class-assessment', 'gru-student-performance-box'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * When the user clicks at the box
     */
    selectStudent: function() {
      const component = this;
      component.get('onSelectStudent')(component.get('student.id'));
      Ember.Logger.debug(`Clicking at student: ${component.get('student.id')}`);
    },

    /**
     * @function actions:selectQuestion
     * @param {Number} questionId
     */
    selectQuestion: function(questionId) {
      if (questionId) {
        this.get('onSelectQuestion')(questionId);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {User} student
   */
  student: null,

  /**
   * Array containing the QuestionResult or empty object based on the student responses
   * empty object for not started questions
   * @property {QuestionResult[]} reportData
   */
  reportData: null,

  /**
   * Indicates if the report is displayed in anonymous mode
   * @property {boolean} anonymous
   */
  anonymous: false,

  /**
   * It returns an object representing the status for each question
   * @property {[]} questions
   */
  questions: Ember.computed('reportData.[]', function() {
    let component = this;
    let reportData = component.get('reportData');
    return reportData.map(function(item) {
      return component.getQuestionStatus(item);
    });
  }),

  /**
   * @property {number} user assessment score
   */
  score: Ember.computed('reportData.[]', function() {
    return correctPercentage(this.get('reportData'));
  }),

  /**
   * Indicates if the assessment has been started
   * @property {number} started
   */
  started: Ember.computed('reportData.[]', function() {
    return totalCompleted(this.get('reportData'));
  }),

  /**
   * Indicates if the assessment has not started questions
   * @property {number} notStarted
   */
  totalNotStarted: Ember.computed('reportData.[]', function() {
    return totalNotStarted(this.get('reportData'));
  }),
  /**
   * @property {Function} onSelectQuestion - Event handler called when a question in a column is selected
   */
  onSelectQuestion: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Gets the question status
   * @param {QuestionResult} questionResult
   */
  getQuestionStatus: function(questionResult) {
    let status = 'not-started';
    let questionId;
    let isOE = questionResult.get('questionType') === 'OE';
    if (questionResult.get('started')) {
      //if it has been started
      let correct = questionResult.get('correct');
      let skipped = questionResult.get('skipped');
      status = skipped
        ? 'skipped'
        : isOE ? 'open-ended' : correct ? 'correct' : 'incorrect';
      questionId = questionResult.get('questionId');
    }
    return Ember.Object.create({
      status,
      id: questionId
    });
  }
});
