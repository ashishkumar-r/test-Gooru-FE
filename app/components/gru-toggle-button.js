import Ember from 'ember';

export default Ember.Component.extend({
  /**
   * @type {Boolean}
   * Property to find out whether the toggle button is checked or not
   */
  isChecked: false,

  didInsertElement: function() {
    const $fileInput = this.$('input[type="checkbox"]');
    if ($fileInput) {
      $fileInput.attr('title', 'toggle');
    }
  },

  actions: {
    /**
     * Action triggered when the user toggle button
     */
    onToggleButton() {
      let component = this;
      let isChecked = !component.get('isChecked');
      component.set('isChecked', isChecked);
      component.sendAction('onToggleButton', isChecked);
    }
  }
});
