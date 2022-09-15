import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';

/**
 * Multiple answer
 *
 * Component responsible for show the multiple answer, which option is selected
 * and the correct option.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(QuestionMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-multiple-answer'],

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
    let userAnswers = component.get('userAnswer') || [];

    if (component.get('showCorrect')) {
      userAnswers = questionUtil.getCorrectAnswer();
    }

    let answers = question.get('answers');
    return answers.map(function(answer) {
      let userAnswer = userAnswers.filterBy('id', answer.get('id'));
      let correct = userAnswer.length
        ? questionUtil.isAnswerChoiceCorrect(userAnswer.get('firstObject'))
        : false;

      return {
        text: answer.get('text'),
        selected: userAnswer.length
          ? userAnswer.get('firstObject.selection')
          : false,
        correct: correct
      };
    });
  })

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
