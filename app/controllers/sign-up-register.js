import Ember from 'ember';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Redirected to Signin
     */
    userLogin: function() {
      this.transitionToRoute('login');
    }
  }
});
