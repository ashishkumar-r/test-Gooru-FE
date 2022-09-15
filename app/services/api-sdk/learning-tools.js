import Ember from 'ember';
import LearningToolsAdapter from 'gooru-web/adapters/learning_tools';
import LearningToolSerializer from 'gooru-web/serializers/learning-tools';

/**
 * @typedef {Object} LearningToolsService
 */
export default Ember.Service.extend({
  /**
   * @property {LearningToolAdapter} LearningToolAdapter
   */
  LearningToolAdapter: null,

  learningToolSerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'LearningToolsAdapter',
      LearningToolsAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'learningToolSerializer',
      LearningToolSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  getLearningToolInformation: function(toolId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('LearningToolsAdapter')
        .getLearningToolInformation(toolId)
        .then(function(responseData) {
          resolve(responseData);
        }, reject);
    });
  },

  fetchLearningTool: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('LearningToolsAdapter')
        .fetchLearningTool()
        .then(function(responseData) {
          resolve(
            service
              .get('learningToolSerializer')
              .normalizeLearningTool(responseData)
          );
        }, reject);
    });
  }
});
