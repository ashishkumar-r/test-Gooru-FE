import Ember from 'ember';

/**
 * Adapter for Century Skills endpoints
 *
 * @typedef {Object} CenturySkillAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/api/nucleus/v1/lookups/21-century-skills',

  /**
   * Gets the list of 21 century skills
   * @returns {Promise}
   */
  getCenturySkills: function() {
    const adapter = this;
    const url = adapter.get('namespace');
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
