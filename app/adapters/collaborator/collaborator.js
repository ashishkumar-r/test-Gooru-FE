import Ember from 'ember';

export default Ember.Object.extend({
  /**
   * @property {string} End-point URI
   */
  namespace: '/api/nucleus/v1',

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  },

  /**
   * Updates collaborators for courses, collections, assessments
   * @param {string} id entity id
   * @param {string} type could be courses/collections/assessments
   * @param {number[]} userIds
   * @returns {Promise}
   */
  updateCollaborators: function(id, type, userIds) {
    const options = {
      type: 'PUT',
      dataType: 'json',
      headers: this.get('headers'),
      data: JSON.stringify({
        collaborators: userIds
      })
    };
    const namespace = this.get('namespace');
    const url = `${namespace}/${type}/${id}/collaborators`;

    return Ember.$.ajax(url, options);
  }
});
