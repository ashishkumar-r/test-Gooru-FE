import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/library',
  'Unit | Service | api-sdk/library',
  {}
);

test('fetchLibraries', function(assert) {
  const service = this.subject();

  assert.expect(1);
  service.set(
    'libraryAdapter',
    Ember.Object.create({
      fetchLibraries: function() {
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'librarySerializer',
    Ember.Object.create({
      normalizeFetchLibraries: function(librariesPayload) {
        assert.deepEqual(librariesPayload, [], 'Wrong libraries payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service.fetchLibraries().then(function() {
    done();
  });
});

test('findById', function(assert) {
  const service = this.subject();
  const expectedLibraryId = '1';
  assert.expect(2);

  service.set(
    'libraryAdapter',
    Ember.Object.create({
      getLibraryById: function(libraryId) {
        assert.equal(libraryId, expectedLibraryId, 'Wrong library id');
        return Ember.RSVP.resolve({ id: libraryId });
      }
    })
  );

  service.set(
    'librarySerializer',
    Ember.Object.create({
      normalizeLibrary: function(libraryData) {
        assert.deepEqual(
          libraryData,
          { id: expectedLibraryId },
          'Wrong library data'
        );
        return {};
      }
    })
  );

  var done = assert.async();
  service.fetchById(expectedLibraryId).then(function() {
    done();
  });
});

test('fetchLibraryContent', function(assert) {
  const service = this.subject();

  assert.expect(4);
  service.set(
    'libraryAdapter',
    Ember.Object.create({
      fetchLibraryContent: function(libraryId, contentType) {
        assert.equal(libraryId, 1, 'Wrong library id');
        assert.equal(contentType, 'course', 'Wrong content type');
        return Ember.RSVP.resolve([]);
      }
    })
  );

  service.set(
    'librarySerializer',
    Ember.Object.create({
      normalizeFetchLibraryContent: function(contentType, librariesPayload) {
        assert.deepEqual(librariesPayload, [], 'Wrong library content payload');
        return [];
      }
    })
  );

  var done = assert.async();
  service.fetchLibraryContent(1, 'course').then(function(response) {
    assert.ok(response, 'fake-response', 'Wrong response');
    done();
  });
});
