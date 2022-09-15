import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: [
    'reports',
    'backdrop-pull-ups',
    'teacher-external-assessment-list-view'
  ],

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
      courseId: context.courseId,
      unitId: context.unitModel.get('id'),
      lessonId: context.lessonModel.get('id'),
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
    studentReport(collection, user) {
      let studentPerformance = {
        score: user.score,
        hasStarted: user.hasStarted,
        timeSpent: user.timeSpent || null
      };
      this.sendAction('studentReport', collection, user.id, studentPerformance);
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
    },

    /**
     * Action triggered when de-select a student
     */
    onDeSelectUser(student) {
      this.get('studentsSelectedForSuggest').removeObject(student);
      student.set('selectedForSuggestion', false);
    },

    /**
     * Action triggered when select a student
     */
    onSelectUser(student) {
      this.get('studentsSelectedForSuggest').pushObject(student);
      student.set('selectedForSuggestion', true);
    },

    /**
     * Action triggered when open suggestion popup
     */
    onOpenSuggestionPullup() {
      this.set('showSuggestionPullup', true);
    },

    onClosePullUp() {
      let component = this;
      component.set('showSuggestionPullup', false);
      component.sendAction('onClosePullUp');
    },

    /**
     * Action triggered when close suggestion popup
     */
    onCloseSuggest() {
      this.set('studentsSelectedForSuggest', Ember.A());
      this.get('studentReportData')
        .filterBy('selectedForSuggestion', true)
        .map(data => {
          data.set('selectedForSuggestion', false);
        });
    }
  }
});
