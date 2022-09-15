import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Pretender from 'pretender';
import EndPointsConfig from 'gooru-web/utils/endpoint-config';

moduleForComponent(
  'adapter:authentication/authentication',
  'Unit | Adapter | authentication/authentication',
  {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
    beforeEach: function() {
      this.pretender = new Pretender();
    },
    afterEach: function() {
      this.pretender.shutdown();
    }
  }
);

test('postAuthentication for anonymous account', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  const data = {
    isAnonymous: true
  };
  const routes = function() {
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    this.post(
      `${endpointUrl}/api/nucleus-auth/v2/signin`,
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.equal('anonymous', requestBodyJson.grant_type);
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

  adapter.postAuthentication(data).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});

test('postAuthentication for normal account', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  const data = {
    isAnonymous: false,
    username: 'username',
    password: 'password'
  };
  const encodedCredentials = window.btoa('username:password');
  const routes = function() {
    const endpointUrl = EndPointsConfig.getEndpointSecureUrl();
    this.post(
      `${endpointUrl}/api/nucleus-auth/v2/signin`,
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.equal('credential', requestBodyJson.grant_type);
        assert.equal(
          `Basic ${encodedCredentials}`,
          request.requestHeaders.Authorization
        );
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

  adapter.postAuthentication(data).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});

test('postAuthenticationWithToken', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  const data = {
    accessToken: 'access_token'
  };
  const access_token = 'access_token';
  const routes = function() {
    this.get(
      '/api/nucleus-auth/v1/token',
      function(request) {
        assert.equal(
          `Token ${access_token}`,
          request.requestHeaders.Authorization
        );
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

  adapter.postAuthenticationWithToken(data).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});

test('signOut', function(assert) {
  assert.expect(2);
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );

  const routes = function() {
    this.delete(
      '/api/nucleus-auth/v2/signout',
      function(request) {
        assert.equal('Token token-api-3', request.requestHeaders.Authorization);
        return [204, { 'Content-Type': 'application/json' }, ''];
      },
      false
    );
  };

  this.pretender.map(routes);
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  adapter.signOut('token-api-3').then(function() {
    assert.ok(true, 'Should be called once');
  });
});
