import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {rubricService}
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @property {rubricService}
   */
  questionService: Ember.inject.service('api-sdk/question'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-add-rubric-to-question'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Select rubric
     */
    selectRubric: function(rubric) {
      this.set('selectedRubric', rubric);
      $('.gru-add-rubric-to-question .selected').removeClass('selected');
      $(`.${rubric.id}`).addClass('selected');
    },

    /**
     * Add to question
     */
    addTo: function() {
      let component = this;
      const model = component.get('model');
      const rubricId = component.get('selectedRubric.id');
      const baseQuestionId = model.baseQuestionId;
      let primaryQuestionId = baseQuestionId
        ? baseQuestionId
        : model.questionId;
      return component
        .get('rubricService')
        .associateRubricToQuestion(rubricId, model.questionId)
        .then(function() {
          if (model.callback) {
            component
              .get('questionService')
              .readQuestion(primaryQuestionId)
              .then(function(question) {
                let rubricObj = question.rubric;
                if (baseQuestionId) {
                  let rubricQuestion = question.subQuestions.findBy(
                    'id',
                    model.questionId
                  );
                  if (rubricQuestion) {
                    rubricObj = rubricQuestion.rubric;
                  }
                }
                model.callback.success(rubricObj);
              });
          }
          component.triggerAction({ action: 'closeModal' });
        });
    },

    /**
     * Go to content page
     */
    goToContent: function() {
      let component = this;
      const model = component.get('model');
      let queryParams = {
        profileId: model.userId,
        type: 'my-content',
        activeContentType: 'rubric'
      };
      this.triggerAction({ action: 'closeModal' });
      component.get('router').transitionTo('library-search', { queryParams });
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * Model with the values to use in the modal
   */
  model: null,

  /**
   * Filter only rubrics ON
   */
  filteredRubrics: Ember.computed('model.rubrics', function() {
    return this.get('model.rubrics').filter(rubric => rubric.title);
  })
});
