import Ember from 'ember';
import { cleanFilename, serializeEtlSec } from 'gooru-web/utils/utils';
import ExternalCollectionModel from 'gooru-web/models/content/external-collection';
import ResourceSerializer from 'gooru-web/serializers/content/resource';
import QuestionSerializer from 'gooru-web/serializers/content/question';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Serializer to support the Collection CRUD operations for API 3.0
 *
 * @typedef {Object} ExternalCollectionSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  /**
   * @property {ResourceSerializer} resourceSerializer
   */
  resourceSerializer: null,

  /**
   * @property {QuestionSerializer} questionSerializer
   */
  questionSerializer: null,

  /**
   * @property {TaxonomySerializer} taxonomySerializer
   */
  taxonomySerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'resourceSerializer',
      ResourceSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'questionSerializer',
      QuestionSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Serialize a Collection object into a JSON representation required by the Update Collection endpoint
   *
   * @param collectionModel The Collection model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateCollection: function(collectionModel) {
    return this.serializeCollection(collectionModel);
  },

  serializeCollection: function(collectionModel) {
    const serializer = this;
    const thumbnail = cleanFilename(
      collectionModel.thumbnailUrl,
      this.get('session.cdnUrls')
    );

    let serializedCollection = {
      title: collectionModel.get('title'),
      learning_objective: collectionModel.get('learningObjectives') || null,
      visible_on_profile: collectionModel.get('isVisibleOnProfile'),
      thumbnail: !Ember.isEmpty(thumbnail) ? thumbnail : null,
      taxonomy: serializer
        .get('taxonomySerializer')
        .serializeTaxonomy(collectionModel.get('standards')),
      metadata: {
        '21_century_skills': [],
        scorm: collectionModel.get('metadata.scorm')
      },
      url: collectionModel.get('url'),
      subformat: collectionModel.subFormat,
      primary_language: collectionModel.get('primaryLanguage')
    };

    serializedCollection.metadata['21_century_skills'] =
      collectionModel.get('centurySkills') || [];
    if (collectionModel.get('author_etl_secs')) {
      serializedCollection.author_etl_secs =
        collectionModel.get('author_etl_secs') === '0'
          ? null
          : collectionModel.get('author_etl_secs');
    }
    return serializedCollection;
  },

  /**
   * Normalize the Collection data into a Collection object
   * @param payload
   * @returns {Question}
   */
  normalizeReadCollection: function(payload) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = payload.thumbnail
      ? basePath + payload.thumbnail
      : appRootPath + DEFAULT_IMAGES.COLLECTION;
    const metadata = payload.metadata || {};
    const etlSeconds = serializeEtlSec(payload.author_etl_secs);
    const computedEtlSec = serializeEtlSec(payload.computed_etl_secs);
    return ExternalCollectionModel.create(
      Ember.getOwner(this).ownerInjection(),
      {
        id:
          payload.target_collection_id ||
          payload.suggested_content_id ||
          payload.id,
        pathId: payload.id,
        title: payload.title,
        learningObjectives: payload.learning_objective,
        primaryLanguage: payload.primary_language || 1,
        isVisibleOnProfile:
          typeof payload.visible_on_profile !== 'undefined'
            ? payload.visible_on_profile
            : true,
        children: serializer.normalizeResources(payload.content),
        questionCount: payload.question_count || 0,
        resourceCount: payload.resource_count || 0,
        sequence: payload.sequence_id,
        thumbnailUrl: thumbnailUrl,
        url: payload.url || null,
        standards: serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyObject(payload.taxonomy),
        courseId:
          payload.target_course_id ||
          payload.suggested_course_id ||
          payload.course_id,
        unitId:
          payload.target_unit_id ||
          payload.suggested_unit_id ||
          payload.unit_id,
        lessonId:
          payload.target_lesson_id ||
          payload.suggested_lesson_id ||
          payload.lesson_id,
        creatorId: payload.creator_id,
        ownerId: payload.owner_id,
        collectionSubType:
          payload.target_content_subtype || payload.suggested_content_subtype,
        metadata,
        centurySkills:
          metadata['21_century_skills'] && metadata['21_century_skills'].length
            ? metadata['21_century_skills']
            : [],
        format:
          payload.format ||
          payload.target_content_type ||
          payload.suggested_content_type,
        subFormat: payload.subformat,
        author_etl_secs: payload.author_etl_secs,
        hours: etlSeconds.etlHours === '0 hr' ? '' : etlSeconds.etlHours,
        minutes: etlSeconds.etlMinutes === '0 min' ? '' : etlSeconds.etlMinutes,
        computedHours:
          computedEtlSec.etlHours === '0 hr' ? '' : computedEtlSec.etlHours,
        computedMinutes:
          computedEtlSec.etlMinutes === '0 min'
            ? ''
            : computedEtlSec.etlMinutes,
        learningToolId: payload.learning_tool_id
      }
    );
  },

  normalizeResources: function(payload) {
    const serializer = this;
    if (Ember.isArray(payload)) {
      return payload.map(item =>
        item.content_format === 'resource'
          ? serializer.get('resourceSerializer').normalizeReadResource(item)
          : serializer.get('questionSerializer').normalizeReadQuestion(item)
      );
    }
    return [];
  },

  /**
   * @function serializeCreateExternalCollection
   * Method to serialize external collection data
   */
  serializeCreateExternalCollection(collectionData) {
    const serializer = this;
    const taxonomySerializer = serializer.get('taxonomySerializer');
    let serializedExternalCollectionData = {
      title: collectionData.title,
      url: collectionData.url,
      metadata: {
        audience: collectionData.audience,
        scorm: collectionData.metadata ? collectionData.metadata.scorm : null
      },
      subformat: collectionData.subFormat,
      taxonomy: taxonomySerializer.serializeTaxonomy(collectionData.taxonomy),
      learning_objective: collectionData.description
    };
    return serializedExternalCollectionData;
  }
});
