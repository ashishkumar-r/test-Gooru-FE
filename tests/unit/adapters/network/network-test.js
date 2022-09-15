import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter(
  'adapter:network/network',
  'Unit | Adapter | network/network',
  {
    // needs: []
  }
);

test('readMyNetwork', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      userId: 'user-id'
    })
  );
  const routes = function() {
    this.get(
      '/api/nucleus/v1/profiles/user-id/network',
      function() {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({})
        ];
      },
      false
    );
  };

  this.pretender.map(routes);
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  adapter.readMyNetwork().then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});
