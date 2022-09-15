import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'ca-auto-assigned-confirmation'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    start() {
      this.get('model').onStart();
      this.triggerAction({ action: 'closeModal' });
    },
    cancel() {
      this.get('model').onCancel();
    },

    closePlayer() {
      this.triggerAction({ action: 'closeModal' });
    }
  }
});
