import Ember from 'ember';
import QuestionComponent from './gru-question';
import FillInTheBlank from 'gooru-web/utils/question/fill-in-the-blank';

/**
 * Scientific Fill in the blank
 *
 * Component responsible for controlling the logic and appearance of a Scientific fill in the blank
 * question inside of the {@link player/gru-question-viewer.js}
 *
 * @module
 * @see controllers/player.js
 * @see components/player/gru-question-viewer.js
 * @augments Ember/Component
 */
export default QuestionComponent.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-scientific-fib'],
  // -------------------------------------------------------------------------
  // Events
  initInputEvents: function() {
    const component = this;
    component.setAnswersEvents();
  }.on('didInsertElement'),

  isShow: true,

  // -------------------------------------------------------------------------
  // Properties
  /**
   * Replace "_______" to an input
   * @param question
   *
   */
  answers: Ember.computed('question', function() {
    const component = this;
    let answers = component.get('question.answerDetails');
    let hints = component.get('question.hints');
    const readOnly = component.get('readOnly');
    const disabled = readOnly ? 'disabled' : '';

    // matches [] but not []{, which indicates a malformed sqrt
    let answerData = Ember.A([]);
    answers.map(choice => {
      const input = `<input type='text' value='' data=${choice.answer_category} ${disabled}/>`;
      let answerText = choice.answer_text.replace(
        new RegExp(FillInTheBlank.SCIENTIFIC_FIB_REGEX.global.source, 'g'),
        input
      );
      let hint = hints[`${choice.answer_category}_explanation`];
      let answerObj = Ember.Object.create({
        answer_category: choice.answer_category,
        answer_text: answerText,
        ishintShow: true,
        hint: hint.replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      });
      answerData.pushObject(answerObj);
    });
    return answerData;
  }),
  // -------------------------------------------------------------------------
  // Methods
  /**
   * Notify input answers
   * @param {boolean} onLoad if this was called when loading the component
   */
  notifyInputAnswers: function(onLoad) {
    const component = this,
      inputs = component.$('.fib-answers input[type=text]'),
      answers = inputs
        .map(function(index, input) {
          let answer = Ember.$(input).val();
          return Ember.$.trim(answer);
        })
        .toArray();

    const answerCompleted = answers.join('').length > 0; //to check that at least 1 answer has text

    const questionUtil = component.get('questionUtil');
    const correct = questionUtil.isCorrect(answers);

    component.notifyAnswerChanged(answers, correct);
    if (answerCompleted) {
      if (onLoad) {
        component.notifyAnswerLoaded(answers, correct);
      } else {
        component.notifyAnswerCompleted(answers, correct);
      }
    } else {
      component.notifyAnswerCleared(answers);
    }
  },

  /**
   * Set answers
   */
  setAnswersEvents: function() {
    const component = this;
    const inputs = component.$('.fib-answers');
    if (component.get('hasUserAnswer')) {
      component.notifyInputAnswers(true);
    }
    inputs.on('keyup', 'input[type=text]', function() {
      component.notifyInputAnswers(false);
    });
  },

  toggleAction(item) {
    let flag = item.get('ishintShow');
    item.set('ishintShow', !flag);
  }
});
