import ApplicationAdapter from './application';
import Ember from 'ember';

export default ApplicationAdapter.extend({
  session: Ember.inject.service('session'),
  /**
   * @property {string} End-point URI
   */
  namespace: '/gooruapi/rest/v2/account/login',

  signInNamespace: '/api/nucleus-auth/v2/users',

  /**
   * Builds the end-point URL using the apiKey as a query string param
   * @param modelName
   * @param id
   * @param snapshot
   * @param requestType
   * @param query
   * @returns {string}
   */
  buildURL: function(modelName, id, snapshot, requestType, query) {
    var apiKeyParam = `apiKey=${this.get('apiKey')}`;
    return `${this._super(
      modelName,
      id,
      snapshot,
      requestType,
      query
    )}?${apiKeyParam}`;
  },

  /**
   * Fetch user tenant accounts
   * @returns {Promise.<[]>}
   */
  getUserTenantAccounts(user) {
    const adapter = this;
    const namespace = adapter.get('signInNamespace');
    const url = `${namespace}/accounts`;
    const options = {
      type: 'POST',
      headers: adapter.defineHeaders(),
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({ email: user.get('email') })
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
