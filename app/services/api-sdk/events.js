import Ember from 'ember';
import Env from '../../config/environment';
const ConfigEvent = Env.events || {};

export default Ember.Service.extend({
  saveResourceResult: function(resourceResult, context, eventType) {
    var service = this;
    var apiKey = ConfigEvent.eventAPIKey;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      const eventContent = service
        .get('eventsSerializer')
        .serializeResource(resourceResult, context, eventType, apiKey);
      service
        .get('collectionResourceAdapter')
        .postData({
          body: eventContent,
          query: {
            apiKey: apiKey
          }
        })
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Saves a collection result
   * @param {AssessmentResult} assessmentResult
   * @param {Context} context
   * @param {string} eventType start|stop
   * @returns {Ember.RSVP.Promise}
   */
  saveCollectionResult: function(assessmentResult, context, eventType) {
    const service = this;
    const apiKey = ConfigEvent.eventAPIKey;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      const eventContent = service
        .get('eventsSerializer')
        .serializeCollection(assessmentResult, context, eventType, apiKey);
      service
        .get('collectionPlayAdapter')
        .postData({
          body: eventContent,
          query: {
            apiKey: apiKey
          }
        })
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  saveReaction: function(resourceResult, context) {
    var service = this;
    var apiKey = ConfigEvent.eventAPIKey;
    var reactionContent = service
      .get('eventsSerializer')
      .serializeReaction(resourceResult, context, apiKey);
    return service.get('collectionResourceAdapter').postData({
      body: reactionContent,
      query: {
        apiKey: apiKey
      }
    });
  },

  saveExternalCollection: function(eventContent) {
    const service = this;
    const apiKey = ConfigEvent.eventAPIKey;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('collectionPlayAdapter')
        .postExternalData({
          body: eventContent,
          query: {
            apiKey: apiKey
          }
        })
        .then(
          function() {
            resolve();
          },
          function(error) {
            reject(error);
          }
        );
    });
  }
});
