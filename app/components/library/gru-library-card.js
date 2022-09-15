import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['library', 'gru-library-card'],
  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  didInsertElement: function() {
    this._super(...arguments);
    const component = this;
    // Adds tooltip to UI elements (elements with attribute 'data-toggle')
    component.$('[data-toggle="tooltip"]').tooltip({ trigger: 'hover' });

    //Determinate if the device where the component is showing is a touch device in order to deactivate the tooltips
    var isTouch = 'ontouchstart' in window || navigator.msMaxTouchPoints > 0;
    if (isTouch) {
      component.$('.actions .item-actions button').tooltip('disable');
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Boolean} indicate if disabled card buttons
   */
  disabledActions: true,
  /**
   * Object to show in the library card
   */
  model: null
});
