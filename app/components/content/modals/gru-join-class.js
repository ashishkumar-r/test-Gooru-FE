import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  code: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.join-class-code'
      }),
      validator('dependent', {
        on: ['allowedCode'],
        message: '{{description}}',
        descriptionKey: 'content.classes.join.join-not-allowed'
      }),
      validator('dependent', {
        on: ['validCode'],
        message: '{{description}}',
        descriptionKey: 'content.classes.join.invalid-code'
      }),
      validator('dependent', {
        on: ['notMember'],
        message: '{{description}}',
        descriptionKey: 'content.classes.join.already-member'
      })
    ]
  },

  validCode: validator('presence', true),
  allowedCode: validator('presence', true),
  notMember: validator('presence', true)
});

export default Ember.Component.extend(Validations, {
  // -------------------------------------------------------------------------
  // Dependencies
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modal', 'gru-join-class'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    joinClass: function() {
      const component = this;
      component.validate().then(function({ validations }) {
        if (validations.get('isValid')) {
          component.set('isLoading', true);
          component.sendAction('onJoinClass', component.get('code'));
        }
        component.set('didValidate', true);
      });
    },

    onCodeFocusOut: function() {
      this.clearValidations();
    },

    onCodeTyping: function() {
      this.clearValidations();
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    const component = this;
    component.$().on('keyup', '.modal-body', function(e) {
      var keyCode = event.keyCode ? event.keyCode : event.which;
      if (keyCode === 13) {
        $(e.target).blur().focus();
        component.$('.join-class-btn').trigger('click');
      }
    });
  },

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Clear validation messages
   */
  clearValidations: function() {
    const component = this;
    component.set('allowedCode', true);
    component.set('validCode', true);
    component.set('notMember', true);
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {string}
   */
  code: null,

  /**
   * @property {string}
   */
  onJoinClass: null,

  /**
   * Indicates if the code is valid, false when the class is not found
   * @property {boolean}
   */
  validCode: true,

  /**
   * Indicates if the code is allowed, false if the user can't join that class
   * @property {boolean}
   */
  allowedCode: true,

  /**
   * Indicates if user is not a member of this class
   * @property {boolean}
   */
  notMember: true,

  /**
   * Indicate if it's waiting for join class callback
   */
  isLoading: false
});
