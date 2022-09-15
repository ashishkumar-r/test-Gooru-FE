import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:performance/activity-performance-summary',
  'Unit | Serializer | performance/activity-performance-summary'
);

test('normalizeActivityPerformanceSummary', function(assert) {
  assert.expect(4);
  const serializer = this.subject();
  const data = {
    date: '2012-01-20',
    collectionId: '123',
    timeSpent: 23,
    scoreInPercentage: 10,
    attempts: 1,
    views: 2,
    status: 'completed'
  };

  serializer.set(
    'collectionPerformanceSummarySerializer',
    Ember.Object.create({
      normalizeCollectionPerformanceSummary: function(data) {
        assert.equal(data.timeSpent, 23, 'Wrong time spend');
        return 'fake-collection-performance-summary';
      }
    })
  );
  const activityPerformanceSummary = serializer.normalizeActivityPerformanceSummary(
    123,
    data
  );
  assert.equal(activityPerformanceSummary.get('userId'), 123, 'Wrong userId');
  assert.equal(
    activityPerformanceSummary.get('date').getTime(),
    new Date(2012, 0, 20).getTime(),
    'Wrong date'
  );

  const collectionPerformanceSummary = activityPerformanceSummary.get(
    'collectionPerformanceSummary'
  );
  assert.equal(
    collectionPerformanceSummary,
    'fake-collection-performance-summary',
    'Wrong collection performance summary'
  );
});

test('normalizeAllActivityPerformanceSummary', function(assert) {
  const serializer = this.subject();
  const data = {
    usageData: [
      {
        activity: [
          {
            date: '2012-01-30',
            collectionId: '8c256e4a-4b37-423c-82b6-82fd8a128af2',
            timeSpent: 123456,
            scoreInPercentage: 20,
            attempts: 10,
            status: 'complete'
          },
          {
            date: '2012-01-29',
            collectionId: '18943604-108f-4b68-b4b1-b1b40ba6ba22',
            timeSpent: 428342,
            scoreInPercentage: 50,
            attempts: 10,
            status: 'complete'
          }
        ],
        userId: 123
      },
      {
        activity: [
          {
            date: '2012-01-30',
            collectionId: '8c256e4a-4b37-423c-82b6-82fd8a128af2',
            timeSpent: 123456,
            scoreInPercentage: 20,
            attempts: 10,
            status: 'complete'
          }
        ],
        userId: 456
      },
      {
        activity: [],
        userId: 789
      }
    ]
  };
  const items = serializer.normalizeAllActivityPerformanceSummary(data);
  assert.equal(items.get('length'), 3, 'Wrong number of items');
  assert.equal(
    items.get('firstObject.userId'),
    123,
    'Wrong user id for first object'
  );
});
