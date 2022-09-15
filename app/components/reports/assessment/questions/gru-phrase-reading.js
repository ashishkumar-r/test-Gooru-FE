import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';

/**
 * SERP Encoding Assessment
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

  classNames: ['reports', 'assessment', 'questions', 'gru-phrase-reading'],

  // -------------------------------------------------------------------------
  // Properties

  showCorrect: false,

  /**
   * @property {Array} answers
   * List of answers
   */
  answers: Ember.computed.alias('answerObj'),

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

  isPaused: false,

  audio: null,

  didInsertElement() {
    if (this.get('answers.length')) {
      let audio = this.get('answers').get('firstObject');
      this.set('audio', new Audio(audio.text));
    }
  },

  //Actions
  actions: {
    //Action triggered when play audio
    onPlayAudio() {
      const component = this;
      const _audio = component.get('audio');
      _audio.play();
      component.set('isPaused', true);
      _audio.onended = function() {
        component.set('isPaused', false);
      };
      _audio.ontimeupdate = function() {
        component
          .$('.answer-container .audio-progress .progress-filling')
          .css('width', `${(_audio.currentTime / _audio.duration) * 100}%`);
      };
    },

    onPauseAudio() {
      let audio = this.get('audio');
      audio.pause();
      this.set('isPaused', false);
    }
  }
});
