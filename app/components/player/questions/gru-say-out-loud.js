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

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-say-out-loud'],

  isShowPlay: false,

  showCorrect: false,

  /**
   * @property {Array} answers
   * List of answers
   */
  answers: Ember.computed.alias('question.answers'),
  // -------------------------------------------------------------------------
  // Actions

  initInputEvents: function() {
    if (this.get('baseQuestion')) {
      this.set('isShowPlay', true);
      const decodingExcercies = this.get('baseQuestion.answers').map(
        (baseAnswer, index) => {
          return {
            answer_text: baseAnswer.get('text'),
            correct_answer: baseAnswer.get('correctAnswer'),
            answer_seq: index + 1
          };
        }
      );
      this.injectDecoding(decodingExcercies);
    }

    for (let index = 0; index < this.get('answers').length; index++) {
      const element = this.get('answers')[index];
      if (element.correctAnswer) {
        element.correctAnswer.map(data => {
          this.hightLightDefaultWord(data, index);
          return data;
        });
      }
    }
  }.on('didInsertElement'),

  // -------------------------------------------------------------------------
  // Properties

  userId: Ember.computed.alias('session.userId'),

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods

  injectDecoding(decodingExcercies) {
    var user = {
      userId: this.get('userId')
    };
    let accessibilitySettings = JSON.parse(
      window.localStorage.getItem('accessibility_settings')
    );
    var content = {
      contentId: this.get('baseQuestion.id'),
      contentTitle: this.get('baseQuestion.title'),
      answer_type: 'say_out_loud',
      answers: decodingExcercies,
      isHighContrast:
        accessibilitySettings && accessibilitySettings.is_high_contrast_enabled
          ? accessibilitySettings.is_high_contrast_enabled
          : false
    };
    window.serp
      .languageDecode()
      .select('#serp-say-out-loud-answer-container')
      .dataIn(user, null, content)
      .decoding()
      .render()
      .listener(function() {
        return;
      });
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
