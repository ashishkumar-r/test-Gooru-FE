import Ember from 'ember';
import Tenant from 'gooru-web/models/tenant/tenant';

/**
 * Serializer to support tenant information
 *
 * @typedef {Object} TenantSerializer
 */
export default Ember.Object.extend({
  /**
   * Normalizes tenant
   * @param {*} payload
   * @returns {Tenant}
   */
  normalizeTenant: function(payload) {
    return Tenant.create(payload);
  }
});
