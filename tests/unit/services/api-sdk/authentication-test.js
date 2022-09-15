import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/authentication',
  'Unit | Service | api-sdk/authentication',
  {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  }
);

test('authenticateAsAnonymous', function(assert) {
  const service = this.subject();
  const response = {};

  assert.expect(2);

  service.set(
    'authenticationAdapter',
    Ember.Object.create({
      postAuthentication: function(data) {
        assert.equal(true, data.isAnonymous, 'Wrong isAnonymous status');
        return Ember.RSVP.resolve(response);
      }
    })
  );

  service.set(
    'authenticationSerializer',
    Ember.Object.create({
      normalizeResponse: function(payload) {
        assert.deepEqual(response, payload, 'Wrong response payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service.authenticateAsAnonymous().then(function() {
    done();
  });
});

test('authenticateWithCredentials', function(assert) {
  const service = this.subject();
  const expectedData = {
    isAnonymous: false,
    username: 'username',
    password: 'password'
  };
  const sessionData = {
    user: {
      gooruUId: 'user-id'
    }
  };

  assert.expect(2);

  service.set(
    'authenticationAdapter',
    Ember.Object.create({
      postAuthentication: function(data) {
        assert.deepEqual(expectedData, data, 'Wrong authentication data');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'authenticationSerializer',
    Ember.Object.create({
      normalizeResponse: function(payload) {
        assert.deepEqual({}, payload, 'Wrong response payload');
        return sessionData;
      }
    })
  );

  var done = assert.async();
  service.authenticateWithCredentials('username', 'password').then(function() {
    done();
  });
});

test('authenticateWithToken', function(assert) {
  const service = this.subject();
  const expectedData = {
    accessToken: 'access_token'
  };
  const sessionData = {
    user: {
      gooruUId: 'user-id'
    }
  };
  assert.expect(2);

  service.set(
    'authenticationAdapter',
    Ember.Object.create({
      postAuthenticationWithToken: function(data) {
        assert.deepEqual(expectedData, data, 'Wrong authentication data');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'authenticationSerializer',
    Ember.Object.create({
      normalizeResponse: function(payload) {
        assert.deepEqual({}, payload, 'Wrong response payload');
        return sessionData;
      }
    })
  );

  var done = assert.async();
  service.authenticateWithToken('access_token').then(function() {
    done();
  });
});

test('signOut', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'authenticationAdapter',
    Ember.Object.create({
      signOut: function() {
        assert.ok(true, 'This should be called once');
        return Ember.RSVP.resolve({});
      }
    })
  );

  var done = assert.async();
  service.signOut().then(function() {
    assert.ok(true, 'This should be called once');
    done();
  });
});

test('domainBasedRedirection', function(assert) {
  const service = this.subject();
  const expectedData = {
    domain: 'www.gooru.org'
  };
  assert.expect(2);
  service.set(
    'authenticationAdapter',
    Ember.Object.create({
      domainBasedRedirection: function(data) {
        assert.deepEqual(expectedData, data, 'Wrong domain redirection data');
        return Ember.RSVP.resolve({});
      }
    })
  );
  const responseData = {
    statusCode: '200',
    redirectUrl: null
  };
  service.set(
    'authenticationSerializer',
    Ember.Object.create({
      normalizeDomainRedirectResponse: function(payload) {
        assert.deepEqual({}, payload, 'Wrong response payload');
        return responseData;
      }
    })
  );

  var done = assert.async();
  service.domainBasedRedirection('www.gooru.org').then(function() {
    done();
  });
});
