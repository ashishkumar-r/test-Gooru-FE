import { test } from 'ember-qunit';
import Ember from 'ember';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

const sessionStub = Ember.Service.extend({
  'token-api3': 'token-api-3'
});

moduleForAdapter(
  'adapter:analytics/current-location',
  'Unit | Adapter | analytics/current-location',
  {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
    beforeEach: function() {
      this.register('service:session', sessionStub);
      this.inject.service('session');
    }
  }
);

test('getUserCurrentLocation', function(assert) {
  const adapter = this.subject();
  assert.expect(1);
  const routes = function() {
    this.get(
      '/api/nucleus-insights/v2/class/123/user/456/current/location',
      function() {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({})
        ];
      },
      false
    );
  };

  this.pretender.map(routes);
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  adapter.getUserCurrentLocation(123, 456).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});

test('getUserCurrentLocationByClassIds', function(assert) {
  const adapter = this.subject();
  assert.expect(3);
  const routes = function() {
    this.post(
      '/api/nucleus-insights/v2/classes/location',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.deepEqual(
          requestBodyJson.classes,
          [123, 321],
          'Wrong class ids'
        );
        assert.equal(
          request.requestHeaders.Authorization,
          'Token token-api-3',
          'Wrong token'
        );

        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify('Fake')
        ];
      },
      false
    );
  };

  this.pretender.map(routes);
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  adapter
    .getUserCurrentLocationByClassIds([123, 321], 456)
    .then(function(response) {
      assert.equal(response, 'Fake', 'Wrong response');
    });
});
