import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/multiple-class',
  'Unit | Service | api-sdk/multiple-class',
  {
    // Specify the other units that are required for this test.
    // needs: ['service:foo']
  }
);

// Replace this with your real tests.
test('it exists', function(assert) {
  let service = this.subject();
  assert.ok(service);
});
