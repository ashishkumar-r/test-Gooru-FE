import Ember from 'ember';

/**
 * Search filter
 *
 * Component with the components for categories and subjects
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

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
    },
    /**
     * Set Subject
     */
    setSubject(subject) {
      this.set('selectedSubject', subject);
      if (this.get('onSubjectSelected')) {
        this.sendAction('onSubjectSelected', subject);
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
   * @type {Array} List of subjects
   */
  subjects: null,

  /**
   * The selected category
   * @property {object}
   */
  selectedCategory: null,

  /**
   * the subject selected
   * @property {TaxonomyRoot}
   */
  selectedSubject: null,

  /**
   * Category selection event
   * @property {string}
   */
  onCategorySelected: null,

  /**
   * when a subject is selected
   * @property {string}
   */
  onSubjectSelected: null,

  /**
   * @property {string}
   */
  categoriesPlaceholderLabelKey: 'taxonomy.gru-category-picker.choose-category',

  /**
   * @property {string}
   */
  subjectsPlaceholderLabelKey: 'taxonomy.gru-taxonomy-selector.choose-subject',

  /**
   * @type {Array} List of subjects
   */
  subjectsWithStandards: Ember.computed('subjects', () => {
    return this.get('subjects').filter(subject => {
      return subject.get('hasStandards');
    });
  }),

  /**
   * @property {boolean}
   */
  onlySubjectsWithStandards: false,

  /**
   * @property {string} dropdown alignment, right | left
   */
  alignment: null,

  /**
   * @property {boolean} indicates if subjects are disabled
   */
  disableSubjects: true
});
