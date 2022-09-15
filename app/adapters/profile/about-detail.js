import Ember from 'ember';

/**
 * Adapter for the app about model
 *
 * @typedef {Object} user-app Adapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),
  namespace: '/api/nucleus/v1',

  getAboutDetail: function() {
    const namespace = this.get('namespace');
    const url = `${namespace}/rbac/users/apps`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: this.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
