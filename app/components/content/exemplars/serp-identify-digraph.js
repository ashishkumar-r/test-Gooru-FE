import Ember from 'ember';
import { removeHtmlTags, getDiff } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  classNames: ['exemplars', 'serp-identify-digraph'],

  isEdit: true,

  exemplarError: false,

  emptyUnderline: false,

  isDisableAddExemplar: Ember.computed.gte(
    'exemplars.length',
    'answers.length'
  ),
  answerIndex: null,
  didInsertElement() {
    const component = this;
    let eventTimer = {};
    component.initializeExemplarItems();
    component.$().on('mouseup touchstart touchend', '.text-edit', function(e) {
      eventTimer[e.type] = new Date().getTime();
      var text = window.getSelection();
      var answerIndex = component.$(this).data('answer-index');
      component.set('emptyUnderline', false);
      if (text.toString() !== '' && getDiff(e, eventTimer)) {
        component.set('answerIndex', answerIndex);
        let answerObject = Ember.Object.create(
          component.get('exemplars').get(answerIndex)
        );
        if (answerObject.answer_text.includes(text.toString())) {
          let sampleobject = Ember.A(answerObject.get('correct_answer'));
          sampleobject.pushObject(
            Ember.Object.create({
              text: text.toString(),
              audio: null,
              audio_file_url: null,
              isRecorded: false,
              seq: sampleobject.length + 1
            })
          );
          component
            .get('answers')
            .get(answerIndex)
            .get('correctAnswer')
            .push(text.toString());
          component.addUnderLineForSelectedWord(text, answerIndex);
          answerObject.set('correct_answer', sampleobject);
        }
      }
    });

    component.$().on('click', '.serp-hl-text-remove', function() {
      var index = component.$(this).data('answer-index');
      let removedText = component
        .$(this)
        .parent()
        .text();
      removedText = removedText.substring(0, removedText.length - 5);
      component
        .$(this)
        .parent()
        .contents()
        .unwrap();
      component.$(this).remove();
      component
        .get('answers')
        .get(index)
        .get('correctAnswer')
        .removeObject(removedText);
      let answerObject = Ember.Object.create(
        component.get('exemplars').get(index)
      );
      let submitAnswer = answerObject.get('correct_answer');
      let filterAnswer = submitAnswer.findBy('text', removedText);
      submitAnswer.removeObject(filterAnswer);
    });
  },

  actions: {
    onAddExemplar() {
      const component = this;
      component.set('exemplarError', false);
      var text = '';
      if (component.get('answers').length > 0) {
        for (let index = 0; index < component.get('answers').length; index++) {
          const result = component.get('answers')[index];
          var data = component
            .get('exemplars')
            .findBy('answer_text', result.text);
          if (!data) {
            text = component.get('answers')[index].text;
            break;
          }
        }
      }
      if (text) {
        component.get('exemplars').pushObject(
          Ember.Object.create({
            answer_text: removeHtmlTags(text),
            correct_answer: Ember.A([])
          })
        );
      }
    },
    onRemoveExemplar(index) {
      var result = Ember.Object.create(this.get('exemplars')[index]);
      var answerresult = this.get('answers').findBy(
        'text',
        result.get('answer_text')
      );
      if (answerresult) {
        answerresult.set('correctAnswer', []);
      }
      this.get('exemplars').removeObject(this.get('exemplars')[index]);
    }
  },
  initializeExemplarItems() {
    const component = this;
    let correctanswers = [];
    for (let index = 0; index < component.get('exemplars').length; index++) {
      const element = component.get('exemplars')[index];
      correctanswers.push(Ember.Object.create(element.correct_answer));
      element.correct_answer.map(data => {
        data = Ember.Object.create(data);
        component.hightLightDefaultWord(data.text, index, true);
        return data;
      });
    }
    component.set('correct_answer', correctanswers);
  },

  addUnderLineForSelectedWord(text, answerIndex) {
    var component = this;
    var start = text.anchorOffset;
    var end = text.focusOffset;
    let innerHTML = '';
    component
      .$(`.answer-edit-${answerIndex}`)[0]
      .childNodes.forEach(childNode => {
        if (
          childNode.data &&
          childNode.data.substring(start, end) === text.toString()
        ) {
          innerHTML =
            innerHTML +
            childNode.data.replace(
              text,
              $.trim(
                `<span class="serp-hl-text underline disable-select">${text}<span class="serp-hl-text-remove" data-answer-index="${answerIndex}"><i class="material-icons">clear</i></span></span>`
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

  hightLightDefaultWord(text, answerIndex, editMode) {
    var component = this;
    let innerHTML = '';
    let html = '';
    if (editMode) {
      html = `<span class="serp-hl-text underline disable-select">${text}<span class="serp-hl-text-remove" data-answer-index="${answerIndex}"><i class="material-icons">clear</i></span></span>`;
    } else {
      html = `<span class="serp-hl-text underline disable-select">${text}</span>`;
    }
    component
      .$(`.answer-edit-${answerIndex}`)[0]
      .childNodes.forEach(childNode => {
        if (childNode.data) {
          innerHTML = innerHTML + childNode.data.replace(text, $.trim(html));
        } else if (childNode.data) {
          innerHTML = innerHTML + childNode.data;
        } else {
          innerHTML = innerHTML + childNode.outerHTML;
        }
      });
    component.$(`.answer-edit-${answerIndex}`).html(innerHTML);
  }

  // -------------------------------------------------------------------------
  // Methods
});
