import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';
import { BASE_WORD_AFFIX } from 'gooru-web/config/question';
import { getDiff } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // --------------------------------------------------------------
  // Attributes

  classNames: ['gru-base-words'],

  // --------------------------------------------------------------
  // Properties

  answers: Ember.A(),

  disableEditorButtons: true,

  selectionOrder: false,

  editMode: false,

  activeTextItem: null,

  eventTimer: {},

  selectedType: Ember.computed('answers', function() {
    let answers = this.get('answers');
    let type = 'basewordone';
    if (answers.length) {
      let firstObj = answers.get('firstObject');
      type = firstObj.type;
    }
    return type;
  }),

  baseWordAffix: BASE_WORD_AFFIX,

  // ---------------------------------------------------------------
  // Event

  didInsertElement() {
    let component = this;
    if (component.get('editMode')) {
      component
        .$()
        .on('mouseup touchstart touchend', '.base-answer-container', function(
          e
        ) {
          let eventTimer = component.get('eventTimer');
          eventTimer[e.type] = new Date().getTime();
          component.wordSelectionEvent(e, component);
        });

      component
        .$()
        .on('keyup', '.gru-base-words-answer-item input', function(e) {
          component
            .$(e.target)
            .closest('.gru-base-words-answer-item')
            .find('.base-answer-container')
            .text(e.target.value);
        });

      component.$().on('click', '.serp-hl-text-remove', function() {
        var index = component.$(this).data('answer-index');
        var textlen = component.$(this).data('textlen');
        var newTag = component.$(`.base-word-edit-${index}`);
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
        if (newTag.children().length <= 0) {
          let inputField = newTag
            .closest('.gru-base-words-answer-item')
            .find('input');
          inputField.attr('disabled', false);
        }
        submitAnswer.map((e, index) => {
          if (textlen === parseInt(e.position) && submitAnswer[index + 1]) {
            var val = submitAnswer[index + 1];
            var totalendlen = parseInt(e.end);
            var totalstartlen = totalendlen + parseInt(val.start);
            var totalendlength = totalendlen + parseInt(val.end);
            let textvalue = {
              word_text: val.word_text,
              start: totalstartlen,
              end: totalendlength,
              position: submitAnswer.length,
              word_text_type: component.get('selectedType')
            };
            submitAnswer[index + 1] = textvalue;
          }
          if (textlen !== parseInt(e.position)) {
            filterAnswer.push(e);
          }
        });
        answerObject.set('correctAnswer', filterAnswer);
      });
    }

    component.initializeValue();
  },

  // ---------------------------------------------------------------
  // Actions
  actions: {
    onAddExcercise() {
      let component = this;
      let answers = component.get('answers');
      let answer = {
        text: '',
        type: component.get('selectedType'),
        baseWords: Ember.A([]),
        correctAnswer: [],
        isCorrect: true
      };
      answers.pushObject(
        Answer.create(Ember.getOwner(component).ownerInjection(), answer)
      );
    },

    onDeleteAnswer(answer) {
      this.get('answers').removeObject(answer);
    }
  },

  // ----------------------------------------------------------------
  // Methods

  initializeValue() {
    let answers = this.get('answers');
    if (answers && answers.length) {
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
            this.get('editMode'),
            elements.position
          );
        }
      });
    }
  },

  wordSelectionEvent(e, component) {
    let eventTimer = component.get('eventTimer');
    var text = window.getSelection();
    var start = text.anchorOffset;
    var end = text.focusOffset;
    var answerIndex = component.$(e.target).data('answer-index');
    let answerObject = component.get('answers').get(answerIndex);
    let childLen = component.$(e.target).children('.serp-hl-text').length;
    let selectedType = component.get('selectedType');
    if (
      text.anchorNode.textContent.substring(start, end) !== text.toString() ||
      text.anchorNode.parentElement.tagName === 'SPAN' ||
      (selectedType === 'basewordone' && childLen > 0) ||
      (selectedType === 'basewordtwo' && childLen > 1)
    ) {
      return;
    }
    component.set('selectionOrder', false);
    if (end < start) {
      component.set('selectionOrder', true);
      return null;
    }
    if (text.toString() !== '' && getDiff(e, eventTimer)) {
      component
        .$(e.target)
        .closest('.gru-base-words-answer-item')
        .find('input')
        .attr('disabled', true);
      let submitAnswer = answerObject.get('correctAnswer');
      let lasttext = {
        word_text: text.toString(),
        start,
        end,
        position: submitAnswer.length,
        word_text_type: selectedType
      };

      if (selectedType === 'basewordaffix') {
        let parentEl = component
          .$(e.target)
          .closest('.gru-base-words-answer-item');
        parentEl.find('.base-word-affix-blk').remove();
        this.set('activeTextItem', lasttext);
        let listEl = '';
        BASE_WORD_AFFIX.forEach(item => {
          listEl += `<li data-value='${item.name}'>${item.label}</li>`;
        });
        let popupElement = document.createElement('ul');
        popupElement.classList.add('base-word-affix-blk');
        popupElement.style.left = `${e.pageX}px`;
        popupElement.innerHTML = listEl;

        $(popupElement).on('click', 'li', function(et) {
          let wordTextType = component.$(et.target).data('value');
          lasttext.word_text_type = wordTextType;
          submitAnswer.pushObject(lasttext);
          answerObject.set('correctAnswer', submitAnswer);
          component.hightLightDefaultWord(
            lasttext,
            answerIndex,
            component.get('editMode'),
            submitAnswer.length - 1
          );
          parentEl.find('.base-word-affix-blk').remove();
        });
        parentEl.append(popupElement);
        return;
      }

      submitAnswer.pushObject(lasttext);
      answerObject.set('correctAnswer', submitAnswer);
      component.addUnderLineForSelectedWord(
        text,
        answerIndex,
        submitAnswer.length - 1
      );
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
      .$(`.base-word-edit-${answerIndex}`)[0]
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
    component.$(`.base-word-edit-${answerIndex}`).html(innerHTML);
  },

  hightLightDefaultWord(text, answerIndex, editMode, textLength) {
    var component = this;
    let innerHTML = '';
    let html = '';
    var start = text.start;
    var end = text.end;
    var fulltext = text.word_text;
    component
      .$(`.base-word-edit-${answerIndex}`)
      .closest('.gru-base-words-answer-item')
      .find('input')
      .attr('disabled', true);
    if (editMode) {
      html = `<span class="serp-hl-text underline disable-select">${fulltext}<span class="serp-hl-text-remove" data-answer-index="${answerIndex}" data-textlen="${textLength}"><i class="material-icons">clear</i></span></span>`;
    } else {
      html = `<span class="serp-hl-text underline disable-select">${fulltext}</span>`;
    }
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
