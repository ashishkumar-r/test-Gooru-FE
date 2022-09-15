import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { CAST_EVENTS } from 'gooru-web/config/config';

/**
 * Service to forward events to cast and catch API
 *
 * @typedef {Object} CastEventsService
 */
export default Ember.Service.extend(ConfigurationMixin, {
  /**
   * @property {Service} Session service
   */
  sessionService: Ember.inject.service('api-sdk/session'),

  /**
   * @property {Service} Tenant service
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  /**Method to check current user tenant allowed to cast events or not
   * @return {Object} Promise
   */

  isCastEventEnabled() {
    return new Ember.RSVP.Promise(resolve => {
      this.get('tenantService')
        .getActiveTenantSetting()
        .then(function(tenantSettings) {
          if (
            tenantSettings &&
            tenantSettings.enable_cast_and_catch_api &&
            tenantSettings.enable_cast_and_catch_api === 'on'
          ) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
    });
  },

  /**@param {String} eventName
   * @param {Object} data
   * @return {Object} Promise
   */
  cast(eventName, data) {
    const service = this;
    const context = { session: {} };

    if (eventName === CAST_EVENTS.LOGIN) {
      context.cdns = service.get('sessionService').get('session.cdnUrls');
      context.tenant = {};
      context.tenant.id = service.get('sessionService').get('session.tenantId');
    }
    const user = service.get('sessionService').get('session.userData');
    context.session.token = service
      .get('sessionService')
      .get('session.token-api3');
    data.basePath = this.get('configuration.endpoint.secureUrl');
    return new Ember.RSVP.Promise((resolve, reject) => {
      window.castAPI
        .eventName(eventName)
        .dataIn(user, context, data)
        .cast()
        .listener(function(response) {
          if (response) {
            return resolve(response);
          } else {
            return reject();
          }
        });
    });
  },

  castEvent(eventName, data) {
    const service = this;
    service.isCastEventEnabled().then(res => {
      if (res) {
        service.cast(eventName, data).then(res => {
          if (res !== 'success') {
            Ember.Logger.warn('Failed to post event');
          }
        });
      }
    });
  }
});
