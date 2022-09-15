import Ember from 'ember';
import QuestionMixin from 'gooru-web/mixins/reports/assessment/questions/question';

/**
 * Hot Text Highlight
 *
 * Component responsible for controlling the logic and appearance of an Hot Text Highlight
 * question inside of the assessment report.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(QuestionMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'assessment', 'questions', 'gru-hot-text-highlight'],

  // -------------------------------------------------------------------------
  // Properties
  items: Ember.computed('question.answerObject.[]', function() {
    let component = this;
    let question = component.get('question');
    let questionUtil = component.getQuestionUtil(question);
    let correctAnswers = questionUtil.getCorrectAnswer();
    let showCorrect = component.get('showCorrect');
    let userAnswer = showCorrect ? correctAnswers : component.get('userAnswer');

    let items = questionUtil.getItems();
    items.forEach(function(item) {
      let selected = !!userAnswer.findBy(
        'text',
        showCorrect ? item.get('text') : item.get('text').trim()
      );
      item.set('selected', selected);
      item.set('correct', !!correctAnswers.findBy('text', item.get('text')));
      //getItems already return if it is correct or not
    });
    return items;
  })

  // -------------------------------------------------------------------------
  // Methods
});
