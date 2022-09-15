import Ember from 'ember';

export default Ember.Object.extend({
  session: Ember.inject.service('session'),

  /**
   * @property {string} End-point URI
   */
  namespace: '/api/nucleus-media/v1/uploads',

  /**
   * Uploads file to S3
   * @param requestType
   * @param query
   * @returns {string}
   */
  uploadFile: function(fileData, type, isAudio = false) {
    let formData = new FormData();
    if (isAudio) {
      formData.append('file', fileData, 'blob.mp3');
    } else {
      formData.append('file', fileData);
    }
    formData.append('entity_type', type);

    const adapter = this;
    const url = adapter.get('namespace');
    const options = {
      type: 'POST',
      contentType: false,
      processData: false,
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: formData
    };
    return Ember.$.ajax(url, options);
  },

  uploadScormFile: function(fileData) {
    let formData = new FormData();
    formData.append('file', fileData);

    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/scorm`;
    const options = {
      type: 'POST',
      contentType: false,
      processData: false,
      dataType: 'json',
      headers: adapter.defineHeaders(),
      data: formData
    };
    return Ember.$.ajax(url, options);
  },

  /**
   * Creates the headers required by API 3.0
   * @returns {{Authorization: string}}
   */
  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
