import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(UIHelperMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  // -------------------------------------------------------------------------
  // Methods

  model() {
    const route = this;
    const profile = route.modelFor('profile').profile;
    route.setTitle('Guardian', null, true);
    return route
      .get('profileService')
      .getGuardianRoles()
      .then(function(roleList) {
        const guardianList = route.get('profileService').getGuardianList();
        return Ember.RSVP.hash({
          profile: profile,
          roleList: roleList.relationships,
          guardianList: guardianList
        });
      });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.set('profile', model.profile);
    controller.set('guardianRoles', model.roleList);
    controller.set('guardianList', model.guardianList.guardians);
    controller.resetController();
    controller.init();
  }
});
