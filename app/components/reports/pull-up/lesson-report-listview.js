import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'pull-up-lesson-report-listview'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * This property will get change based on filter selection.
   * @type {Boolean}
   */
  isPerformanceFltApplied: false,

  /**
   * This property will get change based on filter selection, by default timespent filter off.
   * @type {Boolean}
   */
  isTimeSpentFltApplied: false,

  /**
   * List of contents associated with lesson
   * @type {Array}
   */
  contents: Ember.A(),

  /**
   * Students report data
   * @type {Array}
   */
  studentReportData: Ember.A(),

  /**
   * Maintain the status of sort by firstName
   * @type {String}
   */
  sortByFirstnameEnabled: false,

  /**
   * Maintain the status of sort by lastName
   * @type {String}
   */
  sortByLastnameEnabled: true,

  /**
   * Maintain the status of sort by score
   * @type {String}
   */
  sortByScoreEnabled: false,

  /**
   * Maintain the status of sort by Time spent
   * @type {String}
   */
  sortByTimeSpentEnabled: false,
  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    sortByFirstName() {
      this.sendAction('sortByFirstName');
    },

    sortByLastName() {
      this.sendAction('sortByLastName');
    },

    sortByScore() {
      this.sendAction('sortByScore');
    },

    sortByTimeSpent() {
      this.sendAction('sortByTimeSpent');
    },

    openCollectionReport(collection, collections) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_LESSON_CFU);
      this.sendAction('openCollectionReport', collection, collections);
    },

    openStudentLessonReport(userId) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_LESSON_USER);
      this.sendAction('openStudentLessonReport', userId);
    },

    onClickScrollLeftArrow() {
      let component = this;
      let scrollLeft = component.$('#table-fixed-right-xs').scrollLeft() - 400;
      component.$('#table-fixed-right-xs').animate(
        {
          scrollLeft: `${scrollLeft}px`
        },
        400
      );
    },

    onClickScrollRightArrow() {
      let component = this;
      let scrollLeft = component.$('#table-fixed-right-xs').scrollLeft() + 400;
      component.$('#table-fixed-right-xs').animate(
        {
          scrollLeft: `${scrollLeft}px`
        },
        400
      );
    }
  }
});
