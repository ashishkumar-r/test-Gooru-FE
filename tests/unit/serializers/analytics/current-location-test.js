import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:analytics/current-location',
  'Unit | Serializer | analytics/current-location'
);

test('normalizeForGetUserClassesLocation', function(assert) {
  assert.expect(1);
  const serializer = this.subject();

  const data = {
    usageData: [
      {
        classId: 'class-id',
        courseId: 'course-id',
        unitId: 'unit-id',
        lessonId: 'lesson-id',
        collectionId: 'collection-id',
        status: 'complete'
      },
      {
        classId: '73294a4d-8825-4106-8cc9-8c26f370d91z',
        courseId: '987e0144-631d-4bac-a82b-26ffbf5257a0',
        unitId: '4af505ff-9fc0-49c9-b764-d315b2df0cd7',
        lessonId: 'fa9f52d6-4f15-4f7e-b24d-25dd5b114cc0',
        collectionId: '08d7462f-6fd3-4fce-c992-b9e63f194a5e',
        status: 'complete'
      }
    ]
  };

  const locations = serializer.normalizeForGetUserClassesLocation(data);
  assert.equal(locations.length, 2, 'Wrong location length');
});

test('normalizeForGetUserCurrentLocation', function(assert) {
  assert.expect(2);
  const serializer = this.subject({
    normalizeCurrentLocation: function() {
      assert.ok(true, 'this is called once');
      return 'fake';
    }
  });

  const data = {
    content: [
      {
        classId: '73294a4d-8825-4106-8cc9-8c26f370d91z',
        courseId: '987e0144-631d-4bac-a82b-26ffbf5257a0',
        unitId: '4af505ff-9fc0-49c9-b764-d315b2df0cd7',
        lessonId: 'fa9f52d6-4f15-4f7e-b24d-25dd5b114cc0',
        collectionId: '08d7462f-6fd3-4fce-c992-b9e63f194a5e',
        status: 'complete'
      }
    ]
  };

  const response = serializer.normalizeForGetUserCurrentLocation(data);
  assert.equal(response, 'fake', 'Wrong response');
});

test('normalizeCurrentLocation with collectionId, no collection type', function(assert) {
  assert.expect(7);
  const serializer = this.subject();

  const data = {
    classId: 'class-id',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id',
    collectionId: 'collection-id',
    status: 'complete'
  };

  const location = serializer.normalizeCurrentLocation(data);
  assert.equal(location.get('classId'), 'class-id', 'Wrong class id');
  assert.equal(location.get('courseId'), 'course-id', 'Wrong course id');
  assert.equal(location.get('unitId'), 'unit-id', 'Wrong unit id');
  assert.equal(location.get('lessonId'), 'lesson-id', 'Wrong lesson id');
  assert.equal(
    location.get('collectionId'),
    'collection-id',
    'Wrong collection id'
  );
  assert.equal(
    location.get('collectionType'),
    'collection',
    'Wrong collection type'
  );
  assert.equal(location.get('status'), 'complete', 'Wrong class id');
});

test('normalizeCurrentLocation with assessmentId, no collection type', function(assert) {
  assert.expect(7);
  const serializer = this.subject();

  const data = {
    classId: 'class-id',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id',
    assessmentId: 'collection-id',
    status: 'complete'
  };

  const location = serializer.normalizeCurrentLocation(data);
  assert.equal(location.get('classId'), 'class-id', 'Wrong class id');
  assert.equal(location.get('courseId'), 'course-id', 'Wrong course id');
  assert.equal(location.get('unitId'), 'unit-id', 'Wrong unit id');
  assert.equal(location.get('lessonId'), 'lesson-id', 'Wrong lesson id');
  assert.equal(
    location.get('collectionId'),
    'collection-id',
    'Wrong collection id'
  );
  assert.equal(
    location.get('collectionType'),
    'assessment',
    'Wrong collection type'
  );
  assert.equal(location.get('status'), 'complete', 'Wrong class id');
});

test('normalizeCurrentLocation with collection type', function(assert) {
  assert.expect(7);
  const serializer = this.subject();

  const data = {
    classId: 'class-id',
    courseId: 'course-id',
    unitId: 'unit-id',
    lessonId: 'lesson-id',
    collectionId: 'collection-id',
    collectionType: 'assessment',
    status: 'complete'
  };

  const location = serializer.normalizeCurrentLocation(data);
  assert.equal(location.get('classId'), 'class-id', 'Wrong class id');
  assert.equal(location.get('courseId'), 'course-id', 'Wrong course id');
  assert.equal(location.get('unitId'), 'unit-id', 'Wrong unit id');
  assert.equal(location.get('lessonId'), 'lesson-id', 'Wrong lesson id');
  assert.equal(
    location.get('collectionId'),
    'collection-id',
    'Wrong collection id'
  );
  assert.equal(
    location.get('collectionType'),
    'assessment',
    'Wrong collection type'
  );
  assert.equal(location.get('status'), 'complete', 'Wrong class id');
});
