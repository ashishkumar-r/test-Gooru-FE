import Ember from 'ember';

/**
 * Adapter to support the errors API 3.0 integration
 *
 * @typedef {Object} ErrorAdapter
 */

export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus-utils/v1/user-error',
  errorLogNamespace: '/web/parse/error/log',

  createError: function(data) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const path = `${namespace}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      global: false /* Stop global ajaxError event from triggering */,
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data.body)
    };
    return Ember.$.ajax(path, options);
  },
  errorParseEvent: function(eventData) {
    const adapter = this;
    const header = adapter.defineHeaders();
    header['x-parse-application-id'] = eventData.appId;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: header,
      data: JSON.stringify(eventData)
    };
    return Ember.$.ajax(adapter.get('errorLogNamespace'), options);
  },

  /**
   *
   * @returns {{Authorization: string}}
   */
  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
