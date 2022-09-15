import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';

/**
 * Multiple choice
 *
 * Component responsible for show the reorder, what option are selected
 * and the correct option.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(QuestionMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-reorder'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  answers: Ember.computed(
    'question.answerObject.[]',

    function() {
      let component = this;
      let question = component.get('question');
      let questionUtil = component.getQuestionUtil(question);
      let userAnswers = component.get('userAnswer');
      let correctAnswers = questionUtil.getCorrectAnswer();
      let answers = question.get('answers').sortBy('order');

      let userAnswersWithText =
        userAnswers &&
        userAnswers.map(function(userAns) {
          let userAnsValue = answers.findBy('id', userAns),
            userAnsText = userAnsValue ? userAnsValue.text : '';
          return {
            value: userAns,
            userAnsText: userAnsText
          };
        });

      return answers.map(function(answer, inx) {
        let userAnswerAtIndex = userAnswers && userAnswers.objectAt(inx);
        let correctAnswerAtIndex = correctAnswers.objectAt(inx);

        return {
          showCorrect: component.get('showCorrect'),
          selectedOrderText:
            userAnswersWithText &&
            userAnswersWithText.length > 0 &&
            userAnswersWithText[inx].userAnsText,
          selectedOrder:
            userAnswers && userAnswers.indexOf(correctAnswerAtIndex) + 1,
          text: answer.get('text'),
          correct: questionUtil.isAnswerChoiceCorrect(userAnswerAtIndex, inx)
        };
      });
    }
  )

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
