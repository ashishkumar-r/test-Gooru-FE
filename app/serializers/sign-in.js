import DS from 'ember-data';
import Ember from 'ember';

export default DS.JSONAPISerializer.extend({
  serialize: function(snapshot) {
    return snapshot.record.toJSON();
  },

  normalizeSingleResponse: function(store, primaryModelClass, payload) {
    var sessionModel = {
      data: {
        id: payload.gooruUId,
        type: 'session',
        attributes: {
          gooruUId: payload.gooruUId,
          token: payload.token,
          username: payload.user.username,
          firstName: payload.user.firstName,
          lastName: payload.user.lastName,
          displayName: payload.user.displayName
        }
      }
    };
    store.push(sessionModel);

    return sessionModel;
  },

  /**
   * Normalize the user tenant list
   * @param payload
   * @returns {tenantList}
   */
  normalizegetUserTenantAccounts: function(payload) {
    var serializer = this;
    let tenantList = [];
    let userAccounts = payload.user_accounts || [];
    if (Ember.isArray(userAccounts)) {
      tenantList = userAccounts.map(tenantInfo =>
        serializer.normalizeTenantData(tenantInfo)
      );
    }
    return tenantList;
  },

  normalizeTenantData: function(tenantData) {
    return {
      imageUrl: tenantData.image_url,
      loginType: tenantData.login_type,
      tenantName: tenantData.tenant_name,
      tenantShortName: tenantData.tenant_short_name
    };
  }
});
