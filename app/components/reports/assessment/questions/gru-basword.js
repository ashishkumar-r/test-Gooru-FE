import Ember from 'ember';
import QuestionMixin from 'quizzes-addon/mixins/reports/assessment/questions/question';

/**
 * SERP Underline
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

  classNames: ['reports', 'assessment', 'questions', 'gru-baseword'],

  // -------------------------------------------------------------------------
  // Properties

  didInsertElement() {
    if (this.get('baseAnswers') && this.get('baseAnswers').length) {
      this.get('baseAnswers').forEach((element, answerIndex) => {
        let elementItem = !this.get('showCorrect')
          ? this.get('answerObj')[answerIndex]
          : element;
        let correctAnswer = !this.get('showCorrect')
          ? JSON.parse(elementItem.text)
          : element.correctAnswer;
        for (let index = 0; index < correctAnswer.length; index++) {
          const elements = correctAnswer[index];
          this.hightLightDefaultWord(elements, answerIndex);
        }
      });
    }
  },

  showCorrect: false,

  baseAnswers: Ember.computed('question', function() {
    return this.get('question.answers');
  }),

  // ---------------------------------------------------------------
  // Methods

  hightLightDefaultWord(text, answerIndex) {
    var component = this;
    let innerHTML = '';
    let html = '';
    var start = text.start;
    var end = text.end;
    var fulltext = text.word_text;
    let isCorrect = true;

    html = `<span class="serp-hl-text basword-select ${
      isCorrect ? 'correct' : 'wrong'
    } disable-select">${fulltext}</span>`;
    String.prototype.replaceBetween = function(start, end, what) {
      return this.substring(0, start) + what + this.substring(end);
    };
    component
      .$(`.base-word-edit-${answerIndex}`)[0]
      .childNodes.forEach(childNode => {
        if (
          childNode.data &&
          childNode.data.substring(start, end) === fulltext
        ) {
          innerHTML =
            innerHTML + childNode.data.replaceBetween(start, end, $.trim(html));
        } else if (childNode.data) {
          innerHTML = innerHTML + childNode.data;
        } else {
          innerHTML = innerHTML + childNode.outerHTML;
        }
      });
    component.$(`.base-word-edit-${answerIndex}`).html(innerHTML);
  }
});
