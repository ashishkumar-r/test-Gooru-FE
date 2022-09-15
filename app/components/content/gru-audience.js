import Ember from 'ember';

/**
 * Audience component
 *
 * Component responsible for show the audience
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Ember.Service} Service to do retrieve audiences
   */
  lookupService: Ember.inject.service('api-sdk/lookup'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['content', 'gru-audience'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Remove audience from active audience
     */
    removeAudience: function(audience) {
      audience.set('checked', false);
    }
  },

  // -------------------------------------------------------------------------
  // Events
  init: function() {
    var component = this;
    component._super(...arguments);

    component
      .get('lookupService')
      .readAudiences()
      .then(function(audiences) {
        if (!component.isDestroyed) {
          component.set('audiences', audiences);
          let editedOptions = component.getOptionsArray(
            audiences,
            component.get('srcSelectedAudiences')
          );
          component.set('editAudiences', editedOptions);
        }
      });
  },

  /**
   * Overwrites didUpdate hook
   */
  didUpdate: function() {
    this.$('.dropdown-menu.audience li label').on('click', function(e) {
      e.stopPropagation();
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Ember.A}
   */
  editAudiences: null,

  /**
   * @type {Ember.A} editSelectedAudiences - Editable list of audiences selected for the course
   */
  editSelectedAudiences: null,

  /**
   * Is the course being edited or not?
   * @property {Boolean}
   */
  isEditing: null,

  /**
   * @type {Ember.A}
   */
  srcAudiences: Ember.computed('srcSelectedAudiences', 'audiences', function() {
    return this.getOptionsArray(
      this.get('audiences'),
      this.get('srcSelectedAudiences')
    );
  }),

  /**
   * @type {Ember.A} srcSelectedAudiences - Initial list of audiences selected for the course
   */
  srcSelectedAudiences: null,

  /**
   * @type {Ember.A} audiences - List of audiences for the course
   */
  audiences: Ember.A(),

  // -------------------------------------------------------------------------
  // Observers

  /**
   * Observes if the selection has changed
   */
  updateSelectedAudiences: Ember.observer(
    'editAudiences.@each.checked',
    function() {
      var selectedAudiences = this.get('editAudiences')
        .filterBy('checked')
        .map(function(audience) {
          return audience.get('checked') === true ? audience.get('id') : null;
        });
      if (selectedAudiences && selectedAudiences.length > 0) {
        this.set('editSelectedAudiences', selectedAudiences);
      }
    }
  ),

  resetSelectedAudiences: Ember.observer('isEditing', function() {
    if (this.get('isEditing')) {
      this.set(
        'editAudiences',
        this.getOptionsArray(
          this.get('audiences'),
          this.get('srcSelectedAudiences')
        )
      );
    }
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Create a copy of an array of value-label objects and add an additional property
   * 'checked' to each one, where its value will depend on whether the object value is
   * present or not in the 'selectedOptions' array (list of values)
   * @param {Object[]} allOptions - Array of objects
   * @param {Number[]} selectedOptions - Array of values
   */
  getOptionsArray: function(allOptions, selectedOptions) {
    return allOptions.slice(0).map(function(object) {
      object.checked =
        selectedOptions && selectedOptions.indexOf(object.id) > -1;
      return Ember.Object.create(object);
    });
  }
});
