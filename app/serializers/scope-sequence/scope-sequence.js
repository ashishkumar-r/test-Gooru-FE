import Ember from 'ember';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';

/**
 * Serializer to support the scope and sequence listing
 *
 * @typedef {Object} scopeAndSequenceSerializer
 */
export default Ember.Object.extend({
  /**
   * @return {Object} Property helps to hold the session
   */
  session: Ember.inject.service('session'),

  /**
   * @return {Array} normalizeScopeAndSequence
   */
  normalizeScopeAndSequence(payload) {
    const result = Ember.A([]);
    const basePath = this.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = payload.thumbnail
      ? basePath + payload.thumbnail
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
    const scopeAndSequences =
      payload && payload.scope_and_sequences ? payload.scope_and_sequences : [];
    if (scopeAndSequences && scopeAndSequences.length) {
      scopeAndSequences.forEach(item => {
        let scopeAndSequence = Ember.Object.create({
          id: item.id,
          name: item.name,
          subject: item.subject,
          framework: item.framework,
          description: item.description,
          thumbnailUrl,
          deprecated: item.deprecated,
          gradesCovered: item.gradesCovered,
          originalScopeAndSequenceId: item.originalScopeAndSequenceId,
          remixAllowed: item.remixAllowed,
          premium: item.premium,
          publisherInfo: item.publisherInfo
            ? this.normalizeScopeAndSequencePublisher(item.publisherInfo)
            : null
        });
        result.pushObject(scopeAndSequence);
      });
    }
    return result;
  },

  /**
   * @return {Array} normalizeScopeAndSequenceModules
   */
  normalizeScopeAndSequenceModules(payload) {
    const moduleList = Ember.A();
    const payloadModules = payload.modules ? payload.modules : [];
    if (payloadModules && payloadModules.length) {
      payloadModules.forEach(item => {
        let module = Ember.Object.create(item);
        moduleList.pushObject(module);
      });
    }
    return moduleList;
  },

  /**
   * @return {Array} normalizeScopeAndSequenceTopics
   */
  normalizeScopeAndSequenceTopics(payload) {
    const result = Ember.A();
    const topics = payload.topics ? payload.topics : [];
    if (topics && topics.length) {
      topics.forEach(item => {
        const topic = Ember.Object.create(item);
        result.pushObject(topic);
      });
    }
    return result;
  },

  /**
   * @return {Array} normalizeCompetencies
   */
  normalizeCompetencies(payload) {
    const result = Ember.A();
    payload = payload.competencies ? payload.competencies : [];
    if (payload && payload.length) {
      payload.forEach(item => {
        if (item.competencyMetadata) {
          item.competencyMetadata = JSON.parse(item.competencyMetadata);
        }
        result.pushObject(Ember.Object.create(item));
      });
    }
    return result;
  },

  /**
   * @return {Object} normalizeScopeAndSequencePublisher
   */
  normalizeScopeAndSequencePublisher(payload) {
    const basePath = this.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = payload.thumbnail
      ? basePath + payload.thumbnail
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
    return Ember.Object.create({
      name: payload.name,
      thumbnailUrl
    });
  },

  /**
   * @return {Array} normalizeContentSource
   */
  normalizeContentSource(payload) {
    const result = Ember.A();
    payload = payload.ca_content_sources ? payload.ca_content_sources : [];
    if (payload && payload.length) {
      payload.forEach(item => {
        if (item.key === 'tenant-library' || item.key === 'open-library') {
          const libraries = item.libraries;
          libraries.forEach(library => {
            library.key = item.key;
            library.seq_id = item.seq_id;
            result.pushObject(Ember.Object.create(library));
          });
          return;
        }
        result.pushObject(Ember.Object.create(item));
      });
    }
    return result;
  },

  /**
   * @return {Array} normalizeGradeDomains
   */
  normalizeGradeDomains(payload) {
    let result = Ember.A([]);
    let domainPaylod = payload.domains ? payload.domains : [];
    if (domainPaylod && domainPaylod.length) {
      domainPaylod.forEach(item => {
        let domain = Ember.Object.create({
          description: item.description,
          name: item.domain_name,
          id: item.id,
          sequenceId: item.sequence_id
        });
        result.pushObject(domain);
      });
    }
    return result;
  },

  /**
   * @return normalizeDomainTopics
   */
  normalizeDomainTopics(payload) {
    let result = Ember.A([]);
    let topicsPaylod = payload.topics ? payload.topics : [];
    if (topicsPaylod && topicsPaylod.length) {
      topicsPaylod.forEach(item => {
        let topic = Ember.Object.create({
          title: item.title,
          id: item.id,
          code: item.code,
          sequenceId: item.sequence_id
        });
        result.pushObject(topic);
      });
    }
    return result;
  },

  /**
   * @return normalizeTopicCompetencies
   */
  normalizeTopicCompetencies(payload) {
    let result = Ember.A([]);
    let competenciesPayload = payload.competencies ? payload.competencies : [];
    if (competenciesPayload && competenciesPayload.length) {
      competenciesPayload.forEach(item => {
        let competency = Ember.Object.create({
          id: item.id,
          code: item.code,
          title: item.title,
          codeType: item.code_type,
          isSelectable: item.is_selectable,
          sequenceId: item.sequence_id,
          competencyMetadata: item.competency_metadata
            ? item.competency_metadata
            : null
        });
        result.pushObject(competency);
      });
    }
    return result;
  },

  /**
   * @return normalizeGradeCompetencies
   */
  normalizeGradeCompetencies(payload) {
    let result = Ember.A([]);
    let competenciesPayload = payload.competencies ? payload.competencies : [];
    if (competenciesPayload && competenciesPayload.length) {
      competenciesPayload.forEach(item => {
        let competency = Ember.Object.create({
          description: item.description,
          displayCode: item.display_code,
          id: item.id,
          title: item.title,
          sequenceId: item.sequence_id
        });
        result.pushObject(competency);
      });
    }
    return result;
  },

  normalizeFetchStatus(payload) {
    let competenciesPayload = payload.competencies
      ? payload.competencies
      : null;
    let domainsPayload = payload.domains ? payload.domains : null;
    let topicsPayload = payload.topics ? payload.topics : null;
    let competency = Ember.Object.create({
      competencies: competenciesPayload,
      domains: domainsPayload,
      topics: topicsPayload
    });
    return competency;
  }
});
