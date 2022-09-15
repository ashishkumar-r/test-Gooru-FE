import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/suggest',
  'Unit | Service | api-sdk/suggest',
  {
    needs: [
      'service:api-sdk/collection',
      'service:api-sdk/assessment',
      'service:api-sdk/performance',
      'service:api-sdk/offline-activity/offline-activity'
    ]
  }
);

test('suggestResourcesForCollectionInCourse', function(assert) {
  const service = this.subject();

  assert.expect(10);
  service.set(
    'suggestAdapter',
    Ember.Object.create({
      suggestResourcesForCollection: function(context, limit) {
        assert.equal(
          context.get('collectionId'),
          'collection-id',
          'Wrong container id'
        );
        assert.equal(context.get('userId'), 'user-id', 'Wrong user id');
        assert.equal(context.get('courseId'), 'course-id', 'Wrong course id');
        assert.equal(context.get('unitId'), 'unit-id', 'Wrong unit id');
        assert.equal(context.get('lessonId'), 'lesson-id', 'Wrong lesson id');
        assert.equal(context.get('score'), 10, 'Wrong score');
        assert.equal(context.get('timeSpent'), 100, 'Wrong time spent');
        assert.equal(limit, undefined, 'Wrong limit');
        return Ember.RSVP.resolve({
          a: 1
        });
      }
    })
  );

  service.set(
    'suggestSerializer',
    Ember.Object.create({
      normalizeSuggestResources: function(payload) {
        assert.deepEqual(
          {
            a: 1
          },
          payload,
          'Wrong suggest payload'
        );
        return 'fakeResponse';
      }
    })
  );

  var done = assert.async();
  service
    .suggestResourcesForCollectionInCourse(
      'user-id',
      'course-id',
      'unit-id',
      'lesson-id',
      'collection-id',
      10,
      100
    )
    .then(function(response) {
      assert.equal(response, 'fakeResponse', 'Wrong response');
      done();
    });
});

test('suggestResourcesForCollection', function(assert) {
  const service = this.subject();

  assert.expect(7);
  service.set(
    'suggestAdapter',
    Ember.Object.create({
      suggestResourcesForCollection: function(context, limit) {
        assert.equal(
          context.get('collectionId'),
          'collection-id',
          'Wrong container id'
        );
        assert.equal(context.get('userId'), 'user-id', 'Wrong user id');
        assert.equal(context.get('score'), 10, 'Wrong score');
        assert.equal(context.get('timeSpent'), 100, 'Wrong time spent');
        assert.equal(limit, undefined, 'Wrong limit');
        return Ember.RSVP.resolve({
          a: 1
        });
      }
    })
  );

  service.set(
    'suggestSerializer',
    Ember.Object.create({
      normalizeSuggestResources: function(payload) {
        assert.deepEqual(
          {
            a: 1
          },
          payload,
          'Wrong suggest payload'
        );
        return 'fakeResponse';
      }
    })
  );

  var done = assert.async();
  service
    .suggestResourcesForCollection('user-id', 'collection-id', 10, 100)
    .then(function(response) {
      assert.equal(response, 'fakeResponse', 'Wrong response');
      done();
    });
});

test('suggestResourcesForResourceInCourse', function(assert) {
  const service = this.subject();

  assert.expect(9);
  service.set(
    'suggestAdapter',
    Ember.Object.create({
      suggestResourcesForResource: function(resourceId, context, limit) {
        assert.equal(resourceId, 'resource-id', 'Wrong resource id');
        assert.equal(
          context.get('containerId'),
          'collection-id',
          'Wrong container id'
        );
        assert.equal(context.get('userId'), 'user-id', 'Wrong user id');
        assert.equal(context.get('courseId'), 'course-id', 'Wrong course id');
        assert.equal(context.get('unitId'), 'unit-id', 'Wrong unit id');
        assert.equal(context.get('lessonId'), 'lesson-id', 'Wrong lesson id');
        assert.equal(limit, undefined, 'Wrong limit');
        return Ember.RSVP.resolve({
          a: 1
        });
      }
    })
  );

  service.set(
    'suggestSerializer',
    Ember.Object.create({
      normalizeSuggestResources: function(payload) {
        assert.deepEqual(
          {
            a: 1
          },
          payload,
          'Wrong suggest payload'
        );
        return 'fakeResponse';
      }
    })
  );

  var done = assert.async();
  service
    .suggestResourcesForResourceInCourse(
      'user-id',
      'course-id',
      'unit-id',
      'lesson-id',
      'collection-id',
      'resource-id'
    )
    .then(function(response) {
      assert.equal(response, 'fakeResponse', 'Wrong response');
      done();
    });
});

test('suggestResourcesForResource', function(assert) {
  const service = this.subject();

  assert.expect(5);
  service.set(
    'suggestAdapter',
    Ember.Object.create({
      suggestResourcesForResource: function(resourceId, context, limit) {
        assert.equal(resourceId, 'resource-id', 'Wrong resource id');
        assert.equal(context.get('userId'), 'user-id', 'Wrong user id');
        assert.equal(limit, undefined, 'Wrong limit');
        return Ember.RSVP.resolve({
          a: 1
        });
      }
    })
  );

  service.set(
    'suggestSerializer',
    Ember.Object.create({
      normalizeSuggestResources: function(payload) {
        assert.deepEqual(
          {
            a: 1
          },
          payload,
          'Wrong suggest payload'
        );
        return 'fakeResponse';
      }
    })
  );

  var done = assert.async();
  service
    .suggestResourcesForResource('user-id', 'resource-id')
    .then(function(response) {
      assert.equal(response, 'fakeResponse', 'Wrong response');
      done();
    });
});
