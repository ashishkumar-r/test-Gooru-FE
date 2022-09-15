import Ember from 'ember';
import { getGradeColor } from 'gooru-web/utils/utils';
import { GRADING_SCALE } from 'gooru-web/config/config';
import { average } from 'gooru-web/utils/math';

/**
 * Class assessment summary
 *
 * Component responsible for aggregating the class assessment data
 * and presenting it in a summarized manner to the user
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'class-assessment', 'gru-summary'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * @function actions:toggleView
     * @param {boolean} isQuestionView - Should all the questions be visible or not?
     */
    toggleView: function(isQuestionView) {
      this.set('isQuestionView', isQuestionView);
    },

    /**
     * @function actions:selectQuestion
     * @param {Number} questionId
     */
    selectQuestion: function(questionId) {
      this.get('onSelectQuestion')(questionId);
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @prop { Object[] } answersData - Array that keeps track of all the correct and incorrect answers
   * for each student taking an assessment
   *
   * Each object will consist of:
   * - correct: number of questions that the student has answered correctly
   * - incorrect: number of questions that the student has answered incorrectly
   */
  answersData: Ember.computed('reportData', 'reportData.data', function() {
    const studentsIds = this.get('studentsIds');
    const questionsIds = this.get('assessmentQuestionsIds');
    const reportData = this.get('reportData.data');
    const resourceData = this.get('reportData.resources');
    var answers = [];

    studentsIds.forEach(function(student) {
      var answerCounter = {
        correct: 0,
        incorrect: 0,
        openEnded: 0
      };
      answers.push(answerCounter);

      questionsIds.forEach(function(question) {
        let resource = resourceData.findBy('id', question);
        let questionType =
          resource && resource.get('questionType')
            ? resource.get('questionType')
            : null;

        if (questionType === 'OE') {
          answerCounter.openEnded += 1;
        } else {
          answerCounter.correct += reportData[student][question].get('correct')
            ? 1
            : 0;
          answerCounter.incorrect += reportData[student][question].get(
            'incorrect'
          )
            ? 1
            : 0;
        }
      });
    });

    return answers;
  }),

  /**
   * @prop { Collection } assessment
   */
  assessment: null,

  /**
   * @prop { String[] } assessmentQuestionsIds - An array with the ids of all the questions in the assessment
   * ordered in ascending order per each question's order value.
   */
  assessmentQuestionsIds: Ember.computed('assessment.resources.[]', function() {
    var questions = this.get('assessment.resources').map(function(question) {
      // Copy only the most important properties of the resources array
      return {
        id: question.id,
        order: question.order
      };
    });

    return questions
      .sort(function(a, b) {
        // Sort by order value
        return a.order - b.order;
      })
      .map(function(question) {
        // Return an array with only the question ids
        return question.id;
      });
  }),

  /**
   * @prop { number } averageScore - average score in the assessment
   * for the entire group of students (per scoresData)
   */
  averageScore: Ember.computed('scoresData', function() {
    var scores = this.get('scoresData').map(function(result) {
      return result.score;
    });
    return scores.length ? Math.round(average(scores)) : 0;
  }),

  /**
   * @prop { Object[] } classScores - Aggregate data of the scores in the assessment
   * (to be consumed by the pie chart component)
   *
   * Each object will consist of:
   * - color: color corresponding to a grade bracket in the grading scale (@see /app/config/config.js)
   * - value: percentage of students in the class with a score within said grade bracket
   */
  classScores: Ember.computed('scoresData', function() {
    const scoresData = this.get('scoresData');

    const scoresColors = scoresData.map(function(result) {
      // Map a score to its color
      return getGradeColor(result.score);
    });

    const colors = GRADING_SCALE.map(function(item) {
      return item.COLOR;
    });

    var results = [];

    if (scoresColors.length) {
      let scoreColorsLen = scoresColors.length;

      colors.forEach(function(color) {
        // Count the number of appearances of a certain color
        var numColor = scoresColors.filter(function(scoreColor) {
          return scoreColor === color;
        }).length;

        if (numColor) {
          results.push({
            color: color,
            value: Math.round(numColor / scoreColorsLen * 100)
          });
        }
      });
    }

    return results;
  }),

  /**
   * @prop { boolean } isQuestionView - Should all the questions be visible or not?
   */
  isQuestionView: false,

  /**
   * @prop { Object[] } questionsData - Array that keeps track of all the correct/incorrect answers
   * for each question in the assessment
   *
   * For each question, there will be a counter object with the following properties:
   * - id: question id
   * - correct: number of students that have answered the question correctly
   * - incorrect: number of students that did not answer the question correctly
   * - total: total number of students
   */
  questionsData: Ember.computed('reportData', 'reportData.data', function() {
    const studentsIds = this.get('studentsIds');
    const totalStudents = studentsIds.length;
    const questionsIds = this.get('assessmentQuestionsIds');
    const reportData = this.get('reportData.data');
    const resourceData = this.get('reportData.resources');

    var questions = [];

    questionsIds.forEach(function(question) {
      let resource = resourceData.findBy('id', question);
      let questionType =
        resource && resource.get('questionType')
          ? resource.get('questionType')
          : null;
      var questionCounter = {
        id: question,
        correct: 0,
        incorrect: 0,
        total: totalStudents,
        openEnded: 0
      };

      questions.push(questionCounter);

      studentsIds.forEach(function(student) {
        if (questionType === 'OE') {
          questionCounter.openEnded += 1;
        } else {
          questionCounter.correct += reportData[student][question].get(
            'correct'
          )
            ? 1
            : 0;
          questionCounter.incorrect += reportData[student][question].get(
            'incorrect'
          )
            ? 1
            : 0;
        }
      });
    });
    return questions;
  }),

  /**
   * @prop { Object[] } scoresData - Array with all the scores in the assessment
   *
   * Each object corresponds to an assessment result by a student and will consist of:
   * - score: number of questions answered correctly vs. total number of questions
   * - completed: have all the questions in the assessment been answered?
   */
  scoresData: Ember.computed('answersData', function() {
    const answersData = this.get('answersData');
    const totalQuestions = this.get('assessmentQuestionsIds').length;

    var answerIdx = answersData.length - 1;
    var results = [];

    for (; answerIdx >= 0; answerIdx--) {
      let correct = answersData[answerIdx].correct;
      let totalAnswered = correct + answersData[answerIdx].incorrect;

      if (totalAnswered > 0) {
        let score = Math.round(correct / totalAnswered * 100);
        results.push({
          score: score,
          completed: totalAnswered === totalQuestions
        });
      }
    }

    return results;
  }),

  /**
   * @prop { User[] } students - Students taking the assessment
   */
  students: null,

  /**
   * @prop { String[] } studentsIds - An array with the ids of all the students taking the assessment
   */
  studentsIds: Ember.computed('students.[]', function() {
    return this.get('students').map(function(student) {
      return student.id;
    });
  }),

  /**
   * @prop { Number } totalCompleted - Number of students that have completed the assessment
   */
  totalCompleted: Ember.computed('scoresData.@each.completed', function() {
    const scoresData = this.get('scoresData');
    var total = 0;

    if (scoresData.length) {
      total = scoresData
        .map(function(result) {
          return result.completed ? 1 : 0;
        })
        .reduce(function(a, b) {
          return a + b;
        });
    }
    return total;
  }),

  /**
   * @prop { ReportData } reportData - Unordered 3D matrix of student data with regards to the questions
   */
  reportData: null,

  /**
   * @prop { boolean } isFullScreen - Should the overview be visible or not?
   */
  isFullScreen: false
});
