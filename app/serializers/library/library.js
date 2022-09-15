import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import LibraryModel from 'gooru-web/models/library/library';
import LibraryContentModel from 'gooru-web/models/library/library-content';
import CourseSerializer from 'gooru-web/serializers/content/course';
import AssessmentSerializer from 'gooru-web/serializers/content/assessment';
import CollectionSerializer from 'gooru-web/serializers/content/collection';
import ResourceSerializer from 'gooru-web/serializers/content/resource';
import QuestionSerializer from 'gooru-web/serializers/content/question';
import RubricSerializer from 'gooru-web/serializers/rubric/rubric';
import ProfileSerializer from 'gooru-web/serializers/profile/profile';
import OfflineActivitySerializer from 'gooru-web/serializers/offline-activity/offline-activity';
import { DEFAULT_IMAGES, CONTENT_TYPES } from 'gooru-web/config/config';

/**
 * Serializer to support the Library CRUD operations for API 3.0
 *
 * @typedef {Object} LibrarySerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  init: function() {
    this._super(...arguments);
    this.set(
      'courseSerializer',
      CourseSerializer.create(Ember.getOwner(this).ownerInjection())
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
      'resourceSerializer',
      ResourceSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'questionSerializer',
      QuestionSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'rubricSerializer',
      RubricSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'profileSerializer',
      ProfileSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'offlineActivitySerializer',
      OfflineActivitySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Normalize the Fetch Libraries endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Library[]} an array of libraries
   */
  normalizeFetchLibraries: function(payload) {
    var result = [];
    const serializer = this;
    const libraries = payload.libraries;
    if (Ember.isArray(libraries)) {
      result = libraries.map(library => serializer.normalizeLibrary(library));
    }
    return result;
  },

  normalizeLibrary: function(libraryPayload) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.user');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const thumbnailUrl = libraryPayload.thumbnail
      ? basePath + libraryPayload.thumbnail
      : appRootPath + DEFAULT_IMAGES.USER_PROFILE;
    return LibraryModel.create(Ember.getOwner(serializer).ownerInjection(), {
      id: libraryPayload.id,
      name: libraryPayload.name,
      image: thumbnailUrl,
      description: libraryPayload.description,
      tenantId: libraryPayload.tenant,
      tenantRoot: libraryPayload.tenant_root,
      courseCount: libraryPayload.course_count,
      assessmentCount: libraryPayload.assessment_count,
      collectionCount: libraryPayload.collection_count,
      resourceCount: libraryPayload.resource_count,
      questionCount: libraryPayload.question_count,
      rubricCount: libraryPayload.rubric_count,
      offlineActivityCount: libraryPayload.offline_activity_count,
      sequence: libraryPayload.sequence_id,
      shortName: libraryPayload.short_name
    });
  },

  /**
   * Normalize a library content
   * @param {string} contentType  course, collection, assessment, resource, question, rubric
   * @param {*} payload
   * @return {LibraryContent}
   */
  normalizeFetchLibraryContent: function(contentType, payload) {
    var serializer = this;
    let libraryContent = null;
    let owner = null;
    let ownerDetailsArray = payload.library_contents.owner_details;

    if (ownerDetailsArray) {
      owner = ownerDetailsArray.map(function(profileData) {
        return serializer
          .get('profileSerializer')
          .normalizeReadProfile(profileData);
      });
    }

    const contentData = {
      [CONTENT_TYPES.ASSESSMENT]: {
        normalizer: contentData =>
          serializer
            .get('assessmentSerializer')
            .normalizeReadAssessment(contentData),
        type: 'assessments'
      },
      [CONTENT_TYPES.COLLECTION]: {
        normalizer: contentData =>
          serializer
            .get('collectionSerializer')
            .normalizeReadCollection(contentData),
        type: 'collections'
      },
      [CONTENT_TYPES.RESOURCE]: {
        normalizer: contentData =>
          serializer
            .get('resourceSerializer')
            .normalizeReadResource(contentData),
        type: 'resources'
      },
      [CONTENT_TYPES.QUESTION]: {
        normalizer: contentData =>
          serializer
            .get('questionSerializer')
            .normalizeReadQuestion(contentData),
        type: 'questions'
      },
      [CONTENT_TYPES.RUBRIC]: {
        normalizer: contentData =>
          serializer.get('rubricSerializer').normalizeRubric(contentData),
        type: 'rubrics'
      },
      [CONTENT_TYPES.COURSE]: {
        normalizer: contentData =>
          serializer.get('courseSerializer').normalizeCourse(contentData),
        type: 'courses'
      },
      [CONTENT_TYPES.OFFLINE_ACTIVITY]: {
        normalizer: contentData =>
          serializer
            .get('offlineActivitySerializer')
            .normalizeActivityForLibrary(contentData),
        type: 'offline_activities'
      }
    };

    let contentDataObject = contentData[contentType];
    let contentArray = payload.library_contents[contentDataObject.type];
    if (contentArray) {
      let content = contentArray.map(function(contentData) {
        return contentDataObject.normalizer(contentData);
      });
      libraryContent = Ember.Object.create({
        [contentDataObject.type]: content,
        ownerDetails: owner
      });
    }
    return LibraryContentModel.create({
      library: serializer.normalizeLibrary(payload.library),
      libraryContent
    });
  }
});
