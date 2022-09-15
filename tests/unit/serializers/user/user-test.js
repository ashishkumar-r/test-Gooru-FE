import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';

var configurationService = Ember.Object.create({
  configuration: {
    appRootPath: '/'
  }
});

moduleForComponent('serializer:user/user', 'Unit | Serializer | user/user');

test('normalizeSingleResponse', function(assert) {
  const serializer = this.subject();

  const payload = {
      accountCreatedType: 'normal',
      accountTypeId: 3,
      active: 1,
      confirmStatus: 0,
      createdOn: 'MonDec0106:25:15UTC2014',
      emailId: 'sdffsgf@gmail.com',
      firstName: 'developer',
      gooruUId: '006449b7-fd9a-457b-99b0-98e2cacf1536',
      lastName: 'team',
      organizationName: 'Gooru',
      partyUid: '006449b7-fd9a-457b-99b0-98e2cacf1536',
      profileImageUrl:
        'http://profile-demo.s3.amazonaws.com/profile-prod/006449b7-fd9a-457b-99b0-98e2cacf1536.png',
      userRoleSetString: 'User',
      username: 'developer2',
      usernameDisplay: 'developer2',
      viewFlag: 0
    },
    response = serializer.normalizeFindRecordResponse(
      'any store',
      'user/user',
      payload
    );

  const expected = {
    data: {
      id: '006449b7-fd9a-457b-99b0-98e2cacf1536',
      type: 'user/user',
      attributes: {
        accountCreatedType: 'normal',
        accountTypeId: 3,
        active: 1,
        confirmStatus: 0,
        createdOn: 'MonDec0106:25:15UTC2014',
        email: 'sdffsgf@gmail.com',
        firstName: 'developer',
        gooruUId: '006449b7-fd9a-457b-99b0-98e2cacf1536',
        lastName: 'team',
        organizationName: 'Gooru',
        partyUid: '006449b7-fd9a-457b-99b0-98e2cacf1536',
        avatarUrl:
          'http://profile-demo.s3.amazonaws.com/profile-prod/006449b7-fd9a-457b-99b0-98e2cacf1536.png',
        userRoleSetString: 'User',
        username: 'developer2',
        usernameDisplay: 'developer2',
        viewFlag: 0
      }
    }
  };

  assert.deepEqual(response, expected, 'Wrong response');
});

test('normalizeQueryRecordResponse', function(assert) {
  const serializer = this.subject();

  const appRootPath = '/'; //default appRootPath
  serializer.set('configurationService', configurationService);

  const payload = {
      searchResult: [
        {
          associationDate: 1448412441000,
          lastname: 'Bermudez',
          emailId: 'jeffreystudent02@test.com',
          username: 'JeffreyStudent02',
          firstname: 'Jeffrey',
          gooruUId: '7c74a27d-3748-49bd-83b4-4a3523ff370a'
        }
      ],
      totalHitCount: 1
    },
    response = serializer.normalizeQueryRecordResponse(
      'any store',
      'user/user',
      payload
    );

  const expected = {
    data: [
      {
        id: '7c74a27d-3748-49bd-83b4-4a3523ff370a',
        type: 'user/user',
        attributes: {
          email: 'jeffreystudent02@test.com',
          firstName: 'Jeffrey',
          gooruUId: '7c74a27d-3748-49bd-83b4-4a3523ff370a',
          lastName: 'Bermudez',
          username: 'JeffreyStudent02',
          accountCreatedType: undefined,
          accountTypeId: undefined,
          active: undefined,
          confirmStatus: undefined,
          createdOn: undefined,
          organizationName: undefined,
          partyUid: undefined,
          avatarUrl: `${appRootPath}${DEFAULT_IMAGES.USER_PROFILE}`,
          userRoleSetString: undefined,
          usernameDisplay: undefined,
          viewFlag: undefined
        }
      }
    ]
  };

  assert.deepEqual(response, expected, 'Wrong response');
});

test('normalizeUser', function(assert) {
  const serializer = this.subject();

  const payload = {
      accountCreatedType: 'normal',
      accountTypeId: 3,
      active: 1,
      confirmStatus: 0,
      createdOn: 'MonDec0106:25:15UTC2014',
      emailId: 'sdffsgf@gmail.com',
      firstName: 'developer',
      gooruUId: '006449b7-fd9a-457b-99b0-98e2cacf1536',
      lastName: 'team',
      organizationName: 'Gooru',
      partyUid: '006449b7-fd9a-457b-99b0-98e2cacf1536',
      profileImageUrl:
        'http://profile-demo.s3.amazonaws.com/profile-prod/006449b7-fd9a-457b-99b0-98e2cacf1536.png',
      userRoleSetString: 'User',
      username: 'developer2',
      usernameDisplay: 'developer2',
      viewFlag: 0
    },
    response = serializer.normalizeUser(payload);

  const expected = {
    id: '006449b7-fd9a-457b-99b0-98e2cacf1536',
    type: 'user/user',
    attributes: {
      accountCreatedType: 'normal',
      accountTypeId: 3,
      active: 1,
      confirmStatus: 0,
      createdOn: 'MonDec0106:25:15UTC2014',
      email: 'sdffsgf@gmail.com',
      firstName: 'developer',
      gooruUId: '006449b7-fd9a-457b-99b0-98e2cacf1536',
      lastName: 'team',
      organizationName: 'Gooru',
      partyUid: '006449b7-fd9a-457b-99b0-98e2cacf1536',
      avatarUrl:
        'http://profile-demo.s3.amazonaws.com/profile-prod/006449b7-fd9a-457b-99b0-98e2cacf1536.png',
      userRoleSetString: 'User',
      username: 'developer2',
      usernameDisplay: 'developer2',
      viewFlag: 0
    }
  };

  assert.deepEqual(response, expected, 'Wrong response');
});
