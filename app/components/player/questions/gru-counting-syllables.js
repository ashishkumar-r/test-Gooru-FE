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
  classNames: ['counting-syllables'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events
  initInputEvents: function() {
    const decodingExcercies =
      this.get('question.answers') &&
      this.get('question.answers').map(baseAnswer => {
        return {
          answer_text: baseAnswer.get('text'),
          correct_answer: baseAnswer.get('correctAnswer')
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
      answers: decodingExcercies
    };
    window.serp
      .languageDecode()
      .select('#serp-counting-syllables-tool-container')
      .dataIn(user, null, content)
      .countingSyllables()
      .render()
      .listener(function() {
        return;
      });
  }
});
