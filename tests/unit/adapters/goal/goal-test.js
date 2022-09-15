import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

const sessionStub = Ember.Service.extend({
  'token-api3': 'token-api-3'
});

moduleForAdapter('adapter:goal/goal', 'Unit | Adapter | goal/goal', {
  unit: true,
  beforeEach: function() {
    this.register('service:session', sessionStub);
    this.inject.service('session');
  }
});

test('Goal creation, success', function(assert) {
  assert.expect(3);
  // Mock backend response
  this.pretender.map(function() {
    this.post('/api/nucleus/v1/goals', function(request) {
      let requestBodyJson = JSON.parse(request.requestBody);
      assert.equal(requestBodyJson.title, 'any content', 'Wrong title');
      assert.equal(
        request.requestHeaders.Authorization,
        'Token token-api-3',
        'Wrong token'
      );
      return [
        201,
        {
          'Content-Type': 'text/plain',
          location: 'goal-id-456'
        },
        ''
      ];
    });
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();
  const params = { title: 'any content' };

  adapter.createGoal(params).then(function(response) {
    assert.equal(
      response,
      'goal-id-456',
      'Should respond with the newly created ID for the goal'
    );
  });
});

test('Goal creation, failure', function(assert) {
  assert.expect(3);
  // Mock backend response
  this.pretender.map(function() {
    this.post('/api/nucleus/v1/goals', function(request) {
      let requestBodyJson = JSON.parse(request.requestBody);
      assert.equal(requestBodyJson.title, 'any content', 'Wrong title');
      assert.equal(
        request.requestHeaders.Authorization,
        'Token token-api-3',
        'Wrong token'
      );
      return [500, { 'Content-Type': 'text/plain' }, ''];
    });
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();
  const params = { title: 'any content' };

  adapter.createGoal(params).catch(function(response) {
    assert.equal(response.status, '500', 'Error code');
  });
});

test('Goal update, success', function(assert) {
  assert.expect(3);
  // Mock backend response
  this.pretender.map(function() {
    this.put('/api/nucleus/v1/goals/123', function(request) {
      let requestBodyJson = JSON.parse(request.requestBody);
      assert.equal(requestBodyJson.title, 'any content', 'Wrong title');
      assert.equal(
        request.requestHeaders.Authorization,
        'Token token-api-3',
        'Wrong token'
      );
      return [
        201,
        {
          'Content-Type': 'text/plain'
        },
        ''
      ];
    });
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();
  const params = {
    title: 'any content'
  };
  const goalId = 123;

  adapter.updateGoal(params, goalId).then(function(response) {
    assert.ok(response, 'Should return true');
  });
});

test('Goal delete, success', function(assert) {
  assert.expect(2);
  // Mock backend response
  this.pretender.map(function() {
    this.delete('/api/nucleus/v1/goals/123', function(request) {
      assert.equal(
        request.requestHeaders.Authorization,
        'Token token-api-3',
        'Wrong token'
      );
      return [
        200,
        {
          'Content-Type': 'text/plain'
        },
        ''
      ];
    });
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();

  adapter.deleteGoal(123).then(function(response) {
    assert.ok(response, 'Should return true');
  });
});

test('getGoalsByUser', function(assert) {
  assert.expect(2);
  const fakeResponse = 'fakeResponse';

  // Mock backend response
  this.pretender.map(function() {
    this.get('/api/nucleus/v1/goals/user/123', function(request) {
      assert.equal(
        request.requestHeaders.Authorization,
        'Token token-api-3',
        'Wrong token'
      );
      return [
        200,
        {
          'Content-Type': 'application/json; charset=utf-8'
        },
        JSON.stringify(fakeResponse)
      ];
    });
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();

  adapter.getGoalsByUser(123).then(function(response) {
    assert.equal(response, fakeResponse, 'Wrong response');
  });
});
