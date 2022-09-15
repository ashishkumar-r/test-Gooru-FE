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
  classNames: ['gru-phrase-reading'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events
  initInputEvents: function() {
    let baseAnswers = this.get('baseQuestion.answers')
      ? this.get('baseQuestion.answers')
      : [];
    const decodingExcercies = baseAnswers.map(baseAnswer => {
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
    var content = {
      contentId: 'contentId',
      contentTitle: 'contentTitle',
      answers: decodingExcercies,
      isPhraseCued: true
    };
    window.serp
      .languageDecode()
      .select('#gru-phrase-reading-question-container')
      .dataIn(user, null, content)
      .wordsPerMinute()
      .render()
      .listener(function() {
        return;
      });
  }
});
