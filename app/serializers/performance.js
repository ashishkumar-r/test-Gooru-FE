import Ember from 'ember';

/**
 * Serializer for Performance endpoints
 *
 * @typedef {Object} PerformanceSerializer
 */
export default Ember.Object.extend({
  /**
   * Normalized data of user performance units
   * @return {Object}
   */
  normalizeUserPerformanceUnits: function(response) {
    let resultSet = Ember.A();
    response = Ember.A(response.units);
    response.forEach(data => {
      let result = Ember.Object.create(data);
      resultSet.pushObject(result);
    });
    response.set('units', resultSet);
    return response;
  },

  /**
   * Normalized data of user performance lessons
   * @return {Object}
   */
  normalizeUserPerformanceLessons: function(response) {
    let resultSet = Ember.A();
    response = Ember.A(response.lessons);
    response.forEach(data => {
      let result = Ember.Object.create(data);
      resultSet.pushObject(result);
    });
    return resultSet;
  },

  /**
   * Normalized data of user performance collections
   * @return {Object}
   */
  normalizeUserPerformanceCollections: function(response) {
    let resultSet = Ember.A();
    response = Ember.A(response.collections);
    response.forEach(data => {
      let result = Ember.Object.create(data);
      resultSet.pushObject(result);
    });
    return resultSet;
  },

  /**
   * Normalized data of user performance resource in  assessments
   * @return {Object}
   */
  normalizeUserPerformanceResourceInAssessment: function(response) {
    let resultSet = Ember.A();
    response = Ember.A(response.resources);
    response.forEach(data => {
      let result = Ember.Object.create(data);
      resultSet.pushObject(result);
    });
    return resultSet;
  },

  /**
   * Normalized data of user performance resource in  collections
   * @return {Object}
   */
  normalizeUserPerformanceResourceInCollection: function(response) {
    let resultSet = Ember.A();
    response = Ember.A(response.resources);
    response.forEach(data => {
      let result = Ember.Object.create(data);
      resultSet.pushObject(result);
    });
    return resultSet;
  }
});
