import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:performance/class-performance-summary',
  'Unit | Serializer | class/class-performance-summary'
);

test('normalizeClassPerformanceSummary', function(assert) {
  const serializer = this.subject();
  const data = {
    classId: '123',
    timeSpent: 23,
    completedCount: 20,
    scoreInPercentage: 10,
    totalCount: 10
  };
  const classPerformanceSummary = serializer.normalizeClassPerformanceSummary(
    data
  );
  assert.equal(classPerformanceSummary.get('id'), '123', 'Wrong id');
  assert.equal(classPerformanceSummary.get('classId'), '123', 'Wrong class id');
  assert.equal(
    classPerformanceSummary.get('timeSpent'),
    23,
    'Wrong time spent'
  );
  assert.equal(
    classPerformanceSummary.get('totalCompleted'),
    20,
    'Wrong total completed'
  );
  assert.equal(classPerformanceSummary.get('score'), 10, 'Wrong score');
  assert.equal(classPerformanceSummary.get('total'), 10, 'Wrong score');
});

test('normalizeAllClassPerformanceSummary', function(assert) {
  const serializer = this.subject();
  const data = {
    usageData: [
      {
        classId: '8c256e4a-4b37-423c-82b6-82fd8a128af2',
        timeSpent: 23860,
        completedCount: 0,
        scoreInPercentage: 0,
        totalCount: 'NA'
      },
      {
        classId: '18943604-108f-4b68-b4b1-b1b40ba6ba22',
        timeSpent: 133348,
        completedCount: 1,
        scoreInPercentage: 40,
        totalCount: 'NA'
      },
      {
        classId: 'aaa5e73a-2372-46a5-8344-4feeab1c9f1d',
        timeSpent: 181397,
        completedCount: 1,
        scoreInPercentage: 80,
        totalCount: 'NA'
      }
    ],
    userId: '95a744e1-631e-4642-875d-8b07a5e3b421'
  };
  const items = serializer.normalizeAllClassPerformanceSummary(data);
  assert.equal(items.length, 3, 'Wrong number of items');
  assert.equal(
    items[0].get('id'),
    '8c256e4a-4b37-423c-82b6-82fd8a128af2',
    'Wrong id'
  );
});
