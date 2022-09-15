import Ember from 'ember';
import Class from 'gooru-web/models/content/class';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Service} Class service API SDK
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * @property {Service} Notifications service
   */
  notifications: Ember.inject.service(),

  /**
   * @property {Service} session service
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-new-class-card'],

  classNameBindings: ['isNewClassCardOnly:class-card-only'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    createClass: function() {
      const component = this;
      const newClass = this.get('newClass');
      newClass.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          component.sendAction('onCreateClass', newClass);
        }
        component.set('didValidate', true);
      });
    }
  },

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    var newClass = Class.create(Ember.getOwner(this).ownerInjection(), {
      title: null,
      classSharing: 'open'
    });
    this.set('newClass', newClass);
  },

  didRender() {
    const component = this;
    component.$().on('keyup', '.modal-body', function(e) {
      var keyCode = event.keyCode ? event.keyCode : event.which;
      if (keyCode === 13) {
        $(e.target)
          .blur()
          .focus();
        component.$('.get-started-btn').trigger('click');
      }
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Class} class
   */
  newClass: null,

  /**
   * @property {String} action to send up after creating the class to
   * refresh the list of classes in the top header
   */
  updateUserClasses: null,

  /**
   * @type {String} open or restricted, tells the component which radio is checked.
   */
  currentClassSharing: Ember.computed.alias('newClass.classSharing'),

  /**
   * Indicate if it's waiting for join class callback
   */
  isLoading: false,

  /**
   * Checking is demo account
   */
  isGuestAccount: Ember.computed.alias('session.isGuest')
});
