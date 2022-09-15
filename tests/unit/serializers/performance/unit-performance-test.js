import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:performance/unit-performance',
  'Unit | Serializer | performance/unit-performance'
);

test('normalizeQueryResponse', function(assert) {
  const serializer = this.subject();
  const payload = {
    content: [
      {
        userUid: '6f337b1c-0b0d-49b3-8314-e279181aeddf',
        usageData: [
          {
            unitId: 'first-unit-id',
            completedCount: 5,
            scoreInPercentage: 80,
            timeSpent: 121507,
            attempts: 16,
            totalCount: 10
          },
          {
            unitId: 'second-unit-id',
            completedCount: 3,
            scoreInPercentage: 55,
            timeSpent: 215122,
            attempts: 7,
            totalCount: 10
          },
          {
            unitId: 'third-unit-id',
            completedCount: 3,
            scoreInPercentage: 55,
            timeSpent: 215122,
            attempts: 7,
            totalCount: 10
          },
          {
            unitId: 'c1f810a2-c87f-48f5-a899-0d9753383042',
            completedCount: 3,
            scoreInPercentage: 55,
            timeSpent: 215122,
            attempts: 7,
            totalCount: 10
          },
          {
            unitId: 'dfc99db4-d331-4733-ac06-35358cee5c64',
            completedCount: 3,
            scoreInPercentage: 55,
            timeSpent: 215122,
            attempts: 7,
            totalCount: 10
          }
        ]
      }
    ],
    message: null,
    paginate: null
  };
  const expected = {
    data: [
      {
        id: 'first-unit-id',
        type: 'performance/unit-performance',
        attributes: {
          type: 'unit',
          score: 80,
          completionDone: 5,
          completionTotal: 10,
          timeSpent: 121507,
          attempts: 16,
          ratingScore: 0
        }
      },
      {
        id: 'second-unit-id',
        type: 'performance/unit-performance',
        attributes: {
          type: 'unit',
          score: 55,
          completionDone: 3,
          completionTotal: 10,
          timeSpent: 215122,
          attempts: 7,
          ratingScore: 0
        }
      },
      {
        id: 'third-unit-id',
        type: 'performance/unit-performance',
        attributes: {
          type: 'unit',
          score: 55,
          completionDone: 3,
          completionTotal: 10,
          timeSpent: 215122,
          attempts: 7,
          ratingScore: 0
        }
      },
      {
        id: 'c1f810a2-c87f-48f5-a899-0d9753383042',
        type: 'performance/unit-performance',
        attributes: {
          type: 'unit',
          score: 55,
          completionDone: 3,
          completionTotal: 10,
          timeSpent: 215122,
          attempts: 7,
          ratingScore: 0
        }
      },
      {
        id: 'dfc99db4-d331-4733-ac06-35358cee5c64',
        type: 'performance/unit-performance',
        attributes: {
          type: 'unit',
          score: 55,
          completionDone: 3,
          completionTotal: 10,
          timeSpent: 215122,
          attempts: 7,
          ratingScore: 0
        }
      }
    ]
  };
  const response = serializer.normalizeQueryResponse(
    'any store',
    'performance/unit-performance',
    payload
  );

  assert.deepEqual(response, expected, 'Wrong response');
});
