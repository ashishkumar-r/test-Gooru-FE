import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import { NETWORK_TYPE } from 'gooru-web/config/config';

moduleForService(
  'service:api-sdk/profile',
  'Unit | Service | api-sdk/profile',
  {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  }
);

test('createProfile', function(assert) {
  assert.expect(5);
  const service = this.subject();

  service.set(
    'profileAdapter',
    Ember.Object.create({
      createProfile: function(data) {
        const expectedData = {
          body: {}
        };
        assert.deepEqual(expectedData, data, 'Wrong profile data');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      serializeCreateProfile: function(profileObject) {
        assert.equal(
          profileObject.get('tenantId'),
          'tenant-id',
          'Wrong profile object'
        );
        return {};
      }
    })
  );

  service.set(
    'authenticationSerializer',
    Ember.Object.create({
      normalizeResponse: function(payload, isAnonymous, accessToken) {
        assert.deepEqual(payload, {}, 'Wrong payload value');
        assert.equal(isAnonymous, false, 'Wrong isAnonymous value');
        assert.equal(accessToken, undefined, 'Wrong accessToken value');
        return {};
      }
    })
  );

  service.set('session', {
    tenantId: 'tenant-id'
  });

  var done = assert.async();
  service.createProfile(Ember.Object.create({})).then(function() {
    done();
  });
});

test('updateMyProfile', function(assert) {
  const service = this.subject();

  assert.expect(2);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      updateMyProfile: function(data) {
        const expectedData = {
          body: {}
        };
        assert.deepEqual(expectedData, data, 'Wrong profile data');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      serializeUpdateProfile: function(profileObject) {
        assert.deepEqual({}, profileObject, 'Wrong profile object');
        return {};
      }
    })
  );

  var done = assert.async();
  service.updateMyProfile({}).then(function() {
    done();
  });
});

test('readUserProfile', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.readMultipleProfiles = function(profileIds) {
    assert.deepEqual(profileIds, [1]);
    return Ember.RSVP.resolve(['fakeProfile']);
  };

  var done = assert.async();
  service.readUserProfile(1).then(function(profile) {
    assert.equal(profile, 'fakeProfile', 'Wrong profile');
    done();
  });
});

test('readMultipleProfiles', function(assert) {
  const service = this.subject();
  assert.expect(6);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      readMultipleProfiles: function() {
        assert.ok(true, 'readUserProfile() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      normalizeReadMultipleProfiles: function(profilePayload) {
        assert.deepEqual({}, profilePayload, 'Wrong profile payload');
        return ['user-1', 'user-2', 'user-3', 'user-4', 'user-5'];
      }
    })
  );

  var done = assert.async();
  service
    .readMultipleProfiles(['user-1', 'user-2', 'user-3', 'user-4', 'user-5'], 2)
    .then(function() {
      done();
    });
});
test('readUserProfileByUsername', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      readUserProfileByUsername: function(username) {
        assert.equal(
          username,
          'username',
          'readUserProfileByUsername() function was called'
        );
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      normalizeReadProfile: function(profilePayload) {
        assert.deepEqual({}, profilePayload, 'Wrong profile payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service.readUserProfileByUsername('username').then(function() {
    done();
  });
});

test('followUserProfile', function(assert) {
  const service = this.subject();
  assert.expect(1);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      followUserProfile: function() {
        assert.ok(true, 'followUserProfile() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  var done = assert.async();
  service.followUserProfile().then(function() {
    done();
  });
});

test('unfollowUserProfile', function(assert) {
  const service = this.subject();
  assert.expect(1);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      unfollowUserProfile: function() {
        assert.ok(true, 'unfollowUserProfile() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  var done = assert.async();
  service.unfollowUserProfile().then(function() {
    done();
  });
});

test('checkUsernameAvailability-User does not exist', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyUsername: function(username) {
        assert.notEqual(
          username,
          'other-username-value',
          'Usernames should not be equal'
        );
        return Ember.RSVP.reject({ status: 404 });
      }
    })
  );

  var done = assert.async();
  service.checkUsernameAvailability('username-value').then(
    function() {
      assert.ok(true);
      done();
    },
    function() {
      assert.ok(false, 'Username was not validated correctly');
      done();
    }
  );
});

