import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {rubricService}
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @requires service:api-sdk/offline-activity/offline-activity
   */
  activityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

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
      if (model.rubricsFor && model.rubricsFor === 'student') {
        return component
          .get('activityService')
          .associateStudentRubricToOA(rubricId, model.oaId)
          .then(function(oaRubricId) {
            if (model.callback) {
              if (model.callback) {
                let oaRubric = {
                  SourceRubric: component.get('selectedRubric'),
                  NewRubricId: oaRubricId
                };

                model.callback.success(oaRubric);
              }
            }
            component.triggerAction({ action: 'closeModal' });
          });
      } else {
        return component
          .get('activityService')
          .associateTeacherRubricToOA(rubricId, model.oaId)
          .then(function(oaRubricId) {
            if (model.callback) {
              let oaRubric = {
                SourceRubric: component.get('selectedRubric'),
                NewRubricId: oaRubricId
              };

              model.callback.success(oaRubric);
            }
            component.triggerAction({ action: 'closeModal' });
          });
      }
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
      component.get('router').transitionTo('library-search', { queryParams });
      component.triggerAction({ action: 'closeModal' });
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
