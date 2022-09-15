import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';

/**
 * Rubric card
 *
 * Component responsible of showing the rubric information in cards, so that most useful information is summarized there.
 * @module
 */

export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['cards', 'gru-rubric-card'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {},
  // -------------------------------------------------------------------------
  // Events

  didRender() {
    var component = this;
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Rubric} rubric
   */
  rubric: null
});
