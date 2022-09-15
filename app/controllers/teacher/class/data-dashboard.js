import Ember from 'ember';

export default Ember.Controller.extend({
  // ----------------------------------------------------------------------
  // Dependencies

  queryParams: {},

  // --------------------------------------------------------------------
  // Properties

  /**
   * Inject the  student class parent controller.
   */
  studentClassController: Ember.inject.controller('student.class'),

  /**
   * @property {Array} fwCompetencies
   */
  fwCompetencies: Ember.computed.alias('studentClassController.fwCompetencies'),

  /**
   * @property {Array} fwDomains
   */
  fwDomains: Ember.computed.alias('studentClassController.fwDomains'),

  /**
   * A link to the parent class controller
   * @see controllers/class.js
   * @property {studentTimespentData}
   */
  studentTimespentData: Ember.computed.alias(
    'studentClassController.studentTimespentData'
  ),

  /**
   * @property {Boolean}
   */
  isPublicClass: Ember.computed.alias('class.isPublic'),

  /**
   * @property {Object}
   */
  courseData: Ember.computed.alias('course'),

  activeComponent: null,

  // --------------------------------------------------------------------
  // Actions

  actions: {
    onGoBack() {
      this.transitionToRoute('teacher.class.atc', this.get('currentClass.id'));
    }
  }

  // ---------------------------------------------------------------------
  // Methods
});
