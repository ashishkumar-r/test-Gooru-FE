import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Adapter for the Tenant model
 *
 * @typedef {Object} TenantAdapter
 */
export default Ember.Object.extend(ConfigurationMixin, {
  nucleusNamespace: '/api/nucleus',

  session: Ember.inject.service('session'),

  /**
   * Find a tenant by id
   * @param {string} id
   * @returns {Promise.<Tenant>}
   * Deprecated
   */
  findTenantById: function(id) {
    const adapter = this;
    const basePath = adapter.get('configuration.endpoint.tenantUrl');
    const url = `${basePath}/${id}/tenant.json`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8'
    };
    return Ember.$.ajax(url, options);
  },

  getActiveTenantSetting() {
    const url = `${this.nucleusNamespace}/v1/lookups/tenant-settings`;
    const options = {
      type: 'GET',
      headers: this.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  getActiveRoster(params, classId) {
    const url = `${this.nucleusNamespace}/v1/classes/${classId}/roster/sync/settings`;
    const options = {
      type: 'PUT',
      headers: this.defineHeaders(),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify(params)
    };
    return Ember.$.ajax(url, options);
  },

  getGrade(params) {
    const url = `${this.nucleusNamespace}/v1/classes/roster/grades`;
    const options = {
      type: 'POST',
      headers: this.defineHeaders(),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify(params)
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