test('checkUsernameAvailability-User already exists', function(assert) {
  const service = this.subject();
  var i18n = Ember.Object.create({
    t: function() {
      return { string: 'sign-up.error-username-taken' };
    }
  });
  service.set('i18n', i18n);
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyUsername: function(username) {
        assert.equal(username, 'username-value', 'Usernames should be equal');
        return Ember.RSVP.resolve({ status: 200 });
      }
    })
  );

  var done = assert.async();
  service.checkUsernameAvailability('username-value').then(
    function() {
      assert.ok(false, 'Username was not validated correctly');
      done();
    },
    function() {
      assert.ok(true);
      done();
    }
  );
});

test('checkEmailAvailability-Email does not exist', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyEmail: function(email) {
        assert.notEqual(
          email,
          'other-email-value',
          'Emails should not be equal'
        );
        return Ember.RSVP.reject({ status: 404 });
      }
    })
  );

  var done = assert.async();
  service.checkEmailAvailability('email-value').then(
    function() {
      assert.ok(true);
      done();
    },
    function() {
      assert.ok(false, 'Email was not validated correctly');
      done();
    }
  );
});

test('checkEmailAvailability-Email already exists', function(assert) {
  const service = this.subject();
  var i18n = Ember.Object.create({
    t: function() {
      return { string: 'sign-up.error-username-taken' };
    }
  });
  service.set('i18n', i18n);
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyEmail: function(email) {
        assert.equal(email, 'email-value', 'Emails should be equal');
        return Ember.RSVP.resolve({ status: 200 });
      }
    })
  );

  var done = assert.async();
  service.checkEmailAvailability('email-value').then(
    function() {
      assert.ok(false, 'Email was not validated correctly');
      done();
    },
    function() {
      assert.ok(true);
      done();
    }
  );
});

test('checkEmailExists-Email exists', function(assert) {
  const service = this.subject();
  var i18n = Ember.Object.create({
    t: function() {
      return { string: 'forgot-password.error-email-not-exists' };
    }
  });
  service.set('i18n', i18n);
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyEmail: function(email) {
        assert.notEqual(
          email,
          'other-email-value',
          'Emails should not be equal'
        );
        return Ember.RSVP.reject({ status: 404 });
      }
    })
  );

  var done = assert.async();
  service.checkEmailExists('email-value').then(
    function() {
      assert.ok(false, 'Email was not validated correctly');
      done();
    },
    function() {
      assert.ok(true);
      done();
    }
  );
});

test('checkEmailExists-Email does not exist', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyEmail: function(email) {
        assert.equal(email, 'email-value', 'Emails should be equal');
        return Ember.RSVP.resolve({ status: 200 });
      }
    })
  );

  var done = assert.async();
  service.checkEmailExists('email-value').then(
    function() {
      assert.ok(true);
      done();
    },
    function() {
      assert.ok(false, 'Email was not validated correctly');
      done();
    }
  );
});

test('checkGoogleEmail-The account does not exist', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyEmail: function(email) {
        assert.notEqual(
          email,
          'other-email-value',
          'Emails should not be equal'
        );
        return Ember.RSVP.reject({ status: 404 });
      }
    })
  );

  var done = assert.async();
  service.checkGoogleEmail('email-value').then(
    function() {
      assert.ok(true);
      done();
    },
    function() {
      assert.ok(false, 'Email was not validated correctly');
      done();
    }
  );
});

test('checkGoogleEmail-Account not using google sign-in', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyEmail: function(email) {
        assert.equal(email, 'email-value', 'Emails should be equal');
        return Ember.RSVP.resolve({ login_type: 'credential', status: 200 });
      }
    })
  );

  var done = assert.async();
  service.checkGoogleEmail('email-value').then(
    function() {
      assert.ok(true);
      done();
    },
    function() {
      assert.ok(false, 'Email was not validated correctly');
      done();
    }
  );
});

