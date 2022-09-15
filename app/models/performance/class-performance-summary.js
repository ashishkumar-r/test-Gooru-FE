import Ember from 'ember';
import PerformanceSummary from './performance-summary';
import { roundFloat } from 'gooru-web/utils/math';

/**
 * Class performance summary model
 *
 * @typedef {Object} ClassPerformanceSummary
 */
export default PerformanceSummary.extend({
  /**
   * @property {String} classId
   */
  classId: null,

  /**
   * @property {number} total learning items completed
   */
  totalCompleted: null,

  /**
   * @property {number} total learning items
   */
  total: null,

  /**
   * @property {number} completed percentage
   */
  completedPercentage: Ember.computed('totalCompleted', 'total', function() {
    const total = this.get('total');
    return total
      ? roundFloat(this.get('totalCompleted') / this.get('total') * 100)
      : 0;
  })
});
