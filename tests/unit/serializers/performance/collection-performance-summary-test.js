import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:performance/collection-performance-summary',
  'Unit | Serializer | performance/collection-performance-summary'
);

test('normalizeCollectionPerformanceSummary', function(assert) {
  const serializer = this.subject();
  const data = {
    collectionId: '123',
    timeSpent: 23,
    scoreInPercentage: 10,
    attempts: 1,
    views: 2,
    status: 'completed'
  };
  const collectionPerformanceSummary = serializer.normalizeCollectionPerformanceSummary(
    data
  );
  assert.equal(collectionPerformanceSummary.get('id'), '123', 'Wrong id');
  assert.equal(
    collectionPerformanceSummary.get('collectionId'),
    '123',
    'Wrong collection id'
  );
  assert.equal(
    collectionPerformanceSummary.get('timeSpent'),
    23,
    'Wrong time spent'
  );
  assert.equal(collectionPerformanceSummary.get('score'), 10, 'Wrong score');
  assert.equal(
    collectionPerformanceSummary.get('attempts'),
    1,
    'Wrong attempts'
  );
  assert.equal(collectionPerformanceSummary.get('views'), 2, 'Wrong views');
  assert.equal(
    collectionPerformanceSummary.get('status'),
    'completed',
    'Wrong status'
  );
});

test('normalizeAllCollectionPerformanceSummary', function(assert) {
  const serializer = this.subject();
  const data = {
    content: [
      {
        usageData: [
          {
            collectionId: '8c256e4a-4b37-423c-82b6-82fd8a128af2',
            timeSpent: 123456,
            scoreInPercentage: 20,
            attempts: 10,
            status: 'complete'
          },
          {
            collectionId: '18943604-108f-4b68-b4b1-b1b40ba6ba22',
            timeSpent: 428342,
            scoreInPercentage: 50,
            attempts: 10,
            status: 'complete'
          }
        ],
        userId: '95a744e1-631e-4642-875d-8b07a5e3b421'
      }
    ]
  };
  const items = serializer.normalizeAllCollectionPerformanceSummary(data);
  assert.equal(items.length, 2, 'Wrong number of items');
  assert.equal(
    items[0].get('id'),
    '8c256e4a-4b37-423c-82b6-82fd8a128af2',
    'Wrong id'
  );
});
