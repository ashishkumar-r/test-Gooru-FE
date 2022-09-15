import Ember from 'ember';
import ResourceResult from 'gooru-web/models/result/resource';
import { getQuestionUtil } from 'gooru-web/config/question';

/**
 * Model for a brief summary of the status of a question after it was answered by a user.
 *
 * @typedef {Object} QuestionResult
 *
 */
export default ResourceResult.extend({
  /**
   * @property {boolean} correct - Was the answer provided for this question correct?
   */
  correct: null,

  /**
   * @property {Object} question
   */
  question: Ember.computed.alias('resource'),

  /**
   * Sometimes the question is not resolved and only the id is provided
   * This is used mostly by the real time
   * TODO once the SDK is integrated we could analyze if is possible to use only 'question'
   * @property {number} questionId - ID of the question graded
   */
  questionId: Ember.computed.alias('resourceId'),

  /**
   * @property {number} score - Question score
   */
  score: 0,

  /**
   * @property {Object} answer - Answer provided by the user
   */
  userAnswer: null,

  /**
   * @property {boolean} - answer has been submitted
   */
  submittedAnswer: null,

  /**
   * @property {boolean} indicates when it has been graded
   */
  isGraded: null,

  /**
   * @property {Array} subQuestions if it has subQuestions
   */
  subQuestions: Ember.A([]),

  /**
   * Applies only to question type resources. Core API will provide correct answer.
   * FE needs to capture user chosen values and compare with core API responses and then send status.
   *
   * If user did not answer the question or did not view the resource, then status will be skipped.
   * Values: correct / incorrect / skipped
   *
   * This value can be null for “start” event. Required for “stop” event.
   *
   * @property {String}
   */
  attemptStatus: Ember.computed('correct', 'skipped', 'pending', function() {
    const isOpenEnded = this.get('question.isOpenEnded');
    const skipped = this.get('skipped') || this.get('pending');
    const correct = this.get('correct');
    let status = correct ? 'correct' : skipped ? 'skipped' : 'incorrect';
    if (isOpenEnded) {
      status = skipped ? 'skipped' : 'started';
    }
    return status;
  }),

  /**
   * Indicates if the question was skipped, a result is skipped
   * if it has no answer and correct === false
   * @property {boolean}
   */
  skipped: Ember.computed('correct', 'userAnswer', function() {
    return !this.get('correct') && !this.get('answered');
  }),

  /**
   * Indicates if the question is incorrect, a result is incorrect
   * if it has answer and correct === false
   * Important! Skipped results are treated as incorrect as well
   * @property {boolean}
   */
  incorrect: Ember.computed('correct', function() {
    return this.get('correct') === false;
  }),

  /**
   * A result is started when it has any value at the correct property
   * Not started results are only used by real time and they has not correct value
   * @property {boolean} indicates when it has been started
   */
  started: Ember.computed('correct', function() {
    return this.get('correct') !== null;
  }),

  /**
   * Indicates if it is answered
   * @return {boolean}
   */
  answered: Ember.computed('userAnswer', function() {
    return (
      this.get('userAnswer') !== null && this.get('userAnswer') !== undefined
    );
  }),

  /**
   * JSON representation for this instance
   * @returns {*}
   */
  toJSON: function() {
    let question = this.get('question');
    let questionType = question.get('questionType');
    let util = getQuestionUtil(questionType).create({
      question: question
    });

    return {
      gooruOId: this.get('questionId'),
      score: this.get('correct') ? 1 : 0, // this is for real time //TODO  ?
      reaction: this.get('reaction'),
      timeSpent: this.get('timeSpent'),
      resourceType: 'question',
      questionType: questionType,
      answerObject: util.toJSONAnswerObjects(this.get('userAnswer'))
    };
  }
});
