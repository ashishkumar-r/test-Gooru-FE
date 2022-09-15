import Ember from 'ember';

/**
 * Delete class activity component
 *
 * Component responsible for remove a class activity from teacher class-activities
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

  classNames: ['content', 'modals', 'gru-remove-class-activity'],
  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * remove ClassActivity
     */
    removeClassActivity: function(model) {
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
            .t('content.modals.remove-class-activity.delete-error', {
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
