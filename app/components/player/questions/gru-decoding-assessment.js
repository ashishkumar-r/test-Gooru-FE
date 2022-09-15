import QuestionComponent from './gru-question';
import Ember from 'ember';

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
  classNames: ['gru-decoding-assessment'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Properties

  showCorrect: false,

  /**
   * @property {Array} answers
   * List of answers
   */
  answers: Ember.computed.alias('question.answers'),

  isShowPlay: false,
  /**
   * @property {Array} baseAnswers
   * List of base answers
   */
  baseAnswers: Ember.computed.alias('question.answers'),
  /**
   * @property {Array} exemplars
   * List of question exemplars
   */
  exemplars: Ember.computed.alias('question.exemplarDocs'),

  // -------------------------------------------------------------------------
  // Events
  initInputEvents: function() {
    if (this.get('baseQuestion')) {
      this.set('isShowPlay', true);
      const decodingExcercies = this.get('baseQuestion.answers').map(
        baseAnswer => {
          return {
            answer_text: baseAnswer.get('text')
          };
        }
      );
      this.injectDecoding(decodingExcercies);
    }
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
      .select('#serp-decoding-answer-container')
      .dataIn(user, null, content)
      .decoding()
      .render()
      .listener(function() {
        return;
      });
  },
  actions: {
    onPlayAudio(container, url) {
      const component = this;
      const _audio = new Audio(url);
      _audio.play();
      _audio.ontimeupdate = function() {
        component
          .$(
            `.answer-container .${container} .audio-progress .progress-filling`
          )
          .css('width', `${(_audio.currentTime / _audio.duration) * 100}%`);
      };
    }
  }
});
