import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['header', 'content', 'gru-header'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Select menu tab
     */
    select: function(value) {
      this.set('selected', value);
    },
    /**
     * Click button action
     */
    clickAction: function(action) {
      action();
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Object[]} headerActions List of action buttons to show
   */
  headerActions: [],

  /**
   * @property {Object[]} options List of tab options to show
   */
  options: [],

  /**
   * @property {String} selected Current option selected
   */
  selected: '',

  /**
   * @property {String} title Header title
   */
  title: '',

  /**
   * @property {String} back button
   */
  backButton: {},

  /**
   * @property {Boolean} Indicate if this header work with scroll to an specific section
   */
  useScroll: false
});
