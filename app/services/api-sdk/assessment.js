import Ember from 'ember';
import AssessmentSerializer from 'gooru-web/serializers/content/assessment';
import AssessmentAdapter from 'gooru-web/adapters/content/assessment';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import { getTaxonomyIds } from 'gooru-web/utils/utils';

/**
 * @typedef {Object} AssessmentService
 */
export default Ember.Service.extend({
  /**
   * @property {Profile} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),
  /**
   * @property {AssessmentSerializer} assessmentSerializer
   */
  assessmentSerializer: null,

  /**
   * @property {AssessmentAdapter} assessmentAdapter
   */
  assessmentAdapter: null,

  /**
   * @property {CollectionService}
   */
  quizzesCollectionService: Ember.inject.service('quizzes/collection'),

  init: function() {
    this._super(...arguments);
    this.set(
      'assessmentSerializer',
      AssessmentSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'assessmentAdapter',
      AssessmentAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomyAdapter',
      TaxonomyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Creates a new assessment
   *
   * @param assessmentData object with the assessment data
   * @returns {Promise}
   */
  createAssessment: function(assessmentData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedClassData = service
        .get('assessmentSerializer')
        .serializeCreateAssessment(assessmentData);
      service
        .get('assessmentAdapter')
        .createAssessment({
          body: serializedClassData
        })
        .then(
          function(responseData, textStatus, request) {
            let assessmentId = request.getResponseHeader('location');
            assessmentData.set('id', assessmentId);
            resolve(assessmentData);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets an Assessment by id
   * @param {string} assessmentId
   * @returns {Promise}
   */
  readAssessment: function(
    assessmentId,
    classFramework,
    isDefaultShowFW,
    isSetOwner = true
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('assessmentAdapter')
        .readAssessment(assessmentId)
        .then(function(responseData) {
          let assessment = service
            .get('assessmentSerializer')
            .normalizeReadAssessment(responseData);
          let taxonomyIds = getTaxonomyIds(assessment, true);
          let profileService = service.get('profileService');
          Ember.RSVP.hash({
            getcrosswalkCompetency:
              isDefaultShowFW && taxonomyIds.length
                ? service.getcrosswalkCompetency(
                  assessment,
                  classFramework,
                  taxonomyIds
                )
                : [],
            profile: isSetOwner
              ? profileService.readUserProfile(assessment.get('ownerId'))
              : {}
          }).then(function(hash) {
            if (isSetOwner) {
              assessment.set('owner', hash.profile);
            }
            resolve(assessment);
          });
        });
    });
  },
  /**
   * Gets an Assessment by id
   * @param {string} assessmentId
   * @returns {Promise}
   */
  readAssessmentDCA: function(assessmentId, assessmentType) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('assessmentAdapter')
        .readAssessmentDCA(assessmentId, assessmentType)
        .then(function(responseData) {
          resolve(
            service
              .get('assessmentSerializer')
              .normalizeReadAssessment(responseData)
          );
        }, reject);
    });
  },

  /**
   * Gets an External Assessment by id
   * @param {string} assessmentId
   * @returns {Promise}
   */
  readExternalAssessment: function(
    assessmentId,
    classFramework,
    isDefaultShowFW,
    isSetOwner = true
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('assessmentAdapter')
        .readExternalAssessment(assessmentId)
        .then(function(responseData) {
          let assessment = service
            .get('assessmentSerializer')
            .normalizeReadAssessment(responseData);
          let taxonomyIds = getTaxonomyIds(assessment, true);
          let profileService = service.get('profileService');
          Ember.RSVP.hash({
            getcrosswalkCompetency:
              isDefaultShowFW && taxonomyIds.length
                ? service.getcrosswalkCompetency(
                  assessment,
                  classFramework,
                  taxonomyIds
                )
                : [],
            profile: isSetOwner
              ? profileService.readUserProfile(assessment.get('ownerId'))
              : {}
          }).then(function(hash) {
            if (isSetOwner) {
              assessment.set('owner', hash.profile);
            }
            resolve(assessment);
          });
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
  updateAssessment: function(assessmentId, assessmentModel) {
    const service = this;
    let serializedData = service
      .get('assessmentSerializer')
      .serializeUpdateAssessment(assessmentModel);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('assessmentAdapter')
        .updateAssessment(assessmentId, serializedData)
        .then(function() {
          service.notifyQuizzesAssessmentChange(assessmentId);
          resolve();
        }, reject);
    });
  },

  /**
   * Updates an Assessment
   *
   * @param assessmentId the id of the Assessment to be updated
   * @param title the Assessment title
   * @returns {Promise}
   */
  updateAssessmentTitle: function(assessmentId, title, type) {
    const service = this;
    let serializedData = service
      .get('assessmentSerializer')
      .serializeUpdateAssessmentTitle(title);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('assessmentAdapter')
        .updateAssessment(assessmentId, serializedData, type)
        .then(function() {
          if (type !== 'assessments-external') {
            service.notifyQuizzesAssessmentChange(assessmentId);
          }
          resolve();
        }, reject);
    });
  },

  /**
   * Adds a question to a specific assessment
   * @param assessmentId
   * @param questionId
   * @returns {Promise}
   */
  addQuestion: function(assessmentId, questionId) {
    var service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('assessmentAdapter')
        .addQuestion(assessmentId, questionId)
        .then(function() {
          service.notifyQuizzesAssessmentChange(assessmentId);
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
  deleteAssessment: function(assessment) {
    const service = this;

    if (assessment.get('isExternalAssessment')) {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        service
          .get('assessmentAdapter')
          .deleteExternalAssessment(assessment.id)
          .then(resolve, reject);
      });
    } else {
      return new Ember.RSVP.Promise(function(resolve, reject) {
        service
          .get('assessmentAdapter')
          .deleteAssessment(assessment.id)
          .then(function() {
            service.notifyQuizzesAssessmentChange(assessment.id);
            resolve();
          }, reject);
      });
    }
  },

  /**
   * Copies an assessment by id
   * @param {string} assessmentId
   * @returns {Ember.RSVP.Promise}
   */
  copyAssessment: function(assessmentId, type) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('assessmentAdapter')
        .copyAssessment(assessmentId, type)
        .then(function(responseData, textStatus, request) {
          resolve(request.getResponseHeader('location'));
        }, reject);
    });
  },

  /**
   * Reorder assessment resources
   *
   * @param assessmentId the id of the Assessment to be updated
   * @param {string[]} questionIds
   * @returns {Promise}
   */
  reorderAssessment: function(assessmentId, questionIds) {
    const service = this;
    let serializedData = service
      .get('assessmentSerializer')
      .serializeReorderAssessment(questionIds);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('assessmentAdapter')
        .reorderAssessment(assessmentId, serializedData)
        .then(function() {
          service.notifyQuizzesAssessmentChange(assessmentId);
          resolve();
        }, reject);
    });
  },

  /**
   * Notify an assessment change at quizzes
   * @param {string} assessmentId
   */
  notifyQuizzesAssessmentChange: function(assessmentId) {
    const quizzesCollectionService = this.get('quizzesCollectionService');
    Ember.Logger.info('Notifying assessment change');
    return quizzesCollectionService.notifyCollectionChange(
      assessmentId,
      'assessment'
    );
  },

  /**
   * Find  the mastery accrual for the given list of assessmentIds
   *
   * @param {string} assessmentIds
   * @returns {Promise}
   */
  assessmentsMasteryAccrual: function(assessmentIds) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('assessmentAdapter')
        .assessmentsMasteryAccrual(assessmentIds)
        .then(function(responseData) {
          resolve(
            service
              .get('assessmentSerializer')
              .normalizeAssessmentsMasteryAccrual(responseData)
          );
        }, reject);
    });
  },
  diagnosticAssessment: function(content, assessmentId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('assessmentAdapter')
        .diagnosticAssessment(content, assessmentId)
        .then(
          function(response, data, jqXHR) {
            let diagnosticAssessmentId = jqXHR.getResponseHeader('location');
            resolve(
              Ember.Object.create({
                content_subtype: diagnosticAssessmentId
              })
            );
          },
          function(error) {
            if (error.status === 500) {
              resolve(error);
            } else {
              reject(error);
            }
          }
        );
    });
  },

  getcrosswalkCompetency: function(collection, classFramework, taxonomyIds) {
    const service = this;
    return service
      .get('taxonomyAdapter')
      .crosswalkCompetency(classFramework, taxonomyIds)
      .then(function(crosswalkResponse) {
        let frameworkCrossWalkComp = service
          .get('taxonomySerializer')
          .normalizeCrosswalkCompetency(crosswalkResponse);
        let collectionStandrs = collection.standards;
        collectionStandrs.map(standard => {
          let taxonomyData = frameworkCrossWalkComp.findBy(
            'sourceDisplayCode',
            standard.code
          );
          if (taxonomyData) {
            standard.code = taxonomyData.targetDisplayCode;
            standard.frameworkCode = taxonomyData.targetFrameworkId;
          }
        });
        collection.children.map(resource => {
          resource.standards.map(standard => {
            let taxonomyData = frameworkCrossWalkComp.findBy(
              'sourceDisplayCode',
              standard.code
            );
            if (taxonomyData) {
              if (
                resource.taxonomy &&
                resource.taxonomy.code === standard.code
              ) {
                resource.taxonomy.code = taxonomyData.targetDisplayCode;
                resource.taxonomy.frameworkCode =
                  taxonomyData.targetFrameworkId;
              }
              standard.code = taxonomyData.targetDisplayCode;
              standard.frameworkCode = taxonomyData.targetFrameworkId;
              standard.loCode = taxonomyData.targetLoCode;
              standard.loName = taxonomyData.targetLoName;
            }
          });
        });
      });
  }
});
