import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';
import { getSelectionList } from 'gooru-web/utils/utils';
import { VOWEL_TYPES } from 'gooru-web/config/question';

export default Ember.Component.extend({
  // -----------------------------------------------------------
  // Attributes
  classNames: ['gru-vowel-teams'],

  // ------------------------------------------------------------
  // Properties

  answers: Ember.A([]),

  editMode: false,

  // ------------------------------------------------------------
  // Events

  didInsertElement() {
    let component = this;
    component.onLoad();
    if (component.get('editMode')) {
      component
        .$()
        .on('mouseup touchend', '.vowel-teams-container', function(e) {
          component.initializeTool(component, e);
        });
      component
        .$()
        .on('keyup', '.gru-vowel-teams-answer-item input', function() {
          let mainDiv = $(this).closest('.gru-vowel-teams-answer-item');
          mainDiv.find('.vowel-teams-container').text(this.value);
        });
      component.closeActiveItem();
      this.selectVowels();
    }
  },

  // --------------------------------------------------------------
  // Actions

  actions: {
    onAddExcercise() {
      let answers = this.get('answers');
      var newAns = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        correctAnswer: [],
        isCorrect: true
      });
      answers.pushObject(newAns);
    },

    onDeleteAnswer(answer) {
      this.get('answers').removeObject(answer);
    }
  },

  // --------------------------------------------------------------
  // Methods

  onLoad() {
    let answers = this.get('answers');
    if (!answers.length) {
      var newAns = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        correctAnswer: [],
        isCorrect: true
      });
      answers.pushObject(newAns);
    }
    answers.forEach((item, answerIndex) => {
      if (item.correctAnswer.length) {
        let textDiv = this.$(`.vowel-team-edit-${answerIndex}`);
        textDiv
          .parent()
          .find('input')
          .attr('disabled', true);
        item.correctAnswer.forEach(cItem => {
          this.hightLightDefaultWord(
            cItem,
            answerIndex,
            this.get('editMode'),
            cItem.position
          );
        });
      }
    });
  },

  selectVowels() {
    let component = this;
    let popupSelectionDiv = component.popupSelectionDiv();
    component.$().on('click', '.serp-hl-text-span b', function(e) {
      let selectedText = this;
      popupSelectionDiv.off('click');
      popupSelectionDiv.on('click', '.backdrops', function() {
        popupSelectionDiv.hide();
        popupSelectionDiv.off('click');
      });
      popupSelectionDiv
        .css({
          top: `${e.pageY - 10}px`,
          left: `${e.pageX}px`
        })
        .show();
      popupSelectionDiv.on('click', 'span', function() {
        $(selectedText)
          .removeClass()
          .addClass($(this).attr('class'));
        popupSelectionDiv.off('click');
        popupSelectionDiv.hide();
        let mainDiv = $(selectedText).closest('.vowel-teams-container');
        component.updateAnsObj(mainDiv.data('answer-index'));
      });
    });
  },

  initializeTool(component, event) {
    let selectedWords = window.getSelection();
    if (selectedWords.toString() && selectedWords.toString().length >= 2) {
      let range = selectedWords.getRangeAt(0);
      let input = $(event.target)
        .closest('.gru-vowel-teams-answer-item')
        .find('input');
      input.attr('disabled', true);
      let span = document.createElement('span');
      span.classList.add('serp-hl-text-span');
      range.surroundContents(span);
      span.innerHTML = span.textContent
        .split('')
        .map(letter => `<b class="selection">${letter}</b>`)
        .join('');
      let closeTag = document.createElement('i');
      closeTag.classList.add('material-icons');
      closeTag.textContent = 'clear';
      span.appendChild(closeTag);
      component.updateAnsObj(event.target.dataset.answerIndex);
    }
    selectedWords.empty();
  },

  updateAnsObj(answerIndex) {
    let component = this;
    let element = component.$(`.vowel-team-edit-${answerIndex}`)[0];
    let activeNodes = getSelectionList(element.childNodes);
    let activeIndex = element.dataset.answerIndex;
    let answerObj = component.get('answers').get(activeIndex);
    answerObj.set('correctAnswer', activeNodes);
  },

  closeActiveItem() {
    let component = this;
    component.$().on('click', '.serp-hl-text-span i', function() {
      $(this)
        .siblings('b')
        .contents()
        .unwrap();
      $(this)
        .parent()
        .contents()
        .unwrap();
      let mainDiv = $(this).closest('.vowel-teams-container');
      if (!mainDiv.children('span').length) {
        mainDiv
          .parent()
          .find('input')
          .attr('disabled', false);
      }
      component.updateAnsObj(mainDiv.data('answer-index'));
      $(this).remove();
    });
  },

  hightLightDefaultWord(text, answerIndex, editMode) {
    var component = this;
    let innerHTML = '';
    let html = '';
    var start = text.start;
    var end = text.end;
    var fulltext = text.text;
    let findPosition = (index, itemName) => {
      let findItem = text[itemName] ? text[itemName] : [];
      return findItem.indexOf(index) !== -1;
    };
    let spanBox = fulltext
      .split('')
      .map(
        (letter, index) =>
          `<b class="selection ${
            findPosition(index, 'macronPositions') ? 'selected ' : ''
          } ${
            findPosition(index, 'crossPositions') ? 'selected crossed ' : ''
          }">${letter}</b>`
      )
      .join('');
    if (editMode) {
      html = `<span class="serp-hl-text-span">${spanBox}<i class="material-icons">clear</i></span>`;
    } else {
      html = `<span class="serp-hl-text-span">${spanBox}</span>`;
    }
    String.prototype.replaceBetween = function(start, end, what) {
      return this.substring(0, start) + what + this.substring(end);
    };
    component
      .$(`.vowel-team-edit-${answerIndex}`)[0]
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
    component.$(`.vowel-team-edit-${answerIndex}`).html(innerHTML);
  },

  popupSelectionDiv() {
    let component = this;
    let vowelTypes = VOWEL_TYPES.filter(item => !item.isHidden);
    let parentEl = component.$('.gru-vowel-teams-section');
    let selectionDiv = parentEl.find('.pop-selection-item');
    if (selectionDiv.length) {
      return selectionDiv;
    }
    selectionDiv = component.$('<div>').appendTo(parentEl);
    selectionDiv.addClass('pop-selection-item');
    selectionDiv.append('<div class="backdrops"></div>');
    vowelTypes.forEach(type => {
      selectionDiv.append(
        $('<span/>', {
          class: type.class,
          text: type.label
        })
      );
    });
    return selectionDiv;
  }
});
