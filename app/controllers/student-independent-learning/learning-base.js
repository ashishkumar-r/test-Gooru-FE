import Ember from 'ember';

/**
 * Independent Learning Courses controller
 *
 * Controller responsible of the logic for the Independent Learning Courses page
 */

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {Controller} Parent controller
   */
  studentIndependentController: Ember.inject.controller(
    'student-independent-learning'
  ),

  /**
   * @type {LearnerService} Service to retrieve learner information
   */
  learnerService: Ember.inject.service('api-sdk/learner'),

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * when loading more items from learner locations
     */
    showMoreResults: function() {
      const userId = this.get('session.userId');
      const contentType = this.get('contentType');
      const offset = this.get('offset');
      let locations = this.get('locations');
      let performance = this.get('performance');
      return Ember.RSVP
        .hash({
          locations: this.get('learnerService').fetchLocations(
            userId,
            contentType,
            offset
          ),
          performance: this.get('learnerService').fetchPerformance(
            userId,
            contentType,
            offset
          )
        })
        .then(hash => {
          this.set('offset', offset + this.get('pageSize'));
          this.set('locations', locations.concat(hash.locations));
          this.set('performance', performance.concat(hash.performance));
        });
    }
  },

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {LearnerLocation[]} list of locations to show
   */
  items: Ember.computed('locations.[]', 'performance.[]', function() {
    let locations = this.get('locations');
    let performance = this.get('performance');
    let performanceMap = performance.reduce((result, perfItem) => {
      result[perfItem.courseId || perfItem.collectionId] = perfItem;
      return result;
    }, {});
    return locations.map(location => ({
      location,
      performance: performanceMap[location.courseId || location.collectionId]
    }));
  }),

  /**
   * @property {LearnerLocation[]} list of locations to show
   */
  locations: null,

  /**
   * @property {LearnerPerformance[]} list of performance for every location
   */
  performance: null,

  /**
   * @property {Number} number of items loaded, used to load more
   */
  pageSize: 20,

  /**
   * @property {boolean} if the show more button should be displayed
   */
  showMoreResultsButton: Ember.computed('locations.[]', function() {
    return (
      this.get('locations.length') &&
      this.get('locations.length') % this.get('pageSize') === 0
    );
  }),

  /**
   * @property {Number} number of items loaded, used to load more
   */
  offset: 20,

  /**
   * @property {String} the content type
   */
  contentType: null

  // -------------------------------------------------------------------------
  // Observers

  // -------------------------------------------------------------------------
  // Methods
});