test('checkGoogleEmail-Account using google sign-in already exists', function(
  assert
) {
  const service = this.subject();
  var i18n = Ember.Object.create({
    t: function() {
      return { string: '"common.errors.sign-in-google-account-exists"' };
    }
  });
  service.set('i18n', i18n);
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyEmail: function(email) {
        assert.equal(email, 'email-value', 'Emails should be equal');
        return Ember.RSVP.resolve({ login_type: 'google', status: 200 });
      }
    })
  );

  var done = assert.async();
  service.checkGoogleEmail('email-value').then(
    function() {
      assert.ok(false, 'Email was not validated correctly');
      done();
    },
    function() {
      assert.ok(true);
      done();
    }
  );
});

test('checkGoogleUsername-The account does not exist', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyUsername: function(username) {
        assert.notEqual(
          username,
          'other-username-value',
          'Usernames should not be equal'
        );
        return Ember.RSVP.reject({ status: 404 });
      }
    })
  );

  var done = assert.async();
  service.checkGoogleUsername('username-value').then(
    function() {
      assert.ok(true);
      done();
    },
    function() {
      assert.ok(false, 'Username was not validated correctly');
      done();
    }
  );
});

test('checkGoogleUsername-Account not using google sign-in', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyUsername: function(username) {
        assert.equal(username, 'username-value', 'Usernames should be equal');
        return Ember.RSVP.resolve({ login_type: 'credential', status: 200 });
      }
    })
  );

  var done = assert.async();
  service.checkGoogleUsername('username-value').then(
    function() {
      assert.ok(true);
      done();
    },
    function() {
      assert.ok(false, 'Username was not validated correctly');
      done();
    }
  );
});

test('checkGoogleUsername-Account using google sign-in already exists', function(
  assert
) {
  const service = this.subject();
  var i18n = Ember.Object.create({
    t: function() {
      return { string: '"common.errors.sign-in-google-account-exists"' };
    }
  });
  service.set('i18n', i18n);
  assert.expect(2);

  service.set(
    'availabilityAdapter',
    Ember.Object.create({
      verifyUsername: function(username) {
        assert.equal(username, 'username-value', 'Usernames should be equal');
        return Ember.RSVP.resolve({ login_type: 'google', status: 200 });
      }
    })
  );

  var done = assert.async();
  service.checkGoogleUsername('username-value').then(
    function() {
      assert.ok(false, 'Username was not validated correctly');
      done();
    },
    function() {
      assert.ok(true);
      done();
    }
  );
});

test('getCourses', function(assert) {
  const service = this.subject();

  assert.expect(4);

  service.set(
    'profileCoursesAdapter',
    Ember.Object.create({
      getCourses: function(profileId, subject, params) {
        assert.equal(profileId, 'profile-id', 'Wrong profile id');
        assert.equal(subject, 'course-subject', 'Wrong course subject');
        assert.equal(params.page, 1, 'Wrong page number');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'courseSerializer',
    Ember.Object.create({
      normalizeGetCourses: function(coursesPayload) {
        assert.deepEqual({}, coursesPayload, 'Wrong courses payload');
        return {};
      }
    })
  );

  let profileObject = Ember.Object.create({
    id: 'profile-id'
  });
  var done = assert.async();
  service
    .getCourses(profileObject, 'course-subject', { page: 1 })
    .then(function() {
      done();
    });
});

test('readResources', function(assert) {
  const service = this.subject();
  assert.expect(3);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      readResources: function(userId, params) {
        assert.equal(userId, 1, 'readResources(1) function was called');
        assert.equal(params.page, 1, 'Wrong page number');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      normalizeReadResources: function(response) {
        assert.deepEqual(
          response,
          {},
          'normalizeReadResources() function was called'
        );
        return [];
      }
    })
  );

  var done = assert.async();
  service.readResources(1, { page: 1 }).then(function() {
    done();
  });
});

test('readQuestions', function(assert) {
  const service = this.subject();
  assert.expect(3);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      readQuestions: function(userId, params) {
        assert.equal(userId, 1, 'readQuestions(1) function was called');
        assert.equal(params.page, 1, 'Wrong page number');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      normalizeReadQuestions: function(response) {
        assert.deepEqual(
          response,
          {},
          'normalizeReadQuestions() function was called'
        );
        return [];
      }
    })
  );

  var done = assert.async();
  service.readQuestions(1, { page: 1 }).then(function() {
    done();
  });
});

