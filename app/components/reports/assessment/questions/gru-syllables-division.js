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

  classNames: ['reports', 'assessment', 'questions', 'gru-syllables-division'],

  // -------------------------------------------------------------------------
  // Properties

  didInsertElement() {
    if (this.get('baseAnswers') && this.get('baseAnswers').length) {
      this.get('baseAnswers').forEach((element, answerIndex) => {
        this.$(`.syllables-division-edit-${answerIndex}`).html(
          this.wrapLetters(element.text)
        );
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

  // ---------------------------------------------------------------------
  // Methods
  hightLightDefaultWord(text, answerIndex) {
    var component = this;
    var start = text.start;
    var end = text.end;
    let parentEl = component.$(`.syllables-division-edit-${answerIndex}`);
    parentEl
      .find(`b[data-index=${start}], b[data-index =${end}]`)
      .wrapAll('<span class="serp-hl-text-span"></span>');

    if (text.selectedIndex.length) {
      text.selectedIndex.forEach(sIndex => {
        parentEl.find(`b[data-index=${sIndex}]`).addClass('selected');
      });
    }
    component.arrowLine(parentEl[0]);
  },

  wrapLetters(value) {
    let text = '';
    if (value && value.length) {
      for (let i = 0; i < value.length; i++) {
        text += `<b data-index=${i}>${value[i]}</b>`;
      }
    }
    return text;
  },
  arrowLine(_this) {
    $(_this)
      .find('span')
      .removeClass('left-line');
    $(_this)
      .find('span')
      .each((index, el) => {
        if ($(el).children('b').length <= 1) {
          if ($(el).prev('span')[0]) {
            $(el).addClass('left-line');
          }
        }
      });
  }
});
