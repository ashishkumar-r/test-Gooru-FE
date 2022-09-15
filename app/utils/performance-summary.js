import Ember from 'ember';
import ActivityPerformanceSummary from 'gooru-web/models/performance/activity-performance-summary';
import CollectionPerformanceSummary from 'gooru-web/models/performance/collection-performance-summary';
import { average, sumAll } from 'gooru-web/utils/math';

/**
 * Aggregates all users collection activity summary items
 * @param {CollectionPerformanceSummary[]} collectionPerformanceSummaryItems
 * @returns {CollectionPerformanceSummary}
 */
export function aggregateCollectionPerformanceSummaryItems(
  collectionPerformanceSummaryItems
) {
  const timeSpentValues = collectionPerformanceSummaryItems
    .map(function(item) {
      var timeSpent = item.get('timeSpent');
      return timeSpent;
    })
    .filter(function(timeSpent) {
      return timeSpent !== undefined; // throw away any instances which are not undefined
    });

  const scoreValues = collectionPerformanceSummaryItems
    .map(function(item) {
      var score = item.get('score');
      return score;
    })
    .filter(function(score) {
      return score !== undefined; // throw away any instances which are not undefined
    });

  const attempts = collectionPerformanceSummaryItems
    .map(function(item) {
      var attempts = item.get('attempts');
      return attempts;
    })
    .filter(function(attempts) {
      return attempts !== undefined; // throw away any instances which are not undefined
    });

  const collectionId = collectionPerformanceSummaryItems[0].get('collectionId');
  const lastIndex = collectionPerformanceSummaryItems.length - 1;
  const sessionId = collectionPerformanceSummaryItems[lastIndex].get(
    'sessionId'
  );
  const isGraded = collectionPerformanceSummaryItems[lastIndex].get('isGraded');

  return CollectionPerformanceSummary.create({
    collectionId: collectionId,
    sessionId: sessionId,
    timeSpent: timeSpentValues.length > 0 ? sumAll(timeSpentValues) : null,
    score: scoreValues.length > 0 ? average(scoreValues) : null,
    attempts: attempts.length > 0 ? sumAll(attempts) : null,
    isGraded: isGraded,
    averageTimespent:
      timeSpentValues.length > 0 ? average(timeSpentValues) : null
  });
}

/**
 * Aggregates all users class activity summary items
 * @param {Ember.A|ActivityPerformanceSummary[]} activityPerformanceSummaryItems
 * @returns {ActivityPerformanceSummary[]}
 */
export function aggregateClassActivityPerformanceSummaryItems(
  activityPerformanceSummaryItems
) {
  const aggregatedClassActivities = Ember.A([]);
  const dates = activityPerformanceSummaryItems
    .map(a => a.get('date').getTime())
    .uniq();
  dates.forEach(function(date) {
    //gets all user activities within the same date
    const activitiesPerDate = activityPerformanceSummaryItems.filter(
      a => a.get('date').getTime() === date
    );
    const dateCollectionPerformanceSummaryItems = activitiesPerDate.mapBy(
      'collectionPerformanceSummary'
    );
    const collectionIds = dateCollectionPerformanceSummaryItems
      .mapBy('collectionId')
      .uniq();
    collectionIds.forEach(function(collectionId) {
      //gets all user performance items for the same collection
      const collectionPerformanceSummaryItems = dateCollectionPerformanceSummaryItems.filterBy(
        'collectionId',
        collectionId
      );
      const aggregatedActivity = ActivityPerformanceSummary.create({
        date: new Date(date),
        activation_date: moment(date).format('YYYY-MM-DD'),
        collectionPerformanceSummary: aggregateCollectionPerformanceSummaryItems(
          collectionPerformanceSummaryItems
        )
      });
      aggregatedClassActivities.pushObject(aggregatedActivity);
    });
  });
  return aggregatedClassActivities;
}

/**
 * Aggregates all users of offline class activity summary items
 * @param {Ember.A|ActivityPerformanceSummary[]} activityPerformanceSummaryItems
 * @returns {ActivityPerformanceSummary[]}
 */
export function aggregateOfflineClassActivityPerformanceSummaryItems(
  activityPerformanceSummaryItems
) {
  const aggregatedClassActivities = Ember.A([]);
  const dcaContentIds = activityPerformanceSummaryItems
    .mapBy('dcaContentId')
    .uniq();
  dcaContentIds.forEach(function(dcaContentId) {
    let activities = activityPerformanceSummaryItems.filterBy(
      'dcaContentId',
      dcaContentId
    );
    const dcaContentCollectionPerformanceSummaryItems = activities.mapBy(
      'collectionPerformanceSummary'
    );
    const collectionIds = dcaContentCollectionPerformanceSummaryItems
      .mapBy('collectionId')
      .uniq();
    collectionIds.forEach(function(collectionId) {
      //gets all user performance items for the same collection
      const collectionPerformanceSummaryItems = dcaContentCollectionPerformanceSummaryItems.filterBy(
        'collectionId',
        collectionId
      );
      const aggregatedActivity = ActivityPerformanceSummary.create({
        dcaContentId,
        collectionPerformanceSummary: aggregateCollectionPerformanceSummaryItems(
          collectionPerformanceSummaryItems
        )
      });
      aggregatedClassActivities.pushObject(aggregatedActivity);
    });
  });
  return aggregatedClassActivities;
}
