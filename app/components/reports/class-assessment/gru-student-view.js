import Ember from 'ember';
import { correctPercentage } from 'gooru-web/utils/question-result';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'class-assessment', 'gru-student-view'],

  actions: {
    /**
     * @function actions:selectQuestion
     * @param {Number} questionId
     */
    selectQuestion: function(questionId) {
      this.get('onSelectQuestion')(questionId);
    },

    /**
     * When clicking at the student header
     * @param {string} studentId
     */
    selectStudent: function(studentId) {
      this.get('onSelectStudent')(studentId);
    },
    /**
     * Sort students view
     * @function actions:sort
     */
    sortStudentView: function(sort) {
      this.set('sortAlphabetically', sort);
      if (this.get('sortAlphabetically')) {
        this.set('studentPerformanceListSorting', ['student.lastFirstName']);
      } else {
        this.set('studentPerformanceListSorting', [
          'score:desc',
          'student.lastFirstName'
        ]);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @prop { Collection } assessment
   */
  assessment: null,

  /**
   * @prop { User[] } students - Students taking the assessment
   */
  students: null,

  /**
   * @prop { ReportData } reportData
   */
  reportData: null,

  /**
   * Indicates if the report is displayed in anonymous mode
   * @property {boolean} anonymous
   */
  anonymous: false,

  /**
   * Returns a convenience structure to display the student view
   *
   *
   * Sample response
   * The "questionId#" corresponds to the actual question id
   *
   *  [
   *    {
   *      student: {User}
   *      reportData: {
   *        questionId1 : QuestionResult,
   *        questionId2 : QuestionResult,
   *        questionId3 : QuestionResult
   *      },
   *    },
   *    {
   *      student: {User}
   *      reportData: {
   *        questionId1 : QuestionResult,
   *        questionId2 : QuestionResult,
   *        questionId3 : QuestionResult
   *      },
   *    }
   *  ]
   *
   * @return [] students performance info
   */
  studentPerformanceList: Ember.computed(
    'students.[]',
    'reportData.data',
    function() {
      const component = this;
      const students = component.get('students');
      const reportData = component.get('reportData.data');
      return students.map(function(student) {
        let studentReportData = reportData[student.get('id')] || {};
        let studentResourceResults = component.getReportDataResults(
          studentReportData
        );
        return Ember.Object.create({
          student: student,
          reportData: studentResourceResults,
          score: correctPercentage(studentResourceResults)
        });
      });
    }
  ),

  /**
   * Indicate if the table is to be sorted alphabetically using the students full name, if not, sort by average of score.
   *
   * @property {Boolean}
   */
  sortAlphabetically: false,

  /**
   * Array containing the criteria that controls the sorting, default is sort alphabetically, default is defined by property '@sortAlphabetically'
   *
   * @property {Array}
   */
  studentPerformanceListSorting: ['score:desc', 'student.lastFirstName'],
  /**
   * Property containing t he sorted list
   *
   * @property {Ember.computed}
   */
  sortedStudentPerformance: Ember.computed.sort(
    'studentPerformanceList',
    'studentPerformanceListSorting'
  ),
  // -------------------------------------------------------------------------
  // Methods

  /**
   *
   * Returns only the QuestionResult instances or an empty object when the student has no value for a question
   *
   * studentReportData param looks like
   *
   *    {
   *      questionId1 : QuestionResult,
   *      questionId2 : QuestionResult,
   *      questionId3 : QuestionResult
   *    }
   *
   * @param {Object} studentReportData
   * @returns {QuestionResult[]}
   */
  getReportDataResults: function(studentReportData) {
    const component = this;
    const questions = component.get('assessment.resources');

    return questions.map(function(question) {
      var reportData = studentReportData[question.get('id')];
      reportData.set('questionType', question.get('questionType'));
      return reportData;
    });
  }
});
