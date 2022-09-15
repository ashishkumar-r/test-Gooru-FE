import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  classNames: ['oca-summary-report-pull-up'],

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Array<Object>}
   */
  reportData: null,

  /**
   * Propery of class id
   * @property {Number}
   */
  classId: null,

  /**
   * @property {Object}
   */
  performanceSummary: null,

  /**
   * @property {Number}
   */
  timeSpent: null,

  /**
   * Propery to hide the default pullup.
   * @property {Boolean}
   */
  showPullUp: false,

  /**
   * @property {Boolean}
   */
  isShowOCAMonthReportPullUp: false,

  /**
   * @property {Object}
   */
  selectedMonthSummary: null,

  /**
   * @property {Array} secondaryClasses
   * Property for list of secondary classes
   */
  secondaryClasses: Ember.A([]),
  primaryClass: null,

  /**
   * @property {Object} activeClass
   * Property for active class object
   */
  activeClass: Ember.computed('secondaryClasses', function() {
    const component = this;
    let activeClass = null;
    const secondaryClasses = component.get('secondaryClasses');
    if (component.get('isMultiClassEnabled') && secondaryClasses.length) {
      activeClass = secondaryClasses.findBy('isPrimaryClass', true);
    }
    return activeClass;
  }),

  /**
   * @property {UUID} activeClassId
   * Property for active class id
   */
  activeClassId: Ember.computed.alias('activeClass.id'),

  /**
   * @property {Boolean} isPrimaryClassActive
   * Property to check whether primary class is active or not
   */
  isPrimaryClassActive: Ember.computed('activeClass', function() {
    return this.get('isMultiClassEnabled')
      ? this.get('activeClass.isPrimaryClass')
      : true;
  }),

  /**
   * @property {Object} secondaryClassPerformanceSummary
   * Propery for active secondary class performance summary
   */
  secondaryClassPerformanceSummary: Ember.computed('reportData', function() {
    const component = this;
    const reportData = component.get('reportData');
    const performanceSummary = Ember.Object.create({
      performance: Ember.Object.create({
        scoreInPercentage: null
      })
    });
    if (reportData && reportData.length) {
      let score = 0;
      reportData.map(monthlyReportSummary => {
        score += monthlyReportSummary.get('scoreInPercentage');
      });
      performanceSummary.set('performance.scoreInPercentage', score);
    }
    return performanceSummary;
  }),

  /**
   * @property {Object} classPerformanceSummary
   * Property for active class peroformance summary
   */
  classPerformanceSummary: Ember.computed(
    'isPrimaryClassActive',
    'secondaryClassPerformanceSummary',
    'performanceSummary',
    function() {
      return this.get('isPrimaryClassActive')
        ? this.get('performanceSummary')
        : this.get('secondaryClassPerformanceSummary');
    }
  ),

  isShowAddData: false,

  showAddDataObserver: Ember.observer('isShowAddData', function() {
    if (!this.get('isShowAddData')) {
      this.getYearlySummaryData();
    }
  }),

  actions: {
    onPullUpClose() {
      let component = this;
      component.closePullUp();
    },

    closePullUp(closeAll) {
      let component = this;
      component.set('isShowOCAMonthReportPullUp', false);
      if (closeAll) {
        component.closePullUp();
      }
    },

    onSelectMonth(selectedSummaryItem) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CS_CLASS_REPORT);
      component.set('selectedMonthSummary', selectedSummaryItem);
      component.set('isShowOCAMonthReportPullUp', true);
    },

    onToggleClassListContainer() {
      const component = this;
      component.$('.secondary-classes .class-container').slideToggle();
    },

    onSelectClass(selectedClass) {
      const component = this;
      component.set('activeClass', selectedClass);
      component.getYearlySummaryData();
    },
    onOpenPerformanceEntry(activityClass) {
      const component = this;
      component.sendAction('onOpenPerformanceEntry', activityClass);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    this.openPullUp();
    this.handleAppContainerScroll();
  },

  didDestroyElement() {
    this.handleAppContainerScroll();
  },

  init() {
    let component = this;
    component._super(...arguments);
    component.getYearlySummaryData();
  },

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.set('showPullUp', true);
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  /**
   * Function to animate the  pullup from top to bottom
   */
  closePullUp() {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        component.sendAction('onClosePullUp');
      }
    );
  },

  /**
   * Function to hanle the pullup scroll
   */
  handleAppContainerScroll() {
    let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
      .length;
    if (activePullUpCount > 0) {
      Ember.$(document.body).addClass('no-vertical-scroll');
    } else if (activePullUpCount === 0) {
      Ember.$(document.body).removeClass('no-vertical-scroll');
    }
  },

  /**
   * Function to get yearly summary report
   */
  getYearlySummaryData() {
    let component = this;
    const classId = component.get('activeClassId') || component.get('classId');
    let dcaYearlySummaryPromise = component
      .get('analyticsService')
      .getDCAYearlySummary(classId);
    Ember.RSVP.hash({
      dcaYearlySummary: dcaYearlySummaryPromise
    }).then(function(hash) {
      let dcaYearlySummary = hash.dcaYearlySummary;
      let summarySortedByMonth = dcaYearlySummary
        .sortBy('month')
        .sortBy('year')
        .reverse();
      component.set('reportData', summarySortedByMonth);
      if (component.get('selectedMonthSummary')) {
        const selectedMonthSummary = component.get('selectedMonthSummary');
        let existingSummary = summarySortedByMonth.find(
          item =>
            item.month === selectedMonthSummary.month &&
            item.year === selectedMonthSummary.year
        );
        if (existingSummary) {
          component.set('selectedMonthSummary', existingSummary);
        }
      }
      component.calculateTimeSpent();
    });
  },

  /**
   * Function to calculate timespent
   */
  calculateTimeSpent() {
    let component = this;
    let reportData = component.get('reportData');
    let timeSpent = null;
    reportData.forEach(summary => {
      timeSpent += summary.timeSpent ? summary.timeSpent : 0;
    });
    component.set('timeSpent', timeSpent);
  }
});
