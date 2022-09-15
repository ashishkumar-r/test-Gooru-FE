import Ember from 'ember';
import StudentLearnerProficiency from 'gooru-web/mixins/student-learner-proficiency';
export default Ember.Controller.extend(StudentLearnerProficiency, {
  // -------------------------------------------------------------------------
  // Dependenciess
  /**
   * Teacher class controller
   */
  classController: Ember.inject.controller('teacher/class'),

  /**
   * @property {Array} fwCompetencies
   */
  fwCompetencies: Ember.computed.alias('classController.fwCompetencies'),

  /**
   * @property {Array} fwDomains
   */
  fwDomains: Ember.computed.alias('classController.fwDomains'),

  classFramework: Ember.computed.alias('classController.classFramework'),

  isDefaultShowFW: Ember.computed.alias('classController.isDefaultShowFW'),

  // -------------------------------------------------------------------------
  // Attributes

  queryParams: ['tab'],

  tab: null
});
