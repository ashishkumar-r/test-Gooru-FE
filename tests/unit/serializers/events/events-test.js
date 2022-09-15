import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Context from 'gooru-web/models/result/context';
import QuestionResult from 'gooru-web/models/result/question';
import ResourceResult from 'gooru-web/models/result/resource';
import AssessmentResult from 'gooru-web/models/result/assessment';

moduleForComponent(
  'serializer:events/events',
  'Unit | Serializer | events/events'
);

test('serializeResource, for resource result', function(assert) {
  const serializer = this.subject();

  let context = Context.create({
    userId: 'user-id',
    resourceId: 'resource-id',
    collectionId: 'collection-id',
    classId: 'class-id',
    parentEventId: 'parent-id',
    resourceType: 'resource',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'b479f7cd-52af-4b41-a8e5-fbd4b899b099',
    collectionType: 'collection',
    sessionId: 'session-id',
    isStudent: false,
    sourceId: 10
  });

  const resourceResult = ResourceResult.create({
    correct: true,
    reaction: 4,
    timeSpent: 1333,
    startedAt: new Date(),
    submittedAt: null,
    resource: Ember.Object.create({
      id: 123,
      isQuestion: false,
      taxonomy: []
    }),
    resourceEventId: 'resource-event-id'
  });

  const apiKey = 'api-key-1';
  const response = serializer.serializeResource(
    resourceResult,
    context,
    'stop',
    apiKey
  )[0];

  assert.equal(
    response.eventId,
    'resource-event-id',
    'Wrong resource event id'
  );
  assert.equal(
    response.eventName,
    'collection.resource.play',
    'Wrong event name'
  );
  assert.equal(response.session.apiKey, 'api-key-1', 'Wrong session api key');
  assert.equal(response.session.sessionId, 'session-id', 'Wrong session id');
  assert.ok(response.startTime, 'Missing start time');
  assert.equal(
    response.startTime,
    response.endTime,
    'Start time and end time should be the same when end time is not provided'
  );
  assert.equal(response.user.gooruUId, 'user-id', 'Wrong user id');
  assert.ok(response.context, 'Missing context object');
  assert.equal(response.version.logApi, '3.0', 'Wrong api log version');
  assert.deepEqual(response.metrics, {}, 'Wrong metrics');
  assert.equal(response.payLoadObject.isStudent, false, 'Wrong is student');
  assert.equal(response.payLoadObject.taxonomyIds, null, 'Wrong taxonomy ids');
  assert.equal(response.payLoadObject.sourceId, 10, 'Wrong source id');
});

test('serializeResource, for resource result, having submittedAt lower than startedAt', function(assert) {
  const serializer = this.subject();

  let context = Context.create({
    userId: 'user-id',
    resourceId: 'resource-id',
    collectionId: 'collection-id',
    classId: 'class-id',
    parentEventId: 'parent-id',
    resourceType: 'resource',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'b479f7cd-52af-4b41-a8e5-fbd4b899b099',
    collectionType: 'collection',
    sessionId: 'session-id',
    isStudent: false,
    sourceId: 10
  });

  const resourceResult = ResourceResult.create({
    correct: true,
    reaction: 4,
    timeSpent: 1333,
    startedAt: new Date(1480375447326),
    submittedAt: new Date(1480375429443),
    resource: Ember.Object.create({
      id: 123,
      isQuestion: false,
      taxonomy: []
    }),
    resourceEventId: 'resource-event-id'
  });

  const apiKey = 'api-key-1';
  const response = serializer.serializeResource(
    resourceResult,
    context,
    'stop',
    apiKey
  )[0];
  assert.ok(response.startTime, 'Missing start time');
  assert.equal(
    response.startTime,
    response.endTime,
    'Start time and end time should be the same when end time is lower than start time'
  );
});

