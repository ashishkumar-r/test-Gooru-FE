import Ember from 'ember';

/**
 * Profile navigation
 *
 * Component responsible for enabling navigation between sub-sections within /profile
 * @module
 * @see controllers/class.js
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['profile gru-navigation'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     *
     * Triggered when an menu item is selected
     * @param item
     */
    selectItem: function(item) {
      this.highlightMenuItem(item);
      if (this.get('onItemSelected')) {
        this.sendAction('onItemSelected', item);
      }
    },

    /**
     *
     * Triggered when the user clicks follow/unfollow button
     */
    toggleFollowingStatus: function() {
      if (this.get('onFollowChanged')) {
        this.sendAction('onFollowChanged');
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  didInsertElement: function() {
    var item = this.get('selectedMenuItem');
    this.highlightMenuItem(item);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {String|Function} onItemSelected - event handler for when an menu item is selected
   */
  onItemSelected: null,

  /**
   * @property {String} selectedMenuItem - menu Item selected
   */

  selectedMenuItem: null,

  // -------------------------------------------------------------------------
  // Observers
  /**
   * Refreshes the left navigation with the selected menu item
   */
  refreshSelectedMenuItem: function() {
    var item = this.get('selectedMenuItem');
    this.highlightMenuItem(item);
  }.observes('selectedMenuItem'),

  // -------------------------------------------------------------------------
  // Methods

  highlightMenuItem: function(item) {
    this.$('.profile-menu-item').removeClass('selected');
    this.$(`.profile-menu-item.${item}`).addClass('selected');
  }
});
