import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter(
  'adapter:content/collection',
  'Unit | Adapter | content/collection',
  {
    // needs: []
  }
);

test('createCollection', function(assert) {
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
      '/api/nucleus/v1/collections',
      function() {
        return [201, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });
  adapter.createCollection(data).then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('readCollection', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v1/collections/collection-id',
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
  adapter.readCollection('collection-id').then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});

test('updateCollection', function(assert) {
  const adapter = this.subject();
  const expectedData = {
    title: 'The Collection title'
  };
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/collections/collection-id',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.deepEqual(
          requestBodyJson,
          expectedData,
          'Expected request body is not correct'
        );
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });
  adapter.updateCollection('collection-id', expectedData).then(
    function() {
      assert.ok(true);
    },
    function() {
      assert.ok(false, 'Update Collection failed');
    }
  );
});

test('reorderCollection', function(assert) {
  const adapter = this.subject();
  const expectedData = {
    order: [{ id: 'a', sequence_id: 1 }]
  };
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/collections/collection-id/order',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.deepEqual(
          requestBodyJson,
          expectedData,
          'Expected request body is not correct'
        );
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });
  adapter.reorderCollection('collection-id', expectedData).then(
    function() {
      assert.ok(true);
    },
    function() {
      assert.ok(false, 'Reorder Collection failed');
    }
  );
});

test('addResource', function(assert) {
  const adapter = this.subject();
  const expectedData = {
    id: 'resource-id'
  };
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/collections/collection-id/resources',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.deepEqual(
          requestBodyJson,
          expectedData,
          'Expected request body is not correct'
        );
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });
  adapter.addResource('collection-id', 'resource-id').then(function() {
    assert.ok(true);
  });
});

test('addQuestion', function(assert) {
  const adapter = this.subject();
  const expectedData = {
    id: 'question-id'
  };
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/collections/collection-id/questions',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.deepEqual(
          requestBodyJson,
          expectedData,
          'Expected request body is not correct'
        );
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });
  adapter.addQuestion('collection-id', 'question-id').then(function() {
    assert.ok(true);
  });
});

test('deleteCollection', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.delete(
      '/api/nucleus/v1/collections/collection-id',
      function() {
        return [204, { 'Content-Type': 'application/json; charset=utf-8' }, ''];
      },
      false
    );
  });
  adapter.deleteCollection('collection-id').then(function() {
    assert.ok(true);
  });
});

test('copyCollection', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/copier/collections/collection-id',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'copy-collection-id' },
          ''
        ];
      },
      false
    );
  });
  adapter.copyCollection('collection-id').then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});
