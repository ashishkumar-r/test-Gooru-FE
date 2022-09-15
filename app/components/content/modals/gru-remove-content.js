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

  classNames: ['content', 'modals', 'gru-remove-content'],
  // -------------------------------------------------------------------------
  // Events
  init() {
    this._super(...arguments);
    // 'validator' should never be set as a param except for testing
    var validator = this.get('validator');
    if (!validator) {
      this.set(
        'validator',
        Ember.Object.create({
          confirm: '',
          check1: false,
          check2: false
        })
      );
    } else {
      this.set('validator', validator);
    }
  },
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Remove Content
     */
    removeContent: function(model) {
      let component = this;

      component.set('isLoading', true);

      // This removeMethod will be a wrapper around the actual remove method that is particular to
      // each content type.
      model
        .removeMethod()
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
            .t('content.modals.remove-content.remove-error', {
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
   * Object to control when the delete button becomes enabled
   * @property {model}
   */
  validator: null,

  /**
   * Indicate if it's waiting for removeMethod callback
   */
  isLoading: false,

  /**
   * Indicate if delete button is disabled
   */
  isDisabled: Ember.computed('validator.{confirm,check1,check2}', function() {
    const areChecked =
      this.get('validator.check1') && this.get('validator.check2');
    const isConfirm = this.get('validator.confirm').toUpperCase() === 'REMOVE';
    return !(areChecked && isConfirm);
  })
});
