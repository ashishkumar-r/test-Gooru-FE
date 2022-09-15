import Ember from 'ember';
import DS from 'ember-data';

/**
 * Model that contains the student performance data by unit, lesson or collection|assessment.
 * @typedef {Object} StudentPerformance
 */
export default DS.Model.extend({
  /**
   * @property {User} user
   */
  user: DS.belongsTo('user/user', { async: false }),

  /**
   * @property {Performance[]} List of Performance items.
   */
  performanceData: DS.hasMany('performance/performance', { async: false }),

  /**
   * @property {Performance[]} List of Performance items, excluding the provided ids
   */
  filteredPerformanceData: Ember.computed('excludedIds.[]', function() {
    const excludedIds = this.get('excludedIds');
    return this.get('performanceData').filter(function(performance) {
      return excludedIds.indexOf(performance.get('realId')) < 0;
    });
  }),

  /**
   * Contains the ids that should be ignored during some calculations, like score
   * This is useful for calculating the collections score since not all the collections has a score
   * @property {string[]}
   */
  excludedIds: [],

  /**
   * @property {Number} Computed property with the average score for all student data.
   */
  averageScore: Ember.computed('filteredPerformanceData', function() {
    return this.calculateAverage('score', this.get('performanceData'));
  }),

  /**
   * @property {Number} Computed property with the average time spent for all student data.
   */
  averageTimeSpent: Ember.computed('performanceData', function() {
    return this.calculateAverage('timeSpent', this.get('performanceData'));
  }),

  /**
   * @property {Number} Computed property with the summatory of completion done for all student data.
   */
  sumCompletionDone: Ember.computed('performanceData', function() {
    return this.calculateSum('completionDone', this.get('performanceData'));
  }),

  /**
   * @property {Number} Computed property with the summatory of completion total for all student data.
   */
  sumCompletionTotal: Ember.computed('performanceData', function() {
    return this.calculateSum('completionTotal', this.get('performanceData'));
  }),

  /**
   * Helper function to calculate the average value of a specific field.
   * @param fieldName the field to calculate
   * @returns {number} the average value
   */
  calculateAverage: function(fieldName, performanceData) {
    var avgValue = -1;
    const counter = performanceData.length;
    if (counter > 0) {
      avgValue = this.calculateSum(fieldName, performanceData) / counter;
    }
    return avgValue;
  },

  /**
   * Helper function to calculate the summatory value of a specific field.
   * @param fieldName the field to calculate
   * @returns {number} the summatory value
   */
  calculateSum: function(fieldName, performanceData) {
    var sumValue = 0;
    if (performanceData.length > 0) {
      performanceData.forEach(function(performance) {
        sumValue += performance.get(fieldName);
      });
    }
    return sumValue;
  }
});
