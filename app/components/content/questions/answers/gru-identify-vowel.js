import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';
import { VOWEL_TYPES } from 'gooru-web/config/question';

export default Ember.Component.extend({
  // -----------------------------------------------------------
  // Attributes
  classNames: ['gru-identify-vowel'],

  // ------------------------------------------------------------
  // Properties

  answers: Ember.A([]),

  editMode: false,

  // ------------------------------------------------------------
  // Events

  didInsertElement() {
    let component = this;
    component.onLoad();
    component
      .$()
      .on('keyup', '.gru-identify-vowel-answer-item input', function() {
        let mainDiv = $(this).closest('.gru-identify-vowel-answer-item');
        let contentTag = mainDiv.find('.identify-vowel-container');
        let answersIndex = contentTag.data('answerIndex');
        component.defaultHighlighter(contentTag, this.value, answersIndex);
      });
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
    let component = this;
    let answers = component.get('answers');
    if (!answers.length) {
      var newAns = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        correctAnswer: [],
        isCorrect: true
      });
      answers.pushObject(newAns);
      return;
    }
    answers.forEach((answer, answerIndex) => {
      let contentTag = component.$(`.identify-vowel-edit-${answerIndex}`);
      if (answer.text) {
        component.defaultHighlighter(
          contentTag,
          answer.text,
          answerIndex,
          answer
        );
      }
    });
  },

  defaultHighlighter(contentTag, text, answerIndex, answer = null) {
    let component = this;
    let crossedClass = pIndex => {
      let crossLetter = answer.correctAnswer.find(
        cAns => parseInt(cAns.crossPosition, 0) === pIndex
      );
      if (crossLetter) {
        let className = 'selected';
        if (crossLetter.isCross) {
          className += ' crossed';
        }
        if (crossLetter.isShort) {
          className += ' short';
        }
        return className;
      }
    };

    let splitText = [...text]
      .map((item, index) => {
        return item !== ' '
          ? `<b class="selection ${
            answer ? crossedClass(index + 1) : ''
          }" data-b-index=${index + 1}>${item}</b>`
          : item;
      })
      .join('');
    contentTag.html(splitText);
    let popupSelectionDiv = component.popupSelectionDiv();
    contentTag.off('click');
    if (component.get('editMode')) {
      contentTag.on('click', '.selection', function(e) {
        popupSelectionDiv.off('click');
        let selectedText = this;
        popupSelectionDiv
          .css({
            top: `${e.pageY - 10}px`,
            left: `${e.pageX}px`
          })
          .show();
        popupSelectionDiv.on('click', '.backdrops', function() {
          popupSelectionDiv.hide();
          popupSelectionDiv.off('click');
        });
        popupSelectionDiv.on('click', 'span', function() {
          $(selectedText)
            .removeClass()
            .addClass($(this).attr('class'));
          component.updateAnsObj(answerIndex);
          popupSelectionDiv.off('click');
          popupSelectionDiv.hide();
        });
      });
    }
  },

  updateAnsObj(answerIndex) {
    let component = this;
    let correctAnswer = [];
    let element = component.$(`.identify-vowel-edit-${answerIndex}`);
    element.children('.selected').each((index, el) => {
      let clonedEl = $(el).clone();
      clonedEl.find('i').remove();
      clonedEl[0].normalize();
      correctAnswer.push({
        text: clonedEl[0].textContent,
        crossPosition: clonedEl[0].dataset.bIndex,
        isCross: clonedEl.hasClass('crossed'),
        isCorrect: true,
        isShort: clonedEl.hasClass('short')
      });
    });
    let answerObj = component.get('answers').get(answerIndex);
    answerObj.setProperties({
      correctAnswer
    });
  },

  popupSelectionDiv() {
    let component = this;
    let vowelTypes = VOWEL_TYPES;
    let parentEl = component.$('.gru-identify-vowel-container');
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
