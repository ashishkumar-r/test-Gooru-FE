import Ember from 'ember';
import ModalMixin from '../mixins/modal';

/**
 * User registration
 *
 * Component that routes the user either to the log in flow or the sign up flow.
 * May be embedded into a modal window (@see gru-modal).
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-user-registration'],

  classNameBindings: ['component-class'],

  // -------------------------------------------------------------------------
  // Events

  didInsertElement: function() {
    var component = this;
    component.$('[data-toggle=\'tooltip\']').tooltip({ trigger: 'hover' });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {?String} specific class
   */
  'component-class': null
});
