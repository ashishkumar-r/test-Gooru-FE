import Ember from 'ember';
import { radialProgress } from 'gooru-web/utils/d3/radial-progress';

/**
 * Completion Information Chart
 *
 * Component responsible for showing a radial progress chart.
 *
 * Radial Progress chart taken from d3.org
 * @see http://www.brightpointinc.com/download/radial-progress-source-code/
 *
 * @module
 * @augments ember/Component
 */

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['charts', 'gru-radial-chart'],

  // -------------------------------------------------------------------------
  // Events

  didRender: function() {
    const $component = this.$();
    const minValue = this.get('minValue');
    const value = this.get('value');
    const maxValue =
      value > this.get('maxValue') ? value : this.get('maxValue');

    // Get the component dimensions from the css
    const width = parseInt($component.css('width').split('px')[0]);
    const height = parseInt($component.css('height').split('px')[0]);
    var radialChart = radialProgress(this.element)
      .margin({ top: 0, right: 0, bottom: 0, left: 0 })
      .diameter(Math.min(height, width))
      .value(value || 0)
      .minValue(minValue || 0)
      .maxValue(maxValue || 1);

    if (!this.get('showPercentageLabel')) {
      if (!value || !maxValue) {
        radialChart.__textDisplay('--');
      } else {
        radialChart.__textDisplay(`${parseInt(value / maxValue * 100)}%`);
      }
    }

    radialChart.render();

    this.set('radialChart', radialChart);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Number} minValue - Lowest value for the graph
   */
  minValue: 0,

  /**
   * @property {Number} maxValue - Highest value for the graph
   */
  maxValue: 1,

  /**
   * @private {Object} radialChart - Radial chart instance
   */
  radialChart: null,

  /**
   * @property {boolean} showPercentageLabel - Show the percentage label
   * provided by the radial progress chart by default
   */
  showPercentageLabel: false,

  /**
   * @property {String} value - Value to graph
   * It should be between minValue and maxValue
   */
  value: 0
});
