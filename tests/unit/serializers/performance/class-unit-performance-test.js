import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:performance/class-unit-performance',
  'Unit | Serializer | performance/class-unit-performance'
);

test('normalizeQueryRecordResponse', function(assert) {
  const serializer = this.subject();
  const payload = {
    content: [
      {
        userUid: 'user-id',
        usageData: [
          {
            unitId: 'unit-id',
            scoreInPercentage: 90,
            completedCount: 10,
            totalCount: 20,
            timeSpent: 10000,
            attempts: 1,
            ratingScore: 0
          }
        ]
      }
    ],
    message: null,
    paginate: null
  };
  const expected = {
    data: {
      type: 'performance/class-performance',
      relationships: {
        studentPerformanceData: {
          data: [
            {
              id: 'user-id',
              type: 'performance/student-performance'
            }
          ]
        }
      }
    },
    included: [
      {
        id: 'user-id@unit-id',
        attributes: {
          type: 'unit',
          score: 90,
          completionDone: 10,
          completionTotal: 20,
          timeSpent: 10000,
          attempts: 1,
          ratingScore: 0
        },
        type: 'performance/unit-performance'
      },
      {
        id: 'user-id',
        relationships: {
          performanceData: {
            data: [
              {
                id: 'user-id@unit-id',
                type: 'performance/unit-performance'
              }
            ]
          },
          user: {
            data: {
              id: 'user-id',
              type: 'user/user'
            }
          }
        },
        type: 'performance/student-performance'
      },
      {
        id: 'user-id',
        type: 'user/user'
      }
    ]
  };
  const response = serializer.normalizeQueryRecordResponse(
    'any store',
    'performance/class-performance',
    payload
  );

  assert.deepEqual(response.data.type, expected.data.type, 'Wrong type');
  assert.deepEqual(
    response.data.relationships,
    expected.data.relationships,
    'Wrong relationships'
  );
  assert.deepEqual(response.included, expected.included, 'Wrong included data');
});
