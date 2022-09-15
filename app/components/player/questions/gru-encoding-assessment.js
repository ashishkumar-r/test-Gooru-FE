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
  classNames: ['gru-encoding-assessment'],

  // -------------------------------------------------------------------------
  // Actions

  showCorrect: false,

  answers: Ember.computed.alias('question.answers'),

  isShowPlay: false,

  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------
  // Methods
  actions: {
    //Action triggered when play audio
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
  },
  initInputEvents: function() {
    if (this.get('baseQuestion')) {
      this.set('isShowPlay', true);
      const encodingAnswers = this.get('baseQuestion.answers').map(
        baseAnswer => {
          return {
            audio_file_url: baseAnswer.get('audioUrl'),
            answer_text: baseAnswer.get('text')
          };
        }
      );
      this.injectEncoding(encodingAnswers);
    }
  }.on('didInsertElement'),

  // -------------------------------------------------------------------------
  // Properties
  // -------------------------------------------------------------------------
  // Methods

  injectEncoding(baseAnswers) {
    let accessibilitySettings = JSON.parse(
      window.localStorage.getItem('accessibility_settings')
    );
    var user = {
      userId: 'userId'
    };
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
      .select('#serp-encoding-answer-container')
      .dataIn(user, null, content)
      .encoding()
      .render()
      .listener(function() {
        return;
      });
  }
});
