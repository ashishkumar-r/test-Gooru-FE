import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import Context from 'gooru-web/models/result/context';

moduleForService('service:api-sdk/learner', 'Unit | Service | api-sdk/learner');

test('fetchLocations', function(assert) {
  const service = this.subject();

  assert.expect(6);

  service.set(
    'learnerAdapter',
    Ember.Object.create({
      fetchLocations: function(userId, contentType, offset, limit) {
        assert.deepEqual(userId, 'user-id', 'Wrong user id');
        assert.deepEqual(contentType, 'collection', 'Wrong content type');
        assert.deepEqual(offset, 0, 'Wrong default offset');
        assert.deepEqual(limit, 20, 'Wrong default limit');
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'learnerSerializer',
    Ember.Object.create({
      normalizeLocations: function(payload) {
        assert.deepEqual(payload, [], 'Wrong locations payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service.fetchLocations('user-id', 'collection').then(response => {
    assert.deepEqual(response, [], 'Wrong response');
    done();
  });
});

test('fetchPerformance', function(assert) {
  const service = this.subject();

  assert.expect(6);

  service.set(
    'learnerAdapter',
    Ember.Object.create({
      fetchPerformance: function(userId, contentType, offset, limit) {
        assert.deepEqual(userId, 'user-id', 'Wrong user id');
        assert.deepEqual(contentType, 'collection', 'Wrong content type');
        assert.deepEqual(offset, 0, 'Wrong default offset');
        assert.deepEqual(limit, 20, 'Wrong default limit');
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'learnerSerializer',
    Ember.Object.create({
      normalizePerformances: function(payload) {
        assert.deepEqual(payload, [], 'Wrong performance payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service.fetchPerformance('user-id', 'collection').then(response => {
    assert.deepEqual(response, [], 'Wrong response');
    done();
  });
});

test('fetchPerformanceLesson', function(assert) {
  const service = this.subject();

  assert.expect(6);

  service.set(
    'learnerAdapter',
    Ember.Object.create({
      fetchPerformanceLesson: function(
        courseId,
        unitId,
        lessonId,
        collectionType
      ) {
        assert.deepEqual(courseId, 'course-id', 'Wrong course id');
        assert.deepEqual(unitId, 'unit-id', 'Wrong unit id');
        assert.deepEqual(lessonId, 'lesson-id', 'Wrong lesson id');
        assert.deepEqual(collectionType, 'collection', 'Wrong collection type');
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'learnerSerializer',
    Ember.Object.create({
      normalizePerformancesLesson: function(payload) {
        assert.deepEqual(payload, [], 'Wrong performance payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service
    .fetchPerformanceLesson('course-id', 'unit-id', 'lesson-id', 'collection')
    .then(response => {
      assert.deepEqual(response, [], 'Wrong response');
      done();
    });
});

test('fetchPerformanceUnit', function(assert) {
  const service = this.subject();
  assert.expect(5);

  service.set(
    'learnerAdapter',
    Ember.Object.create({
      fetchPerformanceUnit: function(courseId, unitId, collectionType) {
        assert.deepEqual(courseId, 'course-id', 'Wrong course id');
        assert.deepEqual(unitId, 'unit-id', 'Wrong unit id');
        assert.deepEqual(collectionType, 'collection', 'Wrong collection type');
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'learnerSerializer',
    Ember.Object.create({
      normalizePerformancesUnit: function(payload) {
        assert.deepEqual(payload, [], 'Wrong performance payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service
    .fetchPerformanceUnit('course-id', 'unit-id', 'collection')
    .then(response => {
      assert.deepEqual(response, [], 'Wrong response');
      done();
    });
});

test('fetchPerformance', function(assert) {
  const service = this.subject();

  assert.expect(4);
  const expectedCourseIds = ['course-id-1', 'course-id-2'];

  service.set(
    'learnerAdapter',
    Ember.Object.create({
      fetchCoursesPerformance: function(userId, courseIds) {
        assert.equal(userId, 'user-id', 'Wrong user id');
        assert.deepEqual(courseIds, expectedCourseIds, 'Wrong content type');
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'learnerSerializer',
    Ember.Object.create({
      normalizePerformances: function(payload) {
        assert.deepEqual(payload, [], 'Wrong performance payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service
    .fetchCoursesPerformance('user-id', expectedCourseIds)
    .then(response => {
      assert.deepEqual(response, [], 'Wrong response');
      done();
    });
});

test('fetchLocationCourse', function(assert) {
  const service = this.subject();

  assert.expect(4);

  service.set(
    'learnerAdapter',
    Ember.Object.create({
      fetchLocationCourse: function(courseId, userId) {
        assert.deepEqual(courseId, 'course-id', 'Wrong course id');
        assert.deepEqual(userId, 'user-id', 'Wrong user id');
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'learnerSerializer',
    Ember.Object.create({
      normalizeFetchLocationCourse: function(payload) {
        assert.deepEqual(payload, [], 'Wrong performance payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service.fetchLocationCourse('course-id', 'user-id').then(response => {
    assert.deepEqual(response, [], 'Wrong response');
    done();
  });
});

test('fetchCollectionPerformance', function(assert) {
  const service = this.subject();

  const context = {
    collectionId: '45f38f1b-2a81-48a0-b738-34ac2a74e2fd',
    collectionType: 'assessment',
    courseId: '7b58ac43-075b-46c4-a7f4-a1ce2b346e85',
    lessonId: '111b0322-d17f-470c-bc56-c5cca0356657',
    sessionId: '16aec613-54be-4f7a-bea8-cbd8f2859d3b',
    unitId: '390fa450-a4d9-4c28-a259-aa3de2a3081b',
    userId: 'f90278ce-e008-4355-868f-59738699ba52'
  };

  assert.expect(8);

  service.set(
    'learnerAdapter',
    Ember.Object.create({
      fetchCollectionPerformance: function(params) {
        assert.deepEqual(
          params.collectionType,
          'assessment',
          'Wrong collection type'
        );
        assert.deepEqual(
          params.contentId,
          '45f38f1b-2a81-48a0-b738-34ac2a74e2fd',
          'Wrong content id'
        );
        assert.deepEqual(
          params.userId,
          'f90278ce-e008-4355-868f-59738699ba52',
          'Wrong user id'
        );
        assert.deepEqual(
          params.courseId,
          '7b58ac43-075b-46c4-a7f4-a1ce2b346e85',
          'Wrong course id'
        );
        assert.deepEqual(
          params.unitId,
          '390fa450-a4d9-4c28-a259-aa3de2a3081b',
          'Wrong unit id'
        );
        assert.deepEqual(
          params.lessonId,
          '111b0322-d17f-470c-bc56-c5cca0356657',
          'Wrong lesson id'
        );
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'studentCollectionPerformanceSerializer',
    Ember.Object.create({
      normalizeStudentCollection: function(payload) {
        assert.deepEqual(payload, [], 'Wrong performance payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service.fetchCollectionPerformance(context, false).then(response => {
    assert.deepEqual(response, [], 'Wrong response');
    done();
  });
});

test('fetchCollectionPerformance', function(assert) {
  const service = this.subject();

  const context = Context.create({
    collectionId: '45f38f1b-2a81-48a0-b738-34ac2a74e2fd',
    collectionType: 'assessment',
    courseId: '7b58ac43-075b-46c4-a7f4-a1ce2b346e85',
    lessonId: '111b0322-d17f-470c-bc56-c5cca0356657',
    sessionId: '16aec613-54be-4f7a-bea8-cbd8f2859d3b',
    unitId: '390fa450-a4d9-4c28-a259-aa3de2a3081b',
    userId: 'f90278ce-e008-4355-868f-59738699ba52'
  });

  assert.expect(8);

  service.set(
    'learnerAdapter',
    Ember.Object.create({
      fetchCollectionPerformance: function(params) {
        assert.deepEqual(
          params.collectionType,
          'assessment',
          'Wrong collection type'
        );
        assert.deepEqual(
          params.contentId,
          '45f38f1b-2a81-48a0-b738-34ac2a74e2fd',
          'Wrong content id'
        );
        assert.deepEqual(
          params.userId,
          'f90278ce-e008-4355-868f-59738699ba52',
          'Wrong user id'
        );
        assert.deepEqual(
          params.courseId,
          '7b58ac43-075b-46c4-a7f4-a1ce2b346e85',
          'Wrong course id'
        );
        assert.deepEqual(
          params.unitId,
          '390fa450-a4d9-4c28-a259-aa3de2a3081b',
          'Wrong unit id'
        );
        assert.deepEqual(
          params.lessonId,
          '111b0322-d17f-470c-bc56-c5cca0356657',
          'Wrong lesson id'
        );
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'studentCollectionPerformanceSerializer',
    Ember.Object.create({
      normalizeStudentCollection: function(payload) {
        assert.deepEqual(payload, [], 'Wrong performance payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service.fetchCollectionPerformance(context, false).then(response => {
    assert.deepEqual(response, [], 'Wrong response');
    done();
  });
});

test('fetchLearnerSessions', function(assert) {
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
  const expectedParams = {
    collectionType: 'collectionType',
    courseId: 'courseId',
    userId: 'userId',
    unitId: 'unitId',
    lessonId: 'lessonId',
    contentId: 'contentId',
    openSession: false
  };

  service.set(
    'learnerAdapter',
    Ember.Object.create({
      fetchLearnerSessions: function(params) {
        assert.deepEqual(
          expectedParams,
          params,
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
  const promise = service.fetchLearnerSessions(
    Context.create({
      collectionType: 'collectionType',
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
