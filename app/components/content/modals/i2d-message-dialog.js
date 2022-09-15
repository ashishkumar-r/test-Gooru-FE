import Ember from 'ember';

export default Ember.Component.extend({

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['i2d-message-dialog'],
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    confirm: function() {
      const component = this;
      let model = this.get('model');
      component.send('cancel');
      model.onConfirm();
    },

    cancel: function() {
      const component = this;
      component.triggerAction({
        action: 'closeModal'
      });
    }
  }
});
