import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/analytics',
  'Unit | Service | api-sdk/analytics',
  {
    // Specify the other units that are required for this test.
    needs: [
      'service:api-sdk/analytics',
      'service:api-sdk/course',
      'service:api-sdk/unit',
      'service:api-sdk/lesson',
      'service:api-sdk/assessment',
      'service:api-sdk/collection'
    ]
  }
);

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
    'analyticsAdapter',
    Ember.Object.create({
      queryRecord: function(query) {
        assert.deepEqual(query, {
          classId: 'the-class-id',
          courseId: 'the-course-id',
          unitId: 'the-unit-id',
          lessonId: 'the-lesson-id',
          collectionId: 'the-collection-id',
          collectionType: 'the-collection-type'
        });
        return Ember.RSVP.resolve(response);
      }
    })
  );

  service.set(
    'analyticsSerializer',
    Ember.Object.create({
      normalizeResponse: function(payload) {
        assert.deepEqual(payload, response);
        return [];
      }
    })
  );

  var done = assert.async();
  service
    .findResourcesByCollection(
      'the-class-id',
      'the-course-id',
      'the-unit-id',
      'the-lesson-id',
      'the-collection-id',
      'the-collection-type'
    )
    .then(function() {
      done();
    });
});

test('getUserCurrentLocation fetchAll-default-value', function(assert) {
  assert.expect(3);

  const service = this.subject({
    loadCurrentLocationData: function(currentLocation) {
      assert.ok(false, 'loadCurrentLocationData should not be called');
      return Ember.RSVP.resolve(currentLocation);
    }
  });

  service.set(
    'currentLocationAdapter',
    Ember.Object.create({
      getUserCurrentLocation: function(classId, userId) {
        assert.equal(classId, 345, 'wrong class id');
        assert.equal(userId, 123, 'wrong user id');
        return Ember.RSVP.resolve('fake response');
      }
    })
  );

  service.set(
    'currentLocationSerializer',
    Ember.Object.create({
      normalizeForGetUserCurrentLocation: function(payload) {
        assert.equal(
          payload,
          'fake response',
          'wrong payload, should match adapter response'
        );
        return Ember.Object.create({
          courseId: 'courseId',
          unitId: 'unitId',
          lessonId: 'lessonId'
        });
      }
    })
  );

  var done = assert.async();
  service.getUserCurrentLocation(345, 123).then(function() {
    done();
  });
});

test('getUserCurrentLocation fetchAll-true currentLocation-null', function(assert) {
  assert.expect(3);

  const service = this.subject({
    loadCurrentLocationData: function(currentLocation) {
      assert.ok(
        false,
        'loadCurrentLocationData should not be called, because current location is null'
      );
      return Ember.RSVP.resolve(currentLocation);
    }
  });

  service.set(
    'currentLocationAdapter',
    Ember.Object.create({
      getUserCurrentLocation: function(classId, userId) {
        assert.equal(classId, 345, 'wrong class id');
        assert.equal(userId, 123, 'wrong user id');
        return Ember.RSVP.resolve('fake response');
      }
    })
  );

  service.set(
    'currentLocationSerializer',
    Ember.Object.create({
      normalizeForGetUserCurrentLocation: function(payload) {
        assert.equal(
          payload,
          'fake response',
          'wrong payload, should match adapter response'
        );
        return null;
      }
    })
  );

  var done = assert.async();
  service.getUserCurrentLocation(345, 123, true).then(function() {
    done();
  });
});

