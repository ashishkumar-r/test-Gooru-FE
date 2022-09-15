import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['activity-report', 'class-summary-report'],

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.set('isLoading', true);
    component.fetchClassSummaryData();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click on monthly report
    onShowMonthlyReport(reportData) {
      const component = this;
      component.set('monthlyReportContext', reportData);
      component.set('isShowMonthlySummaryReport', true);
    },

    //Action triggered when click on close pullup
    onClosePullUp() {
      this.set('showPullUp', false);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} classId
   */
  classId: Ember.computed.alias('classSummary.classId'),

  /**
   * @property {UUID} userId
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * @property {Array} classSummaryReportData
   */
  classSummaryReportData: Ember.A([]),

  /**
   * @property {Boolean} isLoading
   */
  isLoading: false,

  /**
   * @property {String} reportPeriod
   */
  reportPeriod: Ember.computed('monthlyReportContext', function() {
    const component = this;
    let reportData = component.get('monthlyReportContext');
    return `${reportData.get('year')}-${reportData.get('month')}-01`;
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchClassSummaryData
   * Method to fetch class summary report data
   */
  fetchClassSummaryData() {
    const component = this;
    const analyticsService = component.get('analyticsService');
    const classId = component.get('classId');
    const userId = component.get('userId');
    return Ember.RSVP
      .hash({
        classSummaryReportData: analyticsService.getDCAYearlySummary(
          classId,
          userId
        )
      })
      .then(({ classSummaryReportData }) => {
        if (!component.isDestroyed) {
          component.set(
            'classSummaryReportData',
            classSummaryReportData
              .sortBy('month')
              .sortBy('year')
              .reverse()
          );
          component.set('isLoading', false);
        }
      });
  }
});
