import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/tenant',
  'Unit | Service | api-sdk/tenant',
  {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  }
);

test('findTenantById', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'tenantAdapter',
    Ember.Object.create({
      findTenantById: function(id) {
        assert.equal(id, 12345, 'Wrong id');
        return Ember.RSVP.resolve('FakeTenant');
      }
    })
  );

  service.set(
    'tenantSerializer',
    Ember.Object.create({
      normalizeTenant: function(response) {
        assert.equal(response, 'FakeTenant', 'Wrong response');
        return [];
      }
    })
  );

  var done = assert.async();
  service.findTenantById(12345).then(function() {
    done();
  });
});
