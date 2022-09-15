import Ember from 'ember';
import { formatDate } from 'gooru-web/utils/utils';

/**
 * Adapter ActivityPerformanceSummary
 *
 * @typedef {Object} ActivityPerformanceSummaryAdapter
 */
export default Ember.Object.extend({
  session: Ember.inject.service(),

  namespace: '/api/nucleus-insights/v2',

  /**
   * Finds activity performance summary for the ids provided
   * @param {string} userId user id, useful to the get the performance for an specific class user
   * @param {string} classId optional class id filter
   * @param {string[]} activityIds
   * @param {string} activityType collection|assessment
   * @param {Date} startDate optional start date, default is now
   * @param {Date} endDate optional end date, default is now
   * @returns {Ember.RSVP.Promise}
   */
  findClassActivityPerformanceSummaryByIds: function(
    userId,
    classId,
    activityIds,
    activityType,
    startDate = new Date(),
    endDate = new Date()
  ) {
    const namespace = this.get('namespace');
    const url = `${namespace}/class/${classId}/activity`;
    const options = {
      type: 'POST',
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      headers: this.defineHeaders(),
      data: JSON.stringify({
        userId: userId,
        collectionType: activityType,
        startDate: formatDate(startDate, 'YYYY-MM-DD'),
        endDate: formatDate(endDate, 'YYYY-MM-DD'),
        collectionIds: activityIds
      })
    };
    return new Ember.RSVP.Promise(function(resolve, reject) {
      Ember.$.ajax(url, options).then(function(responseData) {
        resolve(responseData);
      }, reject);
    });
  },

  /**
   * @function findClassActivityPerformanceSummaryByIds
   * Get performance of offline class activity
   */
  findOfflineClassActivityPerformanceSummaryByIds(classId, oaIds, userId) {
    const adapter = this;
    const namespace = adapter.get('namespace');
    const url = `${namespace}/class/${classId}/activity`;
    const options = {
      type: 'POST',
      headers: adapter.defineHeaders(),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      data: JSON.stringify({
        dcaContentIds: oaIds,
        collectionType: 'offline-activity',
        userId
      })
    };
    return Ember.$.ajax(url, options);
  },

  defineHeaders: function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }
});
