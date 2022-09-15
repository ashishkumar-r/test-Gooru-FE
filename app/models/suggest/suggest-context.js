import Ember from 'ember';
/**
 * Model for suggest context
 *
 * @typedef {Object} SuggestContext
 *
 */
export default Ember.Object.extend({
  /**
   * @property {string}
   */
  containerId: null,

  /**
   * @property {string}
   */
  userId: null,

  /**
   * @property {string}
   */
  courseId: null,

  /**
   * @property {string}
   */
  unitId: null,

  /**
   * @property {string}
   */
  lessonId: null,

  /**
   * @property {number}
   */
  score: null,

  /**
   * @property {number}
   */
  timeSpent: null
});
