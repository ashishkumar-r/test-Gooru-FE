import Ember from 'ember';

/**
 * Model that contains the notification information
 * @typedef {Object} Notification
 */
export default Ember.Object.extend({
  /**
   * @property {string}
   */
  id: null,

  /**
   * @property {string}
   */
  status: null,

  /**
   * @property {Date} Date in which the rubric was created
   */
  createdDate: null,

  /**
   * @property {Date} Date in which the rubric was updated
   */
  updatedDate: null,

  /**
   * Many values identifying the event type.
   * @property {string} notificationEvent
   */
  notificationEvent: null,

  /**
   * @property {string} Indicator for FE on how to construct the notification display message along with placeholders where links are needed.
   */
  template: null,

  /**
   * @property {Object[]} Actors on notification
   */
  actors: [],

  /**
   * @property {Object} Object that links to relevant content item
   */
  object: null
});
