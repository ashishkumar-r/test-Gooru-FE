import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import { ASSESSMENT_SUB_TYPES } from 'gooru-web/config/config';

moduleForComponent(
  'service:api-sdk/course-map',
  'Unit | Service | api sdk/course map',
  {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  }
);

test('getLessonInfo', function(assert) {
  const service = this.subject();
  const expectedClassId = 'class-id';
  const expectedCourseId = 'course-id';
  const expectedUnitId = 'unit-id';
  const expectedLessonId = 'lesson-id';

  assert.expect(6);

  service.set(
    'courseMapAdapter',
    Ember.Object.create({
      getLessonInfo: function(classId, courseId, unitId, lessonId) {
        assert.equal(classId, expectedClassId, 'Wrong class id');
        assert.equal(courseId, expectedCourseId, 'Wrong course id');
        assert.equal(unitId, expectedUnitId, 'Wrong unit id');
        assert.equal(lessonId, expectedLessonId, 'Wrong lesson id');
        return Ember.RSVP.resolve({ id: lessonId });
      }
    })
  );

  service.set(
    'courseMapSerializer',
    Ember.Object.create({
      normalizeLessonInfo: function(lessonData) {
        assert.deepEqual(
          lessonData,
          { id: expectedLessonId },
          'Wrong lesson data'
        );
        return lessonData;
      }
    })
  );

  var done = assert.async();
  service
    .getLessonInfo(
      expectedClassId,
      expectedCourseId,
      expectedUnitId,
      expectedLessonId
    )
    .then(response => {
      assert.deepEqual(
        response,
        { id: expectedLessonId },
        'Response has to match'
      );
      done();
    });
});

test('createNewPath', function(assert) {
  let service = this.subject();
  let expectedContext = Ember.Object.create({
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id',
    collectionId: 'collection-id'
  });
  let expectedSuggestion = Ember.Object.create({
    type: 'collection',
    subType: ASSESSMENT_SUB_TYPES.PRE_TEST
  });
  let expectedPathId = 1;

  service.set(
    'courseMapAdapter',
    Ember.Object.create({
      createNewPath: function(context, suggestion) {
        assert.deepEqual(context, expectedContext, 'Invalid context data');
        assert.deepEqual(
          suggestion,
          expectedSuggestion,
          'Invalid suggestion data'
        );
        return Ember.RSVP.resolve(expectedPathId);
      }
    })
  );

  var done = assert.async();
  service.createNewPath(expectedContext, expectedSuggestion).then(response => {
    assert.equal(response, expectedPathId, 'Invalid response value');
    done();
  });
});
