import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import BookmarkModel from 'gooru-web/models/content/bookmark';

/**
 * Serializer to support the Bookmark CRUD operations for API 3.0
 *
 * @typedef {Object} BookmarkSerializer
 */
export default Ember.Object.extend(ConfigurationMixin, {
  session: Ember.inject.service('session'),

  /**
   * Serialize a Bookmark object into a JSON representation required by the Create Bookmark endpoint
   *
   * @param bookmarkModel The Bookmark model to be serialized
   * @returns {Object} returns a JSON Object
   */
  serializeCreateBookmark: function(bookmarkModel) {
    return this.serializeBookmark(bookmarkModel);
  },

  serializeBookmark: function(bookmarkModel) {
    let serializedBookmark = {
      title: bookmarkModel.get('title'),
      content_id: bookmarkModel.get('contentId'),
      content_type: bookmarkModel.get('contentType')
    };
    return serializedBookmark;
  },

  /**
   * Normalize the Fetch Bookmarks endpoint's response
   *
   * @param payload is the endpoint response in JSON format
   * @returns {Bookmarks[]} an array of bookmarks
   */
  normalizeFetchBookmarks: function(payload) {
    var result = [];
    const serializer = this;
    const bookmarks = payload.bookmarks;
    if (Ember.isArray(bookmarks)) {
      result = bookmarks.map(bookmark =>
        serializer.normalizeBookmark(bookmark)
      );
    }
    return result;
  },

  normalizeBookmark: function(bookmarkPayload) {
    var serializer = this;
    return BookmarkModel.create(Ember.getOwner(serializer).ownerInjection(), {
      id: bookmarkPayload.id,
      title: bookmarkPayload.title,
      contentId: bookmarkPayload.content_id,
      contentType: bookmarkPayload.content_type
    });
  }
});
