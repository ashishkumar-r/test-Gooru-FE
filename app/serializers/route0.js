import Ember from 'ember';
import {
  DEFAULT_IMAGES,
  CONTENT_TYPES,
  PATH_TYPE
} from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  normalizeFetch: function(payload) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = serializer.get('appRootPath');
    let milestones = Ember.A([]);
    let response = Ember.Object.create({
      status: payload.status,
      ctxPathType: PATH_TYPE.ROUTE0,
      userCompetencyRoute: payload.userCompetencyRoute,
      milestones
    });
    if (payload && payload.route0Content && payload.route0Content.milestones) {
      const milestoneList = payload.route0Content.milestones;
      milestoneList.forEach(milestone => {
        const milestoneResponse = Ember.Object.create({
          milestone_id: milestone.milestoneId,
          milestoneSequence: milestone.milestoneSequence,
          milestoneTitle: milestone.milestoneTitle,
          isRoute0: true,
          lessons: Ember.A([]),
          units: Ember.A([])
        });
        const units = milestone.units || [];
        units.forEach(unit => {
          unit.id = unit.unitId;
          unit.pathType = PATH_TYPE.ROUTE0;
          unit.ctxPathType = PATH_TYPE.ROUTE0;
          const unitData = Ember.Object.create(unit);
          milestoneResponse.units.push(unitData);
          const lessons = unit.lessons || [];
          lessons.forEach(lesson => {
            lesson.pathType = PATH_TYPE.ROUTE0;
            lesson.ctxPathType = PATH_TYPE.ROUTE0;
            if (lesson.alternate_paths) {
              let suggestedPaths = serializer.normalizeAlternatePathContent(
                lesson.alternate_paths
              );
              let lessonChildren = lesson.collections;
              suggestedPaths.map(suggestedPath => {
                let ctxCollectionIndex = lessonChildren.findIndex(
                  child => child.collectionId === suggestedPath.assessmentId
                );
                if (ctxCollectionIndex >= 0) {
                  //Add suggested content, next to the context collection
                  lessonChildren.splice(
                    ctxCollectionIndex + 1,
                    0,
                    suggestedPath
                  );
                }
              });
            }
            const lessonResponse = Ember.Object.create({
              lesson_id: lesson.lessonId,
              lessonSequence: lesson.lessonSequence,
              lesson_title: lesson.lessonTitle,
              unit_id: unit.unitId,
              unitTitle: unit.unitTitle,
              unitSequence: unit.unitSequence,
              collections: Ember.A([]),
              gutCodes: lesson.aggregatedGutCodes
            });
            const collections = lesson.collections || [];
            collections.forEach(collection => {
              collection.pathType = PATH_TYPE.ROUTE0;
              collection.ctxPathType = PATH_TYPE.ROUTE0;
              const defaultImage = collection.collectionType.includes(
                CONTENT_TYPES.COLLECTION
              )
                ? DEFAULT_IMAGES.COLLECTION
                : DEFAULT_IMAGES.ASSESSMENT;
              const thumbnailUrl = collection.thumbnail
                ? basePath + collection.thumbnail
                : appRootPath + defaultImage;
              const collectionResponse = Ember.Object.create({
                id: collection.collectionId,
                collectionSequence: collection.collectionSequence,
                format: collection.collectionType,
                pathId: collection.pathId,
                ctxPathType: PATH_TYPE.ROUTE0,
                title: collection.title,
                thumbnailUrl,
                source: collection.source || null
              });
              lessonResponse.collections.push(collectionResponse);
            });
            milestoneResponse.lessons.push(lessonResponse);
          });
        });
        milestones.push(milestoneResponse);
      });
    }
    milestones.sortBy('milestoneSequence');
    return response;
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
      let systemSuggestions = alternatePaths.system || null;
      let teacherSuggestions = alternatePaths.teacher || null;
      let source = '';
      if (teacherSuggestions) {
        source = 'teacher_suggestions';
        teacherAlternatePathContents.push(
          serializer.serializeCategorizedSuggestedContent(
            teacherSuggestions,
            source
          )
        );
        teacherAlternatePathContents = teacherAlternatePathContents.sortBy(
          'pathId'
        );
        alternatePathContents.pushObjects(teacherAlternatePathContents);
      }
      if (systemSuggestions) {
        source = 'system_suggestions';
        systemAlternatePathContents.push(
          serializer.serializeCategorizedSuggestedContent(
            systemSuggestions,
            source
          )
        );
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
    if (content.suggested_content_type === 'resource') {
      serializedData = serializer.normalizeSuggestedResource(content, source);
    } else {
      serializedData = serializer.normalizeSuggestedCollection(content, source);
    }
    return serializedData;
  },

  /**
   * @function normalizeSuggestedCollection
   * Method to normalize suggested collection/assessment content
   */
  normalizeSuggestedCollection(content, source) {
    let suggestedCollection = {
      collectionId: content.suggested_content_id,
      collectionSubType: content.suggested_content_subtype,
      collectionType: content.suggested_content_type,
      title: content.title,
      assessmentId: content.ctx_collection_id || null,
      classId: content.ctx_class_id || null,
      courseId: content.ctx_course_id || null,
      unitId: content.ctx_unit_id || null,
      lessonId: content.ctx_lesson_id || null,
      pathId: content.id,
      thumbnail: content.thumbnail,
      source
    };
    return suggestedCollection;
  },

  /**
   * @function normalizeSuggestedResource
   * Method to normalize suggesetd resource content
   */
  normalizeSuggestedResource(content, source) {
    let suggestedResource = {
      collectionId: content.suggested_content_id,
      collectionSubType: content.suggested_content_subtype,
      collectionType: content.suggested_content_type,
      title: content.title,
      assessmentId: content.ctx_collection_id || null,
      classId: content.ctx_class_id || null,
      courseId: content.ctx_course_id || null,
      unitId: content.ctx_unit_id || null,
      lessonId: content.ctx_lesson_id || null,
      pathId: content.id,
      thumbnail: content.thumbnail,
      source
    };
    return suggestedResource;
  },

  updateRouteAction: function(data) {
    return data;
  }
});
