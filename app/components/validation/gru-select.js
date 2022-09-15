import Ember from 'ember';

/**
 * Select field component
 *
 * Component responsible to show a bootstrap selectpicker.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-select'],

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  didInsertElement: function() {
    const component = this;
    let selectpicker = component.$('.selectpicker');
    component.set('showMessage', false);
    selectpicker.selectpicker();
    selectpicker.on('loaded.bs.select', function() {
      // Update model when the user selects
      selectpicker.on('change', function(e) {
        e.stopPropagation();
        var optionSelected = selectpicker.find('option:selected').val();
        component.set('optionSelected', optionSelected);
        component.sendAction('onOptionSelect', optionSelected);
      });
      // Change value shown in UI when model changes
      if (!component.isDestroyed) {
        component.addObserver('optionSelected', function() {
          console.log('optionSelected', 'in observer'); //eslint-disable-line

          if (component.get('optionSelected') !== selectpicker.val()) {
            selectpicker.selectpicker('val', component.get('optionSelected'));
          }
        });
      }
    });
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @param {Array} options - List of options displayed in the component
   */
  options: null,

  /**
   * @param {String} title - Placeholder of the select
   */
  title: null,

  /**
   * @param {Boolean} search - search option of the select
   */
  search: false,

  /**
   * @param {Boolean} showMessage
   */
  showMessage: false,

  /**
   * @param {String} errorMessage
   */
  errorMessage: null,

  /**
   * @param {String} optionSelected
   */
  optionSelected: null

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
