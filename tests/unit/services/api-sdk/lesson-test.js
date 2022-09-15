import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import LessonModel from 'gooru-web/models/content/lesson';

moduleForService(
  'service:api-sdk/lesson',
  'Unit | Service | api-sdk/lesson',
  {}
);

test('createLesson', function(assert) {
  const service = this.subject();
  let lessonModel = Ember.Object.create();

  assert.expect(2);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/courses/course-id/units/unit-id/lessons',
      function() {
        return [
          200,
          { 'Content-Type': 'text/plain', Location: 'lesson-id' },
          ''
        ];
      },
      false
    );
  });

  service.set(
    'serializer',
    Ember.Object.create({
      serializeCreateLesson: function(lessonObject) {
        assert.deepEqual(lessonObject, lessonModel, 'Wrong lesson object');
        return {};
      }
    })
  );

  var done = assert.async();
  service.createLesson('course-id', 'unit-id', lessonModel).then(function() {
    assert.equal(lessonModel.get('id'), 'lesson-id', 'Wrong lesson id');
    done();
  });
});

test('updateLesson', function(assert) {
  const service = this.subject();
  let lessonModel = LessonModel.create({
    id: 'lesson-id'
  });

  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/courses/course-id/units/unit-id/lessons/lesson-id',
      function() {
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  service.set(
    'serializer',
    Ember.Object.create({
      serializeUpdateLesson: function(lessonObject) {
        assert.deepEqual(lessonObject, lessonModel, 'Wrong lesson object');
        return {};
      }
    })
  );

  var done = assert.async();
  service.updateLesson('course-id', 'unit-id', lessonModel).then(function() {
    done();
  });
});

test('Delete Lesson', function(assert) {
  const expectedCourseId = 'course-id';
  const expectedUnitId = 'unit-id';
  const expectedLessonId = 'lesson-id';
  const service = this.subject();

  assert.expect(3);

  service.set(
    'adapter',
    Ember.Object.create({
      deleteLesson: function(params) {
        assert.equal(params.courseId, expectedCourseId, 'Wrong course id');
        assert.equal(params.unitId, expectedUnitId, 'Wrong unit id');
        assert.equal(params.lessonId, expectedLessonId, 'Wrong lesson id');
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.deleteLesson('course-id', 'unit-id', 'lesson-id').then(function() {
    done();
  });
});

test('Dissassociate collection from Lesson', function(assert) {
  const expectedCourseId = 'course-id';
  const expectedUnitId = 'unit-id';
  const expectedLessonId = 'lesson-id';
  const expectedCollectionId = 'collection-id';
  const service = this.subject();

  assert.expect(4);

  service.set(
    'adapter',
    Ember.Object.create({
      disassociateAssessmentOrCollectionToLesson: function(params) {
        assert.equal(params.courseId, expectedCourseId, 'Wrong course id');
        assert.equal(params.unitId, expectedUnitId, 'Wrong unit id');
        assert.equal(params.lessonId, expectedLessonId, 'Wrong lesson id');
        assert.equal(
          params.collectionId,
          expectedCollectionId,
          'Wrong collection id'
        );
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service
    .disassociateAssessmentOrCollectionToLesson(
      'course-id',
      'unit-id',
      'lesson-id',
      'collection-id'
    )
    .then(function() {
      done();
    });
});

test('Copy Lesson', function(assert) {
  const service = this.subject();

  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
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

  var done = assert.async();
  service
    .copyLesson('course-id', 'unit-id', 'lesson-id')
    .then(function(response) {
      assert.equal(response, 'copy-lesson-id', 'Wrong lesson id');
      done();
    });
});

test('reorderLesson', function(assert) {
  const service = this.subject();
  const expectedUnitId = 'unit-id';

  assert.expect(6);

  service.set(
    'serializer',
    Ember.Object.create({
      serializeReorderLesson: function(collectionIds) {
        assert.equal(collectionIds.length, 2, 'Wrong total collections');
        assert.equal(collectionIds[0], 'a', 'Wrong id at index 0');
        return 'fake-data';
      }
    })
  );
  service.set(
    'adapter',
    Ember.Object.create({
      reorderLesson: function(courseId, unitId, lessonId, data) {
        assert.equal(courseId, 'course-id', 'Wrong course id');
        assert.equal(unitId, expectedUnitId, 'Wrong unit id');
        assert.equal(lessonId, 'lesson-id', 'Wrong lesson id');
        assert.equal(
          data,
          'fake-data',
          'Wrong data parameter coming from serializer'
        );
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service
    .reorderLesson('course-id', expectedUnitId, 'lesson-id', ['a', 'b'])
    .then(function() {
      done();
    });
});
