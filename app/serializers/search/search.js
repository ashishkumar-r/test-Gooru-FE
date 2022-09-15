import Ember from 'ember';

import ResourceModel from 'gooru-web/models/content/resource';
import QuestionModel from 'gooru-web/models/content/question';
import AssessmentModel from 'gooru-web/models/content/assessment';
import CollectionModel from 'gooru-web/models/content/collection';
import CourseModel from 'gooru-web/models/content/course';
import ProfileModel from 'gooru-web/models/profile/profile';
import {
  DEFAULT_IMAGES,
  TAXONOMY_LEVELS,
  CONTENT_TYPE_ENUM
} from 'gooru-web/config/config';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import Rubric from 'gooru-web/models/rubric/rubric';
import { isEmptyValue } from 'gooru-web/utils/utils';

/**
 * Serializer to support Search functionality
 *
 * @typedef {Object} SearchSerializer
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
   * Normalize the Search collections response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Collection[]}
   */
  normalizeSearchCollections: function(payload, isSuggestion = false) {
    const serializer = this;
    payload.searchResults = payload.searchResults ? payload.searchResults : [];
    if (Ember.isArray(payload.searchResults)) {
      const result = payload.searchResults.map(function(result) {
        return serializer.normalizeCollection(result, isSuggestion);
      });
      //Temporary fix(Remove duplicate value) after some time will be removed
      if (Ember.isArray(result) && isSuggestion && result && result.length) {
        const props = ['title', 'description'];
        const collectionUniqueData = [
          ...new Map(
            result.map(data => [props.map(k => data[k]).join('|'), data])
          ).values()
        ];
        return collectionUniqueData;
      } else {
        return result;
      }
    }
  },

  /**
   * Normalize a collection
   * @param {*} collectionData
   * @returns {Collection}
   */
  normalizeCollection: function(collectionData) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const userBasePath = serializer.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const defaultImage =
      collectionData.format === 'assessment' ||
      collectionData.format === 'assessment-external'
        ? DEFAULT_IMAGES.ASSESSMENT
        : DEFAULT_IMAGES.COLLECTION;
    const thumbnailUrl = collectionData.thumbnail
      ? basePath + collectionData.thumbnail
      : appRootPath + defaultImage;
    const userThumbnailUrl = collectionData.userProfileImage
      ? userBasePath + collectionData.userProfileImage
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
    const creatorThumbnailUrl = collectionData.creatorProfileImage
      ? userBasePath + collectionData.creatorProfileImage
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
    const taxonomyInfo =
      collectionData.taxonomySet &&
      collectionData.taxonomySet.curriculum &&
      collectionData.taxonomySet.curriculum.curriculumInfo;
    const taxonomyList = collectionData.taxonomy ? collectionData.taxonomy : [];
    const course = collectionData.course || {};
    return CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: collectionData.id,
      title: collectionData.title,
      thumbnailUrl: thumbnailUrl,
      standards: taxonomyInfo
        ? serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyArray(taxonomyInfo)
        : serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyObject(taxonomyList),
      publishStatus: collectionData.publishStatus,
      learningObjectives: collectionData.languageObjective
        ? collectionData.languageObjective
        : collectionData.learningObjective,
      resourceCount: collectionData.resourceCount || 0,
      questionCount: collectionData.questionCount || 0,
      remixCount: collectionData.scollectionRemixCount || 0,
      course: course.title,
      courseId: course.id,
      relevance: collectionData.relevance,
      efficacy: collectionData.efficacy,
      engagement: collectionData.engagement,
      isVisibleOnProfile: collectionData.profileUserVisibility,
      owner: ProfileModel.create({
        id: collectionData.gooruUId,
        firstName:
          collectionData.user && collectionData.user.firstname
            ? collectionData.user.firstname
            : collectionData.userFirstName,
        lastName:
          collectionData.user && collectionData.user.lastname
            ? collectionData.user.lastname
            : collectionData.userLastName,
        avatarUrl: userThumbnailUrl,
        username:
          collectionData.user && collectionData.user.username
            ? collectionData.user.username
            : collectionData.usernameDisplay
      }),
      creator: ProfileModel.create({
        id: collectionData.creatorId,
        firstName: collectionData.creatorFirstname,
        lastName: collectionData.creatorLastname,
        avatarUrl: creatorThumbnailUrl,
        username: collectionData.creatornameDisplay
      }),
      format: collectionData.format || collectionData.type || null
    });
  },

  /**
   * @function normalizeSearchOfflineActivities
   * Method to serialize search offline activities
   */
  normalizeSearchOfflineActivities(
    offlineActivitiesPayload,
    isSuggestion = false
  ) {
    const serializer = this;
    if (Ember.isArray(offlineActivitiesPayload.searchResults)) {
      const result = offlineActivitiesPayload.searchResults.map(function(
        result
      ) {
        return serializer.normalizeOfflieActivity(result);
      });
      //Temporary fix(Remove duplicate value) after some time will be removed.
      if (Ember.isArray(result) && isSuggestion && result && result.length) {
        const props = ['title', 'description'];
        const offlineUniqueData = [
          ...new Map(
            result.map(data => [props.map(k => data[k]).join('|'), data])
          ).values()
        ];
        return offlineUniqueData;
      } else {
        return result;
      }
    }
  },

  /**
   * Normalize a offine activity
   * @param {*} offlineActivityData
   * @returns {offlineActivityData}
   */
  normalizeOfflieActivity: function(offlineActivityData) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const userBasePath = serializer.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = offlineActivityData.thumbnail
      ? basePath + offlineActivityData.thumbnail
      : appRootPath + DEFAULT_IMAGES.OFFLINE_ACTIVITY;
    const userThumbnailUrl = offlineActivityData.userProfileImage
      ? userBasePath + offlineActivityData.userProfileImage
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
    const creatorThumbnailUrl = offlineActivityData.creatorProfileImage
      ? userBasePath + offlineActivityData.creatorProfileImage
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
    const taxonomyInfo =
      offlineActivityData.taxonomySet &&
      offlineActivityData.taxonomySet.curriculum &&
      offlineActivityData.taxonomySet.curriculum.curriculumInfo;
    const taxonomyList = offlineActivityData.taxonomy
      ? offlineActivityData.taxonomy
      : [];

    const course = offlineActivityData.course || {};
    return Ember.Object.create({
      id: offlineActivityData.id,
      title: offlineActivityData.title,
      thumbnailUrl: thumbnailUrl,
      standards: taxonomyInfo
        ? serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyArray(taxonomyInfo)
        : serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyObject(taxonomyList),
      publishStatus: offlineActivityData.publishStatus,
      learningObjectives: offlineActivityData.languageObjective
        ? offlineActivityData.languageObjective
        : offlineActivityData.learningObjective,
      resourceCount: offlineActivityData.resourceCount || 0,
      questionCount: offlineActivityData.questionCount || 0,
      remixCount: offlineActivityData.scollectionRemixCount || 0,
      course: course.title,
      courseId: course.id,
      isVisibleOnProfile: offlineActivityData.profileUserVisibility,
      owner: ProfileModel.create({
        id: offlineActivityData.gooruUId,
        firstName:
          offlineActivityData.user && offlineActivityData.user.firstname
            ? offlineActivityData.user.firstname
            : offlineActivityData.userFirstName,
        lastName:
          offlineActivityData.user && offlineActivityData.user.lastname
            ? offlineActivityData.user.lastname
            : offlineActivityData.userLastName,
        avatarUrl: userThumbnailUrl,
        username:
          offlineActivityData.user && offlineActivityData.user.username
            ? offlineActivityData.user.username
            : offlineActivityData.usernameDisplay
      }),
      creator: ProfileModel.create({
        id: offlineActivityData.creatorId,
        firstName: offlineActivityData.creatorFirstname,
        lastName: offlineActivityData.creatorLastname,
        avatarUrl: creatorThumbnailUrl,
        username: offlineActivityData.creatornameDisplay
      }),
      format: offlineActivityData.format || offlineActivityData.type || null,
      taskCount: offlineActivityData.taskCount || 0,
      collectionType:
        offlineActivityData.collectionType || offlineActivityData.type
    });
  },

  /**
   * Normalize an assessment
   * @param {*} assessmentData
   * @returns {Assessment}
   */
  normalizeAssessment: function(assessmentData) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const userBasePath = serializer.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = assessmentData.thumbnail
      ? basePath + assessmentData.thumbnail
      : appRootPath + DEFAULT_IMAGES.ASSESSMENT;
    const ownerThumbnailUrl = assessmentData.userProfileImage
      ? userBasePath + assessmentData.userProfileImage
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
    const creatorThumbnailUrl = assessmentData.creatorProfileImage
      ? userBasePath + assessmentData.creatorProfileImage
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
    const taxonomyInfo =
      assessmentData.taxonomySet &&
      assessmentData.taxonomySet.curriculum &&
      assessmentData.taxonomySet.curriculum.curriculumInfo;
    const taxonomyList = assessmentData.taxonomy ? assessmentData.taxonomy : [];

    const course = assessmentData.course || {};
    return AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
      id: assessmentData.id,
      title: assessmentData.title,
      format: assessmentData.format || assessmentData.type || null,
      thumbnailUrl: thumbnailUrl,
      standards: taxonomyInfo
        ? serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyArray(taxonomyInfo)
        : serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyObject(taxonomyList),
      publishStatus: assessmentData.publishStatus,
      learningObjectives: assessmentData.languageObjective
        ? assessmentData.languageObjective
        : assessmentData.learningObjective,
      resourceCount: assessmentData.resourceCount
        ? Number(assessmentData.resourceCount)
        : 0,
      questionCount: assessmentData.questionCount
        ? Number(assessmentData.questionCount)
        : 0,
      remixCount: assessmentData.scollectionRemixCount || 0,
      course: course.title,
      courseId: course.id,
      relevance: assessmentData.relevance,
      efficacy: assessmentData.efficacy,
      engagement: assessmentData.engagement,
      isVisibleOnProfile: assessmentData.profileUserVisibility,
      owner: ProfileModel.create({
        id: assessmentData.gooruUId,
        firstName:
          assessmentData.user && assessmentData.user.firstname
            ? assessmentData.user.firstname
            : assessmentData.userFirstName,
        lastName:
          assessmentData.user && assessmentData.user.lastname
            ? assessmentData.user.lastname
            : assessmentData.userLastName,
        avatarUrl: ownerThumbnailUrl,
        username:
          assessmentData.user && assessmentData.user.username
            ? assessmentData.user.username
            : assessmentData.usernameDisplay
      }),
      creator: ProfileModel.create({
        id: assessmentData.creatorId,
        firstName: assessmentData.creatorFirstname,
        lastName: assessmentData.creatorLastname,
        avatarUrl: creatorThumbnailUrl,
        username: assessmentData.creatornameDisplay
      })
    });
  },

  /**
   * Normalize the Search assessments response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Assessment[]}
   */
  normalizeSearchAssessments: function(payload, isSuggestion = false) {
    const serializer = this;
    if (Ember.isArray(payload.searchResults)) {
      const result = payload.searchResults.map(function(result) {
        return serializer.normalizeAssessment(result);
      });
      //Temporary fix(Remove duplicate value) after some time will be removed
      if (Ember.isArray(result) && isSuggestion && result && result.length) {
        const props = ['title', 'description'];
        const assessmentUniqueData = [
          ...new Map(
            result.map(data => [props.map(k => data[k]).join('|'), data])
          ).values()
        ];
        return assessmentUniqueData;
      } else {
        return result;
      }
    }
  },

  /**
   * Normalize the Search resources response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Resource[]}
   */
  normalizeSearchResources: function(payload) {
    const serializer = this;
    if (Ember.isArray(payload.searchResults)) {
      return payload.searchResults.map(function(result) {
        return serializer.normalizeResource(result);
      });
    }
  },

  /**
   * Normalize the rubrics
   * @param payload
   * @returns {Rubric[]}
   */
  normalizeSearchRubrics: function(payload) {
    let rubrics = payload.searchResults;
    const serializer = this;
    return rubrics.map(function(rubricData) {
      return serializer.normalizeRubric(rubricData);
    });
  },

  /**
   * Normalizes a rubric
   * @param {*} data
   * @return {Rubric}
   */
  normalizeRubric: function(rubric) {
    if (rubric) {
      const serializer = this;
      const categories = rubric.categories;
      const basePath = serializer.get('session.cdnUrls.content');
      const userBasePath = serializer.get('session.cdnUrls.user');
      const appRootPath = this.get('appRootPath'); //configuration appRootPath
      const thumbnail = rubric.thumbnail ? basePath + rubric.thumbnail : null;
      const taxonomyInfo =
        (rubric.taxonomy &&
          rubric.taxonomy.curriculum &&
          rubric.taxonomy.curriculum.curriculumInfo) ||
        [];
      const ownerThumbnailUrl = rubric.creator.profileImage
        ? userBasePath + rubric.creator.profileImage
        : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
      return Rubric.create(Ember.getOwner(this).ownerInjection(), {
        id: rubric.id,
        title: rubric.title,
        description: rubric.description,
        thumbnail: thumbnail,
        standards: serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyObject(taxonomyInfo),
        audience: rubric.audience,
        url: rubric.url,
        isMyProfile: serializer.get('session.userId') === rubric.creator.id,
        owner: ProfileModel.create({
          id: rubric.creator.id,
          firstName: rubric.creator.userFirstName,
          lastName: rubric.creator.userLastName,
          avatarUrl: ownerThumbnailUrl,
          username: rubric.creator.usernameDisplay
        }),
        creator: ProfileModel.create({
          id: rubric.creator.id,
          firstName: rubric.creator.userFirstName,
          lastName: rubric.creator.userLastName,
          avatarUrl: ownerThumbnailUrl,
          username: rubric.creator.usernameDisplay
        }),
        isPublished: rubric.publishStatus === 'published',
        categories: categories
          ? categories.map(category =>
            serializer.normalizeRubricCategory(category)
          )
          : Ember.A(),
        createdDate: rubric.createdAt,
        updatedDate: rubric.updatedAt,
        modifierId: rubric.lastModifiedBy,
        originalCreatorId: rubric.originalCreator
          ? rubric.originalCreator.id
          : null
      });
    }
  },

  /**
   * Normalize the Search question response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Question[]}
   */
  normalizeSearchQuestions: function(payload) {
    const serializer = this;
    if (Ember.isArray(payload.searchResults)) {
      return payload.searchResults.map(function(result) {
        return serializer.normalizeQuestion(result);
      });
    }
  },

  /**
   * Normalizes a question
   * @param {*} result
   * @returns {Question}
   */
  normalizeQuestion: function(result) {
    const serializer = this;
    const format = result.contentFormat || result.resourceFormat.value || null; //value should be 'question'
    const type = QuestionModel.normalizeQuestionType(
      result.typeName || result.contentSubFormat
    );
    const taxonomyInfo =
      (result.taxonomySet &&
        result.taxonomySet.curriculum &&
        result.taxonomySet.curriculum.curriculumInfo) ||
      [];

    return QuestionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: result.gooruOid,
      title: result.title,
      description: result.description,
      format: format,
      publisher: null, //TODO missing publisher at API response,
      thumbnailUrl: result.thumbnail,
      type: type,
      owner: result.user ? serializer.normalizeOwner(result.user) : null,
      standards: serializer
        .get('taxonomySerializer')
        .normalizeTaxonomyArray(taxonomyInfo)
    });
  },

  normalizeAnswaers: function(result) {
    const serializer = this;
    return QuestionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: result.gooruOid,
      title: result.title,
      description: result.description,
      format: result.format,
      publisher: null, //TODO missing publisher at API response,
      thumbnailUrl: result.thumbnail,
      type: result.format,
      owner: result.user ? serializer.normalizeOwner(result.user) : null
    });
  },

  /**
   * Normalizes a resource
   * @param {*} result
   * @returns {Resource}
   */
  normalizeResource: function(result) {
    const serializer = this;
    const format = ResourceModel.normalizeResourceFormat(
      result.contentSubFormat
    );
    const taxonomyInfo =
      (result.taxonomySet &&
        result.taxonomySet.curriculum &&
        result.taxonomySet.curriculum.curriculumInfo) ||
      [];

    return ResourceModel.create(Ember.getOwner(this).ownerInjection(), {
      id: result.gooruOid,
      title: result.title,
      description: result.description,
      format: format,
      type: result.contentSubFormat,
      url: result.url,
      creator: result.creator
        ? serializer.normalizeOwner(result.creator)
        : null,
      owner: result.user ? serializer.normalizeOwner(result.user) : null,
      standards: serializer
        .get('taxonomySerializer')
        .normalizeTaxonomyArray(taxonomyInfo),
      publishStatus: result.publishStatus,
      publisher: result.publisher ? result.publisher[0] : null,
      efficacy: result.efficacy,
      engagement: result.engagement,
      relevance: result.relevance
    });
  },

  /**
   * Normalizes owner
   * @param ownerData
   * @returns {Profile}
   */
  normalizeOwner: function(ownerData) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = ownerData.profileImage
      ? basePath + ownerData.profileImage
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;

    return ProfileModel.create(Ember.getOwner(this).ownerInjection(), {
      id: ownerData.gooruUId || ownerData.id,
      firstName: ownerData.firstName || ownerData.firstname,
      lastName: ownerData.lastName || ownerData.lastname,
      username: ownerData.usernameDisplay,
      avatarUrl: thumbnailUrl
    });
  },

  /**
   * Normalize the Search course response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Course[]}
   */
  normalizeSearchCourses: function(payload) {
    const serializer = this;
    if (Ember.isArray(payload.searchResults)) {
      return payload.searchResults.map(function(result) {
        return serializer.normalizeCourse(result);
      });
    }
  },

  /**
   * Normalize the Search course response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Course[]}
   */
  normalizeSearchLearningMapCourses: function(payload, contentType) {
    const serializer = this;
    const appRootPath = this.get('appRootPath');
    const content = CONTENT_TYPE_ENUM[contentType];
    if (Ember.isArray(payload.contents[content].searchResults)) {
      return payload.contents[content].searchResults.map(function(result) {
        let resultObject = serializer.normalizeLearningMapCourses(result);
        resultObject.owner.avatarUrl =
          resultObject.owner && resultObject.owner.avatarUrl
            ? resultObject.owner.avatarUrl
            : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
        return resultObject;
      });
    }
  },

  /**
   * Normalizes a course
   * @param {*} result
   * @returns {Course}
   */
  normalizeCourse: function(result) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : appRootPath + DEFAULT_IMAGES.COURSE;
    const taxonomyInfo =
      (result.taxonomy &&
        result.taxonomy.curriculum &&
        result.taxonomy.curriculum.curriculumInfo) ||
      [];
    return CourseModel.create(Ember.getOwner(this).ownerInjection(), {
      id: result.id,
      title: result.title,
      description: result.description,
      thumbnailUrl: thumbnailUrl,
      subject: result.subjectBucket,
      subjectName:
        result.taxonomy && result.taxonomy.subject
          ? result.taxonomy.subject[0]
          : null,
      subjectSequence: result.subjectSequence,
      isVisibleOnProfile: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      unitCount: result.unitCount,
      taxonomy: serializer
        .get('taxonomySerializer')
        .normalizeTaxonomyArray(taxonomyInfo, TAXONOMY_LEVELS.COURSE),
      owner: result.owner ? serializer.normalizeOwner(result.owner) : null,
      sequence: result.sequence,
      version: result.version || null
    });
  },

  /**
   * Normalizes a course
   * @param {*} result
   * @returns {Course}
   */
  normalizeLearningMapCourses: function(result) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : appRootPath + DEFAULT_IMAGES.COURSE;
    const taxonomyInfo =
      (result.taxonomy &&
        result.taxonomy.curriculum &&
        result.taxonomy.curriculum.curriculumInfo) ||
      [];
    return CourseModel.create(Ember.getOwner(this).ownerInjection(), {
      id: result.id,
      title: result.title,
      description: result.description,
      thumbnailUrl: thumbnailUrl,
      subject: result.subjectBucket,
      subjectName:
        result.taxonomy && result.taxonomy.subject
          ? result.taxonomy.subject[0]
          : null,
      subjectSequence: result.subjectSequence,
      isVisibleOnProfile: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      unitCount: result.unitCount,
      creator:
        result.creator || result.user
          ? serializer.normalizeOwner(result.creator || result.user)
          : {},
      taxonomy: serializer
        .get('taxonomySerializer')
        .normalizeTaxonomyArray(taxonomyInfo, TAXONOMY_LEVELS.COURSE),
      owner:
        result.owner || result.user
          ? serializer.normalizeOwner(result.owner || result.user)
          : {},
      sequence: result.sequence,
      version: result.version || null,
      type: QuestionModel.normalizeQuestionType(
        result.typeName || result.contentSubFormat
      )
    });
  },

  /**
   * Normalize the Search unit response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Question[]}
   */
  normalizeSearchUnits: function(payload) {
    const serializer = this;
    if (Ember.isArray(payload.searchResults)) {
      return payload.searchResults.map(function(result) {
        return serializer.normalizeUnit(result);
      });
    }
  },

  /**
   * Normalizes a unit
   * @param {*} result
   * @returns {unit}
   */
  normalizeUnit: function(result) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : appRootPath + DEFAULT_IMAGES.COLLECTION;
    const taxonomyInfo =
      (result.taxonomy &&
        result.taxonomy.curriculum &&
        result.taxonomy.curriculum.curriculumInfo) ||
      [];
    return CourseModel.create(Ember.getOwner(this).ownerInjection(), {
      id: result.id,
      title: result.title,
      description: result.description,
      createdDate: result.addDate,
      thumbnailUrl: thumbnailUrl,
      lastModified: result.lastModified,
      lastModifiedBy: result.lastModifiedBy,
      isVisibleOnProfile: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      assessmentCount: result.assessmentCount,
      collectionCount: result.collectionCount,
      lessonCount: result.lessonCount,
      standards: taxonomyInfo
        ? serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyArray(taxonomyInfo, TAXONOMY_LEVELS.COURSE)
        : {},
      owner: result.owner ? serializer.normalizeOwner(result.owner) : null,
      sequence: result.sequence,
      relevance: result.relevance,
      efficacy: result.efficacy,
      engagement: result.engagement,
      type: result.format
    });
  },

  /**
   * Normalize the Search unit response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Lesson[]}
   */
  normalizeSearchLessons: function(payload) {
    const serializer = this;
    if (Ember.isArray(payload.searchResults)) {
      return payload.searchResults.map(function(result) {
        return serializer.normalizeLesson(result);
      });
    }
  },

  /**
   * Normalizes a lesson
   * @param {*} result
   * @returns {Course}
   */
  normalizeLesson: function(result) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = result.thumbnail
      ? basePath + result.thumbnail
      : appRootPath + DEFAULT_IMAGES.COLLECTION;
    return CourseModel.create(Ember.getOwner(this).ownerInjection(), {
      id: result.id,
      title: result.title,
      description: result.description,
      createdDate: result.addDate,
      thumbnailUrl: thumbnailUrl,
      lastModified: result.lastModified,
      lastModifiedBy: result.lastModifiedBy,
      isVisibleOnProfile: result.visibleOnProfile,
      isPublished: result.publishStatus === 'published',
      assessmentCount: result.assessmentCount,
      collectionCount: result.collectionCount,
      standards: null,
      owner: result.owner ? serializer.normalizeOwner(result.owner) : null,
      sequence: result.sequence,
      relevance: result.relevance,
      efficacy: result.efficacy,
      engagement: result.engagement,
      type: result.format
    });
  },

  /**
   * Normalizes a question
   * @param {*} result
   * @returns {Question}
   */
  normalizeLearningMapsContent(learningMapsContent) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const signatureData = learningMapsContent.signatureContents;
    if (signatureData && signatureData.assessments) {
      signatureData.assessments.forEach(function(item) {
        item.thumbnail = item.thumbnail
          ? basePath + item.thumbnail
          : appRootPath + DEFAULT_IMAGES.COLLECTION;
      });
    }
    if (signatureData && signatureData.collections) {
      signatureData.collections.forEach(function(item) {
        item.thumbnail = item.thumbnail
          ? basePath + item.thumbnail
          : appRootPath + DEFAULT_IMAGES.COLLECTION;
      });
    }

    const returnObjects = Ember.Object.create({
      owner: Ember.getOwner(this).ownerInjection(),
      title: learningMapsContent.title,
      code: learningMapsContent.code,
      gutCode: learningMapsContent.gutCode,
      contents: learningMapsContent.contents,
      prerequisites: learningMapsContent.prerequisites,
      subject: learningMapsContent.subject,
      course: learningMapsContent.course,
      domain: learningMapsContent.domain,
      signatureContents: signatureData,
      learningMapsContent: serializer.normalizeSearchLearningMapsContentInfo(
        learningMapsContent.contents
      )
    });
    return returnObjects;
  },

  normalizeLearningMapsContentCompetency(learningMapsContent) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const signatureData = {
      assessments:
        !isEmptyValue(learningMapsContent.contents.signatureAssessments) &&
        !isEmptyValue(
          learningMapsContent.contents.signatureAssessments.searchResults
        )
          ? learningMapsContent.contents.signatureAssessments.searchResults
          : [],
      collections:
        !isEmptyValue(learningMapsContent.contents.signatureCollections) &&
        !isEmptyValue(
          learningMapsContent.contents.signatureCollections.searchResults
        )
          ? learningMapsContent.contents.signatureCollections.searchResults
          : []
    };
    if (signatureData && signatureData.assessments) {
      signatureData.assessments.forEach(function(item) {
        item.thumbnail = item.thumbnail
          ? basePath + item.thumbnail
          : appRootPath + DEFAULT_IMAGES.COLLECTION;
      });
    }
    if (signatureData && signatureData.collections) {
      signatureData.collections.forEach(function(item) {
        item.thumbnail = item.thumbnail
          ? basePath + item.thumbnail
          : appRootPath + DEFAULT_IMAGES.COLLECTION;
      });
    }

    const returnObjects = Ember.Object.create({
      owner: Ember.getOwner(this).ownerInjection(),
      title: learningMapsContent.title,
      code: learningMapsContent.code,
      gutCode: learningMapsContent.gutCode,
      contents: learningMapsContent.contents,
      prerequisites: learningMapsContent.prerequisites,
      subject: learningMapsContent.subject,
      course: learningMapsContent.course,
      domain: learningMapsContent.domain,
      signatureContents: signatureData,
      learningMapsContent: serializer.normalizeSearchLearningMapsContentCompetencyInfo(
        learningMapsContent.contents
      )
    });
    return returnObjects;
  },

  /**
   * @function normalizeSearchLearningMapsContentInfo
   * Serialize each content type from the learning map API
   */
  normalizeSearchLearningMapsContentInfo(contents) {
    let serializer = this;
    let serializedContentData = {};
    let assessmentData = [];
    let collectionData = [];
    let courseData = [];
    let resourceData = [];
    let questionData = [];
    let unitData = [];
    let lessonData = [];
    let rubricData = [];

    if (contents.assessment) {
      contents.assessment.searchResults.map(assessment => {
        let assessmentInfo = serializer.normalizeAssessment(assessment);
        assessmentInfo.id = assessment.id;
        assessmentInfo.description = assessment.learningObjective;
        assessmentInfo.creator = serializer.normalizeOwner(assessment.creator);
        assessmentInfo.owner = serializer.normalizeOwner(assessment.user);
        assessmentInfo.efficacy = assessment.efficacy;
        assessmentInfo.engagement = assessment.engagement;
        assessmentInfo.relevance = assessment.relevance;
        assessmentInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            assessment.taxonomy,
            TAXONOMY_LEVELS.ASSESSMENT
          );
        assessmentData.push(assessmentInfo);
      });
    }

    if (contents.collection) {
      contents.collection.searchResults.map(collection => {
        let collectionInfo = serializer.normalizeCollection(collection);
        collectionInfo.id = collection.id;
        collectionInfo.description = collection.learningObjective;
        collectionInfo.creator = serializer.normalizeOwner(collection.creator);
        collectionInfo.owner = serializer.normalizeOwner(collection.user);
        collectionInfo.efficacy = collection.efficacy;
        collectionInfo.engagement = collection.engagement;
        collectionInfo.relevance = collection.relevance;
        collectionInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            collection.taxonomy,
            TAXONOMY_LEVELS.COLLECTION
          );
        collectionData.push(collectionInfo);
      });
    }

    if (contents.course) {
      contents.course.searchResults.map(course => {
        let courseInfo = serializer.normalizeCourse(course);
        courseInfo.id = course.id;
        courseInfo.description = course.description;
        courseInfo.creator = course.creator
          ? serializer.normalizeOwner(course.creator)
          : {};
        courseInfo.owner = course.owner
          ? serializer.normalizeOwner(course.owner)
          : {};
        courseInfo.efficacy = course.efficacy;
        courseInfo.engagement = course.engagement;
        courseInfo.relevance = course.relevance;
        courseInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            course.taxonomy,
            TAXONOMY_LEVELS.COURSE
          );
        courseData.push(courseInfo);
      });
    }

    if (contents.resource) {
      contents.resource.searchResults.map(resource => {
        let resourceInfo = serializer.normalizeResource(resource);
        resourceInfo.id = resource.id;
        resourceInfo.description = resource.description;
        resourceInfo.creator = resource.creator
          ? serializer.normalizeOwner(resource.creator)
          : {};
        resourceInfo.owner = resource.user
          ? serializer.normalizeOwner(resource.user)
          : {};
        resourceInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            resource.taxonomy,
            TAXONOMY_LEVELS.RESOURCE
          );
        resourceData.push(resourceInfo);
      });
    }

    if (contents.question) {
      contents.question.searchResults.map(question => {
        let questionInfo = serializer.normalizeQuestion(question);
        questionInfo.id = question.id;
        questionInfo.description = question.description;
        questionInfo.creator = serializer.normalizeOwner(question.creator);
        questionInfo.owner = serializer.normalizeOwner(question.user);
        questionInfo.efficacy = question.efficacy;
        questionInfo.engagement = question.engagement;
        questionInfo.relevance = question.relevance;
        questionInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            question.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        questionData.push(questionInfo);
      });
    }

    if (contents.unit) {
      contents.unit.searchResults.map(unit => {
        let unitInfo = serializer.normalizeUnit(unit);
        unitInfo.id = unit.id;
        unitInfo.description = unit.learningObjective;
        unitInfo.creator = unit.creator
          ? serializer.normalizeOwner(unit.creator)
          : {};
        unitInfo.owner = unit.owner
          ? serializer.normalizeOwner(unit.owner)
          : {};
        unitInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            unitInfo.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        unitData.push(unitInfo);
      });
    }

    if (contents.lesson) {
      contents.lesson.searchResults.map(lesson => {
        let lessonInfo = serializer.normalizeLesson(lesson);
        lessonInfo.id = lesson.id;
        lessonInfo.description = lesson.learningObjective;
        lessonInfo.creator = lesson.creator
          ? serializer.normalizeOwner(lesson.creator)
          : {};
        lessonInfo.owner = lesson.owner
          ? serializer.normalizeOwner(lesson.owner)
          : {};
        lessonInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            lessonInfo.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        lessonData.push(lessonInfo);
      });
    }

    serializedContentData.assessment = assessmentData;
    serializedContentData.collection = collectionData;
    serializedContentData.course = courseData;
    serializedContentData.resource = resourceData;
    serializedContentData.question = questionData;
    serializedContentData.unit = unitData;
    serializedContentData.lesson = lessonData;
    serializedContentData.rubric = rubricData;
    return serializedContentData;
  },

  /**
   * @function normalizeSearchLearningMapsContentCompetencyInfo
   * Serialize each content type from the learning map API
   */
  normalizeSearchLearningMapsContentCompetencyInfo(contents) {
    const basePath = this.get('session.cdnUrls.content');
    let serializer = this;
    let serializedContentData = {};
    let assessmentData = [];
    let collectionData = [];
    let courseData = [];
    let resourceData = [];
    let questionData = [];
    let unitData = [];
    let lessonData = [];
    let rubricData = [];
    let solvedExampleData = [];
    let challengingQuestionsData = [];
    let practiceProblemsData = [];
    let signatureCollectionsData = [];
    let signatureAssessmentData = [];

    if (contents.assessments && contents.assessments.searchResults) {
      contents.assessments.searchResults.map(assessment => {
        let assessmentInfo = serializer.normalizeAssessment(assessment);
        assessmentInfo.id = assessment.id;
        assessmentInfo.description = assessment.learningObjective;
        assessmentInfo.creator = serializer.normalizeOwner(assessment.creator);
        assessmentInfo.owner = serializer.normalizeOwner(assessment.user);
        assessmentInfo.efficacy = assessment.efficacy;
        assessmentInfo.engagement = assessment.engagement;
        assessmentInfo.relevance = assessment.relevance;
        assessmentInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            assessment.taxonomy,
            TAXONOMY_LEVELS.ASSESSMENT
          );
        assessmentData.push(assessmentInfo);
      });
    }

    if (contents.collections && contents.collections.searchResults) {
      contents.collections.searchResults.map(collection => {
        let collectionInfo = serializer.normalizeCollection(collection);
        collectionInfo.id = collection.id;
        collectionInfo.description = collection.learningObjective;
        collectionInfo.creator = serializer.normalizeOwner(collection.creator);
        collectionInfo.owner = serializer.normalizeOwner(collection.user);
        collectionInfo.efficacy = collection.efficacy;
        collectionInfo.engagement = collection.engagement;
        collectionInfo.relevance = collection.relevance;
        collectionInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            collection.taxonomy,
            TAXONOMY_LEVELS.COLLECTION
          );
        collectionData.push(collectionInfo);
      });
    }

    if (contents.courses && contents.courses.searchResults) {
      contents.courses.searchResults.map(course => {
        let courseInfo = serializer.normalizeCourse(course);
        courseInfo.id = course.id;
        courseInfo.description = course.description;
        courseInfo.creator = course.creator
          ? serializer.normalizeOwner(course.creator)
          : {};
        courseInfo.owner = course.owner
          ? serializer.normalizeOwner(course.owner)
          : {};
        courseInfo.efficacy = course.efficacy;
        courseInfo.engagement = course.engagement;
        courseInfo.relevance = course.relevance;
        courseInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            course.taxonomy,
            TAXONOMY_LEVELS.COURSE
          );
        courseData.push(courseInfo);
      });
    }

    if (contents.resources && contents.resources.searchResults) {
      contents.resources.searchResults.map(resource => {
        let resourceInfo = serializer.normalizeResource(resource);
        resourceInfo.id = resource.id;
        resourceInfo.description = resource.description;
        resourceInfo.creator = resource.creator
          ? serializer.normalizeOwner(resource.creator)
          : {};
        resourceInfo.owner = resource.user
          ? serializer.normalizeOwner(resource.user)
          : {};
        resourceInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            resource.taxonomy,
            TAXONOMY_LEVELS.RESOURCE
          );
        resourceData.push(resourceInfo);
      });
    }

    if (contents.questions && contents.questions.searchResults) {
      contents.questions.searchResults.map(question => {
        let questionInfo = serializer.normalizeQuestion(question);
        questionInfo.id = question.id;
        questionInfo.description = question.description;
        questionInfo.creator = serializer.normalizeOwner(question.creator);
        questionInfo.owner = serializer.normalizeOwner(question.user);
        questionInfo.efficacy = question.efficacy;
        questionInfo.engagement = question.engagement;
        questionInfo.relevance = question.relevance;
        questionInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            question.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        questionData.push(questionInfo);
      });
    }

    if (contents.units && contents.units.searchResults) {
      contents.units.searchResults.map(unit => {
        let unitInfo = serializer.normalizeUnit(unit);
        unitInfo.id = unit.id;
        unitInfo.description = unit.learningObjective;
        unitInfo.creator = unit.creator
          ? serializer.normalizeOwner(unit.creator)
          : {};
        unitInfo.owner = unit.owner
          ? serializer.normalizeOwner(unit.owner)
          : {};
        unitInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            unitInfo.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        unitData.push(unitInfo);
      });
    }

    if (contents.lessons && contents.lessons.searchResults) {
      contents.lessons.searchResults.map(lesson => {
        let lessonInfo = serializer.normalizeLesson(lesson);
        lessonInfo.id = lesson.id;
        lessonInfo.description = lesson.learningObjective;
        lessonInfo.creator = lesson.creator
          ? serializer.normalizeOwner(lesson.creator)
          : {};
        lessonInfo.owner = lesson.owner
          ? serializer.normalizeOwner(lesson.owner)
          : {};
        lessonInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            lessonInfo.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        lessonData.push(lessonInfo);
      });
    }

    if (contents.solvedExamples && contents.solvedExamples.searchResults) {
      contents.solvedExamples.searchResults.map(solvedExamples => {
        let solvedExamplesInfo = serializer.normalizeAnswaers(solvedExamples);
        solvedExamplesInfo.id = solvedExamples.id;
        solvedExamplesInfo.description = solvedExamples.description;
        solvedExamplesInfo.creator = serializer.normalizeOwner(
          solvedExamples.creator
        );
        solvedExamplesInfo.owner = serializer.normalizeOwner(
          solvedExamples.user
        );
        solvedExamplesInfo.efficacy = solvedExamples.efficacy;
        solvedExamplesInfo.engagement = solvedExamples.engagement;
        solvedExamplesInfo.relevance = solvedExamples.relevance;
        solvedExamplesInfo.type = solvedExamples.format;
        solvedExamplesInfo.thumbnail = solvedExamples.thumbnail;
        solvedExamplesInfo.thumbnailUrl = solvedExamples.thumbnail
          ? basePath + solvedExamples.thumbnail
          : '';
        solvedExamplesInfo.title = solvedExamples.title;
        solvedExamplesInfo.taskCount = solvedExamples.taskCount;
        solvedExamplesInfo.resourceCount = solvedExamples.resourceCount;
        solvedExamplesInfo.questionCount = solvedExamples.questionCount;
        solvedExamplesInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            solvedExamples.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        solvedExampleData.push(solvedExamplesInfo);
      });
    }

    if (
      contents.challengingQuestions &&
      contents.challengingQuestions.searchResults
    ) {
      contents.challengingQuestions.searchResults.map(challengingQuestions => {
        let challengingQuestionsInfo = serializer.normalizeAnswaers(
          challengingQuestions
        );
        challengingQuestionsInfo.id = challengingQuestions.id;
        challengingQuestionsInfo.description = challengingQuestions.description;
        challengingQuestionsInfo.creator = serializer.normalizeOwner(
          challengingQuestions.creator
        );
        challengingQuestionsInfo.owner = serializer.normalizeOwner(
          challengingQuestions.user
        );
        challengingQuestionsInfo.efficacy = challengingQuestions.efficacy;
        challengingQuestionsInfo.engagement = challengingQuestions.engagement;
        challengingQuestionsInfo.relevance = challengingQuestions.relevance;
        challengingQuestionsInfo.type = challengingQuestions.format;
        challengingQuestionsInfo.thumbnail = challengingQuestions.thumbnail;
        challengingQuestionsInfo.thumbnailUrl = challengingQuestions.thumbnail
          ? basePath + challengingQuestions.thumbnail
          : '';
        challengingQuestionsInfo.title = challengingQuestions.title;
        challengingQuestionsInfo.taskCount = challengingQuestions.taskCount;
        challengingQuestionsInfo.resourceCount =
          challengingQuestions.resourceCount;
        challengingQuestionsInfo.questionCount =
          challengingQuestions.questionCount;
        challengingQuestionsInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            challengingQuestions.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        challengingQuestionsData.push(challengingQuestionsInfo);
      });
    }

    if (contents.practiceProblems && contents.practiceProblems.searchResults) {
      contents.practiceProblems.searchResults.map(practiceProblems => {
        let practiceProblemsInfo = serializer.normalizeAnswaers(
          practiceProblems
        );
        practiceProblemsInfo.id = practiceProblems.id;
        practiceProblemsInfo.description = practiceProblems.description;
        practiceProblemsInfo.creator = serializer.normalizeOwner(
          practiceProblems.creator
        );
        practiceProblemsInfo.owner = serializer.normalizeOwner(
          practiceProblems.user
        );
        practiceProblemsInfo.efficacy = practiceProblems.efficacy;
        practiceProblemsInfo.engagement = practiceProblems.engagement;
        practiceProblemsInfo.relevance = practiceProblems.relevance;
        practiceProblemsInfo.type = practiceProblems.format;
        practiceProblemsInfo.thumbnail = practiceProblems.thumbnail;
        practiceProblemsInfo.thumbnailUrl = practiceProblems.thumbnail
          ? basePath + practiceProblems.thumbnail
          : '';
        practiceProblemsInfo.title = practiceProblems.title;
        practiceProblemsInfo.taskCount = practiceProblems.taskCount;
        practiceProblemsInfo.resourceCount = practiceProblems.resourceCount;
        practiceProblemsInfo.questionCount = practiceProblems.questionCount;
        practiceProblemsInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            practiceProblems.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        practiceProblemsData.push(practiceProblemsInfo);
      });
    }

    if (
      contents.signatureCollections &&
      contents.signatureCollections.searchResults
    ) {
      contents.signatureCollections.searchResults.map(signatureCollections => {
        let signatureCollectionsInfo = serializer.normalizeAnswaers(
          signatureCollections
        );
        signatureCollectionsInfo.id = signatureCollections.id;
        signatureCollectionsInfo.description = signatureCollections.description;
        signatureCollectionsInfo.creator = serializer.normalizeOwner(
          signatureCollections.creator
        );
        signatureCollectionsInfo.owner = serializer.normalizeOwner(
          signatureCollections.user
        );
        signatureCollectionsInfo.efficacy = signatureCollections.efficacy;
        signatureCollectionsInfo.engagement = signatureCollections.engagement;
        signatureCollectionsInfo.relevance = signatureCollections.relevance;
        signatureCollectionsInfo.type = signatureCollections.format;
        signatureCollectionsInfo.thumbnail = signatureCollections.thumbnail;
        signatureCollectionsInfo.thumbnailUrl = signatureCollections.thumbnail
          ? basePath + signatureCollections.thumbnail
          : '';
        signatureCollectionsInfo.title = signatureCollections.title;
        signatureCollectionsInfo.taskCount = signatureCollections.taskCount;
        signatureCollectionsInfo.resourceCount =
          signatureCollections.resourceCount;
        signatureCollectionsInfo.questionCount =
          signatureCollections.questionCount;
        signatureCollectionsInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            signatureCollections.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        signatureCollectionsData.push(signatureCollectionsInfo);
      });
    }

    if (
      contents.signatureAssessments &&
      contents.signatureAssessments.searchResults
    ) {
      contents.signatureAssessments.searchResults.map(signatureAssessments => {
        let signatureAssessmentInfo = serializer.normalizeAnswaers(
          signatureAssessments
        );
        signatureAssessmentInfo.id = signatureAssessments.id;
        signatureAssessmentInfo.description = signatureAssessments.description;
        signatureAssessmentInfo.creator = serializer.normalizeOwner(
          signatureAssessments.creator
        );
        signatureAssessmentInfo.owner = serializer.normalizeOwner(
          signatureAssessments.user
        );
        signatureAssessmentInfo.efficacy = signatureAssessments.efficacy;
        signatureAssessmentInfo.engagement = signatureAssessments.engagement;
        signatureAssessmentInfo.relevance = signatureAssessments.relevance;
        signatureAssessmentInfo.type = signatureAssessments.format;
        signatureAssessmentInfo.thumbnail = signatureAssessments.thumbnail;
        signatureAssessmentInfo.thumbnailUrl = signatureAssessments.thumbnail
          ? basePath + signatureAssessments.thumbnail
          : '';
        signatureAssessmentInfo.title = signatureAssessments.title;
        signatureAssessmentInfo.taskCount = signatureAssessments.taskCount;
        signatureAssessmentInfo.resourceCount =
          signatureAssessments.resourceCount;
        signatureAssessmentInfo.questionCount =
          signatureAssessments.questionCount;
        signatureAssessmentInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            signatureAssessments.taxonomy,
            TAXONOMY_LEVELS.QUESTION
          );
        signatureAssessmentData.push(signatureAssessmentInfo);
      });
    }

    serializedContentData.assessment = assessmentData;
    serializedContentData.collection = collectionData;
    serializedContentData.course = courseData;
    serializedContentData.resource = resourceData;
    serializedContentData.question = questionData;
    serializedContentData.unit = unitData;
    serializedContentData.lesson = lessonData;
    serializedContentData.rubric = rubricData;
    serializedContentData.solvedExample = solvedExampleData;
    serializedContentData.challengingQuestion = challengingQuestionsData;
    serializedContentData.practiceProblems = practiceProblemsData;
    serializedContentData.signatureCollection = signatureCollectionsData;
    serializedContentData.signatureAssessment = signatureAssessmentData;
    return serializedContentData;
  },

  normalizeSearchSignatureContents(
    payload,
    isCollection,
    isSuggestion = false
  ) {
    const serializer = this;
    let signatureContent = isCollection
      ? !isEmptyValue(payload.contents.signatureCollections) &&
        !isEmptyValue(payload.contents.signatureCollections.searchResults)
        ? payload.contents.signatureCollections.searchResults
        : !isEmptyValue(payload.contents.collections) &&
          !isEmptyValue(payload.contents.collections.searchResults)
          ? payload.contents.collections.searchResults
          : []
      : !isEmptyValue(payload.contents.signatureAssessments) &&
        !isEmptyValue(payload.contents.signatureAssessments.searchResults)
        ? payload.contents.signatureAssessments.searchResults
        : !isEmptyValue(payload.contents.assessments) &&
        !isEmptyValue(payload.contents.assessments.searchResults)
          ? payload.contents.assessments.searchResults
          : [];
    let collectionData = [];
    if (Ember.isArray(signatureContent)) {
      signatureContent.map(function(collection) {
        let collectionInfo = isCollection
          ? serializer.normalizeCollection(collection)
          : serializer.normalizeAssessment(collection);
        collectionInfo.id = collection.id;
        collectionInfo.description = collection.learningObjective;
        collectionInfo.creator = serializer.normalizeOwner(collection.creator);
        collectionInfo.owner = serializer.normalizeOwner(collection.user);
        collectionInfo.efficacy = collection.efficacy;
        collectionInfo.engagement = collection.engagement;
        collectionInfo.relevance = collection.relevance;
        collectionInfo.standards = serializer
          .get('taxonomySerializer')
          .normalizeLearningMapsTaxonomyArray(
            collection.taxonomy,
            TAXONOMY_LEVELS.COLLECTION
          );
        collectionData.push(collectionInfo);
      });
    }
    //Temporary fix(Remove duplicate value) after some time will be removed.
    if (
      Ember.isArray(collectionData) &&
      isSuggestion &&
      collectionData &&
      collectionData.length
    ) {
      const props = ['title', 'description'];
      const collectionUniqueData = [
        ...new Map(
          collectionData.map(data => [props.map(k => data[k]).join('|'), data])
        ).values()
      ];
      return collectionUniqueData;
    } else {
      return collectionData;
    }
  }
});
