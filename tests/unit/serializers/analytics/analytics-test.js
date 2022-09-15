import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:analytics/analytics',
  'Unit | Serializer | analytics/analytics'
);

test('normalizeResponse', function(assert) {
  const serializer = this.subject();
  const payload = {
    content: [
      {
        userUid: '602fee94-50cf-4a8b-af2b-6b73e0319bab',
        usageData: [
          {
            gooruOId: '46d4a6d4-991b-4c51-a656-f694e037dd68',
            views: 1,
            score: 1,
            reaction: 5,
            timeSpent: 3600000,
            resourceType: 'question',
            questionType: 'MC',
            answerObject: [
              {
                answerId: 'answer_1'
              }
            ]
          },
          {
            score: 0,
            gooruOId: '135d1eab-f00f-4c51-8c26-0b0efea2207f',
            reaction: 0,
            timeSpent: 14471,
            answerObject: 'NA',
            sessionId:
              'AS~24f90728-a53c-4832-b3bc-c4ef9ac09014~0219090c-abe6-4a09-8c9f-343911f5cd86',
            questionType: 'RES',
            views: 3,
            resourceType: 'resource'
          },
          {
            gooruOId: '46d4a6d4-991b-4c51-a656-f694e037dd68',
            views: 1,
            score: 0,
            reaction: 5,
            timeSpent: 3600000,
            resourceType: 'question',
            questionType: 'MC',
            answerObject: null
          }
        ]
      }
    ],
    message: null,
    paginate: null
  };
  const response = serializer.normalizeResponse(payload);

  assert.equal(response.get('length'), 1, 'Missing user results');
  const userResults = response.get('firstObject');
  assert.equal(
    userResults.get('user'),
    '602fee94-50cf-4a8b-af2b-6b73e0319bab',
    'Wrong user'
  );
  const resourceResults = userResults.get('resourceResults');
  assert.equal(resourceResults.get('length'), 3, 'Missing resource results');
  var firstResource = resourceResults.get('firstObject');
  assert.equal(
    firstResource.get('resourceId'),
    '46d4a6d4-991b-4c51-a656-f694e037dd68',
    'Wrong resource id'
  );
  assert.equal(
    firstResource.get('resourceType'),
    'question',
    'Wrong resource type'
  );
  assert.equal(firstResource.get('reaction'), 5, 'Wrong reaction value');
  assert.equal(
    firstResource.get('timeSpent'),
    3600000,
    'Wrong timeSpent value'
  );
  assert.equal(firstResource.get('correct'), true, 'Wrong correct value');
  assert.equal(firstResource.get('score'), 1, 'Wrong score value');
  assert.equal(
    firstResource.get('userAnswer'),
    'answer_1',
    'Wrong user answer value'
  );
  assert.ok(
    firstResource.get('submittedAnswer'),
    'Wrong submitted answer value'
  );
  const secondResource = resourceResults.objectAt(1);
  assert.equal(
    secondResource.get('resourceId'),
    '135d1eab-f00f-4c51-8c26-0b0efea2207f',
    'Wrong resource id'
  );
  assert.equal(
    secondResource.get('resourceType'),
    'resource',
    'Wrong resource type'
  );
  assert.equal(secondResource.get('reaction'), 0, 'Wrong reaction value');
  assert.equal(secondResource.get('timeSpent'), 14471, 'Wrong timeSpent value');
  assert.equal(
    secondResource.get('sessionId'),
    'AS~24f90728-a53c-4832-b3bc-c4ef9ac09014~0219090c-abe6-4a09-8c9f-343911f5cd86',
    'Wrong sessionId value'
  );
  assert.equal(
    secondResource.get('userAnswer'),
    null,
    'Wrong user answer value'
  );
  const thirdResource = resourceResults.objectAt(2);
  assert.notOk(
    thirdResource.get('submittedAnswer'),
    'Wrong submitted answer value'
  );
});
