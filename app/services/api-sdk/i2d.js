import Ember from 'ember';
import I2dSerializer from 'gooru-web/serializers/i2d';
import I2dAdapter from 'gooru-web/adapters/i2d';

/**
 * @typedef {Object} I2D Service
 */
export default Ember.Service.extend({
  /**
   * @property {I2dAdapter} i2dAdapter
   */
  i2dAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'i2dSerializer',
      I2dSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'i2dAdapter',
      I2dAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Upload the images and context
   *
   * @param context
   * @returns {Promise}
   */
  uploadImage: function(context) {
    const service = this;
    return service.get('i2dAdapter').uploadImage(context);
  },

  searchImage: function(context) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('i2dAdapter')
        .searchImage(context)
        .then(
          result =>
            resolve(service.get('i2dSerializer').normalizeSearchResult(result)),
          reject
        );
    });
  },

  fetchImageData: function(uploadId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('i2dAdapter')
        .fetchImageData(uploadId)
        .then(
          result =>
            resolve(service.get('i2dSerializer').normalizeImageData(result)),
          reject
        );
    });
  },

  replaceImage: function(uploadId, data) {
    const service = this;
    return service.get('i2dAdapter').replaceImage(uploadId, data);
  },

  markImageReviewed: function(uploadId) {
    const service = this;
    return service.get('i2dAdapter').markImageReviewed(uploadId);
  }
});
