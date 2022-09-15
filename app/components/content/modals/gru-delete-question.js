import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

/**
 * Delete question component
 *
 * Component responsible for delete a content from content builder
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

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-delete-question'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Delete Content
     */
    deleteQuestion: function(model) {
      let component = this;

      component.set('isLoading', true);
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.QUESTION_DELETE);
      // This deleteMethod will be a wrapper around the actual delete method that is particular to
      // each question type.
      model
        .deleteMethod()
        .then(function() {
          if (model.callback) {
            model.callback.success();
          }
          component.set('isLoading', false);
          component.triggerAction({
            action: 'closeModal'
          });

          if (model.redirect) {
            component.get('router').transitionTo(model.redirect.route, {
              queryParams: {
                profileId: model.redirect.params.profileId,
                type: model.redirect.params.type,
                activeContentType: model.type
              }
            });
          }
        })
        .catch(function(error) {
          var message = component
            .get('i18n')
            .t('content.modals.delete-content.delete-error', {
              type: component
                .get('i18n')
                .t(`common.'${model.type}`)
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
   * Indicate if it's waiting for deleteMethod callback
   */
  isLoading: false
});
