import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Profile from 'gooru-web/models/profile/profile';

moduleForComponent(
  'controller:sign-up-finish',
  'Unit | Controller | sign up finish',
  {
    needs: ['controller:application']
  }
);

test('countrySelect action', function(assert) {
  let controller = this.subject({
    profile: Profile.create(Ember.getOwner(this).ownerInjection(), {
      id: 'profile-id',
      stateId: 'state-id',
      state: 'state-name',
      schoolDistrictId: 'district-id'
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
    showCountryErrorMessage: true,
    otherSchoolDistrict: 'other-district'
  });

  controller.send('countrySelect', 'country-id');

  assert.notOk(
    controller.get('showCountryErrorMessage'),
    'Should not show country error message'
  );
  assert.ok(controller.get('showStates'), 'It should show states');
  assert.equal(
    controller.get('districts'),
    'districts',
    'Districts should be mantained'
  );
  assert.equal(
    controller.get('countrySelected'),
    'country-id',
    'Country selected id should match'
  );
  assert.equal(
    controller.get('country'),
    'country-name',
    'Country name should match'
  );
  assert.equal(
    controller.get('stateSelected'),
    'state-id',
    'State selected id should match'
  );
  assert.equal(
    controller.get('state'),
    'state-name',
    'State name should match'
  );
  assert.equal(
    controller.get('districtSelected'),
    'district-id',
    'District selected id should match'
  );
  assert.equal(
    controller.get('otherSchoolDistrict'),
    'other-district',
    'Other district should match'
  );

  controller.setProperties({
    countries: [
      {
        code: 'country-code',
        id: 'country-id',
        name: 'country-name'
      }
    ]
  });

  controller.send('countrySelect', 'country-id');

  assert.notOk(
    controller.get('showCountryErrorMessage'),
    'Should not show country error message'
  );
  assert.notOk(controller.get('showStates'), 'It should not show states');
  assert.notOk(controller.get('districts'), 'Districts should be unset');
  assert.equal(
    controller.get('countrySelected'),
    'country-id',
    'Country selected id should match'
  );
  assert.equal(
    controller.get('country'),
    'country-name',
    'Country name should match'
  );
  assert.notOk(
    controller.get('stateSelected'),
    'State selected id should be unset'
  );
  assert.notOk(controller.get('state'), 'State name should be unset');
  assert.notOk(
    controller.get('districtSelected'),
    'District selected id should be unset'
  );
  assert.notOk(
    controller.get('otherSchoolDistrict'),
    'Other district should be unset'
  );
});

test('stateSelect action', function(assert) {
  let controller = this.subject({
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

  Ember.run(() => controller.send('stateSelect', 'state-id'));

  assert.notOk(
    controller.get('showStateErrorMessage'),
    'Should not show state error message'
  );
  assert.notOk(
    controller.get('showDistrictErrorMessage'),
    'Should not show district error message'
  );
  assert.equal(
    controller.get('districts'),
    'districts',
    'Districts should be set'
  );
  assert.equal(
    controller.get('stateSelected'),
    'state-id',
    'State selected id should match'
  );
  assert.equal(
    controller.get('state'),
    'state-name',
    'State name should match'
  );
});
