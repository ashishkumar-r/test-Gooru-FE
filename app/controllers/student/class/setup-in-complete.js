import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Controller.extend({
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    back() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_NOT_SETUP_BACK
      );
      this.transitionToRoute('student-home');
    }
  }
});
