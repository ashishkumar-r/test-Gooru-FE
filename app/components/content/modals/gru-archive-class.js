import Ember from 'ember';

/**
 * Archive class component
 *
 * Component responsible for archive a class from class view
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'modals', 'gru-archive-class'],

  // -------------------------------------------------------------------------
  // Events
  init() {
    this._super(...arguments);
    // 'validator' should never be set as a param except for testing
    var validator = this.get('validator');
    if (!validator) {
      this.set(
        'validator',
        Ember.Object.create({
          check1: false,
          check2: false,
          check3: false
        })
      );
    } else {
      this.set('validator', validator);
    }
  },
  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Archive Class
     */
    archiveClass: function(model) {
      let component = this;
      model
        .archiveMethod()
        .then(() => component.triggerAction({ action: 'closeModal' }));
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * This is the model used to archive.
   * @property {model}
   */
  model: null,

  /**
   * Object to control when the archive button becomes enabled
   * @property {model}
   */
  validator: null,

  /**
   * Indicate if archive button is disabled
   */
  isDisabled: Ember.computed(
    'validator.{confirm,check1,check2,check3}',
    function() {
      var areChecked =
        this.get('validator.check1') && this.get('validator.check2');
      if (!this.get('hasNoWarning')) {
        areChecked = areChecked && this.get('validator.check3');
      }
      return !areChecked;
    }
  )
});
