import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import BookmarkModel from 'gooru-web/models/content/bookmark';

moduleForComponent(
  'serializer:content/bookmark',
  'Unit | Serializer | content/bookmark'
);

test('serializeCreateBookmark', function(assert) {
  const serializer = this.subject();
  const bookmarkObject = BookmarkModel.create({
    title: 'bookmark-title',
    contentId: 'any-id',
    contentType: 'any-type'
  });
  const response = serializer.serializeCreateBookmark(bookmarkObject);
  assert.equal(response.title, 'bookmark-title', 'Wrong title');
  assert.equal(response.content_id, 'any-id', 'Wrong content id');
  assert.equal(response.content_type, 'any-type', 'Wrong content type');
});

test('normalizeFetchBookmarks', function(assert) {
  const serializer = this.subject();
  const bookmarksPayload = {
    bookmarks: [
      {
        id: 'aaa-bbb',
        content_id: '123',
        content_type: 'assessment',
        title: 'Title 1'
      },
      {
        id: 'ccc-ddd',
        title: 'Title 2',
        content_id: '456',
        content_type: 'assessment'
      },
      {
        id: 'eee-fff',
        content_id: '789',
        content_type: 'assessment',
        title: 'Title 3'
      }
    ]
  };
  const normalizedBookmarks = serializer.normalizeFetchBookmarks(
    bookmarksPayload
  );

  assert.equal(normalizedBookmarks.length, 3, 'Wrong number of bookmarks');
  const bookmark1 = normalizedBookmarks.objectAt(0);

  assert.equal(bookmark1.get('id'), 'aaa-bbb', 'Wrong bookmark id');
  assert.equal(bookmark1.get('contentId'), '123', 'Wrong content Id');
  assert.equal(
    bookmark1.get('contentType'),
    'assessment',
    'Wrong content type'
  );
  assert.equal(bookmark1.get('title'), 'Title 1', 'Wrong bookmark title');
});
