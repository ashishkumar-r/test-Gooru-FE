import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/network',
  'Unit | Service | api-sdk/network',
  {
    // needs: []
  }
);

test('readMyNetwork', function(assert) {
  const service = this.subject();

  assert.expect(2);

  service.set(
    'networkAdapter',
    Ember.Object.create({
      readMyNetwork: function() {
        assert.ok(true, 'readMyNetwork() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'networkSerializer',
    Ember.Object.create({
      normalizeReadNetwork: function(networkPayload) {
        assert.deepEqual({}, networkPayload, 'Wrong profile payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service.readMyNetwork().then(function() {
    done();
  });
});

test('readUserNetwork', function(assert) {
  const service = this.subject();

  assert.expect(2);

  service.set(
    'networkAdapter',
    Ember.Object.create({
      readUserNetwork: function() {
        assert.ok(true, 'readUserNetwork() function was called');
        return Ember.RSVP.resolve({});
      }
    })
  );

  service.set(
    'networkSerializer',
    Ember.Object.create({
      normalizeReadNetwork: function(networkPayload) {
        assert.deepEqual({}, networkPayload, 'Wrong profile payload');
        return {};
      }
    })
  );

  var done = assert.async();
  service.readUserNetwork().then(function() {
    done();
  });
});
