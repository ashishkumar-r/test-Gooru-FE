import Ember from 'ember';
import QuestionComponent from './gru-question';

/**
 * Reorder Question
 *
 * Component responsible for controlling the logic and appearance of the answers for
 * a reorder question inside of the {@link player/gru-question-viewer.js}
 *
 * @module
 * @see controllers/player.js
 * @see components/player/gru-question-viewer.js
 * @augments player/questions/gru-question.js
 */
export default QuestionComponent.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-reorder'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events
  initSortableList: Ember.on('didInsertElement', function() {
    const component = this;
    component.setAnswers();
    if (!component.get('hasUserAnswer')) {
      component.shuffle();
    }
    this.set('areAnswersShuffled', true);
  }),

  removeSubscriptions: Ember.on('willDestroyElement', function() {
    this.$('.sortable').off('sortupdate');
  }),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Convenient structure to render the question answer choices
   * @property {*}
   */
  answers: Ember.computed('question.answers.[]', function() {
    let answers = this.get('question.answers').sortBy('order');

    if (this.get('hasUserAnswer')) {
      //@see gooru-web/utils/question/reorder.js
      let userAnswer = this.get('userAnswer');
      answers = userAnswer.map(function(answerId) {
        return answers.findBy('id', answerId);
      });
    }
    return answers;
  }),
  /**
   * Return true if the answers list are shuffled
   * @property {Boolean}
   */
  areAnswersShuffled: false,

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Set answers
   */
  setAnswers: function() {
    const component = this;
    const sortable = this.$('.sortable');
    const readOnly = component.get('readOnly');

    sortable.sortable();
    if (readOnly) {
      sortable.sortable('disable');
    }

    if (component.get('hasUserAnswer')) {
      component.notify(true);
    }
    // Manually add subscriptions to sortable element -makes it easier to test
    sortable.on('sortupdate', function() {
      component.notify(false);
    });
  },

  /**
   * Notifies answer events
   * @param {boolean} onLoad if this was called when loading the component
   */
  notify: function(onLoad) {
    const component = this;
    const questionUtil = this.get('questionUtil');
    const $items = component.$('.sortable').find('li');
    const answers = $items
      .map(function(idx, item) {
        return $(item).data('id');
      })
      .toArray();

    const correct = questionUtil.isCorrect(answers);

    component.notifyAnswerChanged(answers, correct);
    if (onLoad) {
      component.notifyAnswerLoaded(answers, correct);
    } else {
      component.notifyAnswerCompleted(answers, correct);
    }
  },

  /**
   * Take the list of items and shuffle all his members
   */
  shuffle: function() {
    const component = this;
    const $items = component.$('.sortable');
    return $items.each(function() {
      var items = $items.children().clone(true);
      return items.length ? $(this).html(component.disorder(items)) : $items;
    });
  },
  /**
   * Disorder elements
   */
  disorder: function(list) {
    var j,
      x,
      i = list.length;
    while (i) {
      j = parseInt(Math.random() * i);
      i -= 1;
      x = list[i];
      list[i] = list[j];
      list[j] = x;
    }
    return list;
  }
});
