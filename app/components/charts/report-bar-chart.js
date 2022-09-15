import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['charts', 'report-bar-chart'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Number of bars should in one item
   * @type {[type]}
   */
  numberOfBars: 12,

  /**
   * Stutent chart report data
   * @type {Object}
   */
  studentChartReportData: null,

  /**
   * Data slipt for each carousel item
   * @type {[type]}
   */
  dataSet: Ember.computed('studentChartReportData', function() {
    let studentChartReportData = this.get('studentChartReportData');
    let numberOfBars = this.get('numberOfBars');
    let data = Ember.A([]);
    for (
      let index = 0, index1 = studentChartReportData.length;
      index < index1;
      index += numberOfBars
    ) {
      data.push(studentChartReportData.slice(index, index + numberOfBars));
    }
    return data;
  }),

  /**
   * This attribute will decide which field to use for chart
   * @type {Boolean}
   */
  useTimeSpentScore: false,

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    onClickChart(userId, showReport) {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_LJ_IS_CHART
      );
      this.sendAction('onClickChart', userId, showReport);
    },

    onClickPrev() {
      this.$('#report-bar-carousel-wrapper').carousel('prev');
    },

    onClickNext() {
      this.$('#report-bar-carousel-wrapper').carousel('next');
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    const component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover',
      container: 'body'
    });
  }
});
