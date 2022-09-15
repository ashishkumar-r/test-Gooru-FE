import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';

export default Ember.Component.extend({

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {LearnerService} Service to retrieve learner information
   */
  learnerService: Ember.inject.service('api-sdk/learner'),

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  actions: {
    /**
    * toggle show more/less
    */
    togglePanel: function() {
      this.set('isExpanded', !this.get('isExpanded'));
    },

    showMoreResults: function(){
      this.set('isLoading', true);
      const pageSize = this.get('PAGE_SIZE');
      const userId = this.get('session.userId');
      const contentType = this.get('contentType');
      const offset = this.get('OFFSET') + pageSize;
      let locations = this.get('locations');
      let performance = this.get('performance');
      return Ember.RSVP.hash({
        locations: this.get('learnerService').fetchLocations(userId, contentType, offset, pageSize),
        performance: this.get('learnerService').fetchPerformance(userId,contentType, offset, pageSize)
      }).then(hash => {
        this.set('OFFSET', offset);
        this.set('locations', locations.concat(hash.locations));
        this.set('CURRENT_ITERATION_SIZE', hash.locations.length);
        this.set('performance', performance.concat(hash.performance));
      });
    }
  },

  // -------------------------------------------------------------------------
  // Attributes
  /**
   * @property {Number} number of items to load per page
   */
  PAGE_SIZE: 8,
  /**
   * @property {Number} number of items loaded in this iteration
   */
  CURRENT_ITERATION_SIZE: 0,
  /**
   * @property {Number} number of items to show in a row
   */
  ROW_SIZE: 4,
  /**
   * @property {Number} number of offset to get items
   */
  OFFSET: 0,
  /**
   * @property {String} the content type
   */
  contentType: CONTENT_TYPES.COURSE,

  /**
   * @property {Location} location information
   */
  locations: null,

  /**
   * @property {Performance} performance information
   */
  performance: null,

  /**
   * @property {CourseItems} courseItems list to show in the courses section
   */
  courseItems: null,

  /**
  * @property {Boolean} isExpanded panel
  */
  isExpanded: false,

  /**
  * @property {Boolean} isLoading data from the API
  */
  isLoading: true,

  // -------------------------------------------------------------------------
  // Events
  init: function() {
    this._super(...arguments);
    this.set('isLoading', true);
    const pageSize = this.get('PAGE_SIZE');
    const userId = this.get('session.userId');
    const contentType = this.get('contentType');
    const offset = this.get('OFFSET');
    return Ember.RSVP.hash({
      locations: this.get('learnerService').fetchLocations(userId, contentType, offset, pageSize),
      performance: this.get('learnerService').fetchPerformance(userId,contentType, offset, pageSize)
    }).then(hash => {
      this.set('locations', hash.locations);
      this.set('CURRENT_ITERATION_SIZE', hash.locations.length);
      this.set('performance', hash.performance);
    });
  },

  // -------------------------------------------------------------------------
  // Methods
  courseInfo: Ember.observer('performance', function() {
    let locations = this.get('locations');
    let performance = this.get('performance');
    let performanceMap = performance.reduce((result, perfItem) => {
      result[perfItem.courseId || perfItem.collectionId] = perfItem;
      return result;
    }, {});
    let courseData = locations.map(location => ({
      location,
      performance: performanceMap[location.courseId || location.collectionId]
    }));
    this.set('courseItems', courseData);
    this.set('isLoading', false);
  }),

  isShowMoreVisible: Ember.computed('locations', function() {
    return (
      this.get('locations.length') &&
      this.get('CURRENT_ITERATION_SIZE') >= this.get('PAGE_SIZE')
    );
  }),

  showMoreToggle: Ember.computed('locations', function() {
    return (
      this.get('locations.length') >= this.get('ROW_SIZE')
    );
  })

});
