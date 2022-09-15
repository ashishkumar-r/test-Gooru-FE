import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter(
  'adapter:notification/notification',
  'Unit | Adapter | notification/notification',
  {
    // needs: []
  }
);

test('fetchNotifications', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v2/notifications',
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
  const pagination = {
    offset: 0,
    pageSize: 10
  };
  adapter.fetchNotifications(pagination).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});
