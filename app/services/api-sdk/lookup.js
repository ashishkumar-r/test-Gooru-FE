import Ember from 'ember';
import LookupSerializer from 'gooru-web/serializers/lookup/lookup';
import LookupAdapter from 'gooru-web/adapters/lookup/lookup';

/**
 * Service to support the Lookup entities
 *
 * Country, State, District
 *
 * @typedef {Object} LookupService
 */
export default Ember.Service.extend({
  lookupSerializer: null,

  lookupAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'lookupSerializer',
      LookupSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'lookupAdapter',
      LookupAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Gets the audience information
   * @returns {Promise.<Audience[]>}
   */
  readAudiences: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .readAudiences()
        .then(function(response) {
          resolve(
            service.get('lookupSerializer').normalizeReadAudiences(response)
          );
        }, reject);
    });
  },

  readNavigatorPrograms: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .readNavigatorPrograms()
        .then(function(response) {
          resolve(response);
        }, reject);
    });
  },

  readNavigatorSubPrograms: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .readNavigatorSubPrograms()
        .then(function(response) {
          resolve(
            service.get('lookupSerializer').normalizeSubProgram(response)
          );
        }, reject);
    });
  },

  /**
   * Gets the depth of knowlege information
   * @returns {Promise.<DepthOfKnowledge[]>}
   */
  readDepthOfKnowledgeItems: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .readDepthOfKnowledgeItems()
        .then(function(response) {
          resolve(
            service
              .get('lookupSerializer')
              .normalizeReadDepthOfKnowledgeItems(response)
          );
        }, reject);
    });
  },

  /**
   * Gets the license information
   * @returns {Promise.<License[]>}
   */
  readLicenses: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .readLicenses()
        .then(function(response) {
          resolve(
            service.get('lookupSerializer').normalizeReadLicenses(response)
          );
        }, reject);
    });
  },

  /**
   * Gets the audience information
   * @returns {Promise.<Audience[]>}
   */
  readAudienceItems: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .readAudienceItems()
        .then(function(response) {
          resolve(response);
          //resolve(service.get('lookupSerializer').normalizeReadCountries(response));
        }, reject);
    });
  },

  /**
   * Gets the countries information
   * @param {string} keyword optional
   *
   * @returns {Promise}
   */
  readCountries: function(keyword) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .readCountries(keyword)
        .then(function(response) {
          resolve(
            service.get('lookupSerializer').normalizeReadCountries(response)
          );
        }, reject);
    });
  },

  /**
   * Gets the states information
   * @param {string} country id
   * @param {string} keyword optional
   *
   * @returns {Promise}
   */
  readStates: function(countryId, keyword) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .readStates(countryId, keyword)
        .then(function(response) {
          resolve(
            service.get('lookupSerializer').normalizeReadStates(response)
          );
        }, reject);
    });
  },

  /**
   * Gets the districts information
   * @param {string} stateId
   * @param {string} keyword optional
   *
   * @returns {Promise}
   */
  readDistricts: function(stateId, keyword) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .readDistricts(stateId, keyword)
        .then(function(response) {
          resolve(
            service.get('lookupSerializer').normalizeReadDistricts(response)
          );
        }, reject);
    });
  },

  /**
   * Gets the languages information new
   * @returns {Promise}
   */
  getLanguages: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .getLanguages()
        .then(function(response) {
          resolve(service.get('lookupSerializer').normalizeLanguages(response));
        }, reject);
    });
  },

  /**
   * Gets the Educational information new
   * @returns {Promise}
   */
  getEducationalUse: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .getEducationalUse()
        .then(function(response) {
          resolve(
            service.get('lookupSerializer').normalizeEducations(response)
          );
        }, reject);
    });
  },

  /**
   * Gets the Educational information new
   * @returns {Promise}
   */
  getFeatureSubjects: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .getFeatureSubjects()
        .then(function(response) {
          resolve(
            service.get('lookupSerializer').normalizeFeatureSubjects(response)
          );
        }, reject);
    });
  },

  /**
   * Gets the Educational information new
   * @returns {Promise}
   */
  knowMoreAboutUserQuestions: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('lookupAdapter')
        .knowMoreAboutUserQuestions()
        .then(function(response) {
          resolve(
            service
              .get('lookupSerializer')
              .normalizeKnowMoreAboutUserQuestions(response)
          );
        }, reject);
    });
  }
});
