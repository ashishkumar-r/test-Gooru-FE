import Ember from 'ember';
import { ENTITY_TYPE } from 'gooru-web/config/config';
import MediaAdapter from 'gooru-web/adapters/media';

/**
 * @typedef {Object} MediaService
 */
export default Ember.Service.extend({
  session: Ember.inject.service('session'),

  mediaAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'mediaAdapter',
      MediaAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Uploads a file to the content cdn
   *
   * @param fileData object with the data
   * @returns {Promise}
   */
  uploadContentFile: function(fileData, isAudio = false) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('mediaAdapter')
        .uploadFile(fileData, ENTITY_TYPE.CONTENT, isAudio)
        .then(
          function(response) {
            resolve(service.get('session.cdnUrls.content') + response.filename);
          },
          function() {
            resolve(null);
          }
        );
    });
  },

  /**
   * Uploads a file to the user cdn
   *
   * @param fileData object with the data
   * @returns {Promise}
   */
  uploadUserFile: function(fileData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('mediaAdapter')
        .uploadFile(fileData, ENTITY_TYPE.USER)
        .then(
          function(response) {
            resolve(service.get('session.cdnUrls.user') + response.filename);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  uploadScormFile: function(fileData) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('mediaAdapter')
        .uploadScormFile(fileData)
        .then(
          function(response) {
            resolve(response);
          },
          function() {
            resolve(null);
          }
        );
    });
  }
});
