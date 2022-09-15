import Ember from 'ember';
import { ANONYMOUS_COLOR } from 'gooru-web/config/config';

/**
 * Completion Chart
 *
 * Component responsible for showing a bar chart with a text label over it.
 * @see /charts/gru-x-bar-chart.js
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['charts', 'gru-completion-chart'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {String} color - Hex color value for the bar in the bar chart
   */
  color: ANONYMOUS_COLOR,

  /**
   * @property {Number} completed - Completed number out of the total
   */
  completed: 0,

  /**
   * @property {String} total - Value equal to 100% of the bar chart
   */
  total: 0,

  /**
   * @property {Number} completedPercentage
   */
  completedPercentage: Ember.computed('completed', 'total', function() {
    var total = this.get('total');
    var percentage = 0;

    if (typeof total === 'number' && total !== 0) {
      percentage = Math.round(this.get('completed') / total * 100);
    }
    return percentage > 100 ? 100 : percentage;
  }),

  /**
   * @property {Number} barChartData
   */
  barChartData: Ember.computed('completedPercentage', function() {
    return [
      {
        color: this.get('color'),
        percentage: this.get('completedPercentage')
      }
    ];
  })
});
