import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'serializer:notification/notification',
  'Unit | Serializer | notification/notification'
);

test('normalizeNotifications', function(assert) {
  const serializer = this.subject();
  const notificationsPayload = {
    notifications: [
      {
        id: 1,
        status: 'unread',
        created_at: '2016-03-09T05:55:42Z',
        updated_at: '2016-03-10T05:13:35Z',
        notification_event: 'core.course.create',
        template: '<b>${actors}</b> has created new ${object}',
        actors: [
          {
            user_id: '8dc3322f-4b59-4102-98e8-43e0fcc346fe',
            display_name: 'Terry Perez',
            thumbnail: '8dc3322f-4b59-4102-98e8-43e0fcc346fe.png'
          },
          {
            user_id: '8dc3322f-4b59-4102-98e8-43e0fcc346fe',
            display_name: 'Ms Evylin',
            thumbnail: '8dc3322f-4b59-4102-98e8-43e0fcc346fe.png'
          },
          {
            user_id: '8dc3322f-4b59-4102-98e8-43e0fcc346fe',
            display_name: 'User One',
            thumbnail: '8dc3322f-4b59-4102-98e8-43e0fcc346fe.png'
          },
          {
            user_id: '8dc3322f-4b59-4102-98e8-43e0fcc346fe',
            display_name: 'User Two',
            thumbnail: '8dc3322f-4b59-4102-98e8-43e0fcc346fe.png'
          },
          {
            user_id: '8dc3322f-4b59-4102-98e8-43e0fcc346fe',
            display_name: 'User Three',
            thumbnail: '8dc3322f-4b59-4102-98e8-43e0fcc346fe.png'
          }
        ],
        object: {
          display_string: 'course',
          content_type: 'course',
          content_id: 'content_id_1'
        }
      },
      {
        id: 2,
        status: 'unread',
        notification_event: 'core.collection.remix',
        created_at: '2016-03-09T05:55:42Z',
        updated_at: '2016-03-10T05:13:35Z',
        template: '<b>${actors}</b> have remixed your <b>${object}</b>',
        actors: [
          {
            user_id: '8dc3322f-4b59-4102-98e8-43e0fcc346fe',
            display_name: 'Terry Perez',
            thumbnail: '8dc3322f-4b59-4102-98e8-43e0fcc346fe.png'
          }
        ],
        object: {
          display_string: 'collection',
          content_type: 'collection',
          content_id: 'content_id_2'
        }
      }
    ],
    filters: {
      limit: 10,
      offset: 0
    }
  };

  const normalizedNotifications = serializer.normalizeNotifications(
    notificationsPayload
  );

  assert.equal(
    normalizedNotifications.length,
    2,
    'Wrong number of notifications'
  );
  const notification1 = normalizedNotifications.objectAt(0);

  assert.equal(notification1.get('id'), 1, 'Wrong notification id');
  assert.equal(notification1.get('status'), 'unread', 'Wrong status');
  assert.equal(
    notification1.get('notificationEvent'),
    'core.course.create',
    'Wrong notification event'
  );
  assert.equal(
    notification1.get('actors').length,
    5,
    'Wrong number of notification actors'
  );
  assert.equal(
    notification1.get('object.objectId'),
    'content_id_1',
    'Wrong object id'
  );
  assert.equal(
    notification1.get('object.objectName'),
    'course',
    'Wrong object name'
  );
  assert.equal(
    notification1.get('object.objectType'),
    'course',
    'Wrong object type'
  );
});

test('normalizeNotification', function(assert) {
  const serializer = this.subject();

  const notificationData = {
    id: 2,
    status: 'unread',
    notification_event: 'core.collection.remix',
    created_at: '2016-03-09T05:55:42Z',
    updated_at: '2016-03-10T05:13:35Z',
    template: '<b>${actors}</b> have remixed your <b>${object}</b>',
    actors: [
      {
        user_id: '8dc3322f-4b59-4102-98e8-43e0fcc346fe',
        display_name: 'Terry Perez',
        thumbnail: '8dc3322f-4b59-4102-98e8-43e0fcc346fe.png'
      }
    ],
    object: {
      display_string: 'collection',
      content_type: 'collection',
      content_id: 'content_id_2'
    }
  };

  const notification = serializer.normalizeNotification(notificationData);
  assert.equal(notification.get('id'), 2, 'Wrong notification id');
  assert.equal(notification.get('status'), 'unread', 'Wrong status');
  assert.equal(
    notification.get('notificationEvent'),
    'core.collection.remix',
    'Wrong notification event'
  );
  assert.equal(
    notification.get('actors').length,
    1,
    'Wrong number of notification actors'
  );
  assert.equal(
    notification.get('object.objectId'),
    'content_id_2',
    'Wrong object id'
  );
  assert.equal(
    notification.get('object.objectName'),
    'collection',
    'Wrong object name'
  );
  assert.equal(
    notification.get('object.objectType'),
    'collection',
    'Wrong object type'
  );
});
