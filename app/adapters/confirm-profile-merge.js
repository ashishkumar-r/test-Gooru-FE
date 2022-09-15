import Ember from 'ember';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';

export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  getApproveMerge: function(token) {
    const version = 'v1';
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const url = `${endpointUrl}/api/nucleus-auth/${version}/user/verify?mode=email`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders(token),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  getRejectMerge: function(token, userId) {
    const version = 'v2';
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const url = `${endpointUrl}/api/nucleus/${version}/profiles/user/universal-profile/cancel`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders(token),
      data: JSON.stringify({
        user_id: userId,
        mode: 'email'
      })
    };
    return Ember.$.ajax(url, options);
  },

  createUlid: function(token) {
    const version = 'v2';
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const url = `${endpointUrl}/api/nucleus/${version}/profiles/user/universal-profile`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders(token),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders(token) {
    return {
      Authorization: `Token ${token}`
    };
  }
});
