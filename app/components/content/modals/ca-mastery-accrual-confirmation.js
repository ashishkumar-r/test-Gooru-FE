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

  classNames: ['content', 'modals', 'ca-mastery-accrual-confirmation'],

  classNameBindings: ['component-class'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    confirm: function() {
      let component = this;
      this.set('isLoading', true);
      let model = this.get('model');
      model
        .onConfirm()
        .then(function() {
          if (model.callback) {
            model.callback.success();
          }
          component.set('isLoading', false);
          component.triggerAction({
            action: 'closeModal'
          });
        })
        .catch(function(error) {
          let message = component
            .get('i18n')
            .t('ca.mastery-accrual.update.error').string;
          component.get('notifications').error(message);
          component.set('isLoading', false);
          Ember.Logger.error(error);
        });
    },

    cancel: function() {
      this.triggerAction({
        action: 'closeModal'
      });
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  isLoading: false
});
