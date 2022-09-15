import QuestionComponent from './gru-question';

/**
 * Fill in the blank
 *
 * Component responsible for controlling the logic and appearance of a fill in the blank
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
  classNames: ['gru-words-per-minute'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events
  initInputEvents: function() {
    let questions =
      this.get('question.answers') || this.get('baseQuestion.answers');
    const decodingExcercies =
      questions &&
      questions.map(baseAnswer => {
        return {
          answer_text: baseAnswer.get('text')
        };
      });
    this.injectDecoding(decodingExcercies);
  }.on('didInsertElement'),

  // -------------------------------------------------------------------------
  // Properties

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods

  injectDecoding(decodingExcercies) {
    var user = {
      userId: 'userId'
    };
    let accessibilitySettings = JSON.parse(
      window.localStorage.getItem('accessibility_settings')
    );
    var content = {
      contentId: 'contentId',
      contentTitle: 'contentTitle',
      answers: decodingExcercies,
      isHighContrast:
        accessibilitySettings && accessibilitySettings.is_high_contrast_enabled
          ? accessibilitySettings.is_high_contrast_enabled
          : false
    };
    window.serp
      .languageDecode()
      .select('#serp-words-per-minute-container')
      .dataIn(user, null, content)
      .wordsPerMinute()
      .render()
      .listener(function() {
        return;
      });
  }
});
