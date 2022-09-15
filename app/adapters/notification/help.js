import Ember from 'ember';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';
import config from '../../config/environment';

/**
 * Adapter for the Help model
 *
 * @typedef {Object} HelpAdapter
 */
export default Ember.Object.extend({
  helpInfoNameSpace: 'api/nucleus',

  session: Ember.inject.service('session'),

  getHelpInfo: function() {
    const version = 'v1';
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const url = `${endpointUrl}/api/nucleus/${version}/lookups/product-help-support-page-identifiers`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders(),
      data: { app_id: config.appId }
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(response) {
        resolve(response);
      }, reject);
    });
  },

  getHelpInfoDescription: function(appId, lang) {
    const version = 'v1';
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    const url = `${endpointUrl}/api/nucleus/${version}/lookups/product-help-support-page-identifiers/${appId}?language=${lang}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders()
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(response) {
        resolve(response);
      }, reject);
    });
  },

  defineHeaders() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
