import Ember from 'ember';
import {
  aggregateClassActivityPerformanceSummaryItems,
  aggregateCollectionPerformanceSummaryItems
} from 'gooru-web/utils/performance-summary';
import ActivityPerformanceSummary from 'gooru-web/models/performance/activity-performance-summary';
import CollectionPerformanceSummary from 'gooru-web/models/performance/collection-performance-summary';

import { module, test } from 'qunit';

module('Unit | Utility | performance summary');

test('aggregateCollectionPerformanceSummaryItems', function(assert) {
  const collectionPerformanceSummaryItems = Ember.A([
    CollectionPerformanceSummary.create({
      timeSpent: 10,
      score: 20,
      attempts: 5,
      collectionId: 123
    }),
    CollectionPerformanceSummary.create({
      timeSpent: 20,
      score: 30,
      attempts: 15,
      collectionId: 123
    }),
    CollectionPerformanceSummary.create({
      timeSpent: 55,
      score: 40,
      attempts: 5,
      collectionId: 123
    }),
    CollectionPerformanceSummary.create({
      timeSpent: 10,
      score: 20,
      attempts: 5,
      collectionId: 123
    }),
    CollectionPerformanceSummary.create({
      //should also count this performance with no values
      timeSpent: null,
      score: null,
      attempts: null,
      collectionId: 123
    })
  ]);

  const aggregated = aggregateCollectionPerformanceSummaryItems(
    collectionPerformanceSummaryItems
  );
  assert.equal(aggregated.get('collectionId'), 123, 'Wrong collection id');
  assert.equal(aggregated.get('timeSpent'), 19, 'Wrong time spent');
  assert.equal(aggregated.get('attempts'), 30, 'Wrong attempts');
  assert.equal(aggregated.get('score'), 22, 'Wrong score');
});

test('aggregateClassActivityPerformanceSummaryItems', function(assert) {
  const collectionAId = 123;
  const collectionBId = 321;

  const _2012_0_10 = new Date(2012, 0, 12);
  const _2012_0_10_activities = [
    ActivityPerformanceSummary.create({
      date: _2012_0_10,
      collectionPerformanceSummary: CollectionPerformanceSummary.create({
        timeSpent: 10,
        score: 20,
        attempts: 5,
        collectionId: collectionAId
      }),
      userId: 10
    }),
    ActivityPerformanceSummary.create({
      date: _2012_0_10,
      collectionPerformanceSummary: CollectionPerformanceSummary.create({
        timeSpent: 20,
        score: 30,
        attempts: 15,
        collectionId: collectionAId
      }),
      userId: 20
    }),
    ActivityPerformanceSummary.create({
      date: _2012_0_10,
      collectionPerformanceSummary: CollectionPerformanceSummary.create({
        timeSpent: 55,
        score: 40,
        attempts: 5,
        collectionId: collectionAId
      }),
      userId: 30
    }),
    ActivityPerformanceSummary.create({
      date: _2012_0_10,
      collectionPerformanceSummary: CollectionPerformanceSummary.create({
        timeSpent: 10,
        score: 20,
        attempts: 5,
        collectionId: collectionAId
      }),
      userId: 40
    }),
    ActivityPerformanceSummary.create({
      date: _2012_0_10,
      collectionPerformanceSummary: CollectionPerformanceSummary.create({
        timeSpent: null,
        score: null,
        attempts: null,
        collectionId: collectionAId
      }),
      userId: 50
    })
  ];

  const _2012_2_10 = new Date(2012, 2, 12);
  const _2012_2_10_activities = [
    ActivityPerformanceSummary.create({
      date: _2012_2_10,
      collectionPerformanceSummary: CollectionPerformanceSummary.create({
        timeSpent: 10,
        score: 20,
        attempts: 5,
        collectionId: collectionAId
      }),
      userId: 10
    }),
    ActivityPerformanceSummary.create({
      date: _2012_2_10,
      collectionPerformanceSummary: CollectionPerformanceSummary.create({
        timeSpent: 10,
        score: 20,
        attempts: 5,
        collectionId: collectionBId //second collection
      }),
      userId: 10
    }),
    ActivityPerformanceSummary.create({
      date: _2012_2_10,
      collectionPerformanceSummary: CollectionPerformanceSummary.create({
        timeSpent: 20,
        score: 30,
        attempts: 15,
        collectionId: collectionAId
      }),
      userId: 20
    })
  ];

  const activityPerformanceSummaryItems = Ember.A();
  activityPerformanceSummaryItems.pushObjects(_2012_0_10_activities);
  activityPerformanceSummaryItems.pushObjects(_2012_2_10_activities);

  const aggregatedItems = aggregateClassActivityPerformanceSummaryItems(
    activityPerformanceSummaryItems
  );
  assert.equal(
    aggregatedItems.get('length'),
    3,
    'Wrong total aggregated items, 1 for 2012-0-10 and 2 for 2012-2-10'
  );

  const aggregatedItemsFor2012_0_10 = aggregatedItems.filter(
    a => a.get('date').getTime() === _2012_0_10.getTime()
  );
  assert.equal(
    aggregatedItemsFor2012_0_10.get('length'),
    1,
    'Wrong items for 2012-0-10'
  );
  const aggregatedFor2012_0_10 = aggregatedItemsFor2012_0_10[0];
  assert.equal(
    aggregatedFor2012_0_10.get('collectionPerformanceSummary.collectionId'),
    collectionAId,
    'Wrong collection id'
  );
  assert.equal(
    aggregatedFor2012_0_10.get('collectionPerformanceSummary.timeSpent'),
    19,
    'Wrong time spent'
  );
  assert.equal(
    aggregatedFor2012_0_10.get('collectionPerformanceSummary.attempts'),
    30,
    'Wrong attempts'
  );
  assert.equal(
    aggregatedFor2012_0_10.get('collectionPerformanceSummary.score'),
    22,
    'Wrong score'
  );

  const aggregatedItemsFor2012_2_10 = aggregatedItems.filter(
    a => a.get('date').getTime() === _2012_2_10.getTime()
  );
  assert.equal(
    aggregatedItemsFor2012_2_10.get('length'),
    2,
    'Wrong items for 2012-2-10'
  );
  const aggregatedFor2012_2_10 = aggregatedItemsFor2012_2_10[1];
  assert.equal(
    aggregatedFor2012_2_10.get('collectionPerformanceSummary.collectionId'),
    collectionBId,
    'Wrong collection id'
  );
  assert.equal(
    aggregatedFor2012_2_10.get('collectionPerformanceSummary.timeSpent'),
    10,
    'Wrong time spent'
  );
  assert.equal(
    aggregatedFor2012_2_10.get('collectionPerformanceSummary.attempts'),
    5,
    'Wrong attempts'
  );
  assert.equal(
    aggregatedFor2012_2_10.get('collectionPerformanceSummary.score'),
    20,
    'Wrong score'
  );
});
