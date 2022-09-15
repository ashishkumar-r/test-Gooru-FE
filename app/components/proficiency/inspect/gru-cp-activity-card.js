import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -----------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-cp-activity-card'],

  // --------------------------------------------------------------------------
  // Properties

  content: null,

  showDateWiseReport: false,

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  isDisableScore: false,

  isHideScore: false,

  // -------------------------------------------------------------------------
  // Actions

  didRender() {
    const component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  actions: {
    onShowReport() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_INDIVIDUAL_STUDENTS_ASSESSMENT
      );

      if (this.get('showDateWiseReport')) {
        this.sendAction('onShowReport', this.get('content'));
      } else {
        let activity;
        if (this.get('content.lastestActivity')) {
          activity = this.get('content.lastestActivity');
        } else {
          activity = this.get('content');
        }
        activity.isLatestReport = true;
        this.sendAction('onShowReport', activity);
      }
    }
  }
});
