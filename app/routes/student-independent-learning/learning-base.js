import Ember from 'ember';
import { CONTENT_TYPES } from 'gooru-web/config/config';

export default Ember.Route.extend({
  templateName: 'student-independent-learning/learning-base',

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

  // -------------------------------------------------------------------------
  // Attributes
  /**
   * @property {Number} number of items to load per page
   */
  PAGE_SIZE: 20,

  /**
   * @property {String} the content type
   */
  contentType: CONTENT_TYPES.COURSE,

  /**
   * @property {String} the menu item name
   */
  item: null,

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Methods
  model: function() {
    const userId = this.get('session.userId');
    const contentType = this.get('contentType');
    return Ember.RSVP.hash({
      locations: this.get('learnerService').fetchLocations(userId, contentType),
      performance: this.get('learnerService').fetchPerformance(
        userId,
        contentType
      )
    });
  },

  setupController: function(controller, model) {
    controller.set('locations', model.locations);
    controller.set('performance', model.performance);
    controller.set('contentType', this.get('contentType'));
    controller.set('pageSize', this.get('PAGE_SIZE'));
    controller.set('offset', this.get('PAGE_SIZE'));
    controller
      .get('studentIndependentController')
      .selectMenuItem(this.get('item'));
  }
});
