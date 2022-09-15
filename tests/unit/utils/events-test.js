import Ember from 'ember';
import { startQuestion, stopQuestion } from '../../../utils/events';
import { module, test } from 'qunit';
import Pretender from 'pretender';

module('Unit | Utility | events', {
  beforeEach() {
    //Starting the pretender
    this.pretender = new Pretender();
  },

  afterEach() {
    //Stopping the pretender
    this.pretender.shutdown();
  }
});

test('Start Question', function(assert) {
  var question = {
    id: 'context-gooru-id',
    questionType: 'FIB'
  };

  var eventData = [
    {
      eventId: 'a6fa7cce-703d-4ddf-b6bd-b72f6cf7c471',
      eventName: 'resource.play',
      metrics: '{}',
      payLoadObject: {
        answerObject: [],
        attemptStatus: null,
        questionType: 'FIB'
      },
      session: {
        apiKey: '33b9ad34-1a0c-43ba-bb9c-4784abe07110',
        sessionToken: 'class-token'
      },
      context: {
        contentGooruId: 'context-gooru-id',
        type: 'start'
      },
      endTime: null,
      startTime: 1453924021,
      user: {
        gooruUId: 'user-id'
      },
      version: {
        logApi: '3.0'
      }
    }
  ];

  assert.expect(10);

  new Pretender(function() {
    this.post('/api/log/event', function(request) {
      var req = JSON.parse(request.requestBody)[0];
      var event = eventData[0];
      assert.ok(
        req.eventId.match(/([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)/i),
        'The event id is not correct'
      );
      assert.equal(
        req.eventName,
        event.eventName,
        'The event name is not correct'
      );
      assert.equal(req.metrics, event.metrics, 'The metrics are not correct');
      assert.deepEqual(
        req.payLoadObject,
        event.payLoadObject,
        'The payload is not correct'
      );
      assert.deepEqual(
        req.session,
        event.session,
        'The session is not correct'
      );
      assert.equal(
        req.context.type,
        event.context.type,
        'The context type is not correct'
      );
      assert.ok(
        req.startTime && req.startTime > 0,
        'The startTime is not correct'
      );
      assert.equal(req.endTime, null, 'The endTime is not correct');
      assert.deepEqual(req.user, event.user, 'The user is not correct');
      assert.deepEqual(
        req.version,
        event.version,
        'The version is not correct'
      );
      return [200, { 'Content-Type': 'application/json' }, ''];
    });
  });

  $.getJSON('/api/log/event');

  startQuestion(
    question,
    Ember.Object.create({
      isAnonymous: false,
      token: 'class-token',
      user: {
        gooruUId: 'class-token-user-id'
      },
      userId: 'user-id'
    })
  );
});

test('Stop Question', function(assert) {
  const question = {
    id: 'context-gooru-id',
    questionType: 'FIB'
  };

  const eventData = [
    {
      eventId: 'a6fa7cce-703d-4ddf-b6bd-b72f6cf7c471',
      eventName: 'resource.play',
      metrics: '{}',
      payLoadObject: {
        answerObject: [
          {
            answerId: 10752617,
            order: '1',
            skip: false,
            status: '0',
            text: 'Dwight Eisenhower',
            timeStamp: 1453935316
          }
        ],
        attemptStatus: 'correct',
        questionType: 'FIB'
      },
      session: {
        apiKey: '33b9ad34-1a0c-43ba-bb9c-4784abe07110',
        sessionToken: 'class-token'
      },
      context: {
        contentGooruId: 'context-gooru-id',
        type: 'stop'
      },
      endTime: 1453924021,
      startTime: null,
      user: {
        gooruUId: 'user-id'
      },
      version: {
        logApi: '3.0'
      }
    }
  ];

  const answer = {
    text: 'Dwight Eisenhower',
    status: '0',
    order: '1',
    answerId: 10752617,
    timeStamp: 1453924021,
    skip: false
  };

  const isAnswerCorrect = true;

  assert.expect(17);

  new Pretender(function() {
    this.post('/api/log/event', function(request) {
      var req = JSON.parse(request.requestBody)[0];
      var event = eventData[0];

      assert.ok(
        req.eventId.match(/([a-f\d]{8}(-[a-f\d]{4}){3}-[a-f\d]{12}?)/i),
        'The event id is not correct'
      );
      assert.equal(
        req.eventName,
        event.eventName,
        'The event name is not correct'
      );
      assert.equal(req.metrics, event.metrics, 'The metrics are not correct');
      assert.equal(
        req.payLoadObject.attemptStatus,
        event.payLoadObject.attemptStatus,
        'The attemptStatus is not correct'
      );
      assert.equal(
        req.payLoadObject.questionType,
        event.payLoadObject.questionType,
        'The questionType is not correct'
      );

      assert.equal(
        req.payLoadObject.answerObject[0].answerId,
        event.payLoadObject.answerObject[0].answerId,
        'The answer object answerId is not correct'
      );
      assert.equal(
        req.payLoadObject.answerObject[0].order,
        event.payLoadObject.answerObject[0].order,
        'The answer object order is not correct'
      );
      assert.equal(
        req.payLoadObject.answerObject[0].skip,
        event.payLoadObject.answerObject[0].skip,
        'The answer object skip is not correct'
      );
      assert.equal(
        req.payLoadObject.answerObject[0].status,
        event.payLoadObject.answerObject[0].status,
        'The answer object status is not correct'
      );
      assert.equal(
        req.payLoadObject.answerObject[0].text,
        event.payLoadObject.answerObject[0].text,
        'The answer object answer is not correct'
      );
      assert.ok(
        req.payLoadObject.answerObject[0].timeStamp &&
          req.payLoadObject.answerObject[0].timeStamp > 0,
        'The answer object timeStamp is not correct'
      );

      assert.deepEqual(
        req.session,
        event.session,
        'The session is not correct'
      );
      assert.equal(
        req.context.type,
        event.context.type,
        'The context type is not correct'
      );
      assert.ok(req.endTime && req.endTime > 0, 'The endTime is not correct');
      assert.equal(req.startTime, null, 'The startTime is not correct');
      assert.deepEqual(req.user, event.user, 'The user is not correct');
      assert.deepEqual(
        req.version,
        event.version,
        'The version is not correct'
      );
      return [200, { 'Content-Type': 'application/json' }, ''];
    });
  });

  $.getJSON('/api/log/event');

  stopQuestion(
    question,
    isAnswerCorrect,
    answer,
    Ember.Object.create({
      isAnonymous: false,
      token: 'class-token',
      user: {
        gooruUId: 'class-token-user-id'
      },
      userId: 'user-id'
    })
  );
});
