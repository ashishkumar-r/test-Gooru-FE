import QuestionComponent from './gru-question';
import Ember from 'ember';

/**
 * Classic
 *
 * Component responsible for controlling the logic and appearance of a classic
 * question inside of the {@link player/gru-question-viewer.js}
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
  classNames: ['gru-classic'],

  // -------------------------------------------------------------------------
  // Actions

  answers: Ember.computed.alias('question.answers'),

  readOnly: false,

  // -------------------------------------------------------------------------
  // Properties

  // -------------------------------------------------------------------------
  // Event

  initInputEvents: function() {
    if (this.get('baseQuestion') || this.get('question.answers')) {
      let answers = this.get('baseQuestion.answers');
      if (this.get('readOnly') && !this.get('baseQuestion.answers')) {
        answers = this.get('question.answers') || {};
      }
      let answersObj = [];
      answers.forEach(item => {
        if (item.correctAnswer && item.correctAnswer.length) {
          answersObj.push({
            answer_text: item.correctAnswer[0] || '',
            text_image: item.textImage,
            additional_letters: item.additionalLetters
              ? item.additionalLetters.map(letter => letter.text)
              : []
          });
        }
      });
      this.injectEncoding(answersObj);
    }
  }.on('didInsertElement'),

  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------
  // Methods

  injectEncoding(baseAnswers) {
    var user = {
      userId: 'userId'
    };
    let accessibilitySettings = JSON.parse(
      window.localStorage.getItem('accessibility_settings')
    );
    var content = {
      contentId: 'contentId',
      contentTitle: 'contentTitle',
      answers: baseAnswers,
      isHighContrast:
        accessibilitySettings && accessibilitySettings.is_high_contrast_enabled
          ? accessibilitySettings.is_high_contrast_enabled
          : false
    };
    window.serp
      .languageDecode()
      .select('#classic-player-container')
      .dataIn(user, null, content)
      .classic()
      .render()
      .listener(function() {
        return;
      });
  }
});
