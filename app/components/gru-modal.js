import Ember from 'ember';
import ModalMixin from '../mixins/modal';

/**
 * Modal window
 *
 * Modal window to dynamically display any component
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend(ModalMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  /** @type {String[]} */
  classNames: ['gru-modal', 'fade', 'modal'],

  /** @type {String[]} */
  classNameBindings: ['component-class'],

  // -------------------------------------------------------------------------
  // Events

  didInsertElement: function() {
    let self = this;
    // Add event listener
    this.$().on('show.bs.modal', event => {
      Ember.run.later(function() {
        $(event.target)
          .find('input:first')
          .focus();
      }, 300);
    });

    this.$().on('hidden.bs.modal', function() {
      // Force the ember run loop to run right away
      Ember.run(function() {
        // The property 'is-visible' controls the visibility of a particular modal instance
        // However, all modals in the app must be controlled simultaneously. That is what
        // the modal mixin is for: to keep all modal instances in sync; therefore,
        // the value of 'modal.isVisible' is set instead of the property 'is-visible'.
        self.set('modal.isVisible', false);
      });
    });

    this.controlVisibility();
  },

  willDestroyElement: function() {
    this.$().off('hidden.bs.modal');
    this.$().off('show.bs.modal');
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Specific component class(es). Multiple classes are separated with spaces.
   * @type {?String}
   */
  'component-class': Ember.computed.alias('modal.component-class'),

  /**
   * Component data
   * @type {*}
   * @private
   */
  'component-model': Ember.computed.alias('modal.model'),

  /**
   * Name of the component to display
   * @type {String}
   * @private
   */
  'component-name': Ember.computed.alias('modal.name'),

  /**
   * Name of the channel this modal component will be listening to.
   * A global modal component will not have a channel value.
   * @type {String}
   */
  channel: null,

  /**
   * Whether the modal window should be visible or not
   * @type {Boolean}
   * @private
   */
  'is-visible': function() {
    var activeChannel = this.get('modal.activeChannel');
    var isVisible = this.get('modal.isVisible');
    var modalChannel = this.get('channel');

    if (!activeChannel) {
      // Addressing the global modal
      return !modalChannel ? isVisible : false;
    } else {
      return activeChannel === modalChannel ? isVisible : false;
    }
  }.property('modal.isVisible', 'modal.activeChannel', 'channel'),

  // -------------------------------------------------------------------------
  // Observers

  /**
   * Display the modal based on its state
   * @type {String}
   */
  controlVisibility: function() {
    if (this.get('is-visible')) {
      this.$().modal('show');
    } else {
      this.$().modal('hide');
    }
  }.observes('is-visible'),

  actions: {
    closeModal: function() {
      this.set('modal.isVisible', false);
    }
  }
});
