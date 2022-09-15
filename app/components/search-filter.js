import Ember from 'ember';

export default Ember.Component.extend({
  /**
   * Type of collection filter selected
   *  @property {string} selectedFilterType
   *
   */
  selectedFilterType: 'collection',

  /**
   * True if collection filter option is selected
   *  @property {boolean} collectionFilterSelected
   *
   */

  collectionFilterSelected: Ember.computed('selectedFilterType', function() {
    var selectedFilterType = this.get('selectedFilterType');

    return !selectedFilterType || selectedFilterType === 'collection';
  }),

  /**
   * True if assessment filter option is selected
   *  @property {boolean} assessmentFilterSelected
   *
   */

  assessmentFilterSelected: Ember.computed('selectedFilterType', function() {
    var selectedFilterType = this.get('selectedFilterType');

    return selectedFilterType && selectedFilterType === 'assessment';
  }),

  /**
   * True if resources filter option is selected
   *  @property {boolean} resourcesFilterSelected
   *
   */

  resourcesFilterSelected: Ember.computed('selectedFilterType', function() {
    var selectedFilterType = this.get('selectedFilterType');

    return selectedFilterType && selectedFilterType === 'resources';
  }),

  /**
   * True if questions filter option is selected
   *  @property {boolean} questionsFilterSelected
   *
   */

  questionsFilterSelected: Ember.computed('selectedFilterType', function() {
    var selectedFilterType = this.get('selectedFilterType');

    return selectedFilterType && selectedFilterType === 'questions';
  }),

  actions: {
    /**
     * Triggered when search filter is selected
     * @param {String} filterType
     */
    searchFilter: function(filterType) {
      this.set('selectedFilterType', filterType);
      this.sendAction('onFilterType', this.get('term'), filterType);
    }
  }
});
