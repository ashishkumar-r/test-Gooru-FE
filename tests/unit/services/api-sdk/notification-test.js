import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/notification',
  'Unit | Service | api-sdk/notification',
  {}
);

test('fetchNotifications', function(assert) {
  const service = this.subject();
  let pagination = {
    offset: 0,
    pageSize: 10
  };
  assert.expect(3);
  service.set(
    'notificationAdapter',
    Ember.Object.create({
      fetchNotifications: function(pagination) {
        assert.deepEqual(pagination.offset, 0, 'Wrong default offset');
        assert.deepEqual(pagination.pageSize, 10, 'Wrong default limit');
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'notificationSerializer',
    Ember.Object.create({
      normalizeNotifications: function(notificationsPayload) {
        assert.deepEqual(
          notificationsPayload,
          [],
          'Wrong notifications payload'
        );
        return [];
      }
    })
  );

  var done = assert.async();
  service.fetchNotifications(pagination).then(function() {
    done();
  });
});
