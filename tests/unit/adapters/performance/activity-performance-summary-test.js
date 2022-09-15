import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

const sessionStub = Ember.Service.extend({
  'token-api3': 'token-api-3'
});

moduleForAdapter(
  'adapter:performance/activity-performance-summary',
  'Unit | Adapter | performance/activity-performance-summary',
  {
    unit: true,
    beforeEach: function() {
      this.register('service:session', sessionStub);
      this.inject.service('session');
    }
  }
);

test('findClassActivityPerformanceSummaryByIds', function(assert) {
  assert.expect(7);
  // Mock backend response
  this.pretender.map(function() {
    this.post('/api/nucleus-insights/v2/class/321/activity', function(request) {
      let requestBodyJson = JSON.parse(request.requestBody);
      assert.equal(requestBodyJson.userId, 123, 'Wrong user id');
      assert.equal(
        requestBodyJson.collectionType,
        'assessment',
        'Wrong collection type'
      );
      assert.deepEqual(
        requestBodyJson.collectionIds,
        [1, 2, 3],
        'Wrong activity ids'
      );
      assert.equal(requestBodyJson.startDate, '2012-01-20', 'Wrong start date');
      assert.equal(requestBodyJson.endDate, '2012-01-30', 'Wrong end date');
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
    .findClassActivityPerformanceSummaryByIds(
      123,
      321,
      [1, 2, 3],
      'assessment',
      new Date(2012, 0, 20),
      new Date(2012, 0, 30)
    )
    .then(function() {
      assert.ok(true, 'This should be called once');
    });
});
