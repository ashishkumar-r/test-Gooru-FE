import GruInput from 'gooru-web/components/validation/gru-input';
import Ember from 'ember';
import { isDecimal } from 'gooru-web/utils/math';

/**
 * Number field with validation (It only accepts integers)
 *
 * Text field with support for ember-cp-validations.
 * It provides feedback based on certain validation criteria.
 *
 * @module
 * @augments ember/Component
 * @see ember-cp-validations
 */
export default GruInput.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  modelValueObserver: function() {
    this.initValues();
  }.observes('model.studentScore'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    inputValueChange: function() {
      this.set(
        'rawInputValue',
        this.get('rawInputValue') ? +this.get('rawInputValue') : null
      );
      this.set('value', this.get('rawInputValue'));
      this.set('isTyping', false);
      if (this.get('onFocusOut')) {
        this.sendAction('onFocusOut');
      }
    },

    focusIn: function() {
      if (this.get('onFocusIn')) {
        this.sendAction('onFocusIn');
      }
    },

    inputTyping: function() {
      this._super(...arguments);
      this.set('oldValue', this.get('rawInputValue'));
    }
  },

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-input-number', 'validation'],
  classNameBindings: [
    'showErrorClass:has-error',
    'isValid:has-success',
    'valuePath'
  ],

  // -------------------------------------------------------------------------
  // Events

  init() {
    this._super(...arguments);
    this.set('oldValue', this.get('rawInputValue'));
  },

  didUpdateAttrs() {
    this._super(...arguments);
    this.initValues();
  },

  didRender: function() {
    this._super(...arguments);
    const component = this;

    const min = component.get('min');
    const max = component.get('max');
    const step = component.get('step');

    if (component.get('autofocus')) {
      component.$('input[type=number]').focus();
    }
    // only accept numbers
    component.$('input[type=number]').keypress(function(event) {
      // 0 means key without character input, 8 is backspace, 48-57 are numbers
      let keyCode =
        typeof event.which === 'number' ? event.which : event.keyCode;

      if (!isDecimal(step)) {
        return (
          keyCode === 0 ||
          keyCode === 8 ||
          keyCode === 46 ||
          (keyCode >= 48 && keyCode <= 57)
        );
      } else {
        return (
          keyCode === 0 || keyCode === 8 || (keyCode >= 48 && keyCode <= 57)
        );
      }
    });
    // check that it is between min and max
    component.$('input[type=number]').on('input', function() {
      // accept the empty value
      if (this.value) {
        var tempValue = +this.value;
        if (tempValue < min || tempValue > max) {
          this.value = component.get('oldValue');
        }
      }
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @param {Number} max - maximum number value
   */
  max: 100,

  /**
   * @param {Number} min - minimum number value
   */
  min: 0,

  /**
   * @param {Number} step - step between values when using the picker
   */
  step: 1,

  /**
   * @param {String} oldValue - before the value has changed / before the input event
   */
  oldValue: null,

  /**
   * @param {Boolean} focus - set input focus
   */
  autofocus: false,

  /**
   * Check every time the score change in order to convert the value to number.
   */
  modelChange: Ember.observer('model.minScore', function() {
    const component = this;
    const minScore = this.get('model.minScore');

    if (minScore !== 'undefined' && typeof minScore !== 'number') {
      component.set('model.minScore', +minScore);
    }
  })
});
