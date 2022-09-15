import Ember from 'ember';

/**
 * Serializer for Skyline Initial endpoints
 *
 * @typedef {Object} SkylineInitialSerializer
 */
export default Ember.Object.extend({
  /**
   * Normalized data of fetch state
   * @return {Object}
   */
  normalizeFetchState: function(response) {
    //response.destination = 'course-map';
    return Ember.Object.create(response);
  }
});
