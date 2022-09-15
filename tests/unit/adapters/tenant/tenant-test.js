import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter('adapter:tenant/tenant', 'Unit | Adapter | tenant/tenant', {
  unit: true
});

test('findTenantById', function(assert) {
  assert.expect(2);
  // Mock backend response
  this.pretender.map(function() {
    this.get(
      'http://tenant-repo/12345/tenant.json',
      function() {
        assert.ok(true, 'Request should be called once');
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({})
        ];
      },
      false
    );
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();
  adapter.set('configurationService', {
    configuration: {
      endpoint: {
        tenantUrl: 'http://tenant-repo'
      }
    }
  });

  adapter.findTenantById(12345).then(function() {
    assert.ok(true, 'Should be called once');
  });
});