test('serializeResource, for question result', function(assert) {
  const serializer = this.subject();

  let context = Context.create({
    userId: 'user-id',
    resourceId: 'resource-id',
    collectionId: 'collection-id',
    classId: 'class-id',
    parentEventId: 'parent-id',
    resourceType: 'resource',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'b479f7cd-52af-4b41-a8e5-fbd4b899b099',
    collectionType: 'collection',
    sessionId: 'session-id',
    isStudent: false,
    sourceId: 10
  });

  const resourceResult = QuestionResult.create({
    correct: true,
    reaction: 4,
    timeSpent: 1333,
    startedAt: new Date(),
    submittedAt: null,
    resource: Ember.Object.create({
      id: 123,
      isQuestion: true,
      questionType: 'MC',
      taxonomy: [],
      answers: Ember.A([
        Ember.Object.create({ id: 1, isCorrect: true, text: 'A' }),
        Ember.Object.create({ id: 2, isCorrect: false, text: 'B' })
      ])
    }),
    userAnswer: 1,
    attemptStatus: 'started',
    resourceEventId: 'resource-event-id'
  });

  const apiKey = 'api-key-1';
  const response = serializer.serializeResource(
    resourceResult,
    context,
    'stop',
    apiKey
  )[0];

  assert.equal(
    response.eventId,
    'resource-event-id',
    'Wrong resource event id'
  );
  assert.equal(
    response.eventName,
    'collection.resource.play',
    'Wrong event name'
  );
  assert.equal(response.session.apiKey, 'api-key-1', 'Wrong session api key');
  assert.equal(response.session.sessionId, 'session-id', 'Wrong session id');
  assert.ok(response.startTime, 'Missing start time');
  assert.equal(
    response.startTime,
    response.endTime,
    'Start time and end time should be the same when end time is not provided'
  );
  assert.equal(response.user.gooruUId, 'user-id', 'Wrong user id');
  assert.ok(response.context, 'Missing context object');
  assert.equal(response.version.logApi, '3.0', 'Wrong api log version');
  assert.deepEqual(response.metrics, {}, 'Wrong metrics');
  assert.equal(
    response.payLoadObject.questionType,
    'MC',
    'Wrong question type'
  );
  assert.equal(
    response.payLoadObject.attemptStatus,
    'started',
    'Wrong question type'
  );
  assert.deepEqual(
    response.payLoadObject.answerObject,
    [
      {
        answerId: 1,
        order: 1,
        skip: false,
        status: 'correct',
        text: 'A'
      }
    ],
    'Wrong answer object'
  );

  assert.equal(response.payLoadObject.isStudent, false, 'Wrong is student');
  assert.equal(response.payLoadObject.taxonomyIds, null, 'Wrong taxonomy ids');
  assert.equal(response.payLoadObject.sourceId, 10, 'Wrong source id');
});

test('getContextValuesForResult', function(assert) {
  const serializer = this.subject();

  let context = Context.create({
    userId: 'user-id',
    resourceId: 'resource-id',
    collectionId: 'collection-id',
    classId: 'class-id',
    parentEventId: 'parent-id',
    resourceType: 'resource',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id',
    collectionType: 'collection'
  });

  let serialized = serializer.getContextValuesForResult(
    context,
    123,
    'stop',
    'any-resource-type',
    'any-reaction-type'
  );
  assert.equal(serialized.contentGooruId, 123, 'wrong content gooru id');
  assert.equal(
    serialized.parentGooruId,
    'collection-id',
    'wrong parent gooru id'
  );
  assert.equal(serialized.classGooruId, 'class-id', 'wrong class gooru id');
  assert.equal(serialized.parentEventId, 'parent-id', 'wrong parent event id');
  assert.equal(serialized.type, 'stop', 'wrong event type');
  assert.equal(serialized.courseGooruId, 'course-id', 'wrong course gooru id');
  assert.equal(serialized.unitGooruId, 'unit-id', 'wrong unit gooru id');
  assert.equal(serialized.lessonGooruId, 'lesson-id', 'wrong lesson gooru id');
  assert.equal(
    serialized.collectionType,
    'collection',
    'wrong collection type'
  );
  assert.equal(
    serialized.resourceType,
    'any-resource-type',
    'wrong resource type'
  );
  assert.equal(serialized.clientSource, 'web', 'wrong client source');
  assert.equal(
    serialized.reactionType,
    'any-reaction-type',
    'wrong reaction type'
  );
});

