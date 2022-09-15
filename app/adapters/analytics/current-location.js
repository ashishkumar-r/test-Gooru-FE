import Ember from 'ember';

/**
 * Adapter to get the User's Current Location
 *
 * @typedef {Object} CurrentLocationAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus-insights/v2',

  getUserCurrentLocation: function(classId, userId, queryParams) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/class/${classId}/user/${userId}/current/location`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    if (queryParams) {
      options.data = queryParams;
    }
    return Ember.$.ajax(url, options);
  },

  /**
   * Get user location in class provided
   * @param {string[]} {classIds, course, fwCode? }
   * @param {string} userId
   * @returns {*}
   */
  getUserCurrentLocationByClassIds: function(classCourseIdsFwCode, userId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/classes/location?userId=${userId}`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: this.defineHeaders(),
      data: JSON.stringify({
        classes: classCourseIdsFwCode
      })
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
