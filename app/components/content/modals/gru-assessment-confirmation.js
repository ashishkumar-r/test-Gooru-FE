import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-assessment-confirmation'],

  classNameBindings: ['component-class'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    start() {
      this.get('model').onStart();
      this.triggerAction({ action: 'closeModal' });
    },
    cancel() {
      this.get('model').onCancel();
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {boolean} flag for determining button and the formatted result behaviour
   */
  noAttempts: Ember.computed.equal('model.attempts', 0),
  /**
   * @property {boolean} flag for determining unlimited behaviour
   */
  unlimited: Ember.computed.equal('model.attempts', -1),

  /**
    * @property {boolean} flag for determining button behaviour
    */
  disableStart: Ember.computed('unlimited', 'noAttempts', function() {
    return !this.get('unlimited') && this.get('noAttempts');
  })
});
