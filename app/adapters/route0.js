import Ember from 'ember';
import ApplicationAdapter from './application';

export default ApplicationAdapter.extend({
  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @type {String}} base url for course map API endpoints
   */
  namespace: '/api/route0/v1',

  namespaceV2: '/api/route0/v2',

  /**
   * Method to fetch route0 for given student in class from the API
   * @function fetchInClass
   * @returns {Promise}
   */
  fetchInClass: function(filter) {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/rtd?classId=${filter.body.classId}&courseId=${filter.body.courseId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.get('headers')
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Method to fetch route0 for given student in class from the API
   * @function fetchInClass
   * @param {filters.classId} classId
   * @param {filters.courseId} courseId
   * @param {filters.userId} userId student id
   * @returns {Promise}
   */
  fetchInClassByTeacher: function(filters) {
    const adapter = this;
    const namespace = adapter.get('namespaceV2');
    const url = `${namespace}/rtd`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.get('headers'),
      data: filters
    };
    return Ember.$.ajax(url, options);
  },

  updateRouteAction: function(action) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/rtd/status`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.get('headers'),
      data: JSON.stringify(action.body)
    };
    return Ember.$.ajax(url, options);
  },

  fetchAlternatePaths: function(params, userId = undefined) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    let url = `${namespace}/rtd/class/${params.classId}/courses/${params.courseId}/units/${params.unitId}/lessons/${params.lessonId}/alternate-paths`;
    if (userId) {
      url += `?userId=${userId}`;
    }
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      processData: false,
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
