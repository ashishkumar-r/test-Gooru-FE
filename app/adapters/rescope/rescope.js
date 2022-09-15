import Ember from 'ember';
import ApplicationAdapter from '../application';

/**
 * Adapter to fetch rescope related information from the data scope
 */
export default ApplicationAdapter.extend({
  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @type {String}} base url for course map API endpoints
   */
  namespace: '/api/rescope/v1/scope',
  /**
   * Method to fetch skipped items from the API
   * @function getSkippedContents
   * @returns {Promise}
   */
  getSkippedContents: function(filter) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/skipped`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.get('headers'),
      data: filter
    };
    return Ember.$.ajax(url, options);
  },
  /**
   * @function getRescopeItems
   * Method to fetch rescoped items from the API
   */
  getRescopeItems: function(params) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/skipped`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.get('headers'),
      data: JSON.stringify(params)
    };
    return Ember.$.ajax(url, options);
  }
});
