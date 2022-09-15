import Ember from 'ember';

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

  classNames: ['content', 'modals', 'gru-remove-student'],
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
          check2: false,
          check3: false
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
     *Remove Student
     */
    removeStudent: function(model) {
      let component = this;

      model
        .deleteMethod()
        .then(function() {
          model.callback.success();
          component.triggerAction({ action: 'closeModal' });
        })
        .catch(function(error) {
          var message = component
            .get('i18n')
            .t('content.modals.remove-student.delete-error', {
              type: component.get('i18n').t('common.class').string.toLowerCase()
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
   * Object to control when the delete button becomes enabled
   * @property {model}
   */
  validator: null,

  /**
   * Indicate if delete button is disabled
   */
  isDisabled: Ember.computed(
    'validator.{confirm,check1,check2,check3}',
    function() {
      let areChecked =
        this.get('validator.check1') &&
        this.get('validator.check2') &&
        this.get('validator.check3');
      const isConfirm =
        this.get('validator.confirm').toUpperCase() === 'DELETE';
      return !(areChecked && isConfirm);
    }
  )
});
