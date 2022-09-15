import Ember from 'ember';
import ScopeAndSequenceAdapter from 'gooru-web/adapters/scope-sequence/scope-sequence';
import ScopeAndSequenceSerializer from 'gooru-web/serializers/scope-sequence/scope-sequence';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';

/**
 * Service to support the scope and sequence listing
 *
 * @typedef {Object} ScopeAndSequenceService
 */
export default Ember.Service.extend({
  /**
   * @property {ScopeAndSequenceAdapter} scopeAndSequenceAdapter
   */
  scopeAndSequenceAdapter: null,

  /**
   * @property {ScopeAndSequenceSerializer} scopeAndSequenceSerializer
   */
  scopeAndSequenceSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'scopeAndSequenceAdapter',
      ScopeAndSequenceAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'scopeAndSequenceSerializer',
      ScopeAndSequenceSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomyAdapter',
      TaxonomyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * @param {Object} params
   * @return {Array} fetchScopeAndSequence
   */
  fetchScopeAndSequence(params) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('scopeAndSequenceAdapter')
        .fetchScopeAndSequence(params)
        .then(response => {
          return resolve(
            service
              .get('scopeAndSequenceSerializer')
              .normalizeScopeAndSequence(response)
          );
        }, reject);
    });
  },

  /**
   * @param {Object} params
   * @return {Array} fetchScopeAndSequence
   */
  fetchModulesByScopeId(pathParams, params = {}) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('scopeAndSequenceAdapter')
        .fetchModulesByScopeId(pathParams, params)
        .then(response => {
          return resolve(
            service
              .get('scopeAndSequenceSerializer')
              .normalizeScopeAndSequenceModules(response)
          );
        }, reject);
    });
  },

  /**
   * @param {Object} params
   * @return {Array} fetchScopeAndSequence
   */
  fetchTopicsByModule(pathParams, params = {}) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('scopeAndSequenceAdapter')
        .fetchTopicsByModule(pathParams, params)
        .then(response => {
          return resolve(
            service
              .get('scopeAndSequenceSerializer')
              .normalizeScopeAndSequenceTopics(response)
          );
        }, reject);
    });
  },

  /**
   * @param {Object} params
   * @return {Array} fetchScopeAndSequence
   */
  fetchCompeteciesByTopics(pathParams, params = {}) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('scopeAndSequenceAdapter')
        .fetchCompeteciesByTopics(pathParams, params)
        .then(response => {
          return resolve(
            service
              .get('scopeAndSequenceSerializer')
              .normalizeCompetencies(response)
          );
        }, reject);
    });
  },

  /**
   * @param {Object} params
   * @return {Array} fetchContentSources
   */
  fetchContentSources(params = {}) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('scopeAndSequenceAdapter')
        .fetchContentSources(params)
        .then(response => {
          return resolve(
            service
              .get('scopeAndSequenceSerializer')
              .normalizeContentSource(response)
          );
        }, reject);
    });
  },

  /**
   * @param {Object} pathParams
   * @return {Array} fetchDomainsByGrade
   */
  fetchDomainsByGrade(pathParams) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('scopeAndSequenceAdapter')
        .fetchDomainsByGrade(pathParams)
        .then(response => {
          return resolve(
            service
              .get('scopeAndSequenceSerializer')
              .normalizeGradeDomains(response)
          );
        }, reject);
    });
  },

  /**
   * @param {Object} pathParams
   * @return {Array} fetchTopicsByDomain
   */
  fetchTopicsByDomain(pathParams) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('scopeAndSequenceAdapter')
        .fetchTopicsByDomain(pathParams)
        .then(response => {
          return resolve(
            service
              .get('scopeAndSequenceSerializer')
              .normalizeDomainTopics(response)
          );
        }, reject);
    });
  },

  /**
   * @param {Object} pathParams
   * @return {Array} fetchCompetencyByDomainTopics
   */
  fetchCompetenciesByDomainTopic(pathParams, isDefaultShowFW, classFramework) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('scopeAndSequenceAdapter')
        .fetchCompetenciesByDomainTopic(pathParams)
        .then(response => {
          let competencies = service
            .get('scopeAndSequenceSerializer')
            .normalizeTopicCompetencies(response);
          let taxonomyIds = [];
          let taxonomyId = competencies.map(competency => competency.id);
          taxonomyIds = taxonomyIds.concat(taxonomyId);
          if (taxonomyIds.length) {
            service
              .getcrosswalkCompetency(competencies, classFramework, taxonomyIds)
              .then(function() {
                return resolve(competencies);
              });
          } else {
            return resolve(competencies);
          }
        }, reject);
    });
  },

  /**
   * @param {Object} pathParams
   * @return {Array} fetchCompetencyByGrade
   */
  fetchCompetenciesByGrade(pathParams) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('scopeAndSequenceAdapter')
        .fetchCompetenciesByGrade(pathParams)
        .then(response => {
          return resolve(
            service
              .get('scopeAndSequenceSerializer')
              .normalizeGradeCompetencies(response)
          );
        }, reject);
    });
  },

  activityStatus(params) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      return service
        .get('scopeAndSequenceAdapter')
        .fetchActivityStatus(params)
        .then(response => {
          return resolve(
            service
              .get('scopeAndSequenceSerializer')
              .normalizeFetchStatus(response)
          );
        }, reject);
    });
  },

  getcrosswalkCompetency: function(competencies, classFramework, taxonomyIds) {
    const service = this;
    return service
      .get('taxonomyAdapter')
      .crosswalkCompetency(classFramework, taxonomyIds)
      .then(function(crosswalkResponse) {
        let frameworkCrossWalkComp = service
          .get('taxonomySerializer')
          .normalizeCrosswalkCompetency(crosswalkResponse);
        competencies.map(competency => {
          let taxonomyData = frameworkCrossWalkComp.findBy(
            'sourceDisplayCode',
            competency.code
          );
          if (taxonomyData) {
            competency.code = taxonomyData.targetDisplayCode;
            competency.loCode = taxonomyData.targetLoCode;
            competency.loName = taxonomyData.targetLoName;
          }
        });
      });
  }
});
