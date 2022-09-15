import Ember from 'ember';
import {
  cleanFilename,
  nullIfEmpty,
  serializeEtlSec
} from 'gooru-web/utils/utils';
import {
  DEFAULT_IMAGES,
  ASSESSMENT_SHOW_VALUES,
  OA_TASK_SUBMISSION_TYPES,
  CONTENT_TYPES
} from 'gooru-web/config/config';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import ActivityModel from 'gooru-web/models/content/activity';
import RubricSerializer from 'gooru-web/serializers/rubric/rubric';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Serializer to support the Offline Activity operations
 *
 * @typedef {Object} OfflineActivitySerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
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

  serializeUpdateActivity: function(activityModel) {
    const serializer = this;
    let actualPayLoad = this.serializeActivity(activityModel);
    actualPayLoad.taxonomy = serializer
      .get('taxonomySerializer')
      .serializeTaxonomy(activityModel.get('standards'));
    return actualPayLoad;
  },

  serializeActivity(activityModel) {
    const thumbnail = cleanFilename(
      activityModel.get('thumbnailUrl'),
      this.get('session.cdnUrls')
    );
    let serializedActivity = {
      title: activityModel.get('title'),
      learning_objective:
        activityModel.get('learningObjectives') !== null &&
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
      },
      primary_language: activityModel.get('primaryLanguage')
    };

    serializedActivity.metadata.audience = activityModel.get('audience') || [];
    serializedActivity.metadata.depth_of_knowledge =
      activityModel.get('depthOfknowledge') || [];
    serializedActivity.metadata['21_century_skills'] =
      activityModel.get('centurySkills') || [];
    serializedActivity.reference = activityModel.reference;
    serializedActivity.exemplar = activityModel.exemplar;
    if (!(activityModel.rubric && activityModel.rubric.length > 0)) {
      //set max score only when no rubrics
      serializedActivity.max_score = activityModel.maxScore;
    }
    if (activityModel.get('author_etl_secs')) {
      serializedActivity.author_etl_secs =
        activityModel.get('author_etl_secs') === '0'
          ? null
          : activityModel.get('author_etl_secs');
    }
    return serializedActivity;
  },

  /**
   * Serialize the Offline Activity title
   *
   * @param title
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateActivityTitle: function(title) {
    return {
      title
    };
  },

  /**
   * Normalize the Activity data into a Activity object
   * @param activityData
   * @returns {Question}
   */
  normalizeReadActivity(activityData) {
    var serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath

    const thumbnailUrl = activityData.thumbnail
      ? basePath + activityData.thumbnail
      : appRootPath + DEFAULT_IMAGES.OFFLINE_ACTIVITY;

    const metadata = activityData.metadata || {};
    const settings = activityData.setting || {};
    const rubric = serializer.normalizeActivityRubric(activityData.rubrics);
    const teacherRubric = rubric ? rubric.findBy('gradeType', 'teacher') : null;
    const maxScore = teacherRubric ? teacherRubric.get('maxScore') : 0;
    const etlSeconds = serializeEtlSec(activityData.author_etl_secs);
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
        primaryLanguage: activityData.primary_language || 1,
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
          CONTENT_TYPES.OFFLINE_ACTIVITY,
        subFormat: activityData.subformat,
        reference: activityData.reference,
        exemplar: activityData.exemplar,
        references: serializer.normalizeReferences(activityData.oa_references),
        rubric,
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
            : [],
        maxScore: maxScore || activityData.max_score || 1,
        author_etl_secs: activityData.author_etl_secs,
        hours: etlSeconds.etlHours === '0 hr' ? '' : etlSeconds.etlHours,
        minutes: etlSeconds.etlMinutes === '0 min' ? '' : etlSeconds.etlMinutes
      }
    );
    return normalizedActivity;
  },
  normalizeTasks(payload) {
    const serializer = this;
    if (Ember.isArray(payload)) {
      let taskArray = payload.map(function(item, index) {
        return serializer.normalizeReadTask(item, index);
      });
      taskArray = taskArray.sortBy('id');
      return taskArray;
    }
    return [];
  },

  normalizeActivityRubric(data) {
    const serializer = this;
    let rubric = Ember.Object.create();
    if (Ember.isArray(data)) {
      return data.map(function(item) {
        return serializer.get('rubricSerializer').normalizeRubric(item);
      });
    }
    return rubric;
  },

  /**
   * Normalize the task data
   * @param taskData
   * @param index optional index value, corresponds to the assessment or collection index
   * @returns {task} deep object, with submissions
   */
  normalizeReadTask(item) {
    const serializer = this;
    return Ember.Object.create({
      id: item.id,
      oaId: item.oa_id,
      title: item.title,
      isEvidenceRequired: item.is_evidence_required,
      description: item.description,
      oaTaskSubmissions: serializer.normalizeSubmissions(
        item.oa_tasks_submissions
      ),
      submissionCount: item.oa_tasks_submissions
        ? item.oa_tasks_submissions.length
        : 0
    });
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

  normalizeReadSubmissions(item) {
    return Ember.Object.create({
      id: item.id,
      oaTaskId: item.oa_task_id,
      taskSubmissionType: item.oa_task_submission_type,
      taskSubmissionSubType: item.oa_task_submission_subtype
    });
  },

  serializeReferenceData: function(refData, fileId) {
    return {
      id: refData.id,
      oa_id: refData.oaId,
      oa_reference_type: refData.type,
      oa_reference_subtype: refData.subType,
      location: fileId,
      oa_reference_usertype: refData.userType,
      oa_reference_name: refData.fileName
    };
  },

  /**
   * Normalizes a rubric
   * @param {*} data
   * @return {Rubric}
   */
  normalizeReferences(payload) {
    const serializer = this;
    if (Ember.isArray(payload)) {
      return payload.map(function(item, index) {
        return serializer.normalizeReadReferences(item, index);
      });
    }
    return [];
  },

  normalizeReadReferences(item) {
    return Ember.Object.create({
      id: item.id,
      oaId: item.oa_id,
      type: item.oa_reference_type,
      subType: item.oa_reference_subtype,
      location: item.location,
      userType: item.oa_reference_usertype,
      fileName: item.oa_reference_name
    });
  },

  /**
   * Normalizes Activity To Grade
   * @param {*} data
   * @return {Object} normalizeOAGradeItems
   */
  normalizeOAGradeItems(payload) {
    const serializer = this;
    const gradeItems = payload.gradeItems;
    return Ember.Object.create({
      classId: payload.classId,
      gradeItems: gradeItems
        ? gradeItems.map(item => serializer.normalizeGradeActivity(item))
        : []
    });
  },

  /**
   * Normalizes a grade activity
   * @param {*} data
   * @return {Object}
   *
   */
  normalizeGradeActivity(data) {
    return Ember.Object.create({
      title: data.title,
      collectionId: data.collectionId,
      collectionType: data.collectionType,
      dcaContentId: data.dcaContentId,
      studentCount: data.studentCount,
      activationDate: data.activationDate,
      students: data.students ? data.students : []
    });
  },

  /**
   * Normalizes a activity for library content
   * @param {*} data
   * @return {Object}
   *
   */
  normalizeActivityForLibrary(activity) {
    let serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = serializer.get('appRootPath');
    const thumbnailUrl = activity.thumbnail
      ? basePath + activity.thumbnail
      : appRootPath + DEFAULT_IMAGES.OFFLINE_ACTIVITY;
    const metadata = activity.metadata || {};
    return Ember.Object.create({
      id: activity.id,
      title: activity.title,
      courseId: activity.course_id,
      ownerId: activity.owner_id,
      standards: serializer
        .get('taxonomySerializer')
        .normalizeTaxonomyObject(activity.taxonomy),
      taskCount: activity.task_count,
      metadata,
      thumbnailUrl
    });
  },

  /**
   * Normalizes a submission grade
   * @param {*} response
   * @return {Object}
   */
  normalizeSubmissionGrade(response) {
    let serializer = this;
    let oaRubrics = serializer.normalizeRubricGrade(response.oaRubrics);
    return Ember.Object.create({
      oaRubrics,
      sessionId: response.sessionId,
      tasks: response.tasks
        ? response.tasks.map(task => serializer.normalizeGradeTasks(task))
        : []
    });
  },

  /**
   * Normalizes a Grade tasks
   * @param {*} response
   * @return {Object}
   */
  normalizeGradeTasks(payload) {
    let serializer = this;
    return Ember.Object.create({
      taskId: payload.taskId,
      submissionText: payload.submissionText,
      submissions: payload.submissions
        ? payload.submissions.map(submission =>
          serializer.normalizeGradeSubmission(submission)
        )
        : []
    });
  },

  /**
   * Normalizes a Grade submission
   * @param {*} response
   * @return {Object}
   */
  normalizeGradeSubmission(payload) {
    const serializer = this;
    const cdnUrls = serializer.get('session.cdnUrls');
    const contentCDN = serializer.get('session.cdnUrls.content');
    let submissionLocation = payload.submissionInfo;
    if (payload.submissionType === 'uploaded') {
      submissionLocation =
        contentCDN + cleanFilename(submissionLocation, cdnUrls);
    }
    let submissionTypeData = OA_TASK_SUBMISSION_TYPES.findBy(
      'value',
      payload.submissionSubtype
    );
    let submissionIcon = submissionTypeData ? submissionTypeData.icon : null;
    return Ember.Object.create({
      submissionInfo: submissionLocation,
      submissionSubtype: payload.submissionSubtype,
      submissionType: payload.submissionType,
      submittedOn: payload.submittedOn,
      submissionIcon,
      submissionOriginalFileName: payload.submissionOriginalFileName
    });
  },

  /**
   * Normalizes a grade
   * @param {*} response
   * @return {Object}
   */
  normalizeRubricGrade(payload) {
    let serializer = this;
    return Ember.Object.create({
      studentGrades: payload.studentGrades
        ? serializer.normalizeGrade(payload.studentGrades)
        : null,
      teacherGrades: payload.teacherGrades
        ? serializer.normalizeGrade(payload.teacherGrades)
        : null
    });
  },

  /**
   * Normalizes a teacher and student grade
   * @param {*} response
   * @return {Object}
   */
  normalizeGrade(payload) {
    let serializer = this;
    return Ember.Object.create({
      grader: payload.grader,
      maxScore: Math.round(parseInt(payload.maxScore)),
      overallComment: payload.overallComment,
      rubricId: payload.rubricId,
      score: Math.round(parseInt(payload.studentScore)),
      submittedOn: payload.submittedOn,
      timeSpent: payload.timeSpent,
      categoryGrade: payload.categoryScore
        ? payload.categoryScore.map(item =>
          serializer.get('rubricSerializer').normalizeCategoryScore(item)
        )
        : []
    });
  },

  serializeRubricGrades(payload) {
    let grade = Ember.Object.create({
      rubric_id: nullIfEmpty(payload.get('id')),
      student_id: payload.get('studentId'),
      class_id: payload.get('classId'),
      collection_id: payload.get('collectionId'),
      content_source: payload.get('contentSource'),
      collection_type: payload.get('collectionType'),
      grader: payload.get('grader'),
      student_score: payload.get('maxScore')
        ? payload.get('studentScore')
          ? parseInt(payload.get('studentScore'))
          : parseInt(payload.get('currentScore'))
        : null,
      max_score: payload.get('maxScore') ? payload.get('maxScore') : null,
      grader_id: payload.get('graderId'),
      session_id: payload.sessionId ? payload.sessionId : undefined,
      overall_comment: payload.get('comment'),
      category_score: payload.get('categoriesScore').length
        ? payload
          .get('categoriesScore')
          .map(category =>
            this.get('rubricSerializer').serializedStudentGradeCategoryScore(
              category
            )
          )
        : null
    });
    if (!payload.get('isCourseMapGrading')) {
      grade.set('dca_content_id', parseInt(payload.get('dcaContentId')));
    } else {
      grade.set('course_id', payload.get('courseId') || undefined);
      grade.set('unit_id', payload.get('unitId') || undefined);
      grade.set('lesson_id', payload.get('lessonId') || undefined);
      grade.set('time_spent', payload.get('timeSpent') || undefined);
    }
    return grade;
  },

  /**
   * Normalizes Students for a Activity to be graded
   * @param {*} data
   * @return {Object}
   */
  normalizeStudentsForActivity(data) {
    const students = data.students;
    return Ember.Object.create({
      students: students ? students : null
    });
  },

  /**
   *
   * @param {json} payload
   * Returns object
   */
  serializeCreateTask(payload) {
    return {
      id: payload.id,
      oa_id: payload.oaId,
      title: payload.title,
      description: payload.description,
      isEvidenceRequired: payload.isEvidenceRequired
    };
  },

  /**
   *
   * @param {json} payload
   * Returns object with only required fields
   */
  serializeUpdateTask(payload) {
    return {
      title: payload.title,
      description: payload.description,
      isEvidenceRequired: payload.isEvidenceRequired
    };
  },

  serializecreateTaskSubmission(payload) {
    return {
      id: payload.id,
      oa_id: payload.oaId,
      oa_task_id: payload.oaTaskId,
      oa_task_submission_type: payload.taskSubmissionType,
      oa_task_submission_subtype: payload.taskSubmissionSubType
    };
  },

  /**
   * @function serializeOaCompletedStudents
   * Method to serialize response payload of fetching list of students who have marked an OA as completed
   */
  serializeOaCompletedStudents(payload) {
    return payload ? payload.students || Ember.A([]) : Ember.A([]);
  },

  /**
   *
   * @param {json} payload
   * Returns object
   */
  serializeReference(payload) {
    return {
      oa_reference_name: payload.fileName
    };
  }
});
