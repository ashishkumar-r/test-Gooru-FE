import Ember from 'ember';

/**
 * Adapter to support the Lookup API 3.0 integration
 *
 * @typedef {Object} LookupAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  namespace: '/config',

  /**
   * Gets custom configuration
   * @returns {Promise.<[]>}
   */
  loadConfiguration: function(key, configBaseUrl) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const version = new Date().getTime();
    const basePath = configBaseUrl ? configBaseUrl : '';
    const url = `${basePath}${namespace}/${key}.json?v=${version}`;
    const options = {
      type: 'GET'
    };
    return Ember.RSVP.hashSettled({
      configuration: Ember.$.ajax(url, options)
    }).then(function(hash) {
      return hash.configuration.value;
    });
  },

  /**
   * Gets reserved words
   * @returns {Promise.<[]>}
   */
  reservedWords: function(configBaseUrl) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const version = new Date().getTime();
    const basePath = configBaseUrl ? configBaseUrl : '';
    const url = `${basePath}${namespace}/reserved-words.json?v=${version}`;
    const options = {
      type: 'GET'
    };
    return Ember.RSVP.hashSettled({
      reservedWords: Ember.$.ajax(url, options)
    }).then(function(hash) {
      return Ember.Object.create({ reservedWords: hash.reservedWords.value });
    });
  }
});
