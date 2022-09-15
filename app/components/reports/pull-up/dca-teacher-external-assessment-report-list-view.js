import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'dca-teacher-external-assessment-list-view'],

  // -------------------------------------------------------------------------
  // Properties

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
   * Maintains the context object
   * @type {Object}
   */
  contextParams: Ember.computed('context', function() {
    let context = this.get('context');
    let params = Ember.Object.create({
      classId: context.classId,
      collectionId: context.id
    });
    return params;
  }),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when select a student report
     */
    studentReport(studentPerformance) {
      this.sendAction('studentReport', studentPerformance);
    },

    /**
     * Action triggered when sort by student first name
     */
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

    /**
     * Action triggered when sort by student last name
     */
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

    /**
     * Action triggered when sort by student score
     */
    sortByScore() {
      let component = this;
      component.toggleProperty('sortByScoreEnabled');
      if (component.get('sortByScoreEnabled')) {
        component.set(
          'studentReportData',
          component
            .get('studentReportData')
            .sortBy('score')
            .reverse()
        );
      } else {
        component.set(
          'studentReportData',
          component.get('studentReportData').sortBy('score')
        );
      }
    }
  }
});
