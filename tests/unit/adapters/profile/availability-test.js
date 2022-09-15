import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter(
  'adapter:profile/availability',
  'Unit | Adapter | profile/availability',
  {
    // needs: []
  }
);

test('verifyUsername', function(assert) {
  const adapter = this.subject();
  const username = 'username-value';
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v2/profiles/search',
      function(request) {
        assert.equal(
          request.queryParams.username,
          username,
          'Wrong request param username value'
        );
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({})
        ];
      },
      false
    );
  });
  adapter.verifyUsername(username).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});

test('verifyEmail', function(assert) {
  const adapter = this.subject();
  const email = 'email-value';
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v2/profiles/search',
      function(request) {
        assert.equal(
          request.queryParams.email,
          email,
          'Wrong request param email value'
        );
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({})
        ];
      },
      false
    );
  });
  adapter.verifyEmail(email).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});
