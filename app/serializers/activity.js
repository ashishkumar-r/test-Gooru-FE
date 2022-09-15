import DS from 'ember-data';
import Ember from 'ember';
import { cleanFilename } from 'gooru-web/utils/utils';
import {
  DEFAULT_IMAGES,
  ASSESSMENT_SHOW_VALUES
} from 'gooru-web/config/config';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import ActivityModel from 'gooru-web/models/content/activity';
import RubricSerializer from 'gooru-web/serializers/rubric/rubric';

export default DS.JSONAPISerializer.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  /**
   * @property {RubricSerializer} rubricSerializer
   */
  rubricSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'rubricSerializer',
      RubricSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Normalized model to serialize
   * @param {jsonObject} activityModel
   * @example  examplePayLoad = {
      title: 'sr1',
      subformat: 'oa.project.poster',
      thumbnail: 'dummy',
      learning_objective: 'dummy',
      metadata: null,
      taxonomy: {
        'CCSS.K12.MA-1-OA-A.01': {
          code: '1.OA.1',
          title:
            'Use addition and subtraction within 20 to solve word problems involving situations of adding to, taking from, putting together, taking apart, and comparing, with unknowns in all positions, e.g., by using objects, drawings, and equations with a symbol for the unknown number to represent the problem.',
          parent_title: 'Math',
          description: '',
          framework_code: 'CCSS'
        },
        'CCSS.K12.MA-1-OA-A.02': {
          code: '1.OA.2',
          title:
            'Solve word problems that call for addition of three whole numbers whose sum is less than or equal to 20, e.g., by using objects, drawings, and equations with a symbol for the unknown number to represent the problem.',
          parent_title: 'Math',
          description: '',
          framework_code: 'CCSS'
        }
      },

      setting: {
        bidirectional_play: false,
        show_feedback: 'summary',
        show_key: 'never',
        attempts_allowed: -1,
        classroom_play_enabled: true
      },
      primary_language: 1,
      taxonomy_to_build: null,
      reference: null,
      duration_hours: null,
      max_score: 200,
      exemplar: 'dummy'
    };
   *
   */
  serializeCreateActivity: function(activityModel) {
    const serializer = this;
    let actualPayLoad = this.serializeActivity(activityModel);
    actualPayLoad.taxonomy = serializer
      .get('taxonomySerializer')
      .serializeTaxonomy(activityModel.get('standards'));
    actualPayLoad.subformat = activityModel.subFormat;
    return actualPayLoad;
  },

  serializeActivity: function(activityModel) {
    const thumbnail = cleanFilename(
      activityModel.get('thumbnailUrl'),
      this.get('session.cdnUrls')
    );
    let serializedActivity = {
      title: activityModel.get('title'),
      learning_objective:
        activityModel.get('learningObjectives') &&
        activityModel.get('learningObjectives') === ''
          ? null
          : activityModel.get('learningObjectives'),
      visible_on_profile: activityModel.get('isVisibleOnProfile'),
      thumbnail: !Ember.isEmpty(thumbnail) ? thumbnail : null,
      metadata: activityModel.get('metadata') || {
        audience: [],
        depth_of_knowledge: [],
        '21_century_skills': []
      },
      setting: {
        bidirectional_play: activityModel.get('bidirectional') || false,
        show_feedback:
          activityModel.get('showFeedback') || ASSESSMENT_SHOW_VALUES.SUMMARY,
        show_key: activityModel.get('showKey')
          ? ASSESSMENT_SHOW_VALUES.SUMMARY
          : ASSESSMENT_SHOW_VALUES.NEVER,
        attempts_allowed: activityModel.get('attempts') || -1,
        classroom_play_enabled: true
      }
    };

    serializedActivity.metadata.audience = activityModel.get('audience') || [];
    serializedActivity.metadata.depth_of_knowledge =
      activityModel.get('depthOfknowledge') || [];
    serializedActivity.metadata['21_century_skills'] =
      activityModel.get('centurySkills') || [];

    serializedActivity.reference = activityModel.reference;
    serializedActivity.exemplar = activityModel.exemplar;

    return serializedActivity;
  },

  /**
   * Normalize the Activity data into a Activity object
   * @param activityData
   * @returns {Question}
   */
  normalizeReadActivity: function(activityData) {
    var serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath

    const thumbnailUrl = activityData.thumbnail
      ? basePath + activityData.thumbnail
      : appRootPath + DEFAULT_IMAGES.OFFLINE_ACTIVITY;

    const metadata = activityData.metadata || {};
    const settings = activityData.setting || {};

    let normalizedActivity = ActivityModel.create(
      Ember.getOwner(this).ownerInjection(),
      {
        id:
          activityData.target_collection_id ||
          activityData.suggested_content_id ||
          activityData.id,
        pathId: activityData.id,
        title: activityData.title,
        learningObjectives: activityData.learning_objective,
        isVisibleOnProfile:
          typeof activityData.visible_on_profile !== 'undefined'
            ? activityData.visible_on_profile
            : true,
        tasks: serializer.normalizeTasks(activityData.oa_tasks),
        taskCount: activityData.oa_tasks ? activityData.oa_tasks.length : 0,

        sequence: activityData.sequence_id,
        thumbnailUrl: thumbnailUrl,
        classroom_play_enabled:
          settings.classroom_play_enabled !== undefined
            ? settings.classroom_play_enabled
            : true,
        standards: serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyObject(activityData.taxonomy),
        format:
          activityData.format ||
          activityData.target_content_type ||
          activityData.suggested_content_type ||
          'Offline-activity',
        subFormat: activityData.subformat,
        references: serializer.normalizeReferences(activityData.oa_references),
        reference: activityData.reference,
        exemplar: activityData.exemplar,
        rubric: serializer
          .get('rubricSerializer')
          .normalizeRubric(activityData.rubrics),
        url: activityData.url,
        ownerId: activityData.owner_id,
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
          activityData.target_course_id ||
          activityData.suggested_course_id ||
          activityData.course_id,
        unitId:
          activityData.target_unit_id ||
          activityData.suggested_unit_id ||
          activityData.unit_id,
        lessonId:
          activityData.target_lesson_id ||
          activityData.suggested_lesson_id ||
          activityData.lesson_id,
        collectionSubType:
          activityData.target_content_subtype ||
          activityData.suggested_content_subtype,
        attempts: settings.attempts_allowed || -1,
        bidirectional: settings.bidirectional_play || false,
        showFeedback: settings.show_feedback || ASSESSMENT_SHOW_VALUES.SUMMARY,
        showKey: settings.show_key === ASSESSMENT_SHOW_VALUES.SUMMARY,
        centurySkills:
          metadata['21_century_skills'] &&
          metadata['21_century_skills'].length > 0
            ? metadata['21_century_skills']
            : []
      }
    );
    return normalizedActivity;
  },
  normalizeTasks: function(payload) {
    const serializer = this;
    if (Ember.isArray(payload)) {
      return payload.map(function(item, index) {
        return serializer.normalizeReadTask(item, index);
      });
    }
    return [];
  },

  /**
   * Normalize the task data
   * @param taskData
   * @param index optional index value, corresponds to the assessment or collection index
   * @returns {task} deep object, with submissions
   */
  normalizeReadTask: function(item) {
    const serializer = this;
    return {
      id: item.id,
      oaId: item.oa_id,
      title: item.title,
      description: item.title,
      oaTaskSubmissions: serializer.normalizeSubmissions(
        item.oa_tasks_submissions
      ),
      submissionCount: item.oa_tasks_submissions
        ? item.oa_tasks_submissions.length
        : 0
    };
  },

  normalizeSubTypes(payload) {
    const serializer = this;
    if (Ember.isArray(payload.collection_subformat_type)) {
      return payload.collection_subformat_type.map(function(item) {
        return Ember.Object.create({
          code: item,
          display_name:
            serializer.get('i18n').t(`common.subtask.${item}`).string ||
            `common.subtask.${item}`
        });
      });
    }
  },

  normalizeSubmissions(payload) {
    const serializer = this;
    if (Ember.isArray(payload)) {
      return payload.map(function(item, index) {
        return serializer.normalizeReadSubmissions(item, index);
      });
    }
    return [];
  },
  normalizeReadSubmissions: function(item) {
    return {
      id: item.id,
      oaTaskId: item.oa_task_id,
      taskSubmissionType: item.oa_task_submission_type,
      taskSubmissionSubType: item.oa_task_submission_subtype
    };
  },

  serializeReferenceData: function(refData) {
    return {
      id: refData.id,
      oa_id: refData.oaId,
      oa_reference_type: refData.type,
      oa_reference_subtype: refData.subType,
      location: refData.location
    };
  },

  /**
   * Normalizes a rubric
   * @param {*} data
   * @return {Rubric}
   */
  normalizeReferences: function(payload) {
    const serializer = this;
    if (Ember.isArray(payload)) {
      return payload.map(function(item, index) {
        return serializer.normalizeReadReferences(item, index);
      });
    }
    return [];
  },

  normalizeReadReferences: function(item) {
    return Ember.Object.create({
      id: item.id,
      oaId: item.oa_id,
      type: item.oa_reference_type,
      subType: item.oa_reference_subtype,
      location: item.location
    });
  }
});
