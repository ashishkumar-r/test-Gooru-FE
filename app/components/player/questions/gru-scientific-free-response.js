import Ember from 'ember';
import QuestionComponent from './gru-question';

/**
 * Open Ended Question
 *
 * Component responsible for controlling the logic and appearance of an open
 * ended question inside of the {@link player/gru-question-viewer.js}
 *
 * @module
 * @see controllers/player.js
 * @see components/player/gru-question-viewer.js
 * @augments Ember/Component
 */
export default QuestionComponent.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-scientific-free-response'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events
  /**
   * When loading the user answer
   */
  updateUserAnswer: Ember.on('init', function() {
    const component = this;
    component.setAnswers();
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Indicates when the answer is completed
   * @return {bool}
   */
  isAnswerCompleted: Ember.computed.bool('answer.length'),

  /**
   * @property {number} max answer length
   */
  maxLength: 1000,

  /**
   * @property {number} characters left
   */
  charactersLeft: function() {
    return this.get('maxLength') - this.get('answer').length;
  }.property('answer'),
  /**
   * @property {boolean} isShow
   */
  isShow: false,
  /**
   * @param answers
   */
  answers: Ember.computed('question', function() {
    const component = this;
    let answers = JSON.parse(
      JSON.stringify(component.get('question.answerDetails'))
    );
    let hints = component.get('question.hints');
    if (answers && hints != null) {
      answers.forEach(function(choice) {
        choice.hint = hints[`${choice.answer_category}_explanation`];
      });
    }
    return answers;
  }),
  // -------------------------------------------------------------------------
  // Observers
  /**
   * When the user changes the response
   */
  updateAnswerObserver: function() {
    this.notify(false);
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Set answer
   * */
  setAnswers: function() {
    if (this.get('hasUserAnswer')) {
      let userAnswer = this.get('userAnswer');
      this.set('answer', userAnswer);
      this.notify(true);
    }
    // set observer for answer update
    this.addObserver('answer', this.updateAnswerObserver);
  },

  /**
   * Notifies answer events
   * @param {boolean} onLoad if this was called when loading the component
   */
  notify: function(onLoad) {
    const component = this,
      answer = Ember.$.trim(component.get('answer'));
    let correct = component.get('isAnswerCompleted');
    component.notifyAnswerChanged(answer, correct);

    if (component.get('isAnswerCompleted')) {
      if (onLoad) {
        component.notifyAnswerLoaded(answer, correct);
      } else {
        component.notifyAnswerCompleted(answer, correct);
      }
    } else {
      component.notifyAnswerCleared(answer);
    }
  },
  toggleAction(isShow, category) {
    const component = this;
    component.set('category', category);
    component.set('isShow', !isShow);
  }
});
