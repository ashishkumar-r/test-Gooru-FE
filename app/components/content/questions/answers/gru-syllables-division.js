import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

export default Ember.Component.extend({
  // ----------------------------------------------------------------
  // Attributes

  classNames: ['content', 'questions', 'answers', 'gru-syllables-division'],

  // -----------------------------------------------------------------
  // Properties

  answers: null,

  editMode: false,

  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    let component = this;
    var ansLength = this.get('answers').length;
    if (ansLength === 0) {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type: 'text',
        correctAnswer: [],
        isCorrect: true
      });
      this.get('answers').pushObject(newChoice);
    }
    if (component.get('editMode')) {
      component
        .$()
        .on('mouseup touchend', '.syllables-division-container', function() {
          component.wordSelection(component, this);
        });
      component.selectVowels();
      component.clearSelection();
      component
        .$()
        .on('keyup', '.gru-syllables-division-answer-item input', function() {
          let parentDiv = component
            .$(this)
            .closest('.gru-syllables-division-answer-item');
          parentDiv
            .find('.syllables-division-container')
            .html(component.wrapLetters(this.value));
        });
    }
    component.initialLoad();
  },

  // ------------------------------------------------------------------------
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

  // -------------------------------------------------------------------------
  // Methods

  initialLoad() {
    let answers = this.get('answers');
    let component = this;
    answers.forEach((item, answerIndex) => {
      component
        .$(`.syllables-division-edit-${answerIndex}`)
        .html(component.wrapLetters(item.text));
      if (item.correctAnswer.length) {
        item.correctAnswer.forEach(cItem => {
          this.hightLightDefaultWord(cItem, answerIndex, this.get('editMode'));
        });
      }
    });
  },

  wordSelection(component, _this) {
    let selectedText = window.getSelection();
    if (selectedText.toString()) {
      let range = selectedText.getRangeAt(0);
      let text = range.toString().replace('clear', '');
      if (text.length === 2) {
        range.deleteContents();
        range.insertNode(document.createTextNode(''));
        let span = document.createElement('span');
        span.classList.add('serp-hl-text-span');
        range.surroundContents(span);
        $(_this)
          .find('b:empty')
          .remove();
        let parentSpan = $(span).parent();
        if (parentSpan && parentSpan.prop('tagName') === 'SPAN') {
          parentSpan.find('i').remove();
          parentSpan.contents().unwrap();
        }
        for (let i = 0; i < text.length; i++) {
          $(span).append($('<b/>', { text: text[i] }));
        }
        $(_this)
          .find('span:not(:has(i))')
          .append('<i class="material-icons">clear</i>');
        $(_this)
          .find('span:not(:has(b))')
          .remove();
        selectedText.empty();
        _this.normalize();
        component.clearSelection(_this);
        component.arrowLine(_this);
        component.getSelectedTag();
      }
    }
  },

  hightLightDefaultWord(text, answerIndex) {
    var component = this;
    var start = text.start;
    var end = text.end;
    let parentEl = component.$(`.syllables-division-edit-${answerIndex}`);
    parentEl
      .find(`b[data-index=${start}], b[data-index =${end}]`)
      .wrapAll('<span class="serp-hl-text-span"></span>');
    parentEl
      .find('span:not(:has(i))')
      .append('<i class="material-icons">clear</i>');
    if (text.selectedIndex.length) {
      text.selectedIndex.forEach(sIndex => {
        parentEl.find(`b[data-index=${sIndex}]`).addClass('selected');
      });
    }
  },

  selectVowels() {
    let component = this;
    component.$().on('click', '.syllables-division-container > b', function() {
      $(this).toggleClass('selected');
      component.getSelectedTag();
    });
  },

  clearSelection() {
    let component = this;
    component
      .$()
      .on('click', '.syllables-division-container span i', function() {
        let span = $(this).parent('span');
        if (span.prev('span') && span.prev('span').children('b').length <= 1) {
          span.prev('span').append(span.find('b:first'));
        }
        if (span.next('span') && span.next('span').children('b').length <= 1) {
          span.next('span').prepend(span.find('b:last'));
        }
        span.contents().unwrap();
        component.arrowLine(
          $(this).closest('.syllables-division-container')[0]
        );
        $(this).remove();
        component.getSelectedTag();
      });
  },

  getSelectedTag() {
    let component = this;
    let answers = component.get('answers');
    answers.forEach((answer, answerIndex) => {
      let activeItem = [];
      let containerList = $(`.syllables-division-edit-${answerIndex}`)[0];
      let childNodes = containerList.childNodes;
      let position = 0;
      let count = -1;
      let selectedIndex = [];
      let i = -1;
      childNodes.forEach(node => {
        if (node.tagName === 'B') {
          i++;
        }
        if (node.tagName === 'SPAN') {
          i = i + $(node).children('b').length;
        }
        if (node.className === 'selected') {
          selectedIndex.push(i);
        }
      });
      childNodes.forEach(node => {
        let nodeContent = {};
        let nodeEl = $(node).clone();
        if (nodeEl.hasClass('serp-hl-text-span')) {
          nodeEl.find('i').remove();
          let bLength = nodeEl.children('b').length;
          nodeContent.start = count + 1;
          nodeContent.end = count + bLength;
          nodeContent.text = nodeEl.text();
          nodeContent.position = position;
          nodeContent.selectedIndex = selectedIndex;
          activeItem.push(nodeContent);
          position++;
          nodeContent = {};
          count = count + bLength;
        } else {
          count++;
        }
      });
      answer.set('correctAnswer', activeItem);
    });
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
