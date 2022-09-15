import Ember from 'ember';
import QuestionMixin from 'quizzes-addon/mixins/reports/assessment/questions/question';
import { VOWELS_LETTERS } from 'gooru-web/config/question';
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

  classNames: ['reports', 'assessment', 'questions', 'gru-identify-vowel'],

  // -------------------------------------------------------------------------
  // Properties

  didInsertElement() {
    let component = this;
    if (this.get('baseAnswers') && this.get('baseAnswers').length) {
      this.get('baseAnswers').forEach((element, answerIndex) => {
        let elementItem = !component.get('showCorrect')
          ? component.get('answerObj')[answerIndex]
          : element;
        let correctAnswer = !component.get('showCorrect')
          ? JSON.parse(elementItem.text)
          : element.correctAnswer;
        for (let index = 0; index < correctAnswer.length; index++) {
          let contentTag = component.$(`.identify-vowel-edit-${answerIndex}`);
          component.defaultHighlighter(
            contentTag,
            element.text,
            answerIndex,
            correctAnswer
          );
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

  defaultHighlighter(contentTag, text, answerIndex, answer = null) {
    let crossedClass = pIndex => {
      let crossLetter = answer.find(
        cAns => parseInt(cAns.crossPosition, 0) === pIndex
      );
      let className = 'selected';
      if (crossLetter) {
        if (crossLetter.isCross) {
          className = 'crossed';
        }
        if (crossLetter.isShort) {
          className = 'short';
        }
        return className;
      }
    };
    let isVowels = letter => {
      return VOWELS_LETTERS.indexOf(letter) !== -1 ? 'selected' : '';
    };

    let splitText = [...text]
      .map((item, index) => {
        return item !== ' '
          ? `<b class="${this.get('showCorrect') ? isVowels(item) : ''} ${
            answer ? crossedClass(index + 1) : ''
          }" data-b-index=${index + 1}>${item}</b>`
          : item;
      })
      .join('');
    contentTag.html(splitText);
  }
});
