import Ember from 'ember';
import QuestionResult from 'gooru-web/models/result/question';
import { getQuestionUtil } from 'gooru-web/config/question';

/**
 * Report data model for class assessment report
 *
 * @typedef {Object} ReportData
 *
 */
export default Ember.Object.extend({
  // -------------------------------------------------------------------------
  // Events

  /**
   *  Initializes the report data
   */
  init: function() {
    const studentIds = this.get('studentIds');
    const resourceIds = this.get('resourceIds');

    if (!studentIds.length) {
      Ember.Logger.error('Report data cannot be initialized without students');
    }
    if (!resourceIds.length) {
      Ember.Logger.error('Report data cannot be initialized without resources');
    }

    this.set('data', this.getEmptyMatrix(studentIds, resourceIds));
  },

  willDestroy: function() {
    this.set('data', null);
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * { Object{}{}{} } cumulativeData
   *
   * Internal matrix that serves as a buffer and stores all changes made to the report data.
   * Any changes made to 'userResults', update this matrix first. Then, this matrix is copied and
   * served to 'reportData' (which guarantees that any observers or computed properties on
   * 'reportData' are fired)
   *
   * Sample structure
   *
   * The "question#" corresponds to the actual question id
   *  {
   *    user1 {
   *      question1 : QuestionResult,
   *      question2 : QuestionResult,
   *      question3 : QuestionResult
   *     },
   *    user2 {
   *      question1 : QuestionResult,
   *      question2 : QuestionResult,
   *      question3 : QuestionResult
   *    }
   *  }
   */
  data: null,

  /**
   * @property {User[]} student
   */
  students: null,

  /**
   * @property {string[]} studentIds - List of student ids
   */
  studentIds: Ember.computed('students', function() {
    return this.get('students').map(function(student) {
      return student.get('id');
    });
  }),

  /**
   * @property {Resource[]} resource
   */
  resources: null,

  /**
   * @property {string[]} studentIds - List of student ids
   */
  resourceIds: Ember.computed('resources', function() {
    return this.get('resources').map(function(resource) {
      return Ember.get(resource, 'id');
    });
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Takes a map of QuestionResults and for each one that doesn't have a boolean value
   * (i.e. true or false) for "correct", sets its "correct" property to false.
   *
   * @param { Object } QuestionResultMap - A map of QuestionResults (i.e. object where each key is a
   * resource id and the content is a QuestionResult instance)
   * @param resourceIds - An array of resource IDs
   * @return {Object}
   */
  autoCompleteRow: function(QuestionResultMap, resourceIds) {
    resourceIds.forEach(function(resourceId) {
      var questionResult = QuestionResultMap[resourceId];
      if (!questionResult.get('started')) {
        questionResult.set('correct', false);
      }
    });
    return QuestionResultMap;
  },

  /**
   * Create a matrix of empty objects from a couple of arrays
   * @param {String[]} idsY - An array of ids used for the first dimension of the matrix
   * @param {String[]} idsX - An array of ids used for the second dimension of the matrix
   * @return {Object}
   */
  getEmptyMatrix: function(idsY, idsX) {
    var matrix = {};
    var yLen = idsY.length;

    for (let i = 0; i < yLen; i++) {
      matrix[idsY[i]] = this.getEmptyRow(idsX);
    }
    return matrix;
  },

  /**
   * Create an object full of empty results
   * @param {String[]} columnIds - An array of ids of all the items in the row
   * @return { QuestionResult[] }
   */
  getEmptyRow: function(columnIds) {
    var row = {};
    var rowLen = columnIds.length;

    for (let i = 0; i < rowLen; i++) {
      row[columnIds[i]] = QuestionResult.create({
        resourceId: columnIds[i]
      });
    }
    return row;
  },

  /**
   * Merges new data
   * @param {UserResourcesResult[]} userResults
   * @returns {merge}
   */
  merge: function(userResults) {
    let reportData;
    let data = this.get('data');
    let resourceIds = this.get('resourceIds');

    userResults
      // Filter in case a student has been removed from the course
      .filter(result => data.hasOwnProperty(result.get('user')))
      .forEach(function(userResult) {
        var userId = userResult.get('user');
        var doReset = userResult.get('isAttemptStarted');
        var doAutoComplete = userResult.get('isAttemptFinished');
        var resourceResults = userResult.get('resourceResults');

        if (doReset) {
          data[userId] = this.getEmptyRow(resourceIds);
        }

        resourceResults
          // Filter in case a resource/question has been removed from the collection/assessment
          .filter(
            result => resourceIds.indexOf(Ember.get(result, 'resourceId')) > -1
          )
          .forEach(function(resourceResult) {
            if (data[userId]) {
              const questionId = Ember.get(resourceResult, 'resourceId');
              if (data[userId][questionId]) {
                //if there are several attempts for the same resource the time spent should be added
                const totalTimeSpent =
                  Ember.get(resourceResult, 'timeSpent') +
                  data[userId][questionId].get('timeSpent');
                Ember.set(resourceResult, 'timeSpent', totalTimeSpent);
              }
              data[userId][questionId] = resourceResult;
            }
          });

        if (doAutoComplete) {
          this.autoCompleteRow(data[userId], resourceIds);
        }
      }, this);

    // Generate a new object so any computed properties listening on reportData are fired
    if (Object.assign) {
      // Preferred way to merge the contents of two objects:
      // https://github.com/emberjs/ember.js/issues/12320
      reportData = Object.assign({}, data);
    } else {
      // Use Ember.merge as a fallback
      reportData = Ember.merge({}, data);
    }

    this.set('data', reportData);

    return this;
  },

  /**
   * Retrieves all student results by question
   *
   * @param {string} questionId
   * @returns { QuestionResult[] }
   */
  getResultsByQuestion: function(questionId) {
    const reportData = this.get('data');
    let questionResults = Ember.A([]);

    this.get('studentIds').forEach(function(studentId) {
      const userQuestionResults = reportData[studentId];
      if (userQuestionResults) {
        const questionResult = userQuestionResults[questionId];

        if (questionResult) {
          questionResults.addObject(questionResult);
        } else {
          Ember.Logger.warn(
            `Missing question data ${studentId} question ${questionId}`
          );
        }
      } else {
        Ember.Logger.warn(`Missing student data ${studentId}`);
      }
    });

    return questionResults;
  },

  /**
   * Retrieves all results by student
   *
   * @param {string} studentId
   * @returns { QuestionResult[] }
   */
  getResultsByStudent: function(studentId) {
    const reportData = this.get('data');
    let questionResults = Ember.A([]);

    const userQuestionResults = reportData[studentId];
    if (userQuestionResults) {
      for (let key in userQuestionResults) {
        if (userQuestionResults.hasOwnProperty(key)) {
          questionResults.addObject(userQuestionResults[key]);
        }
      }
    } else {
      Ember.Logger.warning(`Missing student data ${studentId}`);
    }
    return questionResults;
  },

  /**
   * Retrieves all student results
   *
   * @returns { QuestionResult[] }
   */
  getAllResults: function() {
    const self = this;
    let questionResults = Ember.A([]);

    this.get('studentIds').forEach(function(studentId) {
      let studentResults = self.getResultsByStudent(studentId);
      questionResults.addObjects(studentResults.toArray());
    });

    return questionResults;
  },

  /**
   * Return all the student who submitted the answer
   * @param {Resource} question
   * @param {*} answer user answer
   * @returns {User[]}
   */
  getStudentsByQuestionAndUserAnswer: function(question, answer) {
    const reportData = this.get('data');
    const questionId = question.get('id');
    const util = getQuestionUtil(question.get('questionType')).create({
      question: question
    });
    let found = Ember.A([]);

    this.get('students').forEach(function(student) {
      const studentId = student.get('id');
      const userQuestionResults = reportData[studentId];
      if (userQuestionResults) {
        const questionResult = userQuestionResults[questionId];
        const answered = questionResult && questionResult.get('answered');
        if (answered) {
          const sameAnswer = util.sameAnswer(
            answer,
            questionResult.get('userAnswer')
          );
          if (sameAnswer) {
            found.addObject(student);
          }
        }
      } else {
        Ember.Logger.warning(`Missing student data ${studentId}`);
      }
    });
    return found;
  }
});
