import Ember from 'ember';
import DS from 'ember-data';
import Utils from 'gooru-web/utils/math';

/**
 * Model that contains a class performance data.
 * @typedef {Object} ClassPerformance
 */
export default DS.Model.extend({
  /**
   * @property {StudentPerformance[]} List of StudentPerformance items
   */
  studentPerformanceData: DS.hasMany('performance/student-performance', {
    async: false
  }),

  /**
   * @property {Number} Computed property with the average score of the whole class.
   */
  classAverageScore: Ember.computed('studentPerformanceData', function() {
    const fieldName = 'averageScore';
    const studentPerformanceData = this.get('studentPerformanceData');
    const validStudentPerformanceData = this.filterValidStudentPerformanceData(
      fieldName,
      studentPerformanceData
    );
    return this.calculateClassAverage(fieldName, validStudentPerformanceData);
  }),

  /**
   * @property {Number} Computed property with the average time spent of the whole class.
   */
  classAverageTimeSpent: Ember.computed('studentPerformanceData', function() {
    const fieldName = 'averageTimeSpent';
    const studentPerformanceData = this.get('studentPerformanceData');
    const validStudentPerformanceData = this.filterValidStudentPerformanceData(
      fieldName,
      studentPerformanceData
    );
    return this.calculateClassAverage(fieldName, validStudentPerformanceData);
  }),

  /**
   * @property {Number} Computed property with the summatory of completion done for the whole class.
   */
  classSumCompletionDone: Ember.computed('studentPerformanceData', function() {
    const fieldName = 'sumCompletionDone';
    const studentPerformanceData = this.get('studentPerformanceData');
    const validStudentPerformanceData = this.filterValidStudentPerformanceData(
      fieldName,
      studentPerformanceData
    );
    return this.calculateClassSum(fieldName, validStudentPerformanceData);
  }),

  /**
   * @property {Number} Computed property with the summatory of completion total for the whole class.
   */
  classSumCompletionTotal: Ember.computed('studentPerformanceData', function() {
    const fieldName = 'sumCompletionTotal';
    const studentPerformanceData = this.get('studentPerformanceData');
    const validStudentPerformanceData = this.filterValidStudentPerformanceData(
      fieldName,
      studentPerformanceData
    );
    return this.calculateClassSum(fieldName, validStudentPerformanceData);
  }),

  /**
   * @property {boolean}
   */
  hasStarted: Ember.computed('studentPerformanceData', function() {
    return (
      this.get('classAverageTimeSpent') >= 0 ||
      this.get('classAverageScore') >= 0
    );
  }),

  /**
   * Function to calculate the average score of a unit, lesson or collection|statement
   * @param itemId
   * @returns {Number} the average score
   */
  calculateAverageScoreByItem: function(itemId) {
    const studentPerformanceData = this.get('studentPerformanceData');
    const filteredStudentPerformanceData = this.filterStudentPerformanceDataByItem(
      itemId,
      studentPerformanceData
    );
    return this.calculateAverageByItem(
      itemId,
      'score',
      filteredStudentPerformanceData
    );
  },

  /**
   * Function to calculate the average time spent of a unit, lesson or collection|statement
   * @param itemId
   * @returns {Number} the average time spent
   */
  calculateAverageTimeSpentByItem: function(itemId) {
    const studentPerformanceData = this.get('studentPerformanceData');
    const filteredStudentPerformanceData = this.filterStudentPerformanceDataByItem(
      itemId,
      studentPerformanceData
    );
    return this.calculateAverageByItem(
      itemId,
      'timeSpent',
      filteredStudentPerformanceData
    );
  },

  /**
   * Function to calculate the summatory of completion done for a unit or lesson or collection|statement
   * @param itemId
   * @returns {Number} The summatory of completion done
   */
  calculateSumCompletionDoneByItem: function(itemId) {
    const studentPerformanceData = this.get('studentPerformanceData');
    const filteredStudentPerformanceData = this.filterStudentPerformanceDataByItem(
      itemId,
      studentPerformanceData
    );
    return this.calculateSumByItem(
      itemId,
      'completionDone',
      filteredStudentPerformanceData
    );
  },

  /**
   * Function to calculate the summatory of completion total for a unit or lesson or collection|statement
   * @param itemId
   * @returns {Number} The summatory of completion total
   */
  calculateSumCompletionTotalByItem: function(itemId) {
    const studentPerformanceData = this.get('studentPerformanceData');
    const filteredStudentPerformanceData = this.filterStudentPerformanceDataByItem(
      itemId,
      studentPerformanceData
    );
    return this.calculateSumByItem(
      itemId,
      'completionTotal',
      filteredStudentPerformanceData
    );
  },

  /**
   * Helper function to calculate the average of the specified field by unit or lesson or collection|statement
   * @param itemId the item id
   * @param fieldName the field to calculate
   * @param studentPerformanceData an array with the student performance data
   * @param doRoundValue indicates if the result should be rounded
   * @returns {number} the average value
   */
  calculateAverageByItem: function(
    itemId,
    fieldName,
    studentPerformanceData = [],
    doRoundValue = true
  ) {
    var avgValue = -1;
    if (studentPerformanceData && studentPerformanceData.length > 0) {
      let counter = 0;
      var sumValue = 0;
      if (studentPerformanceData && studentPerformanceData.length > 0) {
        studentPerformanceData.forEach(function(studentPerformance) {
          if (studentPerformance.get(fieldName) !== null) {
            let studentScore = studentPerformance.get(fieldName);
            if (studentScore !== undefined && !isNaN(studentScore)) {
              sumValue += studentScore;
              counter += 1;
            }
          }
        });
      }
      if (sumValue !== null) {
        avgValue = sumValue / counter;
        if (doRoundValue) {
          avgValue = Utils.roundFloat(avgValue);
        }
      } else {
        avgValue = null;
      }
    }
    return avgValue;
  },

  /**
   * Helper function to calculate the summatory of a specified field by unit, lesson or collection|statement.
   * @param itemId the item id
   * @param fieldName the field to calculate
   * @param studentPerformanceData an array with the student performance data
   * @param doRoundValue indicates if the result should be rounded
   * @returns {number} the summatory value
   */
  calculateSumByItem: function(
    itemId,
    fieldName,
    studentPerformanceData = [],
    doRoundValue = true
  ) {
    var sumValue = 0;
    if (studentPerformanceData && studentPerformanceData.length > 0) {
      studentPerformanceData.forEach(function(studentPerformance) {
        if (studentPerformance.get(fieldName) !== null) {
          sumValue += studentPerformance.get(fieldName);
        } else {
          sumValue = null;
        }
      });
      if (doRoundValue) {
        sumValue = Utils.roundFloat(sumValue);
      }
    }
    return sumValue;
  },

  /**
   * Helper function to calculate the average of a specified field.
   * @param fieldName required values are score or timeSpent
   * @param studentPerformanceData an array with the student performance data
   * @returns {Number} the average value
   */
  calculateClassAverage: function(fieldName, studentPerformanceData = []) {
    var classAverage = -1;
    if (studentPerformanceData && studentPerformanceData.length > 0) {
      const counter = studentPerformanceData.length;
      const classSum = this.calculateClassSum(
        fieldName,
        studentPerformanceData
      );
      classAverage = Utils.roundFloat(classSum / counter);
    }
    return classAverage;
  },

  /**
   * Helper function to calculate the summatory of a specified field.
   * @param fieldName required values are completionDone or completionTotal
   * @param studentPerformanceData an array with the student performance data
   * @returns {Number} the average value
   */
  calculateClassSum: function(fieldName, studentPerformanceData = []) {
    var sumValue = 0;
    if (studentPerformanceData && studentPerformanceData.length > 0) {
      studentPerformanceData.forEach(function(studentPerformance) {
        sumValue += studentPerformance.get(fieldName);
      });
    }
    return sumValue;
  },

  /**
   * Helper function to filter the student performance data for the cases where the specified field value is greater or than zero
   * @param fieldName to field to be used in the filter
   * @param studentPerformanceData an array with the student performance data
   * @returns {Array}
   */
  filterValidStudentPerformanceData: function(
    fieldName,
    studentPerformanceData = []
  ) {
    var filteredPerformanceData = Ember.A([]);
    if (studentPerformanceData && studentPerformanceData.length > 0) {
      filteredPerformanceData = studentPerformanceData.filter(function(
        studentPerformance
      ) {
        return studentPerformance.get(fieldName) >= 0;
      });
    }
    return filteredPerformanceData;
  },

  /**
   * Helper function to filter the all students data by a specified unit, lesson or collection|statement
   * @param itemId the unit, lesson or collection|statement ID
   * @param studentPerformanceData an array with the student performance data
   * @returns {Array}
   */
  filterStudentPerformanceDataByItem: function(
    itemId,
    studentPerformanceData = []
  ) {
    var filteredPerformanceData = Ember.A([]);
    if (studentPerformanceData && studentPerformanceData.length > 0) {
      studentPerformanceData.forEach(function(studentPerformance) {
        const performanceData = studentPerformance
          .get('performanceData')
          .findBy('realId', itemId);
        if (performanceData) {
          filteredPerformanceData.push(performanceData);
        }
      });
    }
    return filteredPerformanceData;
  },

  /**
   * @function findNumberOfStudentsByItem
   * Method to find number of students have performed in an item
   */
  findNumberOfStudentsByItem(itemId) {
    let numberOfStudents = 0;
    const studentPerformanceData = this.get('studentPerformanceData') || [];
    if (studentPerformanceData && studentPerformanceData.length > 0) {
      studentPerformanceData.forEach(function(studentPerformance) {
        const performanceData = studentPerformance
          .get('performanceData')
          .findBy('realId', itemId);
        if (performanceData) {
          numberOfStudents++;
        }
      });
    }
    return numberOfStudents;
  }
});
