import GooruIntegration from 'gooru-web/utils/gooru-integration';
import { module, test } from 'qunit';

module('Unit | Utility | gooru integration');

test('testing computed properties', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      appKey: 'app-key',
      token: 'any-token',
      page: 'any-page'
    }
  });
  assert.ok(integration.get('appKey'), 'app-key', 'Wrong app key');
  assert.ok(integration.get('token'), 'any-token', 'Wrong token');
  assert.ok(integration.get('page'), 'any-page', 'Wrong page');
});

test('classInfoPage', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'class-info'
    }
  });
  assert.ok(integration.get('classInfoPage'), 'Should be true');
});

test('teacherDataPage', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'teacher-data'
    }
  });
  assert.ok(integration.get('teacherDataPage'), 'Should be true');
});

test('studentDataPage', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'student-data'
    }
  });
  assert.ok(integration.get('studentDataPage'), 'Should be true');
});

test('courseMapPage', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'course-map'
    }
  });
  assert.ok(integration.get('courseMapPage'), 'Should be true');
});

test('playerPage', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'player'
    }
  });
  assert.ok(integration.get('playerPage'), 'Should be true');
});

test('routeParamsForInfoPage', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'class-info',
      classId: 'any-class'
    }
  });
  const params = integration.get('routeParamsForInfoPage');
  assert.deepEqual(params, ['class.info', 'any-class'], 'Wrong params');
});

test('routeParamsForTeacherDataPage', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'teacher-data',
      classId: 'any-class'
    }
  });
  const params = integration.get('routeParamsForTeacherDataPage');
  assert.deepEqual(
    params,
    ['class.analytics.performance.teacher.course', 'any-class'],
    'Wrong params'
  );
});

test('routeParamsForStudentDataPage', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'student-data',
      classId: 'any-class'
    }
  });
  const params = integration.get('routeParamsForStudentDataPage');
  assert.deepEqual(
    params,
    ['class.analytics.performance.student', 'any-class'],
    'Wrong params'
  );
});

test('routeParamsForPlayerPage', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'player',
      collectionId: 'any-collection-id',
      sourceId: 'any-source-id',
      collectionType: 'any-collection-type'
    }
  });
  const params = integration.get('routeParamsForPlayerPage');
  assert.deepEqual(
    params,
    [
      'player',
      'any-collection-id',
      {
        queryParams: {
          sourceId: 'any-source-id',
          type: 'any-collection-type',
          role: 'student'
        }
      }
    ],
    'Wrong params'
  );
});

test('routeParamsForCourseMapPage', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'course-map',
      classId: 'any-class'
    }
  });
  const params = integration.get('routeParamsForCourseMapPage');
  assert.deepEqual(params, ['class.overview', 'any-class'], 'Wrong params');
});

test('routeParamsForCourseMapPage with unit id', function(assert) {
  const integration = GooruIntegration.create({
    params: {
      page: 'course-map',
      classId: 'any-class',
      unitId: 'unit1'
    }
  });
  const params = integration.get('routeParamsForCourseMapPage');
  assert.deepEqual(
    params,
    ['class.overview', 'any-class', { queryParams: { location: 'unit1' } }],
    'Wrong params'
  );
});

test('routeParamsForCourseMapPage with unit id and lesson id', function(
  assert
) {
  const integration = GooruIntegration.create({
    params: {
      page: 'course-map',
      classId: 'any-class',
      unitId: 'unit1',
      lessonId: 'lesson1'
    }
  });
  const params = integration.get('routeParamsForCourseMapPage');
  assert.deepEqual(
    params,
    [
      'class.overview',
      'any-class',
      { queryParams: { location: 'unit1-lesson1' } }
    ],
    'Wrong params'
  );
});

test('routeParamsForCourseMapPage with unit id and lesson id and collection id', function(
  assert
) {
  const integration = GooruIntegration.create({
    params: {
      page: 'course-map',
      classId: 'any-class',
      unitId: 'unit1',
      lessonId: 'lesson1',
      collectionId: 'collection1'
    }
  });
  const params = integration.get('routeParamsForCourseMapPage');
  assert.deepEqual(
    params,
    [
      'class.overview',
      'any-class',
      { queryParams: { location: 'unit1-lesson1-collection1' } }
    ],
    'Wrong params'
  );
});