test('getContextValuesForCollection', function(assert) {
  const serializer = this.subject();

  let context = Context.create({
    userId: 'user-id',
    collectionId: 'collection-id',
    classId: 'class-id',
    resourceType: 'resource',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id',
    collectionType: 'collection'
  });

  let serialized = serializer.getContextValuesForCollection(
    context,
    'stop',
    123
  );
  assert.equal(serialized.type, 'stop', 'wrong event type');
  assert.equal(
    serialized.contentGooruId,
    'collection-id',
    'wrong content gooru id'
  );
  assert.equal(serialized.classGooruId, 'class-id', 'wrong class gooru id');
  assert.equal(serialized.courseGooruId, 'course-id', 'wrong course gooru id');
  assert.equal(serialized.unitGooruId, 'unit-id', 'wrong unit gooru id');
  assert.equal(serialized.lessonGooruId, 'lesson-id', 'wrong lesson gooru id');
  assert.equal(
    serialized.collectionType,
    'collection',
    'wrong collection type'
  );
  assert.equal(serialized.questionCount, 123, 'wrong question count');
  assert.equal(serialized.clientSource, 'web', 'wrong client source');
});

test('serializeCollection', function(assert) {
  const serializer = this.subject();

  let context = Context.create({
    userId: 'user-id',
    collectionId: 'collection-id',
    classId: 'class-id',
    resourceType: 'resource',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id',
    collectionType: 'collection',
    parentEventId: 'parent-event-id',
    sessionId: 'session-id',
    isStudent: false,
    sourceId: 10
  });

  let assessmentResult = AssessmentResult.create({
    totalNonOpenEndedQuestions: 10,
    startedAt: new Date(),
    submittedAt: null
  });

  let serialized = serializer.serializeCollection(
    assessmentResult,
    context,
    'stop',
    'api-key-1'
  )[0];
  assert.equal(serialized.eventId, 'parent-event-id', 'wrong parent event id');
  assert.equal(serialized.eventName, 'collection.play', 'wrong event name');
  assert.equal(serialized.session.apiKey, 'api-key-1', 'wrong api key');
  assert.equal(serialized.session.sessionId, 'session-id', 'wrong api key');
  assert.ok(serialized.startTime, 'missing start time');
  assert.equal(
    serialized.startTime,
    serialized.endTime,
    'Start time and end time should be the same when end time is not provided'
  );
  assert.equal(serialized.user.gooruUId, 'user-id', 'Wrong user id');
  assert.ok(serialized.context, 'Missing context object');
  assert.equal(serialized.version.logApi, '3.0', 'Wrong api log version');
  assert.deepEqual(serialized.metrics, {}, 'Wrong metrics');
  assert.equal(
    serialized.payLoadObject.gradingType,
    'System',
    'Wrong grading type'
  );
  assert.equal(serialized.payLoadObject.isStudent, false, 'Wrong is student');
  assert.equal(serialized.payLoadObject.sourceId, 10, 'Wrong source id');
});

test('serializeReaction', function(assert) {
  const serializer = this.subject();
  const context = Context.create({
    userId: 'user-id',
    sessionId: 'session-id',
    resourceId: 'resource-id',
    collectionId: 'collection-id',
    classId: 'class-id',
    parentEventId: 'parent-id',
    resourceType: 'resource',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id',
    collectionType: 'collection',
    isStudent: true,
    sourceId: 10
  });
  const resourceResult = QuestionResult.create({
    resource: Ember.Object.create({ id: 'resource-id' }),
    reaction: 3,
    startedAt: null,
    resourceEventId: 'resource-event-id'
  });
  const apiKey = 'api-key-1';
  const response = serializer.serializeReaction(
    resourceResult,
    context,
    apiKey
  );
  const expected = [
    {
      eventId: 'resource-event-id',
      eventName: 'reaction.create',
      session: { apiKey: 'api-key-1', sessionId: 'session-id' },
      startTime: null,
      endTime: null,
      user: { gooruUId: 'user-id' },
      context: {
        contentGooruId: 'resource-id',
        parentGooruId: 'collection-id',
        classGooruId: 'class-id',
        parentEventId: 'parent-id',
        courseGooruId: 'course-id',
        unitGooruId: 'unit-id',
        lessonGooruId: 'lesson-id',
        collectionType: 'collection',
        reactionType: 3
      },
      version: { logApi: '3.0' },
      metrics: {},
      payLoadObject: { isStudent: true, sourceId: 10 }
    }
  ];

  assert.deepEqual(expected, response, 'Wrong response');
});
