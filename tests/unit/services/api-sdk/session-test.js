import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import UserModel from 'gooru-web/models/profile/profile';

moduleForService(
  'service:api-sdk/session',
  'Unit | Service | api-sdk/session',
  {}
);

test('signInWithUser', function(assert) {
  const service = this.subject();
  const response = {};
  const credentials = UserModel.create({
    username: 'username',
    password: 'password'
  });
  const expectedData = {
    isAnonymous: false,
    hasAccessToken: false,
    hasUserData: false,
    username: 'username',
    password: 'password'
  };

  service.set(
    'session',
    Ember.Object.create({
      authenticate: function(useApi3, data) {
        assert.deepEqual(expectedData, data, 'Wrong data');
        return Ember.RSVP.resolve(response);
      }
    })
  );

  var done = assert.async();
  service.signInWithUser(credentials, true).then(function() {
    done();
  });
});

test('signInWithToken', function(assert) {
  const service = this.subject();
  const response = {};
  const token = 'access_token';
  const expectedData = {
    isAnonymous: false,
    hasAccessToken: true,
    hasUserData: false,
    accessToken: 'access_token'
  };

  service.set(
    'session',
    Ember.Object.create({
      authenticate: function(useApi3, data) {
        assert.deepEqual(expectedData, data, 'Wrong data');
        return Ember.RSVP.resolve(response);
      }
    })
  );

  var done = assert.async();
  service.signInWithToken(token).then(function() {
    done();
  });
});

test('signUp', function(assert) {
  const service = this.subject();
  const response = {};
  const user = {
    username: 'username',
    password: 'password'
  };
  const expectedData = {
    isAnonymous: false,
    hasAccessToken: false,
    hasUserData: true,
    user: {
      username: 'username',
      password: 'password'
    }
  };

  service.set(
    'session',
    Ember.Object.create({
      authenticate: function(useApi3, data) {
        assert.deepEqual(expectedData, data, 'Wrong data');
        return Ember.RSVP.resolve(response);
      }
    })
  );

  var done = assert.async();
  service.signUp(user).then(function() {
    done();
  });
});

test('updateUserData', function(assert) {
  const service = this.subject();
  service.set(
    'session',
    Ember.Object.create({
      userData: {},
      data: {},
      store: {
        persist: function() {
          assert.ok(true);
        }
      }
    })
  );
  const expectedData = {
    isNew: false
  };
  service.updateUserData(expectedData);
  assert.deepEqual(
    service.get('session.userData'),
    expectedData,
    'Wrong userData'
  );
});

test('authorize', function(assert) {
  const service = this.subject();

  service.set(
    'session',
    Ember.Object.create({
      authorize: function(useApi3, block) {
        assert.ok(true, 'authorize() function was called');
        block(null);
      }
    })
  );

  var done = assert.async();
  service.authorize().then(function() {
    done();
  });
});
