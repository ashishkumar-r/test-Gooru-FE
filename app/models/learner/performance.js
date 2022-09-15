import Ember from 'ember';

/**
 * Learner performance model
 */
const LearnerPerformanceModel = Ember.Object.extend({
  /**
   *  @property {Number} attempts - The number of attempts
   */
  attempts: null,

  /**
   * @property {String} attemptStatus
   */
  attemptStatus: null,

  /**
   * @property {String} collectionId - Gooru id for the collection
   */
  collectionId: null,

  /**
   * @property {String} collectionTitle - collection title
   */
  collectionTitle: null,

  /**
   * @property {Number} completedCount - completed count
   */
  completedCount: null,

  /**
   * @property {String} courseId - Gooru id for the course
   */
  courseId: null,

  /**
   * @property {String} courseTitle - course title
   */
  courseTitle: null,

  /**
   * @property {Boolean} isCompleted - Indicate if the completed count is the same total count
   */
  isCompleted: Ember.computed('totalCount', 'completedCount', function() {
    return this.get('totalCount') === this.get('completedCount');
  }),

  /**
   * @property {String} lessonId - Gooru id for the lesson
   */
  lessonId: null,

  /**
   * @property {Number} reaction
   */
  reaction: null,

  /**
   * @property {Number} score - score in percentage
   */
  score: Ember.computed.alias('scoreInPercentage'),
  /**
   * @property {Number} score - score in percentage
   */
  sessionId: Ember.computed.alias('lastSessionId'),

  /**
   * @property {Boolean}
   * Computed property  to identify class is started or not
   */
  hasStarted: Ember.computed('score', function() {
    const scorePercentage = this.get('score');
    return scorePercentage !== null && scorePercentage >= 0;
  }),

  /**
   * @property {Number} scoreInPercentage - score in percentage
   */
  scoreInPercentage: null,

  /**
   * @property {Number} timeSpent - time spent in seconds
   */
  timeSpent: null,

  /**
   * @property {Number} totalCount - total count
   */
  totalCount: null
});

export default LearnerPerformanceModel;
