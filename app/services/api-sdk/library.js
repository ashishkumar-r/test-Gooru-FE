import Ember from 'ember';
import LibrarySerializer from 'gooru-web/serializers/library/library';
import LibraryAdapter from 'gooru-web/adapters/library/library';

/**
 * @typedef {Object} LibraryService
 */
export default Ember.Service.extend({
  /**
   * @property {LibrarySerializer} librarySerializer
   */
  librarySerializer: null,

  /**
   * @property {LibraryAdapter} libraryAdapter
   */
  libraryAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'librarySerializer',
      LibrarySerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'libraryAdapter',
      LibraryAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Fetches the libraries
   *
   * @returns {Promise}
   */
  fetchLibraries: function() {
    const service = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('libraryAdapter')
        .fetchLibraries()
        .then(
          response =>
            resolve(
              service.get('librarySerializer').normalizeFetchLibraries(response)
            ),
          reject
        );
    });
  },

  /**
   * Returns a library by id
   * @param {string} libraryId - library ID to search for
   * @returns {Promise}
   */
  fetchById: function(libraryId) {
    const service = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('libraryAdapter')
        .getLibraryById(libraryId)
        .then(
          response =>
            resolve(
              service.get('librarySerializer').normalizeLibrary(response)
            ),
          reject
        );
    });
  },

  /**
   * Fetches the Library Content
   * @param libraryId the library id
   * @param {string} contentType  course, collection, assessment, resource, question, rubric
   * @param pagination - pagination values to list library content
   * @returns {Promise}
   */
  fetchLibraryContent: function(libraryId, contentType = 'course', pagination) {
    const service = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('libraryAdapter')
        .fetchLibraryContent(libraryId, contentType, pagination)
        .then(
          response =>
            resolve(
              service
                .get('librarySerializer')
                .normalizeFetchLibraryContent(contentType, response)
            ),
          reject
        );
    });
  },

  postLtiData(listData) {
    const service = this;
    service.get('libraryAdapter').postLtiData(listData);
  }
});
