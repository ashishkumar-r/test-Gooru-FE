import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter('adapter:media', 'Unit | Adapter | media', {});

test('uploadFile', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.post(
      '/api/nucleus-media/v1/uploads',
      function() {
        return [
          201,
          { 'Content-Type': 'application/json' },
          JSON.stringify({})
        ];
      },
      false
    );
  });
  adapter.uploadFile({}, '').then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});
