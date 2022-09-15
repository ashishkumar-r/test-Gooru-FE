import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:performance/lesson-performance',
  'Unit | Serializer | performance/lesson-performance'
);

test('normalizeQueryResponse', function(assert) {
  const serializer = this.subject();
  const payload = {
    content: [
      {
        userUid: '6f337b1c-0b0d-49b3-8314-e279181aeddf',
        usageData: [
          {
            lessonId: '27f0bc24-c2b5-40d8-bb8f-e6ec939ad553',
            completedCount: 5,
            scoreInPercentage: 65,
            timeSpent: 89141,
            attempts: 12,
            totalCount: 10
          },
          {
            lessonId: '40fe7ec4-261f-43aa-882b-e678fc754256',
            completedCount: 0,
            scoreInPercentage: 0,
            timeSpent: 32366,
            attempts: 4,
            totalCount: 0
          },
          {
            lessonId: '5c9e8048-493a-489c-89e1-80be13c4bed0',
            completedCount: 0,
            scoreInPercentage: 0,
            timeSpent: 32366,
            attempts: 4,
            totalCount: 0
          },
          {
            lessonId: '7cf4a8ec-adec-4b27-815b-6fa4bea9fd97',
            completedCount: 0,
            scoreInPercentage: 0,
            timeSpent: 32366,
            attempts: 4,
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
        id: '27f0bc24-c2b5-40d8-bb8f-e6ec939ad553',
        type: 'performance/lesson-performance',
        attributes: {
          type: 'lesson',
          score: 65,
          completionDone: 5,
          completionTotal: 10,
          timeSpent: 89141,
          attempts: 12,
          ratingScore: 0
        }
      },
      {
        id: '40fe7ec4-261f-43aa-882b-e678fc754256',
        type: 'performance/lesson-performance',
        attributes: {
          type: 'lesson',
          score: 0,
          completionDone: 0,
          completionTotal: 0,
          timeSpent: 32366,
          attempts: 4,
          ratingScore: 0
        }
      },
      {
        id: '5c9e8048-493a-489c-89e1-80be13c4bed0',
        type: 'performance/lesson-performance',
        attributes: {
          type: 'lesson',
          score: 0,
          completionDone: 0,
          completionTotal: 0,
          timeSpent: 32366,
          attempts: 4,
          ratingScore: 0
        }
      },
      {
        id: '7cf4a8ec-adec-4b27-815b-6fa4bea9fd97',
        type: 'performance/lesson-performance',
        attributes: {
          type: 'lesson',
          score: 0,
          completionDone: 0,
          completionTotal: 0,
          timeSpent: 32366,
          attempts: 4,
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
