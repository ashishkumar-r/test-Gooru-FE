import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

const sessionStub = Ember.Service.extend({
  'token-api3': 'token-api-3'
});

moduleForAdapter(
  'adapter:performance/collection-performance-summary',
  'Unit | Adapter | performance/collection-performance-summary',
  {
    unit: true,
    beforeEach: function() {
      this.register('service:session', sessionStub);
      this.inject.service('session');
    }
  }
);

test('searchStudentCollectionPerformanceSummary all criteria provided', function(assert) {
  assert.expect(6);
  // Mock backend response
  this.pretender.map(function() {
    this.get('/api/nucleus-insights/v2/study/assessment/performance', function(
      request
    ) {
      assert.equal(request.queryParams.userId, '23', 'Wrong user id param');
      assert.equal(
        request.queryParams.courseId,
        'course-id',
        'Wrong course id param'
      );
      assert.equal(
        request.queryParams.unitId,
        'unit-id',
        'Wrong unit id param'
      );
      assert.equal(
        request.queryParams.lessonId,
        'lesson-id',
        'Wrong lesson id param'
      );
      assert.equal(
        request.requestHeaders.Authorization,
        'Token token-api-3',
        'Wrong token'
      );
      return [
        200,
        {
          'Content-Type': 'application/json'
        },
        JSON.stringify({})
      ];
    });
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();

  adapter
    .searchStudentCollectionPerformanceSummary('23', {
      collectionType: 'assessment',
      courseId: 'course-id',
      unitId: 'unit-id',
      lessonId: 'lesson-id'
    })
    .then(function() {
      assert.ok(true, 'This should be called once');
    });
});

test('searchStudentCollectionPerformanceSummary just required criteria provided', function(assert) {
  assert.expect(6);
  // Mock backend response
  this.pretender.map(function() {
    this.get('/api/nucleus-insights/v2/study/collection/performance', function(
      request
    ) {
      assert.equal(request.queryParams.userId, '23', 'Wrong user id param');
      assert.equal(
        request.queryParams.courseId,
        'course-id',
        'Wrong course id param'
      );
      assert.ok(!request.queryParams.unitId, 'Wrong unit id param');
      assert.ok(!request.queryParams.lessonId, 'Wrong lesson id param');
      assert.equal(
        request.requestHeaders.Authorization,
        'Token token-api-3',
        'Wrong token'
      );
      return [
        200,
        {
          'Content-Type': 'application/json'
        },
        JSON.stringify({})
      ];
    });
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();

  adapter
    .searchStudentCollectionPerformanceSummary('23', {
      collectionType: 'collection',
      courseId: 'course-id'
    })
    .then(function() {
      assert.ok(true, 'This should be called once');
    });
});

test('findCollectionPerformanceSummaryByIds with no class', function(assert) {
  assert.expect(6);
  // Mock backend response
  this.pretender.map(function() {
    this.post('/api/nucleus-insights/v2/assessment/performance', function(
      request
    ) {
      let requestBodyJson = JSON.parse(request.requestBody);
      assert.equal(requestBodyJson.userId, 123, 'Wrong user id');
      assert.deepEqual(
        requestBodyJson.collectionIds,
        [1, 2, 3],
        'Wrong collection ids'
      );
      assert.ok(!requestBodyJson.classId, 'Class id should be undefined');
      assert.ok(!requestBodyJson.timePeriod, 'Time period should be undefined');
      assert.equal(
        request.requestHeaders.Authorization,
        'Token token-api-3',
        'Wrong token'
      );
      return [
        200,
        {
          'Content-Type': 'application/json'
        },
        JSON.stringify({})
      ];
    });
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();

  adapter
    .findCollectionPerformanceSummaryByIds(123, [1, 2, 3], 'assessment')
    .then(function() {
      assert.ok(true, 'This should be called once');
    });
});

test('findCollectionPerformanceSummaryByIds with class', function(assert) {
  assert.expect(6);
  // Mock backend response
  this.pretender.map(function() {
    this.post('/api/nucleus-insights/v2/assessment/performance', function(
      request
    ) {
      let requestBodyJson = JSON.parse(request.requestBody);
      assert.equal(requestBodyJson.userId, 123, 'Wrong user id');
      assert.deepEqual(
        requestBodyJson.collectionIds,
        [1, 2, 3],
        'Wrong collection ids'
      );
      assert.equal(requestBodyJson.classId, 321, 'Class id should be 321');
      assert.equal(
        requestBodyJson.timePeriod,
        'any time period',
        'Wrong time period'
      );
      assert.equal(
        request.requestHeaders.Authorization,
        'Token token-api-3',
        'Wrong token'
      );
      return [
        200,
        {
          'Content-Type': 'application/json'
        },
        JSON.stringify({})
      ];
    });
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();

  adapter
    .findCollectionPerformanceSummaryByIds(
      123,
      [1, 2, 3],
      'assessment',
      321,
      'any time period'
    )
    .then(function() {
      assert.ok(true, 'This should be called once');
    });
});
