import Ember from 'ember';
import OfflineActivitySerializer from 'gooru-web/serializers/offline-activity/offline-activity';
import OfflineActivityAdapter from 'gooru-web/adapters/offline-activity/offline-activity';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import { getTaxonomyIds } from 'gooru-web/utils/utils';

/**
 * @typedef {Object} ActivityService
 */
export default Ember.Service.extend({
  /**
   * @property {OfflineActivitySerializer} OfflineActivitySerializer
   */
  offlineActivitySerializer: null,

  /**
   * @property {offlineActivityAdapter} offlineActivityAdapter
   */
  offlineActivityAdapter: null,

  /**
   * @property {CollectionService}
   */
  quizzesCollectionService: Ember.inject.service('quizzes/collection'),

  init: function() {
    this._super(...arguments);
    this.set(
      'offlineActivitySerializer',
      OfflineActivitySerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'offlineActivityAdapter',
      OfflineActivityAdapter.create(Ember.getOwner(this).ownerInjection())
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
   * Creates a new activity
   *
   * @param activityId object with the Activity data
   * @returns {Promise}
   */
  createActivity: function(activityData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedActivityData = service
        .get('offlineActivitySerializer')
        .serializeCreateActivity(activityData);
      service
        .get('offlineActivityAdapter')
        .createActivity({
          body: serializedActivityData
        })
        .then(
          function(responseData, textStatus, request) {
            let activityId = request.getResponseHeader('location');
            activityData.set('id', activityId);
            activityData.set('maxScore', 1);
            resolve(activityData);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets an Activity by id
   * @param {string} activityId
   * @returns {Promise}
   */
  readActivity: function(activityId, isDefaultShowFW, classFramework) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .readActivity(activityId)
        .then(function(responseData) {
          let offlineActivity = service
            .get('offlineActivitySerializer')
            .normalizeReadActivity(responseData);
          let taxonomyIds = getTaxonomyIds(offlineActivity, false);
          if (isDefaultShowFW && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(
                offlineActivity,
                classFramework,
                taxonomyIds
              )
              .then(function() {
                resolve(offlineActivity);
              });
          } else {
            resolve(offlineActivity);
          }
        }, reject);
    });
  },

  /**
   * Get a list of OA subtype
   * @returns {Promise}
   */
  getSubTypes: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .getSubTypes()
        .then(function(responseData) {
          resolve(
            service
              .get('offlineActivitySerializer')
              .normalizeSubTypes(responseData)
          );
        }, reject);
    });
  },

  /**
   * Creates a new activity
   *
   * @param activityId object with the Activity data
   * @returns {Promise}
   */
  updateActivity: function(activityId, activityData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedActivityData = service
        .get('offlineActivitySerializer')
        .serializeUpdateActivity(activityData);
      service
        .get('offlineActivityAdapter')
        .updateActivity(activityId, serializedActivityData)
        .then(
          function() {
            resolve(activityData);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Updates the Offline Activity title
   *
   * @param oaId the id of the Offline Activity to be updated
   * @param title the Offline Activity title
   * @returns {Promise}
   */
  updateActivityTitle: function(oaId, title) {
    const service = this;
    let serializedData = service
      .get('offlineActivitySerializer')
      .serializeUpdateActivityTitle(title);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .updateActivity(oaId, serializedData)
        .then(function() {
          resolve();
        }, reject);
    });
  },

  /**
   * Creates a reference in a specific offline activity
   * @param activityId
   * @param referenceData
   * @returns {Promise}
   *
   */

  createReferences: function(referenceData, fileId) {
    var service = this;
    let serializedReferenceData = service
      .get('offlineActivitySerializer')
      .serializeReferenceData(referenceData, fileId);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .createReferences(referenceData.oaId, serializedReferenceData)
        .then(
          function(responseData, textStatus, request) {
            let refId = request.getResponseHeader('location');
            referenceData.set('id', refId);
            resolve(referenceData);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Delete activity
   *
   * @param activityId The activity id to delete
   * @returns {Ember.RSVP.Promise}
   */
  deleteActivity: function(activity) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .deleteActivity(activity.id)
        .then(function() {
          resolve();
        }, reject);
    });
  },

  /**
   * Copies an activity by id
   * @param {string} activityId
   * @returns {Ember.RSVP.Promise}
   */
  copyActivity: function(activityId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .copyActivity(activityId)
        .then(function(responseData, textStatus, request) {
          resolve(request.getResponseHeader('location'));
        }, reject);
    });
  },

  /**
   * Reorder activity resources
   *
   * @param activityId the id of the Activity to be updated
   * @param {string[]} questionIds
   * @returns {Promise}
   */
  reorderActivity: function(activityId, questionIds) {
    const service = this;
    let serializedData = service
      .get('offlineActivitySerializer')
      .serializeReorderActivity(questionIds);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .reorderActivity(activityId, serializedData)
        .then(function() {
          service.notifyQuizzesActivityChange(activityId);
          resolve();
        }, reject);
    });
  },

  /**
   * Notify an activity change at quizzes
   * @param {string} activityId
   */
  notifyQuizzesActivityChange: function(activityId) {
    const quizzesCollectionService = this.get('quizzesCollectionService');
    Ember.Logger.info('Notifying activity change');
    return quizzesCollectionService.notifyCollectionChange(
      activityId,
      'activity'
    );
  },

  /**
   * Find  the mastery accrual for the given list of activityIds
   *
   * @param {string} activityIds
   * @returns {Promise}
   */
  activitysMasteryAccrual: function(activityIds) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .activitysMasteryAccrual(activityIds)
        .then(function(responseData) {
          resolve(
            service
              .get('offlineActivitySerializer')
              .normalizeActivitysMasteryAccrual(responseData)
          );
        }, reject);
    });
  },

  oaTaskSubmissions(taskSubmissionPayload) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .oaTaskSubmissions(taskSubmissionPayload)
        .then(function() {
          resolve(true);
        }, reject);
    });
  },
  /**
   * Delete reference
   *
   * @param activityId The activity id to delete
   * @returns {Ember.RSVP.Promise}
   */
  deleteReference: function(reference) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .deleteReference(reference.oaId, reference.id)
        .then(function() {
          resolve(reference);
        }, reject);
    });
  },

  //--------------Tasks------------------
  createTask(taskPayLoad) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedTaskPayLoad = service
        .get('offlineActivitySerializer')
        .serializeCreateTask(taskPayLoad);
      service
        .get('offlineActivityAdapter')
        .createTask({
          body: serializedTaskPayLoad
        })
        .then(
          function(responseData, textStatus, request) {
            let id = request.getResponseHeader('location');
            taskPayLoad.set('id', id);
            resolve(taskPayLoad);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },
  /**
   * Remove Task
   *
   * @param {taskPayLoad} task to remove
   * @returns {Ember.RSVP.Promise}
   */
  removeTask: function(taskPayLoad) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .removeTask(taskPayLoad.oaId, taskPayLoad.id)
        .then(function() {
          resolve(taskPayLoad);
        }, reject);
    });
  },

  /**
   * Update task details
   * @param oaId the id of the Activity to be updated
   * @param taskId the id of the task to be updated
   * @param data task data to be sent in the request body
   * @returns {Promise}
   */
  updateTask: function(oaId, taskId, taskPayLoad) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedTaskPayLoad = service
        .get('offlineActivitySerializer')
        .serializeUpdateTask(taskPayLoad);
      service
        .get('offlineActivityAdapter')
        .updateTask(oaId, taskId, serializedTaskPayLoad)
        .then(
          function() {
            resolve(taskPayLoad);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  //--------------submissions------------------

  createTaskSubmission(taskTaskSubmission) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedTaskSubmission = service
        .get('offlineActivitySerializer')
        .serializecreateTaskSubmission(taskTaskSubmission);
      service
        .get('offlineActivityAdapter')
        .createTaskSubmission({
          body: serializedTaskSubmission
        })
        .then(
          function(responseData, textStatus, request) {
            let id = request.getResponseHeader('location');
            taskTaskSubmission.set('id', id);
            resolve(taskTaskSubmission);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Remove TaskSubmission
   *
   * @param {taskPayLoad} TaskSubmission to remove
   * @returns {Ember.RSVP.Promise}
   */
  removeTaskSubmission: function(taskSubmissionPayLoad) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .removeTaskSubmission(
          taskSubmissionPayLoad.oaId,
          taskSubmissionPayLoad.oaTaskId,
          taskSubmissionPayLoad.id
        )
        .then(function() {
          resolve(taskSubmissionPayLoad);
        }, reject);
    });
  },

  associateTeacherRubricToOA(rubricId, oaId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .associateTeacherRubricToOA(rubricId, oaId)
        .then(
          function(responseData, textStatus, request) {
            resolve(request.getResponseHeader('location'));
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  associateStudentRubricToOA(rubricId, oaId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .associateStudentRubricToOA(rubricId, oaId)
        .then(
          function(responseData, textStatus, request) {
            resolve(request.getResponseHeader('location'));
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function updateOACompleted
   * @param {Object} oaData
   * Method to update the student's OA status as completed
   */
  updateOACompleted(oaData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .updateOACompleted(oaData)
        .then(
          function() {
            resolve(true);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Update reference
   *
   * @param reference The reference to update
   * @returns {Ember.RSVP.Promise}
   */
  updateReferences: function(reference) {
    const service = this;
    let serializedData = service
      .get('offlineActivitySerializer')
      .serializeReference(reference);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .updateReference(reference.oaId, reference.id, serializedData)
        .then(function() {
          resolve(reference);
        }, reject);
    });
  },
  getBulkSubmission(dataParam) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .getBulkSubmission(dataParam)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },
  getCABulkSubmission(dataParam) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('offlineActivityAdapter')
        .getCABulkSubmission(dataParam)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  getcrosswalkCompetency: function(
    offlineActivity,
    classFramework,
    taxonomyIds
  ) {
    const service = this;
    return service
      .get('taxonomyAdapter')
      .crosswalkCompetency(classFramework, taxonomyIds)
      .then(function(crosswalkResponse) {
        let frameworkCrossWalkComp = service
          .get('taxonomySerializer')
          .normalizeCrosswalkCompetency(crosswalkResponse);
        let standards = offlineActivity.standards;
        standards.map(data => {
          let taxonomyData = frameworkCrossWalkComp.findBy(
            'sourceDisplayCode',
            data.code
          );
          if (taxonomyData) {
            data.code = taxonomyData.targetDisplayCode;
            data.frameworkCode = taxonomyData.targetFrameworkId;
          }
        });
      });
  }
});
