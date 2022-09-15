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

  classNames: ['reports', 'assessment', 'questions', 'gru-say-out-loud'],

  // -------------------------------------------------------------------------
  // Properties

  showCorrect: false,

  /**
   * @property {Array} answers
   * List of answers
   */
  // answers: Ember.computed.alias('question.answers'),
  answers: Ember.computed(
    'showCorrect',
    'question.answers',
    'answerObj',
    function() {
      return this.get('showCorrect')
        ? this.get('question.answers')
        : this.get('answerObj')
          ? this.get('answerObj')
          : this.get('question.answerObject');
    }
  ),
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
  /**
   * @property {Boolean} isPause
   */
  isPause: false,
  /*
   * Hold the audio details
   */
  audioRecorder: null,

  //Actions
  actions: {
    //Action triggered when play audio
    onPlayAudio(container, url, index) {
      const component = this;
      let _audio = component.get('audioRecorder');
      if (!_audio || component.get('answerIndex') !== index) {
        _audio = new Audio(url);
        component.set('answerIndex', index);
      }
      component.set('audioRecorder', _audio);
      _audio.play();
      component.set('isPause', true);
      _audio.ontimeupdate = function() {
        component
          .$(
            `.answer-container .${container} .audio-progress .progress-filling`
          )
          .css('width', `${(_audio.currentTime / _audio.duration) * 100}%`);
      };
      _audio.addEventListener('ended', () => {
        component.set('isPause', false);
      });
    },
    //Action triggered when pause audio
    onPauseAudio() {
      const component = this;
      const audio = component.get('audioRecorder');
      audio.pause();
      component.set('isPause', false);
    }
  },
  didInsertElement() {
    for (let index = 0; index < this.get('answers').length; index++) {
      const element = this.get('answers')[index];
      if (element.correctAnswer) {
        element.correctAnswer.map(data => {
          this.hightLightDefaultWord(data, index);
          return data;
        });
      }
    }
  },
  hightLightDefaultWord(text, answerIndex) {
    var component = this;
    let innerHTML = '';
    var start = text.split(':')[1];
    var end = text.split(':')[2];
    var fulltext = text.split(':')[0];
    let html = `<span class="correct">${fulltext}</span>`;
    String.prototype.replaceBetween = function(start, end, what) {
      return this.substring(0, start) + what + this.substring(end);
    };
    if (component.$(`.answer-sayout .answer-edit-${answerIndex}`)[0]) {
      component
        .$(`.answer-sayout .answer-edit-${answerIndex}`)[0]
        .childNodes.forEach(childNode => {
          if (
            childNode.data &&
            childNode.data.substring(start, end) === fulltext
          ) {
            innerHTML =
              innerHTML +
              childNode.data.replaceBetween(start, end, $.trim(html));
          } else if (childNode.data) {
            innerHTML = innerHTML + childNode.data;
          } else {
            innerHTML = innerHTML + childNode.outerHTML;
          }
        });
      component.$(`.answer-sayout .answer-edit-${answerIndex}`).html(innerHTML);
    }
  }
});
