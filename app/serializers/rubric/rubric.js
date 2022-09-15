import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import {
  cleanFilename,
  nullIfEmpty,
  toTimestamp,
  toLocal
} from 'gooru-web/utils/utils';
import Rubric from 'gooru-web/models/rubric/rubric';
import RubricGrade from 'gooru-web/models/rubric/rubric-grade';
import RubricCategoryScore from 'gooru-web/models/rubric/grade-category-score';
import RubricCategory from 'gooru-web/models/rubric/rubric-category';
import GradeQuestion from 'gooru-web/models/rubric/grade-question';
import GradeQuestionItem from 'gooru-web/models/rubric/grade-question-item';
import GradeQuestionStudents from 'gooru-web/models/rubric/grade-question-students';
import GradeQuestionAnswer from 'gooru-web/models/rubric/grade-question-answer';
import { ROLES } from 'gooru-web/config/config';

/**
 * Serializer to support the Rubric CRUD operations
 *
 * @typedef {Object} RubricSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  /**
   * @property {TaxonomySerializer} taxonomySerializer
   */
  taxonomySerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Serializes a Rubric/Rubric object into a JSON representation required by the Create rubric endpoint
   *
   * @param {Rubric} model - The rubric model to be serialized
   * @returns {Object} JSON Object representation of the rubric model
   */
  serializeCreateRubric: function(model) {
    const serializer = this;
    return {
      title: model.get('title'),
      description: model.get('description'),
      type: model.get('type'),
      is_rubric: true,
      thumbnail: cleanFilename(
        model.get('thumbnail'),
        this.get('session.cdnUrls')
      ),
      metadata: model.get('hasAudience')
        ? {
          audience: model.get('audience')
        }
        : null,
      taxonomy: serializer
        .get('taxonomySerializer')
        .serializeTaxonomy(model.get('standards'))
    };
  },

  /**
   * Serializes a Rubric/Rubric object into a JSON representation required by the update rubric endpoint
   *
   * @param {Rubric} model - The rubric model to be serialized
   * @returns {Object} JSON Object representation of the rubric model
   *
   */
  serializeUpdateRubric: function(model) {
    const serializer = this;
    if (model && model.get('rubricOn')) {
      const url = model.get('uploaded')
        ? cleanFilename(model.get('url'), this.get('session.cdnUrls'))
        : model.get('url');

      return {
        title: nullIfEmpty(model.get('title')),
        description: nullIfEmpty(model.get('description')),
        thumbnail: cleanFilename(
          model.get('thumbnail'),
          this.get('session.cdnUrls')
        ),
        metadata: model.get('hasAudience')
          ? {
            audience: model.get('audience'),
            thumbnailAltText: model.get('metadata.thumbnailAltText')
              ? model.get('metadata.thumbnailAltText')
              : ''
          }
          : {
            thumbnailAltText: model.get('metadata.thumbnailAltText')
              ? model.get('metadata.thumbnailAltText')
              : ''
          },
        taxonomy: serializer
          .get('taxonomySerializer')
          .serializeTaxonomy(model.get('standards')),
        url: nullIfEmpty(url),
        is_remote: !model.get('uploaded'),
        feedback_guidance: nullIfEmpty(model.get('feedback')),
        overall_feedback_required: !!model.get('requiresFeedback'),
        categories: model.get('categories').length
          ? model.get('categories').map(function(category) {
            return serializer.serializedUpdateRubricCategory(category);
          })
          : null,
        max_score: model.get('maxScore'),
        scoring: model.get('scoring'),
        primary_language: model.get('primaryLanguage')
      };
    } else {
      return {
        feedback_guidance: nullIfEmpty(model.get('feedback')),
        overall_feedback_required: !!model.get('requiresFeedback'),
        scoring: model.get('scoring'),
        max_score: model.get('maxScore'),
        increment: model.get('increment'),
        primary_language: model.get('primaryLanguage')
      };
    }
  },

  /**
   * Serializes a Rubric object into a JSON representation required by the update score endpoint
   *
   * @param {Rubric} model - The rubric score model to be serialized
   * @returns {Object} JSON Object representation of the rubric score model
   *
   */
  serializeUpdateScore: function(model) {
    if (model && model.get('scoring')) {
      return {
        scoring: true,
        max_score: model.get('maxScore') ? model.get('maxScore') : 1,
        increment: model.get('increment') ? model.get('increment') : 0.5
      };
    } else {
      return {
        scoring: false
      };
    }
  },

  /**
   * Serializes a rubric category
   * @param {RubricCategory} model
   * @returns {*} serialized category
   */
  serializedUpdateRubricCategory: function(model) {
    let levels = model.get('levels').filter(level => level.name || level.score);

    return {
      category_title: nullIfEmpty(model.get('title')),
      feedback_guidance: nullIfEmpty(model.get('feedbackGuidance')),
      required_feedback: model.get('requiresFeedback') === true,
      level: model.get('allowsLevels') === true,
      scoring: model.get('allowsScoring') === true,
      levels: levels.map(level => ({
        level_name: level.name,
        level_score: level.score
      }))
    };
  },

  /**
   * Serializes a RubricGrade/RubricGrade object into a JSON representation required by the endpoint
   *
   * @param {RubricGrade} model - The rubric grade model to be serialized
   * @returns {Object} JSON Object representation of the rubric grade model
   *
   */
  serializeStudentRubricGrades: function(model) {
    let modelData = {
      event_name: model.get('eventName'),
      rubric_id: model.get('id'),
      title: nullIfEmpty(model.get('title')),
      description: nullIfEmpty(model.get('description')),
      student_id: nullIfEmpty(model.get('studentId')),
      class_id: nullIfEmpty(model.get('classId')),
      course_id: nullIfEmpty(model.get('courseId')),
      unit_id: nullIfEmpty(model.get('unitId')),
      lesson_id: nullIfEmpty(model.get('lessonId')),
      collection_id: nullIfEmpty(model.get('collectionId')),
      session_id: nullIfEmpty(model.get('sessionId')),
      resource_id: nullIfEmpty(model.get('resourceId')),
      student_score: model.get('studentScore')
        ? parseInt(model.get('studentScore'))
        : parseInt(model.get('currentScore')),
      max_score: model.get('maxScore')
        ? model.get('maxScore')
        : model.get('totalPoints'),
      overall_comment: model.get('comment'),
      created_at: toTimestamp(model.get('createdDate')),
      updated_at: toTimestamp(model.get('updatedDate')),
      category_score: model.get('categoriesScore').length
        ? model
          .get('categoriesScore')
          .map(category => this.serializedStudentGradeCategoryScore(category))
        : null,
      taxonomy: this.get('taxonomySerializer').serializeTaxonomy(
        model.get('standards')
      ),
      metadata: model.get('hasAudience')
        ? {
          audience: model.get('audience')
        }
        : null,
      tenant_root: model.get('tenantRoot'),
      tenant: model.get('tenant'),
      gut_codes: model.get('gutCodes'),
      url: model.get('url'),
      creator_id: model.get('owner'),
      modifier_id: model.get('modifierId'),
      original_creator_id: model.get('originalCreatorId'),
      original_rubric_id: model.get('originalRubricId'),
      parent_rubric_id: model.get('parentRubricId'),
      publish_date: model.get('publishDate'),
      rubric_created_at: model.get('rubricCreatedDate'),
      rubric_updated_at: model.get('rubricUpdatedDate'),
      primary_language: model.get('primaryLanguage')
    };
    if (model.baseResourceId) {
      modelData.base_resource_id = model.baseResourceId;
    }
    return modelData;
  },

  /**
   * Serializes a RubricGrade/RubricGrade object into a JSON representation required by the endpoint
   *
   * @param {RubricGrade} model - The rubric grade model to be serialized
   * @returns {Object} JSON Object representation of the rubric grade model
   *
   */
  serializeStudentRubricGradesForDCA(model) {
    let contextModel = this.serializeStudentRubricGrades(model);
    contextModel.activity_date = model.activityDate;
    contextModel.additional_context = model.dcaContentId
      ? model.dcaContentId
      : null;
    contextModel.collection_type = model.collectionType;
    contextModel.content_source = model.contentSource;
    return contextModel;
  },

  /**
   * Serializes a student grade category score
   * @param {GradeCategoryScore} model
   * @returns {*} serialized category score
   */
  serializedStudentGradeCategoryScore: function(model) {
    return {
      category_title: nullIfEmpty(model.get('title')),
      level_obtained: nullIfEmpty(model.get('levelObtained')),
      level_score: Number(model.get('levelScore')),
      level_max_score: Number(model.get('levelMaxScore')),
      level_comment: nullIfEmpty(model.get('levelComment'))
    };
  },

  /**
   * Normalizes an array of rubrics
   *
   * @param payload endpoint response format in JSON format
   * @returns {Rubric[]}
   */
  normalizeGetRubrics: function(payload) {
    const serializer = this;
    if (payload && Ember.isArray(payload.rubrics)) {
      return payload.rubrics.map(function(rubric) {
        return serializer.normalizeRubric(rubric);
      });
    } else {
      return [];
    }
  },

  /**
   * Normalizes a rubric
   * @param {*} data
   * @return {Rubric}
   */
  normalizeRubric: function(data, owners) {
    if (data) {
      const serializer = this;
      const metadata = data.metadata || {};
      const ownerId = data.creator_id;
      const filteredOwners = Ember.A(owners).filterBy('id', ownerId);
      const categories = data.categories;
      const basePath = serializer.get('session.cdnUrls.content');
      const thumbnail = data.thumbnail ? basePath + data.thumbnail : null;
      const url =
        data.url && !data.is_remote ? basePath + data.url : data.url || null;

      return Rubric.create(Ember.getOwner(this).ownerInjection(), {
        id: data.id,
        title: data.title,
        description: data.description,
        isTeacherRubric: data.grader === 'Teacher',
        thumbnail: thumbnail,
        standards: serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyObject(data.taxonomy),
        audience: metadata.audience,
        url: url,
        isPublished: data.publishStatus === 'published',
        publishDate: data.publish_date,
        rubricOn: data.is_rubric,
        uploaded: !data.is_remote,
        feedback: data.feedback_guidance,
        requiresFeedback: data.overall_feedback_required,
        maxScore: data.max_score,
        increment: data.increment,
        scoring: data.scoring,
        categories: categories
          ? categories.map(category =>
            serializer.normalizeRubricCategory(category)
          )
          : Ember.A(),
        owner: filteredOwners.get('length')
          ? filteredOwners.get('firstObject')
          : ownerId,
        createdDate: data.created_at,
        updatedDate: data.updated_at,
        tenant: data.tenant,
        gutCodes: data.gut_codes,
        modifierId: data.modifier_id,
        metadata: metadata,
        originalCreatorId: data.original_creator_id,
        originalRubricId: data.original_rubric_id,
        parentRubricId: data.parent_rubric_id,
        tenantRoor: data.tenant_root,
        grader: data.grader || null,
        gradeType: data.grader === 'Teacher' ? ROLES.TEACHER : ROLES.STUDENT,
        primaryLanguage: data.primary_language || 1
      });
    }
  },

  /**
   * Normalizes a rubric category
   * @param {*} data
   * @return {RubricCategory}
   *
   */
  normalizeRubricCategory(data) {
    const levels = Ember.A([]);
    if (data.levels) {
      data.levels.map(function(level) {
        levels.pushObject(
          Ember.Object.create({
            name: level.level_name,
            score: Number(level.level_score)
          })
        );
      });
    }
    return RubricCategory.create(Ember.getOwner(this).ownerInjection(), {
      title: data.category_title,
      feedbackGuidance: data.feedback_guidance,
      requiresFeedback: data.required_feedback,
      allowsLevels: data.level === true,
      allowsScoring: data.scoring === true,
      levels: levels
    });
  },

  /**
   * Normalizes Questions To Grade
   * @param {*} data
   * @return {GradeQuestion}normalizeQuestionsToGrade
   */
  normalizeQuestionsToGrade: function(data) {
    const serializer = this;
    const gradeItems = data.gradeItems;

    return GradeQuestion.create(Ember.getOwner(this).ownerInjection(), {
      classId: data.classId,
      courseId: data.courseId,
      gradeItems: gradeItems
        ? gradeItems.map(item => serializer.normalizeGradeQuestion(item))
        : null
    });
  },

  /**
   * Normalizes a grade question
   * @param {*} data
   * @return {GradeQuestionItem}
   *
   */
  normalizeGradeQuestion(data) {
    return GradeQuestionItem.create(Ember.getOwner(this).ownerInjection(), {
      unitId: data.unitId,
      lessonId: data.lessonId,
      collectionId: data.collectionId,
      collectionType: data.collectionType,
      resourceId: data.baseResourceId || data.resourceId,
      studentCount: data.studentCount,
      activityDate: data.activityDate,
      subQuestionId: data.baseResourceId ? data.resourceId : null,
      activationDate: data.activationDate,
      students: data.students ? data.students : [],
      title: data.title,
      dca_content_id: data.dca_content_id,
      pathType: data.pathType ? data.pathType : null
    });
  },

  /**
   * Normalizes Students for a Question to be graded
   * @param {*} data
   * @return {GradeQuestionStudents}
   */
  normalizeStudentsForQuestion: function(data) {
    const students = data.students;

    return GradeQuestionStudents.create(Ember.getOwner(this).ownerInjection(), {
      students: students ? students : null
    });
  },

  /**
   * Normalizes Answer for Rubric Grading
   * @param {*} payload
   * @return {GradeQuestionAnswer}
   */
  normalizeAnswerToGrade: function(payload) {
    return GradeQuestionAnswer.create(Ember.getOwner(this).ownerInjection(), {
      courseId: payload.courseId,
      unitId: payload.unitId,
      lessonId: payload.lessonId,
      collectionId: payload.collectionId,
      questionId: payload.questionId,
      sessionId: payload.session_id || payload.sessionId,
      questionText: payload.questionText,
      answerText: payload.answerText,
      submittedAt: toLocal(payload.submittedAt),
      timeSpent: payload.timeSpent,
      userId: payload.userId
    });
  },

  /**
   * Normalizes Rubric Question Summary
   * @param {*} data
   * @return {GradeQuestion}normalizeRubricQuestionSummary
   */
  normalizeRubricQuestionSummary: function(data) {
    const serializer = this;
    const rubricQuestionSummary = data.queRubrics.length
      ? data.queRubrics[0]
      : null;

    if (rubricQuestionSummary) {
      const categoryScore = rubricQuestionSummary.categoryScore;

      return RubricGrade.create(Ember.getOwner(this).ownerInjection(), {
        studentId: rubricQuestionSummary.studentId,
        learnerScore: rubricQuestionSummary.studentScore,
        maxScore: rubricQuestionSummary.maxScore,
        comment: rubricQuestionSummary.overallComment,
        categoriesScore: categoryScore
          ? categoryScore.map(item => serializer.normalizeCategoryScore(item))
          : null
      });
    }
  },

  /**
   * Normalizes a category score
   * @param {*} data
   * @return {RubricCategoryScore}
   *
   */
  normalizeCategoryScore(data) {
    return RubricCategoryScore.create(Ember.getOwner(this).ownerInjection(), {
      title: data.category_title,
      levelObtained: data.level_obtained,
      levelMaxScore: Number(data.level_max_score),
      levelScore: Number(data.level_score),
      levelComment: data.level_comment
    });
  },

  normalizeOaItemsToGrade(responsePayload) {
    const serializer = this;
    let normalizedGradeItems = Ember.Object.create({});
    if (responsePayload) {
      normalizedGradeItems.set('studentId', responsePayload.studentId);
      let oaGradeItems = Ember.A([]);
      responsePayload.gradeItems.map(gradeItem => {
        oaGradeItems.pushObject(serializer.normalizeOaGradeItem(gradeItem));
      });
      normalizedGradeItems.set('gradeItems', oaGradeItems);
    }
    return normalizedGradeItems;
  },

  normalizeOaGradeItem(gradeItem) {
    return Ember.Object.create({
      collectionId: gradeItem.collectionId,
      collectionTitle: gradeItem.collectionTitle,
      collectionType: gradeItem.collectionType,
      lessonId: gradeItem.lessonId,
      lessonTitle: gradeItem.lessonTitle,
      unitId: gradeItem.unitId,
      unitTitle: gradeItem.unitTitle
    });
  }
});
