import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

const sessionStub = Ember.Service.extend({
  'token-api3': 'token-api-3'
});

moduleForAdapter(
  'adapter:performance/class-performance-summary',
  'Unit | Adapter | performance/class-performance-summary',
  {
    unit: true,
    beforeEach: function() {
      this.register('service:session', sessionStub);
      this.inject.service('session');
    }
  }
);

test('findClassPerformanceSummaryByStudentAndClassIds', function(assert) {
  assert.expect(4);
  // Mock backend response
  this.pretender.map(function() {
    this.post('/api/nucleus-insights/v2/classes/performance', function(
      request
    ) {
      let requestBodyJson = JSON.parse(request.requestBody);
      assert.equal(request.queryParams.userId, '23', 'Wrong user id param');
      assert.deepEqual(requestBodyJson.classes, [1,2,3], 'Wrong classIds');
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
    .findClassPerformanceSummaryByStudentAndClassIds('23', [1, 2, 3])
    .then(function() {
      assert.ok(true, 'This should be called once');
    });
});

test('findClassPerformanceSummaryByClassIds', function(assert) {
  assert.expect(4);
  // Mock backend response
  this.pretender.map(function() {
    this.post('/api/nucleus-insights/v2/classes/performance', function(
      request
    ) {
      let requestBodyJson = JSON.parse(request.requestBody);
      assert.ok(!request.queryParams.userId, 'User id should not be provided');
      assert.deepEqual(requestBodyJson.classes, [1, 2, 3], 'Wrong classIds');
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

  adapter.findClassPerformanceSummaryByClassIds([1, 2, 3]).then(function() {
    assert.ok(true, 'This should be called once');
  });
});
