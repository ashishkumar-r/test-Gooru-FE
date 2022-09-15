import Ember from 'ember';
import TenantUrl from 'gooru-web/models/login-tenant-url';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Controller.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

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
    tenantLogin: function() {
      const controller = this;
      const tenantUrl = controller.get('tenantUrl');
      if (controller.get('didValidate') === false) {
        var url = Ember.$('.gru-input.url input').val();
        tenantUrl.set('url', url);
      }
      tenantUrl.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          let url = controller.get('configuration.TENANT_URL');
          let tenantUrl = controller.get('tenantUrl');
          controller.set('didValidate', true);
          window.location.href = `${url}/${tenantUrl.url}`;
        }
      });
    },

    /**
     * Action triggered when click on back arrow
     */
    goBack: function() {
      window.history.back();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {User} user
   */
  tenantUrl: null,

  /**
   * @param {Boolean } didValidate - value used to check if input has been validated or not
   */
  didValidate: false,

  /**
   * @type {string} domainName
   */
  domainName: Ember.computed.alias('configuration.TENANT_DOMAIN_NAME'),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * init and reset all the properties for the validations
   */

  resetProperties() {
    var controller = this;
    var tenantUrl = TenantUrl.create(Ember.getOwner(this).ownerInjection(), {
      url: null
    });
    controller.set('tenantUrl', tenantUrl);
    controller.set('didValidate', false);
  }
});
