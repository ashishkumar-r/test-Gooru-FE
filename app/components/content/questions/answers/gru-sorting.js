import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'questions', 'answers', 'gru-sorting'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Help to add new columns to the group list
     */
    addNewItem(type) {
      var newChoice = Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: null,
        type,
        isCorrect: true,
        sequence: 0
      });
      this.$(`#sorting-list-data-${type}`).focus();
      this.get('answers').pushObject(newChoice);
    },

    /**
     * Action triggered when click delete button from the list
     */
    removeItem(answer) {
      this.get('answers').removeObject(answer);
    }
  },
  // -------------------------------------------------------------------------
  // Events

  didInsertElement() {
    // this.loadData();
    if (this.get('editMode')) {
      // this.initialize();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  answers: null,

  /**
   * Is in edit mode
   */
  editMode: false,

  /**
   * @property { Object } answerObj holding the first answer object from answers
   */
  answerObj: null,

  softAnswers: Ember.computed('answers.@each', function() {
    return this.get('answers').filterBy('type', 'soft');
  }),

  hardAnswers: Ember.computed('answers.@each', function() {
    return this.get('answers').filterBy('type', 'hard');
  }),

  // -------------------------------------------------------------------------
  // Methods

  initialize() {
    let component = this;
    let answers = component.get('answers');
    component.$(function() {
      component.$('.list-item-blk .answer-list-item').draggable({
        helper: 'clone',
        revert: 'invalid'
      });
      component.$('.list-item-blk').droppable({
        tolerance: 'intersect',
        drop: function(event, ui) {
          $(this).append($(ui.draggable));
          let answerIndex = ui.helper[0].dataset.answerIndex;
          let type = event.target.classList.contains('column-soft-list')
            ? 'soft'
            : 'hard';
          let answer = answers.get(answerIndex);
          answer.set('type', type);
          component.getSequenceItem(
            component.$('.column-soft-list'),
            component
          );
          component.getSequenceItem(
            component.$('.column-hard-list'),
            component
          );
        }
      });
    });
  },

  loadData() {
    let component = this;
    let answers = component.get('answers');
    let sortAnswers = answers.sortBy('sequence');
    sortAnswers.forEach(answer => {
      let answerIndex = answers.indexOf(answer);
      if (answer.type) {
        component
          .$(`.column-${answer.type}-list`)
          .append(
            `<li class="answer-list-item" data-answer-index=${answerIndex}> ${answer.text}</li>`
          );
      }
    });
  },

  getSequenceItem(_this, component) {
    let answers = component.get('answers');
    let elementList = _this.children();
    elementList.each(function(index, el) {
      let answerIndex = el.dataset.answerIndex;
      let answer = answers.get(answerIndex);
      answer.set('sequence', index);
    });
  }
});
