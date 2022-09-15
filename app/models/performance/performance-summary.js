import Ember from 'ember';

/**
 * Performance summary model
 * Base performance summary model for class, assessment, collection
 *
 * @typedef {Object} PerformanceSummary
 */
export default Ember.Object.extend({
  /**
     * @property {String} id - Gooru id for the goal
     */
  id: null,

  /**
     * @property {number} time spent in seconds
     */
  timeSpent: null,

  /**
     * @property {number} score
     */
  score: null
});
