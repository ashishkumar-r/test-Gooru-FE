import Ember from 'ember';
import Rubric from 'gooru-web/models/rubric/rubric';

/**
 * Rubric Grade model
 * typedef {Object} RubricGrade
 */
export default Rubric.extend({
  /**
   * @property {string} eventName to create a rubric grade
   */
  eventName: 'resource.rubric.grade',

  /**
   * @property {String} studentId
   */
  studentId: null,

  /**
   * @property {String} classId
   */
  classId: null,

  /**
   * @property {String} courseId
   */
  courseId: null,

  /**
   * @property {String} unitId
   */
  unitId: null,

  /**
   * @property {String} lessonId
   */
  lessonId: null,

  /**
   * @property {String} collectionId
   */
  collectionId: null,

  /**
   * @property {String} sessionId
   */
  sessionId: null,

  /**
   * @property {String} resourceId
   */
  resourceId: null,

  /**
   * @property {Integer} Student score for the grade
   */
  studentScore: null,

  /**
   * @property {String} comment
   */
  comment: '',

  /**
   * @property {gradeCategoryScore[]}
   */
  categoriesScore: [],

  /**
   * All grades scores
   * @property {Array} scores
   */
  scores: Ember.computed.map('categoriesScore.@each.levelScore', function(
    item
  ) {
    return +(item.get('levelScore') || 0);
  }),

  /**
   * Sum of all scores
   * @property {Integer} currentScore
   */
  currentScore: Ember.computed.sum('scores'),

  /**
   * @property {Date} Date in which the rubric-grade was created
   */
  createdDate: null,

  /**
   * @property {Date} Date in which the rubric-grade was updated
   */
  updatedDate: null,

  /**
   * @property {Date} Date in which the rubric was created
   */
  rubricCreatedDate: null,

  /**
   * @property {Date} Date in which the rubric was updated
   */
  rubricUpdatedDate: null,

  /**
   * If any category has scores
   * @property {Boolean}
   */
  hasScore: Ember.computed('categoriesScore.@each.levelScore', function() {
    return this.get('categoriesScore').reduce(
      (hasScore, score) => hasScore || score.get('hasScore'),
      false
    );
  })
});
