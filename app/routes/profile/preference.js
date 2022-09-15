import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(UIHelperMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),
  i18n: Ember.inject.service(),

  setupController: function(controller) {
    controller.initControllerFromRoute();
  },

  model: function() {
    this.setTitle('Preference', null, true);
  }
});
