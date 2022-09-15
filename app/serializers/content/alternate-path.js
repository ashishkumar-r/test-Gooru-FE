import Ember from 'ember';
import AlternatePathModel from 'gooru-web/models/content/alternate-path';
import ResourceModel from 'gooru-web/models/content/resource';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';

/**
 * Serializer for Alternate Path data
 *
 * @typedef {Object} AlternatePathSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  /**
   * Normalize the Alternate Path data
   * @param payload
   * @returns {AlternatePathModel}
   */
  normalizeAlternatePath: function(payload) {
    const serializer = this;
    return AlternatePathModel.create(
      Ember.getOwner(serializer).ownerInjection(),
      {
        pathId: payload.id,
        title: payload.title,
        thumbnail: payload.thumbnail,
        contextClassId: payload.ctx_class_id,
        contextCourseId: payload.ctx_course_id,
        contextUnitId: payload.ctx_unit_id,
        contextLessonId: payload.ctx_lesson_id,
        contextCollectionId: payload.ctx_collection_id,
        targetCourseId: payload.target_course_id,
        targetUnitId: payload.target_unit_id,
        targetLessonId: payload.target_lesson_id,
        targetCollectionId: payload.target_collection_id,
        targetResourceId: payload.target_resource_id,
        targetContentType: payload.target_content_type,
        targetContentSubtype: payload.target_content_subtype,
        questionCount: payload.question_count,
        openEndedQuestionCount: payload.oe_question_count,
        resourceCount: payload.resource_count
      }
    );
  },

  /**
   * Normalize the resource data from alternate path into a Resource object
   * @param resourceData
   * @returns {Resource}
   */
  normalizeReadResource: function(resourceData) {
    const serializer = this;
    const format = ResourceModel.normalizeResourceFormat(
      resourceData.targetContentSubtype
    );
    const resource = ResourceModel.create(
      Ember.getOwner(serializer).ownerInjection(),
      {
        id: resourceData.targetResourceId,
        title: resourceData.title,
        format,
        assessmentId: resourceData.contextCollectionId,
        classId: resourceData.contextClassId,
        courseId: resourceData.contextCourseId,
        unitId: resourceData.contextUnitId,
        lessonId: resourceData.contextLessonId,
        pathId: resourceData.pathId
      }
    );
    return resource;
  },

  /**
   * @function normalizeSuggestedCollection
   * Method to normalize suggested collection/assessment content
   */
  normalizeSuggestedCollection(content, source) {
    let serializer = this;
    let pathType = source === 'teacher_suggestions' ? 'teacher' : 'system';
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = serializer.get('appRootPath'); //configuration appRootPath
    const defaultImage =
      content.suggested_content_type === 'collection'
        ? appRootPath + DEFAULT_IMAGES.COLLECTION
        : appRootPath + DEFAULT_IMAGES.ASSESSMENT;
    const thumbnailUrl = content.thumbnail
      ? basePath + content.thumbnail
      : defaultImage;
    return AlternatePathModel.create(
      Ember.getOwner(serializer).ownerInjection(),
      {
        id: content.suggested_content_id,
        format: content.suggested_content_type,
        url: content.url || null,
        questionCount: content.question_count || 0,
        resourceCount: content.resource_count || 0,
        openEndedQuestionCount: content.oe_question_count || 0,
        sequence: content.sequence_id || null,
        title: content.title,
        assessmentId: content.ctx_collection_id || null,
        classId: content.ctx_class_id || null,
        courseId: content.ctx_course_id || null,
        unitId: content.ctx_unit_id || null,
        lessonId: content.ctx_lesson_id || null,
        pathId: content.id,
        collectionSubType: content.suggested_content_subtype,
        source,
        thumbnailUrl,
        isSuggestedContent: true,
        pathType: pathType,
        ctxPathId: content.ctx_path_id || 0,
        ctxPathType: content.ctx_path_type
      }
    );
  },

  /**
   * @function normalizeSuggestedResource
   * Method to normalize suggesetd resource content
   */
  normalizeSuggestedResource(content, source) {
    const serializer = this;
    const format = ResourceModel.normalizeResourceFormat(
      content.suggested_content_type
    );
    const resource = ResourceModel.create(
      Ember.getOwner(serializer).ownerInjection(),
      {
        id: content.suggested_content_id,
        title: content.title,
        format,
        assessmentId: content.ctx_collection_id || null,
        classId: content.ctx_class_id || null,
        courseId: content.ctx_course_id || null,
        unitId: content.ctx_unit_id || null,
        lessonId: content.ctx_lesson_id || null,
        pathId: content.id || null,
        contentSubFormat: content.content_subformat || null,
        source,
        isSuggestedContent: true
      }
    );
    return resource;
  }
});
