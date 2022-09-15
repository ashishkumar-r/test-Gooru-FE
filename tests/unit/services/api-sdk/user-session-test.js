import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import Context from 'gooru-web/models/result/context';

moduleForService(
  'service:api-sdk/user-session',
  'Unit | Service | api-sdk/user-session',
  {
    needs: [
      'serializer:user-session',
      'model:result/context',
      'adapter:user-session'
    ]
  }
);

test('getCompletedSessions', function(assert) {
  const service = this.subject();
  const response = {
    content: [
      {
        sequence: 1,
        eventTime: 1,
        sessionId: 'session-1'
      },
      {
        sequence: 2,
        eventTime: 1,
        sessionId: 'session-2'
      }
    ]
  };
  const expectedQuery = {
    collectionType: 'collectionType',
    classId: 'classId',
    courseId: 'courseId',
    userId: 'userId',
    unitId: 'unitId',
    lessonId: 'lessonId',
    contentId: 'contentId',
    openSession: false
  };

  service.set(
    'userSessionAdapter',
    Ember.Object.create({
      queryRecord: function(query) {
        assert.deepEqual(
          expectedQuery,
          query,
          'Wrong queryRecord query parameters'
        );
        return Ember.RSVP.resolve(response);
      }
    })
  );

  service.set(
    'userSessionSerializer',
    Ember.Object.create({
      serializeSessionAssessments: function(payload) {
        assert.deepEqual(response, payload, 'Wrong assessments payload');
        return [];
      }
    })
  );

  var done = assert.async();
  const promise = service.getCompletedSessions(
    Context.create({
      collectionType: 'collectionType',
      classId: 'classId',
      courseId: 'courseId',
      userId: 'userId',
      unitId: 'unitId',
      lessonId: 'lessonId',
      collectionId: 'contentId'
    })
  );
  promise.then(function() {
    done();
  });
});

test('getOpenSession', function(assert) {
  const service = this.subject();
  const response = {
    content: {
      sequence: 1,
      eventTime: 1,
      sessionId: 'session-1'
    }
  };
  const expectedQuery = {
    collectionType: 'collectionType',
    classId: 'classId',
    courseId: 'courseId',
    userId: 'userId',
    unitId: 'unitId',
    lessonId: 'lessonId',
    contentId: 'contentId',
    openSession: true
  };

  service.set(
    'userSessionAdapter',
    Ember.Object.create({
      queryRecord: function(query) {
        assert.deepEqual(
          expectedQuery,
          query,
          'Wrong queryRecord query parameters'
        );
        return Ember.RSVP.resolve(response);
      }
    })
  );

  service.set(
    'userSessionSerializer',
    Ember.Object.create({
      serializeOpenAssessment: function(payload) {
        assert.deepEqual(response, payload, 'Wrong assessments payload');
        return [];
      }
    })
  );

  const context = Context.create({
    collectionType: 'collectionType',
    classId: 'classId',
    courseId: 'courseId',
    userId: 'userId',
    unitId: 'unitId',
    lessonId: 'lessonId',
    collectionId: 'contentId'
  });

  var done = assert.async();
  const promise = service.getOpenSession(context);
  promise.then(function() {
    done();
  });
});
