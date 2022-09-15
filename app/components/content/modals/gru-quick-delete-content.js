import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';
/**
 * Remove content component
 *
 * Component responsible for remove a content from content builder
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:notifications
   */
  notifications: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-quick-delete-content'],
  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Delete Content
     */
    deleteContent: function(model) {
      let component = this;

      component.set('isLoading', true);

      // This deleteMethod will be a wrapper around the actual delete method that is particular to
      // each question type.
      model
        .deleteMethod()
        .then(function() {
          if (model.callback) {
            model.callback.success();
          }
          component.set('isLoading', false);
          component.triggerAction({ action: 'closeModal' });

          if (model.redirect) {
            component
              .get('router')
              .transitionTo(model.redirect.route, model.redirect.params.id);
          }
        })
        .catch(function(error) {
          var message = component
            .get('i18n')
            .t('content.modals.delete-content.delete-error', {
              type: component
                .get('i18n')
                .t(`common.${model.type}`)
                .string.toLowerCase()
            }).string;
          component.get('notifications').error(message);
          Ember.Logger.error(error);
        });
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * This is the model used to delete.
   * @property {model}
   */
  model: null,

  /**
   * Content types.
   */
  types: CONTENT_TYPES,

  /**
   * Indicate if it's waiting for removeMethod callback
   */
  isLoading: false
});
