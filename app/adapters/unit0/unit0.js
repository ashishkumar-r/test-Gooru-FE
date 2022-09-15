import Ember from 'ember';

export default Ember.Object.extend({
  session: Ember.inject.service(),

  namespace: '/api/nucleus/v1',

  /**
   * Method to fetch unit0 for given student in class from the API
   * @function fetchInClass
   * @returns {Promise}
   */
  fetchUnit0: function(params) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/classes/${params.classId}/courses/${params.courseId}/unit0`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
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
