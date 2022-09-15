import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'pull-up-course-report-listview'],

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

    openUnitReport(unit, units) {
      this.sendAction('openUnitReport', unit, units);
    },

    openStudentCourseReport(userId) {
      this.sendAction('openStudentCourseReport', userId);
    },

    onClickScrollLeftArrow() {
      let component = this;
      let scrollLeft = component.$('.table-fixed-right').scrollLeft() - 400;
      component.$('.table-fixed-right').animate(
        {
          scrollLeft: `${scrollLeft}px`
        },
        400
      );
    },

    onClickScrollRightArrow() {
      let component = this;
      let scrollLeft = component.$('.table-fixed-right').scrollLeft() + 400;
      component.$('.table-fixed-right').animate(
        {
          scrollLeft: `+=${scrollLeft}px`
        },
        400
      );
    }
  }
});
