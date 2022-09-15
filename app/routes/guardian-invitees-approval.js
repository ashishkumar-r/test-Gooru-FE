import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
export default Ember.Route.extend(PrivateRouteMixin, {
  model() {
    const urlValue = new URL(window.location.href);
    const token = urlValue.searchParams.get('token');
    let decodeToken = atob(token).split(':');
    let guardianId = decodeToken[2];
    return {
      token: token,
      guardianId: Number(guardianId)
    };
  },

  /**
   * Set all controller properties used in the template
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.set('token', model.token);
    controller.set('guardianId', model.guardianId);
    controller.approveGuardianInvitees(model.token);
  },
  /**
   * Reset queryParam values
   */
  resetController(controller) {
    controller.set('token', undefined);
    controller.set('guardianId', null);
  }
});
