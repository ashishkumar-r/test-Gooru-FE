import Ember from 'ember';

/**
 * Serializer to support the Collection CRUD operations for API 3.0
 *
 * @typedef {Object} LearningToolSerializer
 */
export default Ember.Object.extend({
  toolFunctions: {
    NTL: 'noteToolCall'
  },

  normalizeLearningTool(payload) {
    const learningTools = payload ? payload.learningTools : [];
    learningTools.forEach(element => {
      element.callFunction = this.toolFunctions[element.code];
    });
    return learningTools.map(tool => Ember.Object.create(tool));
  }
});
