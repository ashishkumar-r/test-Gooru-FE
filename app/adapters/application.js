import Ember from 'ember';
import DS from 'ember-data';
import Env from '../config/environment';
import SessionMixin from '../mixins/session';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';

const Config = Env['simple-auth-custom'] || {};

export default DS.RESTAdapter.extend(SessionMixin, {
  headers: Ember.computed('session.token-api3', function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }),

  /**
   * @property {string} API Key
   * @see simple-auth-custom at environment.js
   */
  apiKey: Config.apiKey,

  /**
   * This custom implementation removes the default pluralization of the type
   */
  pathForType: function() {
    return '';
  },

  /**
   * Customizing ajax calls
   * @param url
   * @param method
   * @param hash
   * @returns {*}
   */
  ajax: function(url, method, hash) {
    const endpointUrl = EndPointsConfig.getEndpointUrl();
    return this._super(`${endpointUrl}${url}`, method, hash);
  }
});
