import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';
import { getDiff } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['content', 'questions', 'answers', 'gru-say-out-loud'],

  idEditMode: false,

  selectionOrder: false,

  didInsertElement() {
    const component = this;
    component.getInitialValue(component.get('editMode'));
    let eventTimer = {};
    component.$().on('mouseup touchstart touchend', '.text-edit', function(e) {
      eventTimer[e.type] = new Date().getTime();
      var text = window.getSelection();
      var start = text.anchorOffset;
      var end = text.focusOffset;
      if (
        text.anchorNode.textContent.substring(start, end) !== text.toString() ||
        text.anchorNode.parentElement.tagName === 'SPAN'
      ) {
        return;
      }
      var answerIndex = component.$(this).data('answer-index');
      let answerObject = component.get('answers').get(answerIndex);
      component.set('selectionOrder', false);
      if (end < start) {
        component.set('selectionOrder', true);
        return null;
      }
      if (text.toString() !== '' && getDiff(e, eventTimer)) {
        let submitAnswer = answerObject.get('correctAnswer');
        let lasttext = `${text.toString()}:${start}:${end}:${
          submitAnswer.length
        }`;
        submitAnswer.pushObject(lasttext);
        answerObject.set('correctAnswer', submitAnswer);
        component.addUnderLineForSelectedWord(
          text,
          answerIndex,
          submitAnswer.length - 1
        );
      }
    });

    component.$().on('click', '.serp-hl-text-remove', function() {
      var index = component.$(this).data('answer-index');
      var textlen = component.$(this).data('textlen');
      var newTag = $(`.answer-edit-${index}`);
      component
        .$(this)
        .parent()
        .contents()
        .unwrap();
      component.$(this).remove();
      newTag.html(newTag.html().trim());
      let answerObject = component.get('answers').get(index);
      let submitAnswer = answerObject.get('correctAnswer');
      let filterAnswer = [];
      submitAnswer.map((e, index) => {
        if (textlen === parseInt(e.split(':')[3]) && submitAnswer[index + 1]) {
          var val = submitAnswer[index + 1];
          var totalendlen = parseInt(e.split(':')[2]);
          var totalstartlen = totalendlen + parseInt(val.split(':')[1]);
          var totalendlength = totalendlen + parseInt(val.split(':')[2]);
          var textvalue = `${
            val.split(':')[0]
          }:${totalstartlen}:${totalendlength}:${val.split(':')[3]}`;
          submitAnswer[index + 1] = textvalue;
        }
        if (textlen !== parseInt(e.split(':')[3])) {
          filterAnswer.push(e);
        }
      });
      answerObject.set('correctAnswer', filterAnswer);
    });
  },

  getInitialValue(editMode) {
    var ansLength = this.get('answers').length;
    if (ansLength === 0) {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        correctAnswer: [],
        isCorrect: true
      });
      this.get('answers').pushObject(newChoice);
    } else {
      this.get('answers').forEach((element, answerIndex) => {
        for (
          let index = 0;
          index < element.get('correctAnswer').length;
          index++
        ) {
          const elements = element.get('correctAnswer').get(index);
          this.hightLightDefaultWord(
            elements,
            answerIndex,
            editMode,
            elements.split(':')[3]
          );
        }
      });
    }
  },

  addUnderLineForSelectedWord(text, answerIndex, textLength) {
    var component = this;
    var start = text.anchorOffset;
    var end = text.focusOffset;
    let innerHTML = '';
    String.prototype.replaceBetween = function(start, end, what) {
      return this.substring(0, start) + what + this.substring(end);
    };
    component
      .$(`.answer-edit-${answerIndex}`)[0]
      .childNodes.forEach(childNode => {
        if (
          childNode.data &&
          childNode.data.substring(start, end) === text.toString()
        ) {
          innerHTML =
            innerHTML +
            childNode.data.replaceBetween(
              start,
              end,
              $.trim(
                `<span class="serp-hl-text underline disable-select">${text}<span class="serp-hl-text-remove" data-answer-index="${answerIndex}" data-textlen="${textLength}"><i class="material-icons">clear</i></span></span>`
              )
            );
        } else if (childNode.data) {
          innerHTML = innerHTML + childNode.data;
        } else {
          innerHTML = innerHTML + childNode.outerHTML;
        }
      });
    component.$(`.answer-edit-${answerIndex}`).html(innerHTML);
  },

  hightLightDefaultWord(text, answerIndex, editMode, textLength) {
    var component = this;
    let innerHTML = '';
    let html = '';
    var start = text.split(':')[1];
    var end = text.split(':')[2];
    var fulltext = text.split(':')[0];
    if (editMode) {
      html = `<span class="serp-hl-text underline disable-select">${fulltext}<span class="serp-hl-text-remove" data-answer-index="${answerIndex}" data-textlen="${textLength}"><i class="material-icons">clear</i></span></span>`;
    } else {
      html = `<span class="serp-hl-text underline disable-select">${fulltext}</span>`;
    }
    String.prototype.replaceBetween = function(start, end, what) {
      return this.substring(0, start) + what + this.substring(end);
    };
    component
      .$(`.answer-edit-${answerIndex}`)[0]
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
    component.$(`.answer-edit-${answerIndex}`).html(innerHTML);
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Add new answer choice
    addNewChoice: function() {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        correctAnswer: [],
        isCorrect: true
      });
      this.get('answers').pushObject(newChoice);
    },
    //Remove existing answer
    removeChoice: function(answer) {
      if (this.get('references')) {
        this.get('references').map(firstResult => {
          if (
            firstResult &&
            answer.text &&
            firstResult.audio_text.trim() === answer.text.trim()
          ) {
            this.get('references').removeObject(firstResult);
          } else if (!firstResult.audio_text && !firstResult.audio_url) {
            this.get('references').removeObject(firstResult);
          }
        });
      }
      this.get('answers').removeObject(answer);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  answers: null,
  /**
   * Multiple Choice max answers
   * */
  maxAnswers: 10,

  /**
   * Is in edit mode
   */
  editMode: false,

  /**
   * @property {boolean}
   */
  disableEditorButtons: Ember.computed.not('showAdvancedEditor'),

  /**
   * @type {Ember.A}
   */
  hasLimitAnswers: Ember.computed('answers.[]', function() {
    return this.get('answers').length >= this.get('maxAnswers');
  })
});
