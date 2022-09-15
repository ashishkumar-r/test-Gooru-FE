import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-classic'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {boolean} showCorrect help to hide/show correct answer to users
   */
  showCorrect: false,

  userAnswers: Ember.computed('answerObj', function() {
    return this.get('answerObj')
      ? this.get('answerObj').map(item => {
        return { correctAnswer: item.text ? [item.text.slice(1, -1)] : [] };
      })
      : [];
  }),

  baseAnswers: Ember.computed('question', function() {
    return this.get('question.answers');
  }),

  // -----------------------------------------------------------------------
  // Events
  didInsertElement() {
    this.defaultHightlight();
  },

  // -----------------------------------------------------------------------
  // Methods

  /**
   * Help to highlight existing answer
   */

  defaultHightlight() {
    let component = this;
    let answers = component.get('baseAnswers');
    let userAnswers = component.get('userAnswers');
    let looperObj = component.get('showCorrect') ? answers : userAnswers;
    looperObj.forEach((item, index) => {
      let answerEl = component.$(`.answer-edit-${index} .answer-item-text`);
      let answerText = item.correctAnswer.length
        ? item.correctAnswer[0]
        : item.text;
      let replacedText = answerText.replace(/(\[.?\])/gi, match => {
        return `<span class="${match.length > 2 ? 'active' : ''}">${
          match.length > 2 ? match[1] : '_'
        }</span>`;
      });
      answerEl.html(component.wrapLetters(replacedText));
    });
  },

  /**
   * Help to wrap span tag for each letters
   */
  wrapLetters(text) {
    let letterGroups = '';
    let childEl = $(`<p>${text}</p>`)[0].childNodes;
    childEl.forEach(item => {
      if (item.nodeName === '#text') {
        for (let i = 0; i < item.data.length; i++) {
          letterGroups += `<span>${item.data[i]}</span>`;
        }
        return;
      }
      letterGroups += item.outerHTML;
    });
    return letterGroups;
  }
});
