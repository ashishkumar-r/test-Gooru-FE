import Ember from 'ember';
/**
 * Activity performance summary model
 *
 * @typedef {Object} ActivityPerformanceSummary
 */
export default Ember.Object.extend({
  /**
   * @property {string} user id for the student
   */
  userId: null,

  /**
   * @property {Date}
   */
  date: null,

  /**
   * @property {CollectionPerformanceSummary}
   */
  collectionPerformanceSummary: null
});
