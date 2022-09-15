import Ember from 'ember';
import { getQuestionUtil } from 'gooru-web/config/question';
import { stats, userAnswers } from 'gooru-web/utils/question-result';
import {
  CORRECT_COLOR,
  INCORRECT_COLOR,
  ANONYMOUS_COLOR
} from 'gooru-web/config/config';

/**
 * Question Performance Component
 *
 * Component responsible for displaying the question performance information for several students
 *
 * @module
 * @augments Ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'class-assessment', 'gru-question-performance'],

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {User[]} students
   */
  students: null,

  /**
   * @prop { ReportData } reportData - Representation of the data to show in the reports as a 3D matrix
   * Any changes on the content feed will cause the report data to update
   */
  reportData: null,

  /**
   * @property {Resource} question
   */
  question: null,

  /**
   * Indicates if the report is displayed in anonymous mode
   * @property {boolean} anonymous
   */
  anonymous: null,
  /**
   * Indicates when the report is display in anonymous mode if show all performance results
   * @property {boolean} showResult
   */
  showResult: null,

  /**
 * Indicates if is anonymous and show the performance Results
 * @property {boolean} anonymousAndShowResult
 */
  anonymousAndShowResult: Ember.computed.and('anonymous', 'showResult'),

  /**
 * Indicates if is anonymous and show the performance Results
 * @property {boolean} anonymousAndShowResult
 */
  anonymousAndNotShowResult: Ember.computed(
    'anonymous',
    'showResult',
    function() {
      return this.get('anonymous') && !this.get('showResult');
    }
  ),

  /**
   * Question results for this question, all students
   *
   * @property {QuestionResult[]}
   */
  questionResults: Ember.computed('question', 'reportData.data', function() {
    const reportData = this.get('reportData');
    return reportData.getResultsByQuestion(this.get('question.id'));
  }),

  /**
   * Returns a convenient structure to display the x-bar-chart
   */
  questionBarChartData: Ember.computed(
    'questionResults.[]',
    'anonymousAndNotShowResult',
    function() {
      const questionResults = this.get('questionResults');

      const totals = stats(questionResults);
      const total = totals.get('total');
      const anonymousAndNotShowResult = this.get('anonymousAndNotShowResult');

      return Ember.Object.create({
        data: [
          {
            color: anonymousAndNotShowResult
              ? ANONYMOUS_COLOR
              : INCORRECT_COLOR,
            percentage: totals.get('incorrectPercentageFromTotal')
          },
          {
            color: anonymousAndNotShowResult ? ANONYMOUS_COLOR : CORRECT_COLOR,
            percentage: totals.get('correctPercentageFromTotal')
          }
        ],
        completed: totals.get('totalCompleted'),
        total: total
      });
    }
  ),

  /**
   * Convenience structure to display the answers distribution
   * @property {*} answer distributions
   */
  answersData: Ember.computed('questionResults.[]', function() {
    const component = this;
    const reportData = component.get('reportData');
    const question = component.get('question');
    const questionUtil = getQuestionUtil(question.get('questionType')).create({
      question: question
    });

    const answers = userAnswers(this.get('questionResults'));
    const distribution = questionUtil.distribution(answers);

    const answersData = Ember.A([]);
    distribution.forEach(function(answerDistribution) {
      let userAnswer = answerDistribution.get('answer');
      let students = reportData.getStudentsByQuestionAndUserAnswer(
        question,
        userAnswer
      );
      let correct = questionUtil.isCorrect(userAnswer);
      let percentage = answerDistribution
        ? answerDistribution.get('percentage')
        : 0;
      answersData.addObject(
        Ember.Object.create({
          correct: correct,
          userAnswer: userAnswer,
          percentage: percentage,
          students: students,
          charData: Ember.A([
            Ember.Object.create({
              color: correct ? CORRECT_COLOR : INCORRECT_COLOR,
              percentage: percentage
            })
          ])
        })
      );
    });

    return answersData;
  }),
  // -------------------------------------------------------------------------
  // Methods
  /**
   * willDestroyElement event
   */
  willDestroyElement: function() {
    const component = this;
    component.set('showResult', false);
    component.set('anonymous', false);
  }
});
