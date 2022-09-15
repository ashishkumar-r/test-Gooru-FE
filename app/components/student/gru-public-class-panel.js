import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    updateUserClasses() {
      this.sendAction('updateUserClasses');
    },

    showAllCourse() {
      this.toggleProperty('isShowAllCourses');
      let parseEvent;
      if (this.get('isShowAllCourses')) {
        parseEvent = PARSE_EVENTS.SHOW_MORE_COURSE;
      } else {
        parseEvent = PARSE_EVENTS.SHOW_LESS_COURSE;
      }
      this.get('parseEventService').postParseEvent(parseEvent);
    }
  }
});
