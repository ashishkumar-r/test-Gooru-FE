import Ember from 'ember';

export default Ember.Controller.extend({
  /**
   * Injected Guest controller
   */
  guestController: Ember.inject.controller('guest')
});
