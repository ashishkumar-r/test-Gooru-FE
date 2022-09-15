import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/error',
  'Unit | Service | api-sdk/error',
  {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  }
);

test('createError', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'errorAdapter',
    Ember.Object.create({
      createError: function(data) {
        assert.equal(data.body, 'fake-data', 'This should be called once');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'errorSerializer',
    Ember.Object.create({
      serializeError: function(error) {
        assert.equal(error, 'fake-error', 'This should be called once');
        return 'fake-data';
      }
    })
  );

  var done = assert.async();
  service.createError('fake-error').then(function() {
    done();
  });
});
