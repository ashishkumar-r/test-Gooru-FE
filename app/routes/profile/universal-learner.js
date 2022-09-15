import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(PrivateRouteMixin, UIHelperMixin, {
  setupController: function(controller) {
    this._super(controller);
    controller.fetchConsolidateProfile(true);
  },

  model: function() {
    this.setTitle('Universal Learner Identity', null, true);
  }
});
