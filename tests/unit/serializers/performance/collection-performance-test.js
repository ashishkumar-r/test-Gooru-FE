import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:performance/collection-performance',
  'Unit | Serializer | performance/collection-performance'
);

test('normalizeQueryResponse', function(assert) {
  const serializer = this.subject();
  const payload = {
    content: [
      {
        userUid: '6f337b1c-0b0d-49b3-8314-e279181aeddf',
        usageData: [
          {
            completedCount: 10,
            collectionId: '88c8c296-9b25-4ca2-80f8-949076a48f99',
            scoreInPercentage: 90,
            timeSpent: 130339,
            views: 18,
            totalCount: 20
          },
          {
            completedCount: 0,
            collectionId: 'd26f086a-01d5-4b27-b140-cf8b8e0aee78',
            scoreInPercentage: 0,
            timeSpent: 0,
            views: 12,
            totalCount: 0
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
        id: '88c8c296-9b25-4ca2-80f8-949076a48f99',
        type: 'performance/collection-performance',
        attributes: {
          type: 'collection',
          score: 90,
          completionDone: 10,
          completionTotal: 20,
          timeSpent: 130339,
          attempts: undefined,
          ratingScore: 0
        }
      },
      {
        id: 'd26f086a-01d5-4b27-b140-cf8b8e0aee78',
        type: 'performance/collection-performance',
        attributes: {
          type: 'collection',
          score: 0,
          completionDone: 0,
          completionTotal: 0,
          timeSpent: 0,
          attempts: undefined,
          ratingScore: 0
        }
      }
    ]
  };
  const response = serializer.normalizeQueryResponse(
    'any store',
    'performance/lesson-performance',
    payload
  );

  assert.deepEqual(response, expected, 'Wrong response');
});

test('normalizeQueryResponse - alternatePath', function(assert) {
  const serializer = this.subject();
  const payload = {
    content: [
      {
        userUid: '6f337b1c-0b0d-49b3-8314-e279181aeddf',
        alternatePath: [
          {
            resourceId: '88888888-9b25-4ca2-80f8-949076a48f99',
            assessmentId: '88c8c296-9b25-4ca2-80f8-949076a48f99',
            timeSpent: 130339,
            views: 18
          }
        ],
        usageData: [
          {
            completedCount: 10,
            assessmentId: '88c8c296-9b25-4ca2-80f8-949076a48f99',
            scoreInPercentage: 90,
            timeSpent: 130339,
            views: 18,
            totalCount: 20
          },
          {
            completedCount: 0,
            assessmentId: 'd26f086a-01d5-4b27-b140-cf8b8e0aee78',
            scoreInPercentage: 0,
            timeSpent: 0,
            views: 12,
            totalCount: 0
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
        id: '88c8c296-9b25-4ca2-80f8-949076a48f99',
        type: 'performance/collection-performance',
        attributes: {
          type: 'assessment',
          score: 90,
          completionDone: 10,
          completionTotal: 20,
          timeSpent: 130339,
          attempts: undefined,
          ratingScore: 0
        }
      },
      {
        id: 'd26f086a-01d5-4b27-b140-cf8b8e0aee78',
        type: 'performance/collection-performance',
        attributes: {
          type: 'assessment',
          score: 0,
          completionDone: 0,
          completionTotal: 0,
          timeSpent: 0,
          attempts: undefined,
          ratingScore: 0
        }
      },
      {
        id: '88888888-9b25-4ca2-80f8-949076a48f99',
        type: 'performance/collection-performance',
        attributes: {
          type: 'resource',
          score: undefined,
          completionDone: undefined,
          completionTotal: undefined,
          timeSpent: 130339,
          attempts: undefined,
          ratingScore: 0
        }
      }
    ]
  };
  const response = serializer.normalizeQueryResponse(
    'any store',
    'performance/lesson-performance',
    payload
  );

  assert.deepEqual(response, expected, 'Wrong response');
});
