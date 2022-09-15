import Ember from 'ember';
import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @type {String}} base url for notifications API endpoints
   */
  namespace: '/api/notifications/v1',
  /**
   * Method to fetchs notifications for given teacher in class from the API
   * @function teacherFetch
   * @returns {Promise}
   */
  teacherFetch: function(filter) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const nurl = `${namespace}/teacher`;
    let url = filter.body
      ? `${nurl}?classId=${filter.body.classId}&limit=${
        filter.body.limit
      }&boundary=${filter.body.boundary}`
      : nurl;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.get('headers')
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Method to fetchs notifications for given student in class from the API
   * @function teacherFetch
   * @returns {Promise}
   */
  studentFetch: function(filter) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const nurl = `${namespace}/student`;

    let url = filter.body
      ? `${nurl}?classId=${filter.body.classId}&limit=${
        filter.body.limit
      }&boundary=${filter.body.boundary}`
      : nurl;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.get('headers')
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Dismisses teacher notification of the supplied actionID
   * @param {actionId}
   */
  resetTeacherNotification: function(actionId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/teacher/${actionId}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.get('headers'),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Dismisses student notification of the supplied actionID
   * @param {actionId}
   */
  resetStudentNotification: function(actionId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/student/${actionId}`;
    const options = {
      type: 'DELETE',
      contentType: 'application/json; charset=utf-8',
      dataType: 'text',
      processData: false,
      headers: adapter.get('headers'),
      data: JSON.stringify({})
    };
    return Ember.$.ajax(url, options);
  }
});
