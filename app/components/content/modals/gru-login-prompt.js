import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-login-prompt'],

  classNameBindings: ['component-class'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    signIn: function() {
      this.get('router').transitionTo('sign-in');
    },
    signUp: function() {
      this.get('router').transitionTo('sign-up');
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @type {?String} specific class
   */
  'component-class': null

  //Methods
});
