import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

const sessionStub = Ember.Service.extend({
  'token-api3': 'token-api-3'
});

moduleForAdapter(
  'adapter:map/navigate-map',
  'Unit | Adapter | map/navigate-map',
  {
    unit: true,
    beforeEach: function() {
      this.register('service:session', sessionStub);
      this.inject.service('session');
    }
  }
);

test('next', function(assert) {
  assert.expect(3);
  // Mock backend response
  this.pretender.map(function() {
    this.post('/api/navigate-map/v1/next', function(request) {
      let requestBodyJson = JSON.parse(request.requestBody);
      assert.equal(requestBodyJson, 'fake-map-context', 'Wrong body');
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

  adapter.next('fake-map-context').then(function() {
    assert.ok(true, 'This should be called once');
  });
});

test('getCurrentMapContext', function(assert) {
  assert.expect(4);
  // Mock backend response
  this.pretender.map(function() {
    this.get('/api/navigate-map/v1/context', function(request) {
      assert.equal(request.queryParams.course_id, 123, 'Wrong course id');
      assert.equal(request.queryParams.class_id, 321, 'Wrong class id');
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

  adapter.getCurrentMapContext(123, 321).then(function() {
    assert.ok(true, 'This should be called once');
  });
});
