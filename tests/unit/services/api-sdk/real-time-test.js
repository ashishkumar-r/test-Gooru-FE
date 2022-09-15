import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/real-time',
  'Unit | Service | api-sdk/real-time',
  {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  }
);

test('notifyResourceResult', function(assert) {
  const service = this.subject();

  assert.expect(2);

  service.set(
    'realTimeAdapter',
    Ember.Object.create({
      postData: function(data) {
        assert.deepEqual(data, {
          body: {},
          query: {
            classId: 'the-class-id',
            collectionId: 'the-collection-id',
            userId: 'the-user-id'
          }
        });
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'realTimeSerializer',
    Ember.Object.create({
      serialize: function(object) {
        assert.ok(object);
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .notifyResourceResult(
      'the-class-id',
      'the-collection-id',
      'the-user-id',
      Ember.Object.create({})
    )
    .then(function() {
      done();
    });
});

test('findResourcesByCollection', function(assert) {
  const service = this.subject();
  const response = {
    content: [
      {
        userUId: '602fee94-50cf-4a8b-af2b-6b73e0319bab',
        usageData: [
          {
            gooruOId: '46d4a6d4-991b-4c51-a656-f694e037dd68',
            views: 1,
            score: 1,
            reaction: 5,
            timeSpent: 3600000,
            resourceType: 'question',
            questionType: 'MC',
            answerObject: 'NA'
          }
        ]
      }
    ],
    message: null,
    paginate: null
  };

  assert.expect(2);

  service.set(
    'realTimeAdapter',
    Ember.Object.create({
      getData: function(query) {
        assert.deepEqual(query, {
          classId: 'the-class-id',
          collectionId: 'the-collection-id'
        });
        return Ember.RSVP.resolve(response);
      }
    })
  );

  service.set(
    'realTimeSerializer',
    Ember.Object.create({
      normalizeResponse: function(payload) {
        assert.deepEqual(payload, response);
        return [];
      }
    })
  );

  var done = assert.async();
  service
    .findResourcesByCollection('the-class-id', 'the-collection-id')
    .then(function() {
      done();
    });
});

test('notifyAttemptStarted', function(assert) {
  const service = this.subject();

  assert.expect(1);

  service.set(
    'realTimeAdapter',
    Ember.Object.create({
      deleteAttempt: function(data) {
        assert.deepEqual(data, {
          classId: 'the-class-id',
          collectionId: 'the-collection-id',
          userId: 'the-user-id'
        });
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service
    .notifyAttemptStarted('the-class-id', 'the-collection-id', 'the-user-id')
    .then(function() {
      done();
    });
});

test('notifyAttemptFinished', function(assert) {
  const service = this.subject();

  assert.expect(1);

  service.set(
    'realTimeAdapter',
    Ember.Object.create({
      postAttempt: function(data) {
        assert.deepEqual(data, {
          classId: 'the-class-id',
          collectionId: 'the-collection-id',
          userId: 'the-user-id'
        });
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service
    .notifyAttemptFinished('the-class-id', 'the-collection-id', 'the-user-id')
    .then(function() {
      done();
    });
});

test('turnOnAirOn', function(assert) {
  const service = this.subject();

  assert.expect(1);

  service.set(
    'realTimeAdapter',
    Ember.Object.create({
      postOnAir: function(data) {
        assert.deepEqual(data, {
          classId: 'the-class-id',
          collectionId: 'the-collection-id'
        });
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.turnOnAirOn('the-class-id', 'the-collection-id').then(function() {
    done();
  });
});

test('turnOnAirOff', function(assert) {
  const service = this.subject();

  assert.expect(1);

  service.set(
    'realTimeAdapter',
    Ember.Object.create({
      deleteOnAir: function(data) {
        assert.deepEqual(data, {
          classId: 'the-class-id',
          collectionId: 'the-collection-id'
        });
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.turnOnAirOff('the-class-id', 'the-collection-id').then(function() {
    done();
  });
});

test('isOnAir', function(assert) {
  const service = this.subject();

  assert.expect(1);

  service.set(
    'realTimeAdapter',
    Ember.Object.create({
      isOnAir: function(data) {
        assert.deepEqual(data, {
          classId: 'the-class-id',
          collectionId: 'the-collection-id'
        });
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.isOnAir('the-class-id', 'the-collection-id').then(function() {
    done();
  });
});