test('readCollections', function(assert) {
  const service = this.subject();
  assert.expect(3);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      readCollections: function(userId, params) {
        assert.equal(userId, 1, 'readCollections(1) function was called');
        assert.equal(params.page, 1, 'Wrong page number');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      normalizeReadCollections: function(response) {
        assert.deepEqual(
          response,
          {},
          'normalizeReadCollections() function was called'
        );
        return [];
      }
    })
  );

  var done = assert.async();
  service.readCollections(1, { page: 1 }).then(function() {
    done();
  });
});

test('readAssessments', function(assert) {
  const service = this.subject();
  assert.expect(3);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      readAssessments: function(userId, params) {
        assert.equal(userId, 1, 'readAssessments(1) function was called');
        assert.equal(params.page, 1, 'Wrong page number');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      normalizeReadAssessments: function(response) {
        assert.deepEqual(
          response,
          {},
          'normalizeReadAssessments() function was called'
        );
        return [];
      }
    })
  );

  var done = assert.async();
  service.readAssessments(1, { page: 1 }).then(function() {
    done();
  });
});

test('readRubrics', function(assert) {
  const service = this.subject();
  assert.expect(3);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      readRubrics: function(userId, params) {
        assert.equal(userId, 1, 'readRubrics function was called');
        assert.equal(params.page, 1, 'Wrong page number');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      normalizeReadRubrics: function(response) {
        assert.deepEqual(
          response,
          {},
          'normalizeReadRubrics function was called'
        );
        return [];
      }
    })
  );

  var done = assert.async();
  service.readRubrics(1, { page: 1 }).then(function() {
    done();
  });
});

test('forgotPassword', function(assert) {
  const service = this.subject();
  const expectedEmail = 'email-id';
  assert.expect(1);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      forgotPassword: function(email) {
        assert.equal(email, expectedEmail, 'Wrong email');
        return Ember.RSVP.resolve({});
      }
    })
  );

  var done = assert.async();
  service.forgotPassword(expectedEmail).then(function() {
    done();
  });
});

test('resetPassword', function(assert) {
  const service = this.subject();
  const expectedPassword = 'password';
  const expectedToken = 'token';
  assert.expect(2);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      resetPassword: function(password, token) {
        assert.equal(password, expectedPassword, 'Wrong password');
        assert.equal(token, expectedToken, 'Wrong token');
        return Ember.RSVP.resolve({});
      }
    })
  );

  var done = assert.async();
  service.resetPassword(expectedPassword, expectedToken).then(function() {
    done();
  });
});

test('readFollowing', function(assert) {
  const service = this.subject();
  assert.expect(3);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      readNetwork: function(userId, type) {
        assert.equal(userId, 1, 'Wrong user id');
        assert.equal(type, NETWORK_TYPE.FOLLOWING, 'Wrong type');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      normalizeReadNetwork: function(response) {
        assert.deepEqual(response, {}, 'Wrong response');
        return [];
      }
    })
  );

  var done = assert.async();
  service.readFollowing(1).then(function() {
    done();
  });
});

test('readFollowers', function(assert) {
  const service = this.subject();
  assert.expect(3);

  service.set(
    'profileAdapter',
    Ember.Object.create({
      readNetwork: function(userId, type) {
        assert.equal(userId, 1, 'Wrong user id');
        assert.equal(type, NETWORK_TYPE.FOLLOWERS, 'Wrong type');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'profileSerializer',
    Ember.Object.create({
      normalizeReadNetwork: function(response) {
        assert.deepEqual(response, {}, 'Wrong response');
        return [];
      }
    })
  );

  var done = assert.async();
  service.readFollowers(1).then(function() {
    done();
  });
});
