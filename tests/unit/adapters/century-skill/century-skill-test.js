import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter(
  'adapter:century-skill/century-skill',
  'Unit | Adapter | century-skill/century-skill',
  {}
);

test('getCenturySkills', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );

  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v1/lookups/21-century-skills',
      function() {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({})
        ];
      },
      false
    );
  });

  adapter.getCenturySkills().then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});
