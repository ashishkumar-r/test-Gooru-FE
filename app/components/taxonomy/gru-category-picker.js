import Ember from 'ember';

/**
 * Taxonomy category picker component
 *
 * Component responsible for displaying categories
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['taxonomy', 'gru-category-picker'],

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Set Category
     */
    setCategory(category) {
      this.set('selectedCategory', category);
      if (this.get('onCategorySelected')) {
        this.sendAction('onCategorySelected', category);
      }
    }
  },

  //
  // Methods

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @type {Array} List of categories
   */
  categories: [],

  /**
   * The selected category
   * @property {object}
   */
  selectedCategory: null,

  /**
   * Category selection event
   * @property {string}
   */
  onCategorySelected: null,

  /**
   * @property {string}
   */
  placeholderLabelKey: 'taxonomy.gru-category-picker.choose-category',

  /**
   * @property {string} dropdown alignment, right | left
   */
  alignment: null
});
