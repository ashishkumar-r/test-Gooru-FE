import Ember from 'ember';

/**
 * Delete bookmark component
 *
 * Component responsible for delete a bookmark from student independent learning
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

  classNames: ['content', 'modals', 'gru-delete-bookmark'],
  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Delete Bookmark
     */
    deleteBookmark: function(model) {
      let component = this;

      component.set('isLoading', true);

      model
        .deleteMethod()
        .then(function() {
          if (model.callback) {
            model.callback.success();
          }
          component.set('isLoading', false);
          component.triggerAction({ action: 'closeModal' });
        })
        .catch(function(error) {
          var message = component
            .get('i18n')
            .t('content.modals.delete-bookmark.delete-error', {
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
   * Indicate if it's waiting for deleteMethod callback
   */
  isLoading: false
});
