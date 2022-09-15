import Ember from 'ember';

export default Ember.Object.extend({
  /**
   * Serializes an error
   * @param {Error} error
   * @returns {*}
   */
  serializeError: function(error) {
    return {
      client_timestamp: error.get('timestamp'),
      user_id: error.get('userId'),
      log_type: 'ERROR',
      client_info: error.get('details'),
      client_context: error.get('type'),
      api: error.get('details.endpoint.url'),
      api_status: error.get('details.endpoint.status'),
      api_response: error.get('details.endpoint.response'),
      message: error.get('description')
    };
  }
});
