import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';

/**
 * Hot spot text
 *
 * Component responsible for show the hot spot text, which option is selected
 * and the correct option.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(QuestionMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-hs-text'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  answers: Ember.computed('question.answerObject.[]', 'anonymous', function() {
    let component = this;
    let question = component.get('question');
    let questionUtil = component.getQuestionUtil(question);
    let userAnswers = component.get('userAnswer');
    let anonymous = component.get('anonymous');
    if (component.get('showCorrect')) {
      userAnswers = questionUtil.getCorrectAnswer();
    }

    let answers = question.get('answers');
    return answers.map(function(answer) {
      let userAnswerCorrect = false;
      let selected = false;
      if (userAnswers.includes(answer.get('id'))) {
        userAnswerCorrect = questionUtil.isAnswerChoiceCorrect(
          answer.get('id')
        );
        selected = true;
      }

      let elementClass = anonymous
        ? 'anonymous'
        : userAnswerCorrect
          ? 'correct'
          : 'incorrect';
      return {
        text: answer.get('text'),
        selected: selected,
        class: elementClass
      };
    });
  })

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
