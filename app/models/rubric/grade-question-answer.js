import Ember from 'ember';

/**
 * Grade Question Answer model
 *
 * @typedef {Object} Grade Question Answer
 */
export default Ember.Object.extend({
  /**
   * @property {String} courseId - Gooru id for the course
   *
   **/
  courseId: null,

  /**
   * @property {String} unitId - Gooru id for the unit
   *
   **/
  unitId: null,

  /**
   * @property {String} lessonId - Gooru id for the lesson
   *
   **/
  lessonId: null,

  /**
   * @property {String} questionId - Gooru id for the question
   *
   **/
  questionId: null,

  /**
   * @property {String} sessionId - Gooru id for the session
   *
   **/
  sessionId: null,

  /**
   * @property {String} questionText - Question text
   *
   **/
  questionText: null,

  /**
   * @property {String} answerText - Answer text
   *
   **/
  answerText: null,

  /**
   * @property {Date} submittedAt - Date of submission
   *
   **/
  submittedAt: null,

  /**
   * @property {Number} timeSpent - Time spent
   *
   **/
  timeSpent: null,

  /**
   * @property {String} userId - Gooru id for the user
   *
   **/
  userId: null
});
