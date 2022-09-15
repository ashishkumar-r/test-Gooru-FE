import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import Rubric from 'gooru-web/models/rubric/rubric';
import EditRubricValidations from 'gooru-web/validations/edit-rubric';

export default Ember.Route.extend(PrivateRouteMixin, {
  queryParams: {
    editing: {},
    backUrl: {},
    editingContent: {
      refreshModel: true
    },
    primaryLanguage: null
  },

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @property {Service} rubricService
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    const route = this;
    const RubricValidation = Rubric.extend(EditRubricValidations);
    return route
      .get('rubricService')
      .getRubric(params.rubricId)
      .then(function(rubric) {
        const isEditing = params.editing === 'true';
        const editingContent = params.editingContent
          ? params.editingContent
          : null;
        return Ember.RSVP.hash({
          rubric: RubricValidation.create(rubric),
          isEditing: !!isEditing,
          editingContent: editingContent,
          backUrl: params.backUrl,
          primaryLanguage: parseInt(params.primaryLanguage)
        });
      });
  },

  setupController(controller, model) {
    controller.set('rubric', model.rubric);
    controller.set('isEditing', model.isEditing);
    controller.set('editingContent', model.editingContent);
    controller.set('tempRubric', model.rubric.copy());
    controller.set('rubric.backUrl', model.backUrl);
    controller.set('primaryLanguage', model.primaryLanguage);
  }
});
