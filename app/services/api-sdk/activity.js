import Ember from 'ember';
import ActivitySerializer from 'gooru-web/serializers/activity';
import ActivityAdapter from 'gooru-web/adapters/activity';

/**
 * @typedef {Object} ActivityService
 */
export default Ember.Service.extend({
  /**
   * @property {ActivitySerializer} activitySerializer
   */
  activitySerializer: null,

  /**
   * @property {ActivityAdapter} activityAdapter
   */
  activityAdapter: null,

  /**
   * @property {CollectionService}
   */
  quizzesCollectionService: Ember.inject.service('quizzes/collection'),

  init: function() {
    this._super(...arguments);
    this.set(
      'activitySerializer',
      ActivitySerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'activityAdapter',
      ActivityAdapter.create(Ember.getOwner(this).ownerInjection())
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
        .get('activitySerializer')
        .serializeCreateActivity(activityData);
      service
        .get('activityAdapter')
        .createActivity({
          body: serializedActivityData
        })
        .then(
          function(responseData, textStatus, request) {
            let activityId = request.getResponseHeader('location');
            activityData.set('id', activityId);
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
  readActivity: function(activityId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('activityAdapter')
        .readActivity(activityId)
        .then(function(responseData) {
          resolve(
            service
              .get('activitySerializer')
              .normalizeReadActivity(responseData)
          );
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
        .get('activityAdapter')
        .getSubTypes()
        .then(function(responseData) {
          resolve(
            service.get('activitySerializer').normalizeSubTypes(responseData)
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
        .get('activitySerializer')
        .serializeCreateActivity(activityData);
      service
        .get('activityAdapter')
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
   * Creates a reference in a specific offline activity
   * @param activityId
   * @param referenceData
   * @returns {Promise}
   *
   */
  createReferences: function(referenceData) {
    var service = this;
    let serializedReferenceData = service
      .get('activitySerializer')
      .serializeReferenceData(referenceData);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('activityAdapter')
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
        .get('activityAdapter')
        .deleteActivity(activity.id)
        .then(function() {
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
   * Delete activity
   *
   * @param activityId The activity id to delete
   * @returns {Ember.RSVP.Promise}
   */
  deleteReference: function(reference) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('activityAdapter')
        .deleteReference(reference.oaId, reference.id)
        .then(function() {
          resolve();
        }, reject);
    });
  }
});
