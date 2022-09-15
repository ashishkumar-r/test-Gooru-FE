import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';

/**
 * SERP Identify Digraph
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

  classNames: ['reports', 'assessment', 'questions', 'gru-identify-digraph'],

  answers: Ember.computed(
    'showCorrect',
    'question.answers',
    'answerObj',
    function() {
      return this.get('question.answers');
    }
  ),

  graderType: Ember.computed.alias('gradetype'),

  showCorrect: false,

  didInsertElement() {
    if (this.get('showCorrect')) {
      for (
        let index = 0;
        index < this.get('question.answers').length;
        index++
      ) {
        const element = this.get('answers')[index];
        if (element.correctAnswer) {
          element.correctAnswer.map(data => {
            this.hightLightDefaultWord(data, index, true);
            return data;
          });
        }
      }
    } else {
      var objectResult = this.get('answerObj')
        ? this.get('answerObj')
        : this.get('question.answerObject');
      objectResult.map((result, index) => {
        result.text.split(',').map(subresult => {
          var answerResult = this.get('question.answers').get(index);
          if (answerResult.correctAnswer.indexOf(subresult) !== -1) {
            this.hightLightDefaultWord(subresult, index, true);
          } else {
            this.hightLightDefaultWord(subresult, index, false);
          }
          return subresult;
        });
      });
    }
  },
  hightLightDefaultWord(text, answerIndex, status) {
    var component = this;
    let innerHTML = '';
    let html = '';
    if (status) {
      html = `<span class="correct">${text}</span>`;
    } else {
      html = `<span class="error">${text}</span>`;
    }
    component
      .$(`.answer-underline .answer-edit-${answerIndex}`)[0]
      .childNodes.forEach(childNode => {
        if (childNode.data) {
          innerHTML = innerHTML + childNode.data.replace(text, $.trim(html));
        } else if (childNode.data) {
          innerHTML = innerHTML + childNode.data;
        } else {
          innerHTML = innerHTML + childNode.outerHTML;
        }
      });
    component
      .$(`.answer-underline .answer-edit-${answerIndex}`)
      .html(innerHTML);
  }
});
