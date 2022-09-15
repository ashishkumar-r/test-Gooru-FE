import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),
  /**
   * @property {Service} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['modals', 'gru-user-consent-modal'],
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Boolean} isConfirm Accept the personal details
   * provide access to share learn Popup
   */
  isConfirm: false,
  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Trigger when confirm popup
     */
    confirmMessage: function() {
      const component = this;
      component.set('isConfirm', true);
    },
    /**
     * Action trigger when click button updating profile details
     */
    updateUserProfile: function(isAgree) {
      const component = this;
      const model = component.get('model');
      model.onUpdateProfile(isAgree).then(function() {
        component.triggerAction({
          action: 'closeModal'
        });
      });
    }
  },
  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
  }
});
