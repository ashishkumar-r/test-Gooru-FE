import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter(
  'adapter:content/bookmark',
  'Unit | Adapter | content/bookmark',
  {
    // needs: []
  }
);

test('createBookmark', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  const data = {
    body: {}
  };
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v2/bookmarks',
      function() {
        return [201, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });
  adapter.createBookmark(data).then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('fetchBookmarks', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v2/bookmarks',
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
    pageSize: 20
  };
  adapter.fetchBookmarks(pagination).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});

test('deleteBookmark', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.delete(
      '/api/nucleus/v2/bookmarks/bookmark-id',
      function() {
        return [204, { 'Content-Type': 'application/json; charset=utf-8' }, ''];
      },
      false
    );
  });
  adapter.deleteBookmark('bookmark-id').then(() => assert.ok(true));
});
