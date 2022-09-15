import Ember from 'ember';

/**
 * Class actions bar
 *
 * Component responsible for showing the action bar in my class analytics page.
 *
 * @module
 * @see controllers/class.js
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-actions-bar'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered when the user selects the Download option
     */
    download: function() {
      this.sendAction('onDownload');
    },
    /**
     * Action triggered when the user selects the Share option
     */
    share: function() {
      Ember.Logger.log('share');
    },
    /**
     * Action triggered when the user selects the Full Screen option
     */
    toggleFullScreen: function() {
      this.get('onToggleFullScreen')();
    },

    /**
     * Action triggered when the user selects the Edit Content option
     */
    editContent: function() {
      this.get('onEditContent')();
    },

    /**
     * Action triggered when the user selects the view filter option
     * @param {string} filterBy - view filter option
     */
    filter: function(filterBy) {
      if (this.get('onFilterSelected')) {
        this.sendAction('onFilterSelected', filterBy);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {bool} display the edit content option
   */
  enableEdit: true,

  /**
   * @property {bool} display the full screen button
   */
  enableFullScreen: true,

  /**
   * @property {string} for mode: student or teacher
   */
  mode: null,

  /**
   * @property {String} isStudent - shows if the is student mode.
   */
  isStudent: Ember.computed.equal('mode', 'student'),

  /**
   * @property {Boolean} collectionLevel - shows if the collection level.
   */
  collectionLevel: false,

  /**
   * @property {String|Function} onFilterSelected - event handler when a  filter option is selected in the view dropdown.
   */
  onFilterSelected: null,

  /**
   * @property {Boolean|Function} onToggleFullScreen - event handler when a  full screen option is selected.
   */
  onToggleFullScreen: null,

  /**
   * @property {Boolean|Function} onEditContent - event handler when edit content is selected
   */
  onEditContent: null,

  /**
   * If analytics is fullscreen
   * @property {Boolean}
   */
  isFullScreen: null,

  /**
   * @property {String|Function} onDownload - event handler when the download option is clicked
   */
  onDownload: null,

  /**
   * @property {String} selectedFilterBy - shows the filter option selected in the view dropdown.
   */
  selectedFilterBy: null,

  /**
   * @property {String} isFilterByAssessment - shows if the filter option selected is by Assessment.
   */
  isFilterByAssessment: Ember.computed.equal('selectedFilterBy', 'assessment'),

  /**
   * @property {String} isFilterByCollection - shows if the filter option selected is by Collection.
   */
  isFilterByCollection: Ember.computed.equal('selectedFilterBy', 'collection'),

  /**
   * @property {String} isFilterByBoth - shows if the filter option selected is by Both.
   */
  isFilterByBoth: Ember.computed.equal('selectedFilterBy', 'both'),

  /**
   * @property {String} dropdownFilterText - shows the text for the filter option selected in the view dropdown.
   */
  dropdownFilterText: Ember.computed('selectedFilterBy', function() {
    const selectedFilter = this.get('selectedFilterBy');
    return `class.analytics.performance.actions.${selectedFilter}`;
  })

  // -------------------------------------------------------------------------

  // Methods
});
