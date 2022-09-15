import Ember from 'ember';
import ExternalAssessmentSerializer from 'gooru-web/serializers/content/external-assessment';
import ExternalAssessmentAdapter from 'gooru-web/adapters/content/external-assessment';

/**
 * @typedef {Object} AssessmentService
 */
export default Ember.Service.extend({
  /**
   * @property {Profile} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),
  /**
   * @property {externalAssessmentSerializer} externalAssessmentSerializer
   */
  externalAssessmentSerializer: null,

  /**
   * @property {externalAssessmentAdapter} externalAssessmentAdapter
   */
  externalAssessmentAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'externalAssessmentSerializer',
      ExternalAssessmentSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'externalAssessmentAdapter',
      ExternalAssessmentAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Gets an External Assessment by id
   * @param {string} assessmentId
   * @returns {Promise}
   */
  readExternalAssessment: function(assessmentId, isSetOwner = true) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('externalAssessmentAdapter')
        .readExternalAssessment(assessmentId)
        .then(function(responseData) {
          let assessment = service
            .get('externalAssessmentSerializer')
            .normalizeReadExternalAssessment(responseData);
          if (isSetOwner) {
            let profileService = service.get('profileService');
            profileService
              .readUserProfile(assessment.get('ownerId'))
              .then(function(profile) {
                assessment.set('owner', profile);
                resolve(assessment);
              });
          } else {
            resolve(assessment);
          }
        }, reject);
    });
  },

  /**
   * Updates an Assessment
   *
   * @param assessmentId the id of the Assessment to be updated
   * @param assessmentModel the Assessment model with the data
   * @returns {Promise}
   */
  updateExternalAssessment: function(assessmentId, assessmentModel) {
    const service = this;
    let serializedData = service
      .get('externalAssessmentSerializer')
      .serializeUpdateExternalAssessment(assessmentModel);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('externalAssessmentAdapter')
        .updateExternalAssessment(assessmentId, serializedData)
        .then(function() {
          resolve();
        }, reject);
    });
  },

  /**
   * Delete assessment
   *
   * @param assessmentId The assessment id to delete
   * @returns {Ember.RSVP.Promise}
   */
  deleteExternalAssessment: function(assessment) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('externalAssessmentAdapter')
        .deleteExternalAssessment(assessment.id)
        .then(resolve, reject);
    });
  },

  /**
   * Creates a new collection
   *
   * @param assessmentData object with the collection data
   * @returns {Promise}
   */
  createExternalAssessment: function(assessmentData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedExternalAssessmentData = service
        .get('externalAssessmentSerializer')
        .serializeExternalAssessment(assessmentData);
      service
        .get('externalAssessmentAdapter')
        .createExternalAssessment(serializedExternalAssessmentData)
        .then(
          function(responseData, textStatus, request) {
            let createdAssessmentData = Ember.Object.create(assessmentData);
            let collectionId = request.getResponseHeader('location');
            createdAssessmentData.set('id', collectionId);
            resolve(createdAssessmentData);
          },
          function(error) {
            reject(error);
          }
        );
    });
  }
});
