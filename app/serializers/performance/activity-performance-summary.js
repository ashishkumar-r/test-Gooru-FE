import Ember from 'ember';
import ActivityPerformanceSummary from 'gooru-web/models/performance/activity-performance-summary';
import { parseDate } from 'gooru-web/utils/utils';
import CollectionPerformanceSummarySerializer from 'gooru-web/serializers/performance/collection-performance-summary';

/**
 * Serializer to support the CollectionPerformanceSummary CRUD operations
 *
 * @typedef {Object} CollectionPerformanceSummary
 */
export default Ember.Object.extend({
  /**
   * @property {CollectionPerformanceSummarySerializer}
   */
  collectionPerformanceSummarySerializer: null,

  // -------------------------------------------------------------------------
  // Events

  init: function() {
    this._super(...arguments);
    this.set(
      'collectionPerformanceSummarySerializer',
      CollectionPerformanceSummarySerializer.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
  },

  /**
   * Normalize an array of ActivityPerformanceSummary
   *
   * @param payload endpoint response format in JSON format
   * @returns {ActivityPerformanceSummary[]}
   */
  normalizeAllActivityPerformanceSummary: function(payload) {
    const serializer = this;
    const activityPerformanceSummaryItems = Ember.A([]);
    if (payload && Ember.isArray(payload.usageData)) {
      payload.usageData.forEach(function(activityPerformanceSummaryData) {
        const userId = activityPerformanceSummaryData.userId; //process the data for each user
        const activitiesData = activityPerformanceSummaryData.activity || [];
        activitiesData.forEach(function(activityData) {
          const activityPerformanceSummary = serializer.normalizeActivityPerformanceSummary(
            userId,
            activityData
          );
          activityPerformanceSummaryItems.pushObject(
            activityPerformanceSummary
          );
        });
      });
    }

    return activityPerformanceSummaryItems;
  },

  /**
   * Normalize a ActivityPerformanceSummary
   * @param {*} data
   * @return {ActivityPerformanceSummary}
   */
  normalizeActivityPerformanceSummary: function(userId, data) {
    const serializer = this;
    return ActivityPerformanceSummary.create({
      userId: userId,
      date: data.date ? parseDate(data.date, 'YYYY-MM-DD') : null,
      activation_date: data.date ? data.date : null,
      dcaContentId: data.dcaContentId || null,
      collectionPerformanceSummary: serializer
        .get('collectionPerformanceSummarySerializer')
        .normalizeCollectionPerformanceSummary(data)
    });
  }
});
