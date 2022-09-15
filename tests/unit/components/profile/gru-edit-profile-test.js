import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import Profile from 'gooru-web/models/profile/profile';

moduleForComponent(
  'profile/gru-edit-profile',
  'Unit | Component | profile/gru edit profile',
  {
    integration: false,
    needs: [
      'service:i18n',
      'service:configuration',
      'service:api-sdk/profile',
      'service:api-sdk/lookup',
      'service:api-sdk/session',
      'service:api-sdk/media',
      'service:session',
      'service:notifications'
    ]
  }
);

test('cancel action', function(assert) {
  let done = assert.async();
  let component = this.subject({
    profile: Profile.create(Ember.getOwner(this).ownerInjection(), {
      id: 'profile-id'
    }),
    router: {
      transitionTo: (transition, param) => {
        assert.equal(
          transition,
          'profile.about',
          'Transition route should match'
        );
        assert.equal(
          param,
          'profile-id',
          'Transition profile id param should match'
        );
        done();
      }
    }
  });
  component.send('cancel');
});

test('countrySelect action', function(assert) {
  let component = this.subject({
    profile: Profile.create(Ember.getOwner(this).ownerInjection(), {
      id: 'profile-id'
    }),
    countries: [
      {
        code: 'US',
        id: 'country-id',
        name: 'country-name'
      }
    ],
    showStates: true,
    districts: 'districts',
    showCountryErrorMessage: true
  });
  component.set(
    'tempProfile',
    Profile.create(Ember.getOwner(this).ownerInjection(), {
      id: 'profile-id',
      stateId: 'state-id',
      state: 'state-name',
      schoolDistrictId: 'district-id',
      schoolDistrict: 'other-district'
    })
  );

  component.send('countrySelect', 'country-id');

  assert.notOk(
    component.get('showCountryErrorMessage'),
    'Should not show country error message'
  );
  assert.ok(component.get('showStates'), 'It should show states');
  assert.equal(
    component.get('districts'),
    'districts',
    'Districts should be mantained'
  );
  assert.equal(
    component.get('countrySelected'),
    'country-id',
    'Country selected id should match'
  );
  assert.equal(
    component.get('country'),
    'country-name',
    'Country name should match'
  );
  assert.equal(
    component.get('stateSelected'),
    'state-id',
    'State selected id should match'
  );
  assert.equal(component.get('state'), 'state-name', 'State name should match');
  assert.equal(
    component.get('districtSelected'),
    'district-id',
    'District selected id should match'
  );
  assert.equal(
    component.get('otherSchoolDistrict'),
    'other-district',
    'Other district should match'
  );

  component.setProperties({
    countries: [
      {
        code: 'country-code',
        id: 'country-id',
        name: 'country-name'
      }
    ]
  });

  component.send('countrySelect', 'country-id');

  assert.notOk(
    component.get('showCountryErrorMessage'),
    'Should not show country error message'
  );
  assert.notOk(component.get('showStates'), 'It should not show states');
  assert.notOk(component.get('districts'), 'Districts should be unset');
  assert.equal(
    component.get('countrySelected'),
    'country-id',
    'Country selected id should match'
  );
  assert.equal(
    component.get('country'),
    'country-name',
    'Country name should match'
  );
  assert.notOk(
    component.get('stateSelected'),
    'State selected id should be unset'
  );
  assert.notOk(component.get('state'), 'State name should be unset');
  assert.notOk(
    component.get('districtSelected'),
    'District selected id should be unset'
  );
  assert.notOk(
    component.get('otherSchoolDistrict'),
    'Other district should be unset'
  );
});

test('stateSelect action', function(assert) {
  let component = this.subject({
    profile: Profile.create(Ember.getOwner(this).ownerInjection(), {
      id: 'profile-id'
    }),
    states: [
      {
        code: 'state-code',
        id: 'state-id',
        name: 'state-name'
      }
    ],
    districts: 'districts',
    showStateErrorMessage: true,
    showDistrictErrorMessage: true,
    lookupService: {
      readDistricts: id => {
        assert.equal(id, 'state-id', 'State id should match');
        return Ember.RSVP.resolve('districts');
      }
    }
  });

  Ember.run(() => component.send('stateSelect', 'state-id'));

  assert.notOk(
    component.get('showStateErrorMessage'),
    'Should not show state error message'
  );
  assert.notOk(
    component.get('showDistrictErrorMessage'),
    'Should not show district error message'
  );
  assert.equal(
    component.get('districts'),
    'districts',
    'Districts should be set'
  );
  assert.equal(
    component.get('stateSelected'),
    'state-id',
    'State selected id should match'
  );
  assert.equal(component.get('state'), 'state-name', 'State name should match');
});

test('isMyProfile', function(assert) {
  let component = this.subject({
    session: Ember.Object.create({ userId: 'profile-id' }),
    profile: Profile.create(Ember.getOwner(this).ownerInjection(), {
      id: 'profile-id'
    })
  });
  assert.ok(component.get('isMyProfile'), 'It should return true');
  component.set('profile.id', 'other-id');
  assert.notOk(component.get('isMyProfile'), 'It should return false');
  component.set('session.userId', 'other-id');
  assert.ok(component.get('isMyProfile'), 'It should return true');
});

test('saveProfile', function(assert) {
  let profile = Profile.create(Ember.getOwner(this).ownerInjection(), {
    avatarUrl: 'url',
    username: 'username'
  });
  let userData = {
    avatarUrl: '',
    isNew: true,
    username: 'test'
  };
  let component = this.subject({
    profile,
    profileService: {
      updateMyProfile: profileParam => {
        assert.deepEqual(profileParam, profile, 'Profile should match');
        return Ember.RSVP.resolve();
      }
    },
    sessionService: {
      updateUserData: userDataParam =>
        assert.deepEqual(userDataParam, userData, 'User data should match')
    },
    session: Ember.Object.create({
      userData
    })
  });

  Ember.run(() => component.saveProfile(profile));

  component.get('session.userData.avatarUrl', 'url', 'Avatar url should match');
  component.get('session.userData.isNew', false, 'Is new should be false');
  component.get(
    'session.userData.username',
    'username',
    'Username should match'
  );
});

test('Student ID', function(assert) {
  let profile = Profile.create(Ember.getOwner(this).ownerInjection(), {
    isStudent: true,
    studentId: 'student-id',
    isTeacher: false
  });
  let component = this.subject({ profile });
  assert.ok(component.get('profile.isStudent'), 'Student ID should visible');
  assert.equal(
    component.get('profile.studentId'),
    'student-id',
    'Student ID should match'
  );
  assert.notOk(
    component.get('profile.isTeacher'),
    'Student ID should not be visible'
  );
});
