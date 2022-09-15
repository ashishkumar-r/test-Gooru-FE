import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/bookmark',
  'Unit | Service | api-sdk/bookmark',
  {}
);

test('createBookmark', function(assert) {
  const service = this.subject();
  let bookmarkModel = Ember.Object.create();

  assert.expect(2);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v2/bookmarks',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'bookmark-id' },
          ''
        ];
      },
      false
    );
  });

  service.set(
    'bookmarkSerializer',
    Ember.Object.create({
      serializeCreateBookmark: function(bookmarkObject) {
        assert.deepEqual(
          bookmarkObject,
          bookmarkModel,
          'Wrong bookmark object'
        );
        return {};
      }
    })
  );

  var done = assert.async();
  service.createBookmark(bookmarkModel).then(function() {
    assert.equal(bookmarkModel.get('id'), 'bookmark-id', 'Wrong bookmark id');
    done();
  });
});

test('fetchBookmarks', function(assert) {
  const service = this.subject();
  let pagination = {
    offset: 0,
    pageSize: 20
  };
  assert.expect(3);
  service.set(
    'bookmarkAdapter',
    Ember.Object.create({
      fetchBookmarks: function(pagination) {
        assert.deepEqual(pagination.offset, 0, 'Wrong default offset');
        assert.deepEqual(pagination.pageSize, 20, 'Wrong default limit');
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'bookmarkSerializer',
    Ember.Object.create({
      normalizeFetchBookmarks: function(bookmarksPayload) {
        assert.deepEqual(bookmarksPayload, [], 'Wrong bookmarks payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service.fetchBookmarks(pagination).then(function() {
    done();
  });
});

test('deleteBookmark', function(assert) {
  const expectedBookmarkId = 'bookmark-id';
  const service = this.subject();

  assert.expect(1);

  service.set(
    'bookmarkAdapter',
    Ember.Object.create({
      deleteBookmark: function(bookmarkId) {
        assert.equal(bookmarkId, expectedBookmarkId, 'Wrong bookmark id');
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.deleteBookmark('bookmark-id').then(done());
});
