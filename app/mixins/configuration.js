import Ember from 'ember';

/**
 * Convenience mixin for accesing the app configuration
 *
 * @typedef {Object} ConfigurationMixin
 */
export default Ember.Mixin.create({
  /**
   * @property {Ember.Service} Service to configuration properties
   */
  configurationService: Ember.inject.service('configuration'),

  /**
   * @property {*} application configuration properties
   */
  configuration: Ember.computed.alias('configurationService.configuration'),

  /**
   * @property {*} application feature properties
   */
  features: Ember.computed.alias('configuration.features'),

  /**
   * @property {string}
   */
  appRootPath: Ember.computed.alias('configuration.appRootPath'),

  /**
   * @property {string}
   */
  reservedWords: Ember.computed.alias('configuration.reservedWords'),

  /**
   * @property {string}
   */
  adminRootPath: Ember.computed.alias('configuration.ADMIN_GUEST_ROOT_PATH'),

  redirectEndpoint: Ember.computed.alias('configuration.REDIRECT_ENDPOINT'),

  /**
   * Returns the local storage
   * @returns {Storage}
   */
  getLocalStorage: function() {
    return window.localStorage;
  }
});
