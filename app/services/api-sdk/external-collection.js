import Ember from 'ember';
import ExternalCollectionSerializer from 'gooru-web/serializers/content/external-collection';
import ExternalCollectionAdapter from 'gooru-web/adapters/content/external-collection';

/**
 * @typedef {Object} ExternalCollectionService
 */
export default Ember.Service.extend({
  /**
   * @property {Profile} Profile service
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {ExternalCollectionSerializer} ExternalCollectionSerializer
   */
  externalCollectionSerializer: null,

  /**
   * @property {ExternalCollectionAdapter} ExternalCollectionAdapter
   */
  externalCollectionAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'externalCollectionSerializer',
      ExternalCollectionSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'externalCollectionAdapter',
      ExternalCollectionAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Creates a new collection
   *
   * @param collectionData object with the collection data
   * @returns {Promise}
   */
  createExternalCollection: function(collectionData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedExternalCollectionData = service
        .get('externalCollectionSerializer')
        .serializeCreateExternalCollection(collectionData);
      service
        .get('externalCollectionAdapter')
        .createExternalCollection(serializedExternalCollectionData)
        .then(
          function(responseData, textStatus, request) {
            let createdCollectionData = Ember.Object.create(collectionData);
            let collectionId = request.getResponseHeader('location');
            createdCollectionData.set('id', collectionId);
            resolve(createdCollectionData);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Updates a Collection
   *
   * @param collectionId the id of the Collection to be updated
   * @param collectionModel the Collection model with the data
   * @returns {Promise}
   */
  updateExternalCollection: function(collectionId, collectionModel) {
    const service = this;
    let serializedData = service
      .get('externalCollectionSerializer')
      .serializeUpdateCollection(collectionModel);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('externalCollectionAdapter')
        .updateExternalCollection(collectionId, serializedData)
        .then(function() {
          resolve();
        }, reject);
    });
  },

  /**
   * Gets an External Collection by id
   * @param {string} collectionId
   * @returns {Promise}
   */
  readExternalCollection: function(collectionId, isSetOwner = true) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('externalCollectionAdapter')
        .readExternalCollection(collectionId)
        .then(function(responseData) {
          let collection = service
            .get('externalCollectionSerializer')
            .normalizeReadCollection(responseData);
          if (isSetOwner) {
            let profileService = service.get('profileService');
            profileService
              .readUserProfile(collection.get('ownerId'))
              .then(function(profile) {
                collection.set('owner', profile);
                resolve(collection);
              });
          } else {
            resolve(collection);
          }
        }, reject);
    });
  },

  /**
   * Delete collection
   *
   * @param collectionId The collection id to delete
   * @returns {Promise}
   */
  deleteExternalCollection: function(collectionId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('externalCollectionAdapter')
        .deleteExternalCollection(collectionId)
        .then(function() {
          resolve();
        }, reject);
    });
  }
});
