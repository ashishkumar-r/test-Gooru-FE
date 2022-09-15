import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

const sessionStub = Ember.Service.extend({
  'token-api3': 'token-api-3'
});

moduleForAdapter('adapter:content/lesson', 'Unit | Adapter | content/lesson', {
  unit: true,
  beforeEach: function() {
    this.register('service:session', sessionStub);
    this.inject.service('session');
  }
});

test('Lesson creation, success', function(assert) {
  // Mock backend response
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/courses/course-id-123/units/unit-id-456/lessons',
      function() {
        return [
          201,
          {
            'Content-Type': 'text/plain',
            location: 'lesson-id-789'
          },
          ''
        ];
      }
    );
  });

  const adapter = this.subject();

  const params = {
    courseId: 'course-id-123',
    unitId: 'unit-id-456',
    lesson: { title: 'Sample Lesson' }
  };

  adapter.createLesson(params).then(function(response) {
    assert.equal(
      response,
      'lesson-id-789',
      'Should respond with the newly created ID for the unit'
    );
  });
});

test('Lesson creation, failure', function(assert) {
  // Mock backend response
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/courses/course-id-123/units/unit-id-456/lessons',
      function() {
        return [500, { 'Content-Type': 'text/plain' }, ''];
      }
    );
  });

  const adapter = this.subject();

  const params = {
    courseId: 'course-id-123',
    unitId: 'unit-id-456',
    lesson: { title: 'Sample Lesson' }
  };

  adapter.createLesson(params).catch(function(response) {
    assert.equal(response.status, '500', 'Error code');
  });
});

test('Get lesson by ID', function(assert) {
  const lessonData = {
    title: 'Lesson Title'
  };

  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v1/courses/course-id-123/units/unit-id-456/lessons/lesson-id-789',
      function() {
        return [
          200,
          {
            'Content-Type': 'application/json; charset=utf-8'
          },
          JSON.stringify(lessonData)
        ];
      }
    );
  });

  const adapter = this.subject();
  adapter
    .getLessonById({
      courseId: 'course-id-123',
      unitId: 'unit-id-456',
      lessonId: 'lesson-id-789'
    })
    .then(function(response) {
      assert.deepEqual(
        response,
        lessonData,
        'Should respond with the corresponding lesson data'
      );
    });
});

test('associateAssessmentOrCollectionToLesson', function(assert) {
  const adapter = this.subject();
  const requestData = {
    lessonId: 'lesson-id',
    unitId: 'unit-id',
    courseId: 'course-id',
    classId: 'class-id',
    collectionId: 'collection-id',
    type: 'collection'
  };
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/courses/course-id/units/unit-id/lessons/lesson-id/collections',
      function() {
        return [204, { 'Content-Type': 'application/json' }, ''];
      },
      false
    );
  });
  adapter
    .associateAssessmentOrCollectionToLesson(requestData)
    .then(function(response) {
      assert.equal(undefined, response, 'Wrong response');
    });
});

test('disassociateAssessmentOrCollectionToLesson', function(assert) {
  const adapter = this.subject();
  const requestData = {
    lessonId: 'lesson-id',
    unitId: 'unit-id',
    courseId: 'course-id',
    classId: 'class-id',
    collectionId: 'collection-id',
    type: 'collection'
  };
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.delete(
      '/api/nucleus/v1/courses/course-id/units/unit-id/lessons/lesson-id/collections/collection-id',
      function() {
        return [204, { 'Content-Type': 'application/json; charset=utf-8' }, ''];
      },
      false
    );
  });
  adapter
    .disassociateAssessmentOrCollectionToLesson(requestData)
    .then(function(response) {
      assert.equal(undefined, response, 'Wrong response');
    });
});

test('Delete Lesson', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.delete(
      '/api/nucleus/v1/courses/course-id/units/unit-id/lessons/lesson-id',
      function() {
        return [204, { 'Content-Type': 'application/json; charset=utf-8' }, ''];
      },
      false
    );
  });
  adapter
    .deleteLesson({
      courseId: 'course-id',
      unitId: 'unit-id',
      lessonId: 'lesson-id'
    })
    .then(function() {
      assert.ok(true);
    });
});

test('Copy Lesson', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/copier/courses/course-id/units/unit-id/lessons/lesson-id',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'copy-lesson-id' },
          ''
        ];
      },
      false
    );
  });
  adapter
    .copyLesson({
      courseId: 'course-id',
      unitId: 'unit-id',
      lessonId: 'lesson-id'
    })
    .then(function(response) {
      assert.equal('', response, 'Wrong response');
    });
});

test('reorderLesson', function(assert) {
  const adapter = this.subject();
  const expectedData = {
    order: [{ id: 'a', sequence_id: 1 }]
  };
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/courses/course-id/units/unit-id/lessons/lesson-id/order',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.deepEqual(
          requestBodyJson,
          expectedData,
          'Expected request body is not correct'
        );
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });
  adapter.reorderLesson('course-id', 'unit-id', 'lesson-id', expectedData).then(
    function() {
      assert.ok(true);
    },
    function() {
      assert.ok(false, 'Reorder Lesson failed');
    }
  );
});
