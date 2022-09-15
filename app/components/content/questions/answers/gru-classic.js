import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

export default Ember.Component.extend({
  // ----------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'questions', 'answers', 'gru-classic'],

  // ----------------------------------------------------------------------
  // Properties

  /**
   * Answers List
   */
  answers: null,

  /**
   * Is in edit mode
   */
  editMode: false,

  // -----------------------------------------------------------------------
  // Events

  didInsertElement() {
    let answers = this.get('answers');
    if (!answers.length) {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: '',
        isCorrect: true,
        textImage: null,
        additionalLetters: [],
        correctAnswer: [],
        type: 'text'
      });
      this.get('answers').pushObject(newChoice);
    }

    if (this.get('editMode')) {
      this.initialize();
    }
    this.defaultHightlight();
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Add new answer
     */
    onAddExcercise: function() {
      let newAnswerItem = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: '',
        isCorrect: true,
        correctAnswer: [],
        textImage: null,
        additionalLetters: [],
        type: 'text'
      });
      this.get('answers').pushObject(newAnswerItem);
    },

    /**
     * Remove answer object from answers
     */
    onDeleteAnswer(answer) {
      this.get('answers').removeObject(answer);
    },

    addExtraLetters(answer) {
      answer.get('additionalLetters').pushObject({ text: null });
    },

    removeLetter(answer, letter) {
      answer.get('additionalLetters').removeObject(letter);
    }
  },

  // -------------------------------------------------------------------
  // Methods

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
  },

  /**
   * Help to initialize the answer text
   */
  initialize() {
    let component = this;
    component
      .$('.classic-answer-panel')
      .on('keyup', '.answer-input-section input', function() {
        let wrappedLetters = component.wrapLetters(this.value);
        let parentEl = $(this).closest('.answer-section');
        let answerIndex = parentEl.data('answer-index');
        component.parseAnswerText(answerIndex, this.value);
        parentEl.find('.answer-text').html(wrappedLetters);
      });
    component
      .$('.classic-answer-panel')
      .on('click', '.answer-actions .answer-text span', function() {
        $(this).toggleClass('active');
        let parentEl = $(this).closest('.answer-text');
        component.parseCorrectAnswer(parentEl);
      });
  },

  /**
   * Method help to parse answer text
   */
  parseAnswerText(answerIndex, text) {
    let answers = this.get('answers');
    let answerObj = answers.get(answerIndex);
    answerObj.set('textImage', null);
    answerObj.set('text', text);
  },

  /**
   * Method help to parse answer text
   */
  parseCorrectAnswer(activeEl) {
    let answers = this.get('answers');
    let answerIndex = activeEl.data('answer-index');
    let answerObj = answers.get(answerIndex);
    let correctAnswer = [];
    let clonedEl = activeEl.clone();
    let activeSpan = clonedEl.find('span').filter('.active');
    if (activeSpan.length) {
      activeSpan.each((index, item) => {
        $(item).text(`[${$(item).text()}]`);
      });
      let textContent = clonedEl.text();
      correctAnswer.push(textContent);
    }
    answerObj.set('correctAnswer', correctAnswer);
    const isErrorMsg = correctAnswer.length === 0;
    answerObj.set('isShowErrorMsg', isErrorMsg);
  },

  /**
   * Help to highlight existing answer
   */

  defaultHightlight() {
    let component = this;
    let answers = component.get('answers');
    answers.forEach((item, index) => {
      let answerEl = component.$(`.answer-edit-${index}`);
      let answerText = item.correctAnswer.length
        ? item.correctAnswer[0]
        : item.text;
      let replacedText = answerText.replace(/(\[[^[\]]+])/gi, match => {
        return `<span class="active">${match[1]}</span>`;
      });
      answerEl.html(component.wrapLetters(replacedText));
    });
  }
});
