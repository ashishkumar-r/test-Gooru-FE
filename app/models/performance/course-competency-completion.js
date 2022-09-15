import Ember from 'ember';

/**
 * Model for Course competency completion data
 * @property {Object}
 */
export default Ember.Object.extend({

  /**
   * Course Id of competency completion
   * @property {String}
   */
  courseId: null,

  /**
   * Total number of competency completion
   * @property {Integer}
   */
  totalCount: null,

  /**
   * Completed competency count
   * @property {Integer}
   */
  completedCount: null
});
