import Ember from 'ember';
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['student-competency-progress-report-card'],

  fwCompetencies: Ember.A([]),

  studentCompetencyActivties: Ember.A([]),

  // -------------------------------------------------------------------------
  // Events
  didRender() {
    const component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click on activity performance
    onShowReport(activity) {
      this.sendAction('onShowReport', activity);
    }
  }
});
