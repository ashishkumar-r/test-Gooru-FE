import Ember from 'ember';
import ConfigurationAdapter from 'gooru-web/adapters/configuration';
import Env from 'gooru-web/config/environment';
import DevelopmentConfiguration from 'gooru-web/config/env/development';
import TestConfiguration from 'gooru-web/config/env/test';
import ProductionConfiguration from 'gooru-web/config/env/production';
import FeaturesConfiguration from 'gooru-web/config/env/features';

const ConfigurationService = Ember.Service.extend({
  configurationAdapter: null,

  /**
   * Application configuration
   */
  configuration: null,

  /**
   * Feature flags
   */
  features: Ember.computed.alias('configuration.features'),

  init: function() {
    this._super(...arguments);
    this.set(
      'configurationAdapter',
      ConfigurationAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  loadConfiguration: function(configBaseUrl = null) {
    const service = this;
    const environment = Env.environment;
    const isProduction = environment === 'production';
    const isDevelopment = environment === 'development';
    const envConfiguration = isProduction
      ? ProductionConfiguration
      : isDevelopment ? DevelopmentConfiguration : TestConfiguration;

    const configuration = Ember.Object.create(envConfiguration);
    configuration.setProperties(FeaturesConfiguration); //setting default features behavior

    //setting the configuration to the global variable
    ConfigurationService.configuration = configuration;

    this.set('configuration', configuration);

    const hostname = window.location.hostname;

    return service
      .get('configurationAdapter')
      .loadConfiguration(hostname, configBaseUrl)
      .then(function(hostnameConfiguration) {
        if (hostnameConfiguration) {
          service.merge(hostnameConfiguration);
        }
        service
          .get('configurationAdapter')
          .reservedWords(configBaseUrl)
          .then(function(reservedWords) {
            if (reservedWords) {
              service.merge(reservedWords);
            }
          });
        return configuration;
      });
  },

  /**
   * Merges properties
   */
  merge: function(props) {
    this.get('configuration').setProperties(props);
  }
});

ConfigurationService.reopenClass({
  /**
   * Application configuration properties
   */
  configuration: null
});

export default ConfigurationService;
