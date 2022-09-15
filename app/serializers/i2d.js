import DS from 'ember-data';
import Ember from 'ember';

/**
 * Serializer for I2D endpoints
 *
 * @typedef {Object} I2DSerializer
 */
export default DS.JSONAPISerializer.extend({
  normalizeSearchResult: function(data) {
    const serializer = this;
    let uploads = data.uploads;
    return uploads.map(item => {
      return serializer.normalizeSearchItem(item);
    });
  },

  normalizeSearchItem: function(item) {
    return Ember.Object.create({
      id: item.id,
      batchId: item.batch_id,
      classId: item.class_id,
      classCode: item.class_code,
      source: item.source,
      itemRealId: item.item_real_id,
      itemType: item.item_type,
      itemCode: item.item_code,
      imagePath: item.image_path,
      ctxCourseId: item.ctx_course_id,
      ctxUnitId: item.ctx_unit_id,
      ctxLesson_id: item.ctx_lesson_id,
      ctxCollectionId: item.ctx_collection_id,
      ctxPathType: item.ctx_path_type,
      ctxPathId: item.ctx_path_id,
      creatorId: item.creator_id,
      modifierId: item.modifier_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      status: item.status,
      version: item.version
    });
  },

  normalizeImageData: function(data) {
    const serializer = this;
    return Ember.Object.create({
      conversionInfo: data.conversion_info ?
        serializer.normalizeConversionInfo(data.conversion_info) : null,
      uploadInfo: serializer.normalizeSearchItem(data.upload_info),
      parsedData: data.parsed_data.map(data => {
        return serializer.normalizeParseData(data);
      })
    });
  },

  normalizeConversionInfo: function(data) {
    return Ember.Object.create({
      errorCodes: data.processing_error_codes,
      confidentPercent: data.response_confidence_percent,
      itemCode: data.response_item_code,
      questionCount: data.response_question_count,
      studentCount: data.response_student_count,
      classCode: data.response_class_code
    });
  },

  normalizeParseData: function(data) {
    return Ember.Object.create({
      userId: data.user_id,
      username: data.username,
      email: data.email,
      firstName: data.first_name,
      lastName: data.last_name,
      questionId: data.question_id,
      questionTitle: data.question_title,
      questionType: data.question_type,
      questionSequence: data.question_sequence,
      maxScore: data.max_score,
      score: data.score <= data.max_score ? data.score : null
    });
  }
});
