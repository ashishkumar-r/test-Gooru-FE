import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';
import { sec2time } from 'gooru-web/utils/utils';

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

  classNames: ['reports', 'assessment', 'questions', 'gru-words-per-minute'],

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

  audioObject: Ember.computed('answers', function() {
    let answers = this.get('answers');
    let answersDetails = answers ? answers.get('firstObject') : null;
    answersDetails =
      answersDetails && answersDetails.text
        ? JSON.parse(answersDetails.text)
        : null;
    return answersDetails;
  }),

  audio: null,

  isPauseAudio: false,

  wpmCount: 0,

  wpmAvgCount: 0,

  selectedText: null,

  didInsertElement() {
    const component = this;
    let answerObject = this.get('audioObject');
    if (answerObject) {
      this.set('selectedText', answerObject.selectedText);
      let wpmCount = answerObject.selectedText.wpmCount || 0;
      let speechText = answerObject.speechText.fullAudioText.split(' ').length;
      let avgWpmcount = answerObject.speechText.avgWordCount
        ? answerObject.speechText.avgWordCount
        : 0;
      avgWpmcount = avgWpmcount < speechText ? avgWpmcount : speechText;
      component.set(
        'audioDuration',
        sec2time(component.get('selectedText').audioLength / 1000 || 0)
      );
      this.set('wpmAvgCount', avgWpmcount);
      this.setProperties({ wpmCount });
      let audioUrl = answerObject.value;
      this.set('audio', new Audio(audioUrl));
    }
  },

  //Actions
  actions: {
    //Action triggered when play audio
    onPlayAudio() {
      const component = this;
      let _audio = component.get('audio');
      _audio.play();
      component.set('isPauseAudio', true);
      _audio.onended = () => {
        component.set('isPauseAudio', false);
      };
      _audio.ontimeupdate = function() {
        component
          .$('.answer-container .audio-progress .progress-filling')
          .css('width', `${(_audio.currentTime / _audio.duration) * 100}%`);

        let timerEl = component.$('.wpm-timer-section .timer-count');
        timerEl.find('.current-count').html(sec2time(_audio.currentTime));
        timerEl
          .find('.duration')
          .html(
            sec2time(component.get('selectedText').audioLength / 1000 || 0)
          );
      };
    },

    onPauseAudio() {
      let audio = this.get('audio');
      audio.pause();
      this.set('isPauseAudio', false);
    }
  }
});
