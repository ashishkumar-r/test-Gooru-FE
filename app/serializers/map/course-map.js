import Ember from 'ember';
import LessonSerializer from 'gooru-web/serializers/content/lesson';
import CollectionSerializer from 'gooru-web/serializers/content/collection';
import AssessmentSerializer from 'gooru-web/serializers/content/assessment';
import AlternatePathSerializer from 'gooru-web/serializers/content/alternate-path';
import CourseModel from 'gooru-web/models/content/course';
import UnitSerializer from 'gooru-web/serializers/content/unit';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import {
  DEFAULT_IMAGES,
  ASSESSMENT_SUB_TYPES,
  TAXONOMY_LEVELS,
  DEPENDENT_LESSON_SUGGESTION_EVENTS
} from 'gooru-web/config/config';

/**
 * Serializer to support the Course Map operations
 *
 * @typedef {Object} CourseMapSerializer
 */
export default Ember.Object.extend(TenantSettingsMixin, {
  session: Ember.inject.service('session'),

  /**
   * @property {LessonSerializer} lessonSerializer
   */
  lessonSerializer: null,

  /**
   * @property {AssessmentSerializer} assessmentSerializer
   */
  assessmentSerializer: null,

  /**
   * @property {CollectionSerializer} collectionSerializer
   */
  collectionSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'lessonSerializer',
      LessonSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'assessmentSerializer',
      AssessmentSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'collectionSerializer',
      CollectionSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'alternatePathSerializer',
      AlternatePathSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'unitSerializer',
      UnitSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Normalize a lesson info response
   * @param data - The endpoint response in JSON format
   * @returns {Object} lesson and alternate paths
   */
  normalizeLessonInfo: function(data) {
    var serializer = this;
    let lesson = this.get('lessonSerializer').normalizeLesson(data.course_path);
    const isPathRouteView = this.get('isPathRouteView');
    let suggestedPaths = serializer.normalizeAlternatePathContent(
      data.alternate_paths
    );
    if (isPathRouteView) {
      lesson.set('routeContents', suggestedPaths);
    } else {
      let lessonChildren = lesson.get('children');
      suggestedPaths.reverse().map(suggestedPath => {
        let ctxCollectionIndex = lessonChildren.findIndex(
          child => child.id === suggestedPath.assessmentId
        );
        if (ctxCollectionIndex >= 0) {
          //Add suggested content, next to the context collection
          lessonChildren.splice(ctxCollectionIndex + 1, 0, suggestedPath);
        }
      });
    }
    return lesson;
  },

  /**
   * Normalize a Course response
   *
   * @param payload - The endpoint response in JSON format
   * @param {[]} owners owner details
   * @returns {Content/Course} Course Model
   */
  normalizeCourseInfo: function(payload, owners) {
    const serializer = this;
    payload = payload.course_path;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = payload.thumbnail
      ? basePath + payload.thumbnail
      : appRootPath + DEFAULT_IMAGES.COURSE;
    const owner = owners ? owners.findBy('id', payload.owner_id) : null;
    const metadata = payload.metadata || {};

    return CourseModel.create(Ember.getOwner(serializer).ownerInjection(), {
      id: payload.id,
      collaborator: payload.collaborator ? payload.collaborator : [],
      creatorId: payload.creator_id,
      originalCourseId: payload.original_course_id,
      originalCreatorId: payload.original_creator_id,
      children: serializer
        .get('unitSerializer')
        .normalizeUnits(payload.unit_summary),
      description: payload.description,
      isPublished:
        payload.publish_status && payload.publish_status === 'published',
      isVisibleOnProfile:
        typeof payload.visible_on_profile !== 'undefined'
          ? payload.visible_on_profile
          : true,
      owner: owner ? owner : null,
      ownerId: payload.owner_id,
      subject: payload.subject_bucket,
      taxonomy: serializer
        .get('taxonomySerializer')
        .normalizeTaxonomyObject(payload.taxonomy, TAXONOMY_LEVELS.COURSE),
      thumbnailUrl: thumbnailUrl,
      title: payload.title,
      unitCount: payload.unit_count
        ? payload.unit_count
        : payload.unit_summary
          ? payload.unit_summary.length
          : 0,
      metadata: metadata,
      audience:
        metadata.audience && metadata.audience.length > 0
          ? metadata.audience
          : [],
      useCase: payload.use_case,
      version: payload.version
      // TODO More properties will be added here...
    });
  },

  /**
   * Get normalizeClassPerformanceByStudentId
   * @returns {Promise.<[]>}
   */
  normalizeClassPerformanceByStudentId: function(response) {
    response = Ember.A(response.content);
    return response;
  },

  /**
   * Normalize the alternate paths for a lesson
   * @param data - The alternate paths in JSON format
   * @returns {Collection[]} alternate paths list
   */
  normalizeAlternatePaths: function(data) {
    return Ember.isArray(data)
      ? data.map(path => {
        if (path.target_content_type === 'resource') {
          return this.get('alternatePathSerializer').normalizeAlternatePath(
            path
          );
        } else {
          let normalizedPath =
              path.target_content_type === 'collection'
                ? this.get('collectionSerializer').normalizeReadCollection(path)
                : this.get('assessmentSerializer').normalizeReadAssessment(
                  path
                );
          if (!normalizedPath.get('collectionSubType')) {
            normalizedPath.set(
              'collectionSubType',
              ASSESSMENT_SUB_TYPES.BACKFILL
            );
          }
          return normalizedPath;
        }
      })
      : [];
  },

  /**
   * @function normalizeAlternatePathContent
   * @param alternatePaths alternate_path object
   * Method to normalized suggested alternate path from the payload
   */
  normalizeAlternatePathContent(alternatePaths) {
    let serializer = this;
    let systemAlternatePathContents = Ember.A([]);
    let teacherAlternatePathContents = Ember.A([]);
    let alternatePathContents = Ember.A([]);
    if (alternatePaths) {
      let systemSuggestions = alternatePaths.system_suggestions || null;
      let teacherSuggestions = alternatePaths.teacher_suggestions || null;
      let source = '';
      if (teacherSuggestions) {
        source = 'teacher_suggestions';
        teacherSuggestions.map(suggestedContent => {
          teacherAlternatePathContents.push(
            serializer.serializeCategorizedSuggestedContent(
              suggestedContent,
              source
            )
          );
        });
        teacherAlternatePathContents = teacherAlternatePathContents.sortBy(
          'pathId'
        );
        alternatePathContents.pushObjects(teacherAlternatePathContents);
      }
      if (systemSuggestions) {
        source = 'system_suggestions';
        systemSuggestions.map(suggestedContent => {
          systemAlternatePathContents.push(
            serializer.serializeCategorizedSuggestedContent(
              suggestedContent,
              source
            )
          );
        });
        systemAlternatePathContents = systemAlternatePathContents.sortBy(
          'pathId'
        );
        alternatePathContents.pushObjects(systemAlternatePathContents);
      }
    }
    return alternatePathContents;
  },

  /**
   * @function serializeCategorizedSuggestedContent
   * Method to serialize suggested content based on the content type
   */
  serializeCategorizedSuggestedContent(content, source) {
    let serializedData = [];
    const serializer = this;
    const alternatePathSerializer = serializer.get('alternatePathSerializer');
    if (content.suggested_content_type === 'resource') {
      serializedData = alternatePathSerializer.normalizeSuggestedResource(
        content,
        source
      );
    } else {
      serializedData = alternatePathSerializer.normalizeSuggestedCollection(
        content,
        source
      );
    }
    return serializedData;
  },

  normalizeMilestoneAlternatePath(payload) {
    const alternatePath = payload.alternate_paths || null;
    const domainItems = alternatePath ? alternatePath.domains : [];
    const domainData = Ember.A();
    if (domainItems) {
      domainItems.forEach(domain => {
        const payloadContext = domain.context;
        const lessonSuggestions = domain.lesson_suggestions;
        const suggestionStat = domain.diagnostic_suggestions;
        const skippedLessons = domain.skipped_lessons || [];
        const parseLessonsList = this.normalizeSuggestionLessons(
          lessonSuggestions,
          skippedLessons
        );
        const suggestedContent = this.parseDomainDiagnosticSuggestion(domain);
        this.mergeDiagnosticLessonSuggestion(
          parseLessonsList,
          suggestedContent
        );

        const resultData = {
          context: null,
          lessonSuggestions: parseLessonsList,
          diagnosticStats: null
        };
        if (payloadContext) {
          let context = {
            ctxClassId: payloadContext.ctx_class_id,
            ctxCourseId: payloadContext.ctx_course_id,
            ctxUnitId: payloadContext.ctx_unit_id,
            ctxLessonId: payloadContext.ctx_lesson_id,
            ctxCollectionId: payloadContext.ctx_collection_id,
            ctxMilestoneId: payloadContext.ctx_milestone_id,
            ctxGradeId: payloadContext.ctx_grade_id,
            domainCode: payloadContext.domain_code,
            gradeId: payloadContext.grade_id
          };
          resultData.context = Ember.Object.create(context);
        }
        if (suggestionStat) {
          resultData.diagnosticStats = Ember.Object.create({
            session_id: suggestionStat.session_id,
            status: suggestionStat.status
          });
        }
        domainData.pushObject(Ember.Object.create(resultData));
      });
    }
    return domainData;
  },

  normalizeCourseAlternatePath(payload) {
    const alternatePath = payload.alternate_paths || null;
    const payloadContext = alternatePath ? alternatePath.context : null;
    const lessonSuggestions = alternatePath
      ? alternatePath.lesson_suggestions
      : [];
    const suggestionStat = alternatePath
      ? alternatePath.diagnostic_suggestions
      : null;
    const resultData = {
      context: null,
      lessonSuggestions: this.normalizeSuggestionLessons(lessonSuggestions),
      diagnosticStats: null
    };
    if (payloadContext) {
      let context = {
        ctxClassId: payloadContext.ctx_class_id,
        ctxCourseId: payloadContext.ctx_course_id,
        ctxUnitId: payloadContext.ctx_unit_id,
        ctxLessonId: payloadContext.ctx_lesson_id,
        ctxCollectionId: payloadContext.ctx_collection_id,
        ctxMilestoneId: payloadContext.ctx_milestone_id,
        ctxGradeId: payloadContext.ctx_grade_id
      };
      resultData.context = Ember.Object.create(context);
    }
    if (suggestionStat) {
      resultData.diagnosticStats = Ember.Object.create({
        session_id: suggestionStat.session_id,
        status: suggestionStat.status
      });
    }
    return Ember.Object.create(resultData);
  },

  normalizeSuggestionLessons(lessons, skippedLessons = []) {
    const results = Ember.A();
    lessons.forEach(lesson => {
      const lessonItem = {
        id: lesson.id,
        lesson_id: lesson.lesson_id,
        title: lesson.title,
        sequence_id: lesson.sequence_id,
        collections: this.normalizeDiagnosticCollection(
          lesson.collection_summary
        )
      };
      if (skippedLessons) {
        const isSkipped = skippedLessons.indexOf(lesson.lesson_id) !== -1;
        if (isSkipped) {
          lesson.rescope = true;
        }
      }
      results.pushObject(Ember.Object.create(lessonItem));
    });
    return results.sortBy('sequence_id');
  },

  normalizeDiagnosticCollection(collections) {
    const results = Ember.A();
    const basePath = this.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    if (collections) {
      collections.forEach(collection => {
        const thumbnailUrl = collection.thumbnail
          ? basePath + collection.thumbnail
          : appRootPath +
            (collection.format === 'assessment'
              ? DEFAULT_IMAGES.ASSESSMENT
              : DEFAULT_IMAGES.COLLECTION);
        const item = {
          id: collection.id,
          title: collection.title,
          format: collection.format,
          sequenceId: collection.sequence_id,
          thumbnailUrl,
          url: collection.url,
          subformat: collection.subformat,
          gutCodes: collection.gut_codes,
          learningObjective: collection.learning_objective,
          metadata: collection.metadata,
          resourceCount: collection.resource_count,
          questionCount: collection.question_count,
          oeQuestionCount: collection.oe_question_count,
          taskCount: collection.task_count,
          isSuggested: true
        };
        results.pushObject(Ember.Object.create(item));
      });
    }
    return results.sortBy('sequenceId');
  },

  normalizeDependentPath(payload) {
    const dependentPaths = payload.dependent_paths || [];
    const results = Ember.A([]);
    dependentPaths.forEach(dependentLesson => {
      const lessonItem = {
        id: dependentLesson.id,
        lesson_id: dependentLesson.lesson_id,
        lesson_title: dependentLesson.title,
        cxtLessonId: dependentLesson.ctx_lesson_id,
        sequence_id: dependentLesson.sequence_id || 0,
        signatureSuggestions: dependentLesson.signature_suggestions,
        collections: this.normalizeDiagnosticCollection(
          dependentLesson.collection_summary
        )
      };

      if (
        lessonItem.signatureSuggestions &&
        lessonItem.signatureSuggestions.length
      ) {
        const signatureContent = this.parseDependentLessonSuggestion(
          lessonItem.signatureSuggestions
        );
        signatureContent.forEach(item => {
          item.set(
            'dependentSource',
            DEPENDENT_LESSON_SUGGESTION_EVENTS.source
          );
        });
        lessonItem.collections = lessonItem.collections.concat(
          signatureContent
        );
      }
      results.pushObject(Ember.Object.create(lessonItem));
    });
    return results;
  },

  parseDomainDiagnosticSuggestion(domain) {
    const suggestedContent = domain ? domain.signature_suggestions : [];
    const alternatePathSerializer = this.get('alternatePathSerializer');
    return suggestedContent.map(content => {
      const normalizeContent = alternatePathSerializer.normalizeSuggestedCollection(
        content,
        'system'
      );
      return normalizeContent;
    });
  },

  parseDependentLessonSuggestion(signatureSuggestions) {
    const suggestedContent = signatureSuggestions || [];
    const alternatePathSerializer = this.get('alternatePathSerializer');
    return suggestedContent.map(content => {
      const normalizeContent = alternatePathSerializer.normalizeSuggestedCollection(
        content,
        'system'
      );
      return normalizeContent;
    });
  },

  mergeDiagnosticLessonSuggestion(diagnosticLesson, suggestedContent) {
    if (diagnosticLesson && diagnosticLesson.length) {
      diagnosticLesson.forEach(item => {
        let lessonSuggestions = suggestedContent.filterBy(
          'lessonId',
          item.lesson_id
        );
        lessonSuggestions = lessonSuggestions.sortBy('format').reverse();
        if (lessonSuggestions.length) {
          item.set('collections', [...item.collections, ...lessonSuggestions]);
        }
      });
    }
  }
});
