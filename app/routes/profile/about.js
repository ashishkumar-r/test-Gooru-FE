import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(UIHelperMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: {
    isUpdated: false
  },

  // -------------------------------------------------------------------------
  // Methods

  model(params) {
    let route = this;
    route.setTitle('About', null, true);
    return {
      profile: route.modelFor('profile').profile,
      isUpdated: params.isUpdated
    };
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.get('parentController').selectMenuItem('about');
    let isUpdated = model.isUpdated;
    if (isUpdated) {
      Ember.set(model.profile, 'lastUpdate', moment().format('YYYY-MM-DD'));
    }
    controller.set('profile', model.profile);
    controller.resetController();
    controller.getDataPrivacySettings();
  }
});
