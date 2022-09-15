import Ember from 'ember';
import User from 'gooru-web/models/login';
import { GOORU_SHORT_NAME } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Controller.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: ['redirectURL'],

  /**
   * @property {Service} Session
   */
  session: Ember.inject.service(),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Session service
   */
  signInService: Ember.inject.service('sign-in'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when click on submit button
     */
    getUserTenantAccount: function() {
      const controller = this;
      const user = controller.get('user');
      if (controller.get('didValidate') === false) {
        var email = Ember.$('.gru-input.email input').val();
        user.set('email', email);
      }
      user.validate().then(function({ validations }) {
        controller.set('isShowErrormessage', false);
        if (validations.get('isValid')) {
          controller
            .get('signInService')
            .getUserTenantAccounts(user)
            .then(
              function(tenantList) {
                controller.set('tenantLists', tenantList);
                controller.set('didValidate', true);
                if (tenantList.length > 1) {
                  controller.set('isShowUserTenantList', true);
                } else {
                  controller.send('tenantLogin', tenantList.objectAt(0));
                }
              },
              function(error) {
                let statusCode = error.status;
                if (statusCode === 404) {
                  controller.set('isShowErrormessage', true);
                }
              }
            );
        }
      });
    },

    /**
     * Action triggered when click on back arrow
     */
    goBack: function() {
      this.set('isShowUserTenantList', false);
    },

    tenantLogin: function(tenant) {
      let controller = this;
      let tenantUrl = controller.get('configuration.TENANT_URL');
      let userEmail = controller.get('user.email');
      const requestTenantUrl = `${tenantUrl}/${tenant.tenantShortName}`;
      if (tenant.tenantShortName === GOORU_SHORT_NAME) {
        const queryParam = {
          queryParams: { userEmail: userEmail }
        };
        if (controller.get('redirectURL')) {
          queryParam.queryParams.redirectURL = controller.get('redirectURL');
        }
        controller.transitionToRoute('sign-in', queryParam);
      } else {
        let encodedEmail = window.btoa(userEmail);
        window.localStorage.setItem('userEmail', encodedEmail);
        window.location.href = `${requestTenantUrl}?lt=${tenant.loginType}`;
      }
    },

    singUp: function() {
      let userEmail = this.get('user.email');
      const queryParam = {
        queryParams: { userEmail: userEmail }
      };
      this.transitionToRoute('sign-up', queryParam);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {User} user
   */
  user: null,

  /**
   * @param {Boolean } didValidate - value used to check if input has been validated or not
   */
  didValidate: false,

  /**
   * @param {Boolean } isShowUserTenantList
   */
  isShowUserTenantList: false,

  /**
   * @param {Boolean } isShowErrorMessage
   */
  isShowErrorMessage: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * init and reset all the properties for the validations
   */

  resetProperties() {
    var controller = this;
    var user = User.create(Ember.getOwner(this).ownerInjection(), {
      email: null
    });
    controller.set('user', user);
    controller.set('didValidate', false);
    controller.set('isShowUserTenantList', false);
    controller.set('isShowErrorMessage', false);
  }
});
