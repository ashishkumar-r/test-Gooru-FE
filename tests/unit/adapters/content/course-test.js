import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

const sessionStub = Ember.Service.extend({
  'token-api3': 'token-api-3'
});

moduleForAdapter('adapter:content/course', 'Unit | Adapter | content/course', {
  unit: true,
  beforeEach: function() {
    this.register('service:session', sessionStub);
    this.inject.service('session');
  }
});

test('Course creation, success', function(assert) {
  this.pretender.map(function() {
    this.post('/api/nucleus/v1/courses', function() {
      return [
        201,
        {
          'Content-Type': 'application/json; charset=utf-8',
          Location: 'course-id-123'
        },
        ''
      ];
    });
  });

  const adapter = this.subject();

  const courseData = {
    title: 'Course Title'
  };

  adapter.createCourse(courseData).then(function(courseId) {
    assert.equal(
      courseId,
      'course-id-123',
      'Should respond with the newly created ID for the course'
    );
  });
});

test('Get course by ID', function(assert) {
  const courseData = {
    title: 'Course Title'
  };

  this.pretender.map(function() {
    this.get('/api/nucleus/v1/courses/course-id-123', function() {
      return [
        200,
        {
          'Content-Type': 'application/json; charset=utf-8'
        },
        JSON.stringify(courseData)
      ];
    });
  });

  const adapter = this.subject();
  adapter.getCourseById('course-id-123').then(function(response) {
    assert.deepEqual(
      response,
      courseData,
      'Should respond with the corresponding course data'
    );
  });
});

test('getCourseStructure for assessments', function(assert) {
  assert.expect(1);

  this.pretender.map(function() {
    this.get('/api/nucleus/v1/courses/123/assessments', function() {
      return [
        200,
        {
          'Content-Type': 'application/json; charset=utf-8'
        },
        JSON.stringify('fake-response')
      ];
    });
  });

  const adapter = this.subject();
  adapter.getCourseStructure(123, 'assessment').then(function(response) {
    assert.equal(response, 'fake-response', 'Wrong respond');
  });
});

test('getCourseStructure for collections', function(assert) {
  assert.expect(1);

  this.pretender.map(function() {
    this.get('/api/nucleus/v1/courses/123/collections', function() {
      return [
        200,
        {
          'Content-Type': 'application/json; charset=utf-8'
        },
        JSON.stringify('fake-response')
      ];
    });
  });

  const adapter = this.subject();
  adapter.getCourseStructure(123, 'collection').then(function(response) {
    assert.equal(response, 'fake-response', 'Wrong respond');
  });
});

test('Update course, success', function(assert) {
  this.pretender.map(function() {
    this.put('/api/nucleus/v1/courses/course-id-123', function() {
      return [
        204,
        {
          'Content-Type': 'application/json; charset=utf-8'
        },
        ''
      ];
    });
  });

  const adapter = this.subject();

  const courseData = {
    courseId: 'course-id-123',
    course: {
      title: 'Course Title'
    }
  };

  adapter.updateCourse(courseData).then(function(response) {
    assert.equal(response, '', 'Should respond with no content');
  });
});

test('deleteCourse', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.delete(
      '/api/nucleus/v1/courses/course-id',
      function() {
        return [204, { 'Content-Type': 'application/json; charset=utf-8' }, ''];
      },
      false
    );
  });
  adapter.deleteCourse('course-id').then(function() {
    assert.ok(true);
  });
});

test('copyCourse', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/copier/courses/course-id',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'copy-course-id' },
          ''
        ];
      },
      false
    );
  });
  adapter.copyCourse('course-id').then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('reorderCourse', function(assert) {
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
      '/api/nucleus/v1/courses/course-id/order',
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
  adapter.reorderCourse('course-id', expectedData).then(
    function() {
      assert.ok(true);
    },
    function() {
      assert.ok(false, 'Reorder Course failed');
    }
  );
});
