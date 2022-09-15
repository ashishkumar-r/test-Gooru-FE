import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'pull-up-unit-report-listview'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * List of contents associated with unit
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
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    sortByFirstName() {
      let component = this;
      component.toggleProperty('sortByFirstnameEnabled');
      if (component.get('sortByFirstnameEnabled')) {
        component.set(
          'studentReportData',
          component.get('studentReportData').sortBy('firstName')
        );
      } else {
        component.set(
          'studentReportData',
          component
            .get('studentReportData')
            .sortBy('firstName')
            .reverse()
        );
      }
    },

    sortByLastName() {
      let component = this;
      component.toggleProperty('sortByLastnameEnabled');
      if (component.get('sortByLastnameEnabled')) {
        component.set(
          'studentReportData',
          component.get('studentReportData').sortBy('lastName')
        );
      } else {
        component.set(
          'studentReportData',
          component
            .get('studentReportData')
            .sortBy('lastName')
            .reverse()
        );
      }
    },

    sortByScore() {
      let component = this;
      component.toggleProperty('sortByScoreEnabled');
      let studentReportData;
      if (component.get('sortByScoreEnabled')) {
        studentReportData = component
          .get('studentReportData')
          .sortBy('score-use-for-sort')
          .reverse();
      } else {
        studentReportData = component
          .get('studentReportData')
          .sortBy('score-use-for-sort');
      }
      component.set('studentReportData', studentReportData);
    },

    openLessonReport(lesson, lessons) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_REPORT);
      this.sendAction('openLessonReport', lesson, lessons);
    },

    openStudentUnitReport(userId) {
      const component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_LJ_IS_MILESTONE_USER);
      this.sendAction('openStudentUnitReport', userId);
    },

    onClickScrollLeftArrow() {
      let component = this;
      let scrollLeft = component.$('#table-right-01').scrollLeft() - 400;
      component.$('#table-right-01').animate(
        {
          scrollLeft: `${scrollLeft}px`
        },
        400
      );
    },

    onClickScrollRightArrow() {
      let component = this;
      let scrollLeft = component.$('#table-right-01').scrollLeft() + 400;
      component.$('#table-right-01').animate(
        {
          scrollLeft: `${scrollLeft}px`
        },
        400
      );
    }
  }
});
