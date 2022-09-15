import QuestionComponent from './gru-question';
import Ember from 'ember';

/**
 * Indetify Digraph
 *
 * Component responsible for controlling the logic and appearance of a fill in the blank
 * question inside of the {@link player/gru-question-viewer.js}
 *
 * @module
 * @see controllers/player.js
 * @see components/player/gru-question-viewer.js
 * @augments Ember/Component
 */
export default QuestionComponent.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-identify-digraph'],

  // -------------------------------------------------------------------------
  // Actions
  answers: Ember.computed.alias('question.answers'),

  // -------------------------------------------------------------------------
  // Properties
  showCorrect: false,

  isShowPlay: false,

  // -------------------------------------------------------------------------
  // Events
  initInputEvents: function() {
    if (this.get('baseQuestion')) {
      this.set('isShowPlay', true);
      const digraphExercies = this.get('baseQuestion.answers').map(
        baseAnswer => {
          var data = this.get('baseQuestion.exemplarDocs').findBy(
            'answer_text',
            baseAnswer.get('text')
          );
          if (data) {
            return {
              answer_text: baseAnswer.get('text'),
              exemplar_answer: data.correct_answer,
              correct_answer: baseAnswer.get('correctAnswer')
            };
          }
        }
      );
      this.injectIdentifyDigraph(digraphExercies);
    }

    for (let index = 0; index < this.get('question.answers').length; index++) {
      const element = this.get('answers')[index];
      if (element.correctAnswer) {
        element.correctAnswer.map(data => {
          this.hightLightDefaultWord(data, index, true);
          return data;
        });
      }
    }
  }.on('didInsertElement'),

  // -------------------------------------------------------------------------
  // Properties

  userId: Ember.computed.alias('session.userId'),

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods

  injectIdentifyDigraph(digraphExercies) {
    var user = {
      userId: this.get('userId')
    };
    var content = {
      contentId: this.get('baseQuestion.id'),
      contentTitle: this.get('baseQuestion.title'),
      answers: digraphExercies
    };
    window.serp
      .languageDecode()
      .select('#serp-identify-digraph-answer-container')
      .dataIn(user, null, content)
      .underline()
      .render()
      .listener(function() {
        return;
      });
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
    if (component.$(`.answer-underline .answer-edit-${answerIndex}`)[0]) {
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
  }
});
