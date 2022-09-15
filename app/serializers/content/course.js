import Ember from 'ember';
import { cleanFilename, serializeEtlSec } from 'gooru-web/utils/utils';
import CourseModel from 'gooru-web/models/content/course';
import Lesson from 'gooru-web/models/content/lesson';
import LessonItem from 'gooru-web/models/content/lessonItem';
import Unit from 'gooru-web/models/content/unit';
import UnitSerializer from 'gooru-web/serializers/content/unit';
import ProfileSerializer from 'gooru-web/serializers/profile/profile';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import { DEFAULT_IMAGES, TAXONOMY_LEVELS } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

/**
 * Serializer to support the Course CRUD operations for API 3.0
 *
 * @typedef {Object} CourseSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  unitSerializer: null,

  /**
   * @property {TaxonomySerializer} taxonomySerializer
   */
  taxonomySerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'unitSerializer',
      UnitSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'profileSerializer',
      ProfileSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Serialize a Course object into a JSON representation required by the Create Course endpoint
   *
   * @param courseModel The Course model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeCreateCourse: function(courseModel) {
    var courseData = this.serializeCourse(courseModel, true);
    return courseData;
  },

  /**
   * Serialize a Course object into a JSON representation required by the Create Edit endpoint
   *
   * @param courseModel The Course model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateCourse: function(courseModel) {
    var courseData = this.serializeCourse(courseModel, false);
    return courseData;
  },

  /**
   * Serialize the course title
   *
   * @param title
   * @returns {Object} returns a JSON Object
   */
  serializeUpdateCourseTitle: function(title) {
    let serialized = {
      title: title
    };
    return serialized;
  },

  serializeCourse: function(courseModel, isCreate = false) {
    const serializer = this;
    let description = courseModel.get('description');
    let thumbnailUrl = cleanFilename(
      courseModel.get('thumbnailUrl'),
      this.get('session.cdnUrls')
    );
    let serializedCourse = {
      title: courseModel.get('title'),
      description: description ? description : null,
      thumbnail: thumbnailUrl ? thumbnailUrl : null,
      visible_on_profile: courseModel.get('isVisibleOnProfile'),
      taxonomy: serializer
        .get('taxonomySerializer')
        .serializeTaxonomy(courseModel.get('taxonomy')),
      subject_bucket: courseModel.get('subject'),
      metadata: courseModel.get('metadata') || {},
      use_case: courseModel.get('useCase'),
      summary: courseModel.get('summary') ? courseModel.get('summary') : null,
      primary_language: courseModel.get('primaryLanguage')
    };

    let publisherId = courseModel.get('publisherId');
    if (publisherId) {
      serializedCourse.publisher_id = publisherId;
    } else if ((publisherId === null || publisherId === '') && !isCreate) {
      serializedCourse.publisher_id = null;
    }

    serializedCourse.metadata.audience = courseModel.get('audience')
      ? courseModel.get('audience')
      : [];
    if (courseModel.get('author_etl_secs')) {
      serializedCourse.author_etl_secs =
        courseModel.get('author_etl_secs') === '0'
          ? null
          : courseModel.get('author_etl_secs');
    }
    return serializedCourse;
  },

  /**
   * Normalize an array of courses
   *
   * @param payload endpoint response format in JSON format
   * @returns {Content/Course[]} courseData - An array of course models
   */
  normalizeGetCourses: function(payload) {
    const serializer = this;
    if (payload.courses && Ember.isArray(payload.courses)) {
      const owners = Ember.A(payload.owner_details || []);
      return payload.courses.map(function(course) {
        return serializer.normalizeCourse(course, owners);
      });
    } else {
      return [];
    }
  },

  /**
   * Normalize an array of ClassPerformanceSummary
   *
   * @param payload endpoint response format in JSON format
   * @returns {ClassPerformanceSummary[]}
   */
  normalizeCourseCards: function(payload) {
    const serializer = this;
    if (payload.courses && Ember.isArray(payload.courses)) {
      return payload.courses.map(function(course) {
        return serializer.normalizeCourseCard(course);
      });
    } else {
      return [];
    }
  },

  /**
   * Normalize a Course card response
   *
   * @param payload - The endpoint response in JSON format
   * @returns {Content/Course} Course Model
   */
  normalizeCourseCard: function(payload) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = payload.thumbnail
      ? basePath + payload.thumbnail
      : appRootPath + DEFAULT_IMAGES.COURSE;

    return CourseModel.create(Ember.getOwner(serializer).ownerInjection(), {
      id: payload.id,
      thumbnailUrl: thumbnailUrl,
      title: payload.title,
      ownerId: payload.owner_id,
      version: payload.version,
      subject: payload.subject_bucket
    });
  },

  /**
   * Normalize a Course response
   *
   * @param payload - The endpoint response in JSON format
   * @param {[]} owners owner details
   * @returns {Content/Course} Course Model
   */
  normalizeCourse: function(payload, owners) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = payload.thumbnail
      ? basePath + payload.thumbnail
      : appRootPath + DEFAULT_IMAGES.COURSE;
    const owner = owners ? owners.findBy('id', payload.owner_id) : null;
    const metadata = payload.metadata || {};
    const etlSeconds = serializeEtlSec(payload.author_etl_secs);
    const computedEtlSec = serializeEtlSec(payload.computed_etl_secs);

    return CourseModel.create(Ember.getOwner(serializer).ownerInjection(), {
      id: payload.id,
      collaborator: payload.collaborator ? payload.collaborator : [],
      creatorId: payload.creator_id,
      originalCourseId: payload.original_course_id,
      originalCreatorId: payload.original_creator_id,
      createdDate: payload.created_at || null,
      children: serializer
        .get('unitSerializer')
        .normalizeUnits(payload.unit_summary),
      description: payload.description,
      summary: payload.summary,
      publisherId: payload.publisher_id,
      primaryLanguage: payload.primary_language || 1,
      isPublished:
        payload.publish_status && payload.publish_status === 'published',
      isVisibleOnProfile:
        typeof payload.visible_on_profile !== 'undefined'
          ? payload.visible_on_profile
          : true,
      owner: owner
        ? serializer.get('profileSerializer').normalizeReadProfile(owner)
        : null,
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
      version: payload.version,
      aggregatedTaxonomy: payload.aggregated_taxonomy
        ? payload.aggregated_taxonomy
        : null,
      author_etl_secs: payload.author_etl_secs,
      hours: etlSeconds.etlHours === '0 hr' ? '' : etlSeconds.etlHours,
      minutes: etlSeconds.etlMinutes === '0 min' ? '' : etlSeconds.etlMinutes,
      computedHours:
        computedEtlSec.etlHours === '0 hr' ? '' : computedEtlSec.etlHours,
      computedMinutes:
        computedEtlSec.etlMinutes === '0 min' ? '' : computedEtlSec.etlMinutes,
      publisherInfo: payload.publisher_info || null
      // TODO More properties will be added here...
    });
  },
  /**
   * Normalizes the course structure response
   *
   * @param {*} payload - The endpoint response in JSON format
   * @param {string} collectionType collection|assessment
   * @returns {Content/Course} Course Model
   */
  normalizeCourseStructure: function(payload, collectionType) {
    const serializer = this;
    const coursePayload = payload.courses[0];
    const course = CourseModel.create({
      id: coursePayload.id,
      title: coursePayload.title,
      children: serializer.normalizeCourseStructureUnits(
        coursePayload.units || [],
        collectionType
      )
    });
    return course;
  },

  /**
   * Normalizes the course structure units response
   *
   * @param {[]} payload - The endpoint response in JSON format
   * @param {string} collectionType collection|assessment
   * @returns {Content/Unit[]} units
   */
  normalizeCourseStructureUnits: function(payload, collectionType) {
    const serializer = this;
    return payload.map(function(unitPayload) {
      return Unit.create({
        id: unitPayload.id,
        title: unitPayload.title,
        sequence: unitPayload.sequence_id,
        children: serializer.normalizeCourseStructureLessons(
          unitPayload.lessons || [],
          collectionType
        )
      });
    });
  },

  /**
   * Normalizes the course structure lessons response
   *
   * @param {[]} payload - The endpoint response in JSON format
   * @param {string} collectionType collection|assessment
   * @returns {Content/Lesson[]} lessons
   */
  normalizeCourseStructureLessons: function(payload, collectionType) {
    const serializer = this;
    const isAssessment = collectionType === 'assessment';
    return payload.map(function(lessonPayload) {
      const items = isAssessment
        ? lessonPayload.assessments
        : lessonPayload.collections;
      return Lesson.create({
        id: lessonPayload.id,
        title: lessonPayload.title,
        sequence: lessonPayload.sequence_id,
        children: serializer.normalizeCourseStructureLessonItems(items || [])
      });
    });
  },

  /**
   * Normalizes the course structure lesson items response
   *
   * @param {[]} payload - The endpoint response in JSON format
   * @returns {Content/LessonItem[]} lesson items
   */
  normalizeCourseStructureLessonItems: function(payload) {
    return payload.map(function(lessonItemPayload) {
      return LessonItem.create({
        id: lessonItemPayload.id,
        title: lessonItemPayload.title,
        sequence: lessonItemPayload.sequence_id,
        format: lessonItemPayload.format
      });
    });
  },

  /**
   * Serialize reorder course
   * @param {string[]} unitIds
   */
  serializeReorderCourse: function(unitIds) {
    const values = unitIds.map(function(id, index) {
      return { id: id, sequence_id: index + 1 };
    });

    return {
      order: values
    };
  },

  /**
   * Normalized data of course milestones
   * @return {Object}
   */
  normalizeCourseMilestones: function(response) {
    let resultSet = Ember.A();
    response = Ember.A(response.milestones);
    response.forEach(data => {
      let result = Ember.Object.create(data);
      resultSet.pushObject(result);
    });
    return resultSet;
  },

  /**
   * Normalized data of course milestone lessons
   * @return {Object}
   */
  normalizeCourseMilestoneLessons: function(response) {
    let lessons = Ember.A(response.lessons);
    let milestoneLessons = Ember.A([]);
    if (lessons && lessons.length) {
      lessons.map(lesson => {
        //Ignore duplicate lessons
        if (!milestoneLessons.findBy('lesson_id', lesson.lesson_id)) {
          let allLesson = lessons.filter(
            item => item.lesson_id === lesson.lesson_id
          );
          lesson.gutCodes = allLesson.map(item => item.tx_comp_code);
          milestoneLessons.pushObject(Ember.Object.create(lesson));
        }
      });
    }
    return milestoneLessons;
  },

  normalizePublisherList(payload) {
    let learningPubshierList = payload.learningPubshierList
      ? payload.learningPubshierList
      : [];
    let results = Ember.A();
    learningPubshierList.map(function(publisherItem) {
      results.pushObject(Ember.Object.create(publisherItem));
    });
    return results;
  }
});
