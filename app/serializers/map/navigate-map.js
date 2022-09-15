import Ember from 'ember';
import MapContext from 'gooru-web/models/map/map-context';
import MapContent from 'gooru-web/models/map/content';
import MapSuggestion from 'gooru-web/models/map/map-suggestion';
import ResourceModel from 'gooru-web/models/content/resource';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import {
  ASSESSMENT_SUB_TYPES,
  CONTENT_TYPES,
  DEFAULT_IMAGES
} from 'gooru-web/config/config';

/**
 * Serializer to support the navigate map operations
 *
 * @typedef {Object} NavigateMapSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  /**
   * @property {Service} session
   */
  session: Ember.inject.service('session'),

  /**
   * @property {TaxonomySerializer} taxonomySerializer
   */
  taxonomySerializer: null,

  init: function() {
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Serialize a MapContext object into a JSON representation
   *
   * @param {MapContext} model The model to be serialized
   * @returns {Object} JSON Object representation of the model
   */
  serializeMapContext: function(model) {
    let path_type = model.get('collectionSubType') ? 'system' : null;
    let contentData = {
      course_id: model.get('courseId'),
      class_id: model.get('classId'),
      unit_id: model.get('unitId'),
      lesson_id: model.get('lessonId'),
      collection_id: model.get('collectionId'),
      collection_type: model.get('collectionType'),
      collection_subtype: model.get('collectionSubType'),
      current_item_id: model.get('itemId'),
      current_item_type: model.get('itemType'),
      current_item_subtype: model.get('itemSubType'),
      state: model.get('status'),
      path_id: model.get('pathId') || 0,
      path_type: model.get('pathType') || path_type,
      ctx_path_id: model.get('ctxPathId') || 0,
      ctx_path_type: model.get('ctxPathType') || null,
      score_percent: model.get('score'),
      context_data: model.get('contextData'),
      milestone_id: model.get('milestoneId'),
      diagnostic: null,
      source: model.get('source') || null
    };
    if (model.get('diagnostic')) {
      contentData.diagnostic = model.get('diagnostic');
    }
    if (model.get('item')) {
      contentData.resources = model.get('item');
    }
    return contentData;
  },

  /**
   * Normalize an array of goals
   *
   * @param payload endpoint response format in JSON format
   * @returns {Goal[]}
   */
  normalizeMapSuggestions: function(payload = []) {
    const serializer = this;
    let suggestions = [];
    if (payload && Ember.isArray(payload)) {
      suggestions = payload.map(suggestion =>
        serializer.normalizeMapSuggestion(suggestion)
      );
    }

    return suggestions;
  },

  /**
   * Normalize a map context
   * @param {*} data
   * @return {MapContext}
   */
  normalizeMapContext: function(data) {
    return MapContext.create(Ember.getOwner(this).ownerInjection(), {
      courseId: data.course_id,
      classId: data.class_id,
      unitId: data.unit_id,
      lessonId: data.lesson_id,
      collectionId: data.collection_id,
      collectionType: data.collection_type,
      collectionSubType: data.collection_subtype,
      itemId: data.current_item_id,
      itemType: data.current_item_type,
      itemSubType: data.current_item_subtype,
      status: data.state,
      pathId: data.path_id,
      pathType: data.path_type,
      ctxPathId: data.ctx_path_id,
      ctxPathType: data.ctx_path_type,
      score: data.score_percent,
      contextData: data.context_data,
      milestoneId: data.milestone_id,
      diagnostic: data.diagnostic || null,
      source: data.source || null
    });
  },

  /**
   * Normalize a map content
   * @param {*} data
   * @return {MapContext}
   */
  normalizeMapContent: function(data) {
    const basePath = this.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = data.thumbnail
      ? basePath + data.thumbnail
      : appRootPath + DEFAULT_IMAGES.ASSESSMENT;
    return MapContent.create(Ember.getOwner(this).ownerInjection(), {
      id: data.id,
      title: data.title,
      description: data.learning_objective,
      url: data.url,
      thumbnail: thumbnailUrl
    });
  },

  /**
   * Normalize a map suggestion
   * @param {*} data
   * @return {MapSuggestion}
   */
  normalizeMapSuggestion: function(data) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    let subType =
      data.format === CONTENT_TYPES.COLLECTION ||
      data.format === CONTENT_TYPES.EXTERNAL_COLLECTION
        ? ASSESSMENT_SUB_TYPES.SIGNATURE_COLLECTION
        : ASSESSMENT_SUB_TYPES.SIGNATURE_ASSESSMENT;
    let pathType = subType ? 'system' : null;
    let thumbnail = data.thumbnail
      ? basePath + data.thumbnail
      : appRootPath +
        (data.format === CONTENT_TYPES.ASSESSMENT ||
        data.format === CONTENT_TYPES.EXTERNAL_ASSESSMENT
          ? DEFAULT_IMAGES.ASSESSMENT
          : DEFAULT_IMAGES.COLLECTION);
    return MapSuggestion.create(Ember.getOwner(this).ownerInjection(), {
      id: data.id,
      title: data.title,
      type: data.format,
      questionCount: data.questionCount,
      resourceCount: data.resourceCount,
      thumbnail,
      resourceFormat: ResourceModel.normalizeResourceFormat(data.subformat),
      subType,
      pathType: pathType,
      standards: serializer
        .get('taxonomySerializer')
        .normalizeTaxonomyObject(JSON.parse(data.taxonomy))
    });
  }
});
