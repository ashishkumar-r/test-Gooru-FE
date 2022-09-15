import Ember from 'ember';
import { cleanFilename, serializeEtlSec } from 'gooru-web/utils/utils';
import ExternalAssessmentModel from 'gooru-web/models/content/external-assessment';
import QuestionSerializer from 'gooru-web/serializers/content/question';
import {
  DEFAULT_IMAGES,
  ASSESSMENT_SHOW_VALUES
} from 'gooru-web/config/config';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Serializer to support the Assessment CRUD operations for API 3.0
 *
 * @typedef {Object} ExternalAssessmentSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

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
      'questionSerializer',
      QuestionSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Serialize an Assessment object into a JSON representation required by the Update Assessment endpoint
   *
   * @param ExternalAssessmentModel The Assessment model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateExternalAssessment: function(assessmentModel) {
    const serializer = this;
    var serializedAssessment = this.serializeAssessment(assessmentModel);
    serializedAssessment.taxonomy = serializer
      .get('taxonomySerializer')
      .serializeTaxonomy(assessmentModel.get('standards'));
    return serializedAssessment;
  },

  serializeAssessment: function(assessmentModel) {
    const thumbnail = cleanFilename(
      assessmentModel.get('thumbnailUrl'),
      this.get('session.cdnUrls')
    );
    let serializedAssessment = {
      title: assessmentModel.get('title'),
      learning_objective: assessmentModel.get('learningObjectives'),
      visible_on_profile: assessmentModel.get('isVisibleOnProfile'),
      thumbnail: !Ember.isEmpty(thumbnail) ? thumbnail : null,
      metadata: assessmentModel.get('metadata') || {
        audience: [],
        depth_of_knowledge: [],
        '21_century_skills': [],
        scorm: assessmentModel.get('metadata.scorm')
      },
      setting: {
        bidirectional_play: assessmentModel.get('bidirectional') || false,
        show_feedback:
          assessmentModel.get('showFeedback') || ASSESSMENT_SHOW_VALUES.SUMMARY,
        show_key: assessmentModel.get('showKey')
          ? ASSESSMENT_SHOW_VALUES.SUMMARY
          : ASSESSMENT_SHOW_VALUES.NEVER,
        attempts_allowed: assessmentModel.get('attempts') || -1,
        classroom_play_enabled: true
      },
      url: assessmentModel.get('url'),
      subformat: assessmentModel.get('subFormat'),
      primary_language: assessmentModel.get('primaryLanguage')
    };

    serializedAssessment.metadata.audience =
      assessmentModel.get('audience') || [];
    serializedAssessment.metadata.depth_of_knowledge =
      assessmentModel.get('depthOfknowledge') || [];
    serializedAssessment.metadata['21_century_skills'] =
      assessmentModel.get('centurySkills') || [];
    if (assessmentModel.get('author_etl_secs')) {
      serializedAssessment.author_etl_secs =
        assessmentModel.get('author_etl_secs') === '0'
          ? null
          : assessmentModel.get('author_etl_secs');
    }
    return serializedAssessment;
  },

  /**
   * Normalize the Assessment data into a Assessment object
   * @param assessmentData
   * @returns {Question}
   */
  normalizeReadExternalAssessment: function(assessmentData) {
    var serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = assessmentData.thumbnail
      ? basePath + assessmentData.thumbnail
      : appRootPath + DEFAULT_IMAGES.ASSESSMENT;
    const metadata = assessmentData.metadata || {};
    const settings = assessmentData.setting || {};
    const etlSeconds = serializeEtlSec(assessmentData.author_etl_secs);
    const computedEtlSec = serializeEtlSec(assessmentData.computed_etl_secs);
    let normalizedAssessment = ExternalAssessmentModel.create(
      Ember.getOwner(this).ownerInjection(),
      {
        id:
          assessmentData.target_collection_id ||
          assessmentData.suggested_content_id ||
          assessmentData.id,
        pathId: assessmentData.id,
        title: assessmentData.title,
        learningObjectives: assessmentData.learning_objective,
        primaryLanguage: assessmentData.primary_language || 1,
        isVisibleOnProfile:
          typeof assessmentData.visible_on_profile !== 'undefined'
            ? assessmentData.visible_on_profile
            : true,
        children: serializer.normalizeQuestions(assessmentData.question),
        questionCount:
          assessmentData.question_count ||
          (assessmentData.question ? assessmentData.question.length : 0),
        sequence: assessmentData.sequence_id,
        thumbnailUrl: thumbnailUrl,
        classroom_play_enabled:
          settings.classroom_play_enabled !== undefined
            ? settings.classroom_play_enabled
            : true,
        standards: serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyObject(assessmentData.taxonomy),
        format:
          assessmentData.format ||
          assessmentData.target_content_type ||
          assessmentData.suggested_content_type,
        subFormat: assessmentData.subformat,
        url: assessmentData.url,
        ownerId: assessmentData.owner_id,
        metadata: metadata,
        audience:
          metadata.audience && metadata.audience.length > 0
            ? metadata.audience
            : [],
        depthOfknowledge:
          metadata.depth_of_knowledge && metadata.depth_of_knowledge.length > 0
            ? metadata.depth_of_knowledge
            : [],
        courseId:
          assessmentData.target_course_id ||
          assessmentData.suggested_course_id ||
          assessmentData.course_id,
        unitId:
          assessmentData.target_unit_id ||
          assessmentData.suggested_unit_id ||
          assessmentData.unit_id,
        lessonId:
          assessmentData.target_lesson_id ||
          assessmentData.suggested_lesson_id ||
          assessmentData.lesson_id,
        collectionSubType:
          assessmentData.target_content_subtype ||
          assessmentData.suggested_content_subtype,
        attempts: settings.attempts_allowed || -1,
        bidirectional: settings.bidirectional_play || false,
        showFeedback: settings.show_feedback || ASSESSMENT_SHOW_VALUES.SUMMARY,
        showKey: settings.show_key === ASSESSMENT_SHOW_VALUES.SUMMARY,
        centurySkills:
          metadata['21_century_skills'] &&
          metadata['21_century_skills'].length > 0
            ? metadata['21_century_skills']
            : [],
        gutCodes: assessmentData.gut_codes || Ember.A([]),
        author_etl_secs: assessmentData.author_etl_secs,
        hours: etlSeconds.etlHours === '0 hr' ? '' : etlSeconds.etlHours,
        minutes: etlSeconds.etlMinutes === '0 min' ? '' : etlSeconds.etlMinutes,
        computedHours:
          computedEtlSec && computedEtlSec.etlHours !== '0 hr'
            ? computedEtlSec.etlHours
            : '',
        computedMinutes:
          computedEtlSec && computedEtlSec.etlMinutes !== '0 min'
            ? computedEtlSec.etlMinutes
            : ''
      }
    );
    return normalizedAssessment;
  },

  normalizeQuestions: function(payload) {
    const serializer = this;
    if (Ember.isArray(payload)) {
      return payload.map(function(item, index) {
        return serializer
          .get('questionSerializer')
          .normalizeReadQuestion(item, index);
      });
    }
    return [];
  },

  /**
   * @function serializeCreateExternalCollection
   * Method to serialize external collection data
   */
  serializeExternalAssessment(assessmentData) {
    let serializedExternalAssessmentData = {
      title: assessmentData.title,
      url: assessmentData.url,
      metadata: {
        scorm: assessmentData.metadata ? assessmentData.metadata.scorm : null
      },
      subformat: assessmentData.subFormat,
      login_required: false
    };
    return serializedExternalAssessmentData;
  }
});
