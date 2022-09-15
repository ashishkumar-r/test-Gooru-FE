import Ember from 'ember';
import TenantSerializer from 'gooru-web/serializers/tenant/tenant';
import TenantAdapter from 'gooru-web/adapters/tenant/tenant';

/**
 * Service to support the Lookup entities
 *
 * Country, State, District
 *
 * @typedef {Object} LookupService
 */
export default Ember.Service.extend({
  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service(),

  lookupSerializer: null,

  lookupAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'tenantSerializer',
      TenantSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'tenantAdapter',
      TenantAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Gets tenant information by id
   * @returns {Promise.<Tenant>}
   */
  findTenantById: function(id) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      return service
        .get('tenantAdapter')
        .findTenantById(id)
        .then(
          function(response) {
            Ember.run(() => {
              resolve(
                service.get('tenantSerializer').normalizeTenant(response)
              );
            });
          },
          function() {
            resolve(undefined); //ignore if the api call fails
          }
        );
    });
  },

  /**
   * @function getTenantSettingKey
   * Method to get tenant setting key based on user UUID
   */
  getTenantSettingKey() {
    return `${this.get('session.userId')}_tenant_setting`;
  },

  /**
   * @function getLocalStorage
   * Method to get local storage instance
   */
  getLocalStorage() {
    return window.localStorage;
  },

  /**
   * @function getStoredTenantSetting
   * Method to get stored tenant setting
   */
  getStoredTenantSetting() {
    return this.getLocalStorage().getItem(this.getTenantSettingKey());
  },

  /**
   * @function removeStoredTenantSetting
   * Method to remove stored tenant setting
   */
  removeStoredTenantSetting() {
    return this.getLocalStorage().removeItem(this.getTenantSettingKey());
  },

  /**
   * Gets tenant information from current session
   * @returns {Promise.<Tenant>}
   */
  findTenantFromCurrentSession: function() {
    const tenantId = this.get('session.tenantId');
    return this.findTenantById(tenantId);
  },

  getActiveTenantSetting() {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      let tenantSetting = service.getStoredTenantSetting();
      if (!tenantSetting) {
        service
          .get('tenantAdapter')
          .getActiveTenantSetting()
          .then(tenantSetting => {
            if (tenantSetting && tenantSetting.tenant_settings) {
              if (!this.get('session.isAnonymous')) {
                service
                  .getLocalStorage()
                  .setItem(
                    service.getTenantSettingKey(),
                    JSON.stringify(tenantSetting.tenant_settings)
                  );
              }
              resolve(tenantSetting.tenant_settings);
            }
          }, reject);
      } else {
        resolve(JSON.parse(tenantSetting));
      }
    });
  },

  getActiveRoster(params, classId) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('tenantAdapter')
        .getActiveRoster(params, classId)
        .then(() => {
          resolve();
        }, reject);
    });
  },

  getGrade: function(params) {
    const service = this;
    return service
      .get('tenantAdapter')
      .getGrade(params)
      .then(function(response) {
        return response;
      });
  }
});
