import Ember from 'ember';
export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {Service} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),
  /**
   * Maintains the session object.
   */
  session: Ember.inject.service('session'),
  // -------------------------------------------------------------------------

  // -------------------------------------------------------------------------
  // Attributes

  queryParams: ['token'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Token from the update email verify flow
   * @property {String}
   */
  token: '',

  /**
   * @property {Number}
   */
  guardianId: null,

  /**
   * @param {Boolean } isApproved- value used to check if the guardian invitees is approve or not  */
  isApproved: false,

  /**
   * @param {Boolean } invalidToken - value used to check if token is valid or not
   */
  invalidToken: false,

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onClose: function() {
      this.transitionToRoute('login');
    }
  },
  // -------------------------------------------------------------------------
  // Methods
  /**
   * Approve guardian invitees
   */
  approveGuardianInvitees(token) {
    let controller = this;
    let guardianId = controller.get('guardianId');
    controller
      .get('profileService')
      .approveGuardianInvitees(token)
      .then(function() {
        controller
          .get('profileService')
          .getGuardianInformation(guardianId)
          .then(function(guardianInfo) {
            controller.set('guardianName', guardianInfo.firstName);
            controller.set('isApproved', true);
          });
      })
      .catch(function(error) {
        if (error.status === 410) {
          controller.set('invalidToken', true);
        }
      });
  }
});
