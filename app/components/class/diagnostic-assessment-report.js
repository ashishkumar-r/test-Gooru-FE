import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  classNames: ['diagnostic-assessment-report-pull-up'],

  // -------------------------------------------------------------------------
  // Dependencies
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  collectionService: Ember.inject.service('api-sdk/collection'),

  assessmentService: Ember.inject.service('api-sdk/assessment'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * Propery of collection
   * @property {Object}
   */
  collection: Ember.computed('context', function() {
    return this.get('context.collection');
  }),

  isCompetencyReport: false,

  actions: {
    onPullUpClose(closeAll) {
      let component = this;
      component.closePullUp(closeAll);
    },

    pullUpClose(closeAll) {
      let component = this;
      component.set('isShowStudentActivityReport', false);
      component.closePullUp(closeAll);
    },

    onOpenSuggestionPullup() {
      this.set('showSuggestionPullup', true);
    },

    onOpenCompetencyReport(item) {
      this.set('isCompetencyReport', true);
      this.set('competencyData', item);
    },
    onOpenPerformanceEntry() {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_CS_ACTIVITY_REPORT_UPLOAD_DATA);
      const classActivity = component.get('context.activityClass');
      component.sendAction('onOpenPerformanceEntry', classActivity);
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

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
    component.$('[data-toggle="popover"]').popover({
      trigger: 'hover'
    });
  },

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.set('showPullUp', true);
    component.$().animate(
      {
        bottom: '0'
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
  }
});
