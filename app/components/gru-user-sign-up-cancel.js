import Ember from 'ember';
import ModalMixin from '../mixins/modal';

/**
 * User sign up cancel
 *
 * Component that lets the user return to or end the sign up flow
 * May be embedded into a modal window (@see gru-modal).
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-user-sign-up-cancel'],

  classNameBindings: ['component-class'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {?String} specific class
   */
  'component-class': null
});
