import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';

/**
 * Multiple choice
 *
 * Component responsible for show the multiple choice answer, what option are selected
 * and the correct option.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(QuestionMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-multiple-choice'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  answers: Ember.computed('question.answerObject.[]', function() {
    let component = this;
    let question = component.get('question');
    let questionUtil = component.getQuestionUtil(question);
    let userAnswer = component.get('userAnswer');
    if (component.get('showCorrect')) {
      userAnswer = questionUtil.getCorrectAnswer();
    }

    let userAnswerCorrect = questionUtil.isAnswerChoiceCorrect(userAnswer);
    let answers = question.get('answers');
    return answers.map(function(answer) {
      return {
        text: answer.get('text'),
        selected: answer.get('id') === userAnswer,
        correct: userAnswerCorrect
      };
    });
  }),

  isChooseOne: false

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