test('getUserCurrentLocation fetchAll-true', function(assert) {
  assert.expect(3);

  const service = this.subject({
    loadCurrentLocationData: function(currentLocation) {
      assert.ok(true, 'loadCurrentLocationData should be called once');
      return Ember.RSVP.resolve(currentLocation);
    }
  });

  service.set(
    'currentLocationAdapter',
    Ember.Object.create({
      getUserCurrentLocation: function(classId, userId) {
        assert.equal(classId, 345, 'wrong class id');
        assert.equal(userId, 123, 'wrong user id');
        return Ember.RSVP.resolve('fake response');
      }
    })
  );

  service.set(
    'currentLocationSerializer',
    Ember.Object.create({
      normalizeForGetUserCurrentLocation: function(payload) {
        assert.equal(
          payload,
          'fake response',
          'wrong payload, should match adapter response'
        );
        return Ember.Object.create({
          courseId: 'courseId',
          unitId: 'unitId',
          lessonId: 'lessonId'
        });
      }
    })
  );

  var done = assert.async();
  service.getUserCurrentLocation(345, 123, true).then(function() {
    done();
  });
});

test('getUserCurrentLocationByClassIds fetchAll-default-value', function(assert) {
  assert.expect(3);

  const service = this.subject({
    loadCurrentLocationData: function(currentLocation) {
      assert.ok(false, 'loadCurrentLocationData should not be called');
      return Ember.RSVP.resolve(currentLocation);
    }
  });

  service.set(
    'currentLocationAdapter',
    Ember.Object.create({
      getUserCurrentLocationByClassIds: function(classIds, userId) {
        assert.deepEqual(classIds, [345], 'wrong class ids');
        assert.equal(userId, 123, 'wrong user id');
        return Ember.RSVP.resolve('fake response');
      }
    })
  );

  service.set(
    'currentLocationSerializer',
    Ember.Object.create({
      normalizeForGetUserClassesLocation: function(payload) {
        assert.equal(
          payload,
          'fake response',
          'wrong payload, should match adapter response'
        );
        return [
          Ember.Object.create({
            courseId: 'courseId',
            unitId: 'unitId',
            lessonId: 'lessonId'
          })
        ];
      }
    })
  );

  var done = assert.async();
  service.getUserCurrentLocationByClassIds([345], 123).then(function() {
    done();
  });
});

test('getUserCurrentLocationByClassIds with no classes', function(assert) {
  assert.expect(1);

  const service = this.subject({
    loadCurrentLocationData: function() {
      assert.ok(false, 'loadCurrentLocationData should not be called');
    }
  });

  service.set(
    'currentLocationAdapter',
    Ember.Object.create({
      getUserCurrentLocationByClassIds: function() {
        assert.ok(
          false,
          'getUserCurrentLocationByClassIds should not be called'
        );
      }
    })
  );

  service.set(
    'currentLocationSerializer',
    Ember.Object.create({
      normalizeForGetUserClassesLocation: function() {
        assert.ok(
          false,
          'normalizeForGetUserClassesLocation should not be called'
        );
      }
    })
  );

  var done = assert.async();
  service.getUserCurrentLocationByClassIds([], 123).then(function(data) {
    assert.deepEqual(data, [], 'Wrong data');
    done();
  });
});

test('getUserCurrentLocationByClassIds fetchAll- true', function(assert) {
  assert.expect(4);

  const service = this.subject({
    loadCurrentLocationData: function(currentLocation) {
      assert.ok(true, 'loadCurrentLocationData should be called once');
      return Ember.RSVP.resolve(currentLocation);
    }
  });

  service.set(
    'currentLocationAdapter',
    Ember.Object.create({
      getUserCurrentLocationByClassIds: function(classIds, userId) {
        assert.deepEqual(classIds, [345], 'wrong class ids');
        assert.equal(userId, 123, 'wrong user id');
        return Ember.RSVP.resolve('fake response');
      }
    })
  );

  service.set(
    'currentLocationSerializer',
    Ember.Object.create({
      normalizeForGetUserClassesLocation: function(payload) {
        assert.equal(
          payload,
          'fake response',
          'wrong payload, should match adapter response'
        );
        return [
          Ember.Object.create({
            courseId: 'courseId',
            unitId: 'unitId',
            lessonId: 'lessonId'
          })
        ];
      }
    })
  );

  var done = assert.async();
  service.getUserCurrentLocationByClassIds([345], 123, true).then(function() {
    done();
  });
});
