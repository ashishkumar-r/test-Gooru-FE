import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(PrivateRouteMixin, UIHelperMixin, {
  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    this.setTitle('Portfolio', null, true);
    controller.get('parentController').selectMenuItem('portfolio');
    controller.set('profile', model.profile);
  }
});
