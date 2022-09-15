import Ember from 'ember';

export default Ember.Component.extend({
  classNames: ['gru-class-activities-default-adding-view'],

  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Array} todayActivities it has today's activities
   */
  todayActivities: null,

  /**
   * @property {boolean} isFetchingContents
   */
  isFetchingContents: false,

  /**
   * @property {Array} activeSequence has list of active content source list
   */
  activeSequence: Ember.A([]),

  // -------------------------------------------------------------------------
  // Hooks

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    // Action trigger when click on content preview
    onShowContentPreview(content) {
      this.sendAction('onShowContentPreview', content);
    },
    // Action trigger when click on add activites from right panel
    onAddActivityPop(content) {
      this.sendAction('onAddActivityPop', content);
    },
    // Action trigger when click on add activities from popup
    onAddActivity(content, startDate = null, endDate = null) {
      this.sendAction('onAddActivity', content, startDate, endDate);
    },

    onClickShowMore(sequenceLevel) {
      this.sendAction('onDefaultShowMore', {
        page: sequenceLevel.get('page'),
        sequenceIndex: sequenceLevel.get('sequenceIndex')
      });
    }
  }
});
