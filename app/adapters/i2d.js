import Ember from 'ember';

export default Ember.Object.extend({
  session: Ember.inject.service('session'),
  /**
   * @property {string} End-point URI
   */
  namespace: '/api/v1/i2d',

  /**
   * Upload the image
   *
   * @param data
   * @returns {Promise}
   */
  uploadImage: function(data) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/upload`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  searchImage: function(data) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/upload/search`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders(),
      data: JSON.stringify(data)
    };
    return Ember.$.ajax(url, options);
  },

  fetchImageData: function(uploadId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/upload/${uploadId}`;
    const options = {
      type: 'GET',
      contentType: 'application/json; charset=utf-8',
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  replaceImage: function(uploadId, data) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/upload/${uploadId}`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify(data),
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  markImageReviewed: function(uploadId) {
    const adapter = this;
    const namespace = this.get('namespace');
    const url = `${namespace}/upload/${uploadId}/reviewed`;
    const options = {
      type: 'PUT',
      contentType: 'application/json; charset=utf-8',
      data: JSON.stringify({}),
      headers: adapter.defineHeaders()
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
