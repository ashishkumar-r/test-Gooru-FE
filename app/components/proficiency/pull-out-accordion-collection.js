import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:performance
   */
  performanceService: Ember.inject.service('performance'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['pull-out-accordion-collection'],

  // -------------------------------------------------------------------------
  // Properties

  /**
   * collection
   * @return {Object}
   */
  collection: null,

  /**
   * user id
   * @type {String}
   */
  userId: null,

  /**
   *  Indicates loading icon enabled or not
   * @type {Boolean}
   */
  loading: false,

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     *
     * Triggered when an menu item is selected
     * @param item
     */
    selectCompetencyItems: function(collection) {
      let component = this;
      component.set('loading', true);
      let userId = component.get('userId');
      let collectionId = collection.get('id');
      let sessionId = collection.get('sessionId');
      let summaryReportPromise = null;
      if (collection.get('collectionType') === 'assessment') {
        summaryReportPromise = component
          .get('performanceService')
          .getUserPerformanceResourceInAssessment(
            userId,
            null,
            null,
            null,
            collectionId,
            sessionId,
            null
          );
      } else {
        summaryReportPromise = component
          .get('performanceService')
          .getUserPerformanceResourceInCollection(
            userId,
            null,
            null,
            null,
            collectionId,
            sessionId,
            null
          );
      }
      Ember.RSVP.hash({
        resources: summaryReportPromise
      }).then(({ resources }) => {
        component.set('loading', false);
        component.set('resources', resources);
        component.resetAccordionArrowBasedOnState();
      });
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  resetAccordionArrowBasedOnState: function() {
    let component = this;
    let element = component.$(
      `#${component.get('elementId')}-heading > .panel-title a i`
    );

    if (element.hasClass('arrow_drop_up')) {
      element.addClass('arrow_drop_down').removeClass('arrow_drop_up');
      element.text('arrow_drop_down');
    } else {
      element.addClass('arrow_drop_up').removeClass('arrow_drop_down');
      element.text('arrow_drop_up');
    }
  }
});
