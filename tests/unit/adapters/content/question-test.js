import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter(
  'adapter:content/question',
  'Unit | Adapter | content/question',
  {
    // needs: []
  }
);

test('createQuestion', function(assert) {
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
      '/api/nucleus/v2/questions',
      function() {
        return [201, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });
  adapter.createQuestion(data).then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('readQuestion', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v2/questions/12345',
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
  adapter.readQuestion(12345).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});

test('updateQuestion', function(assert) {
  const adapter = this.subject();
  const expectedData = {
    short_title: 'The short title'
  };
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v2/questions/question-id',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.deepEqual(
          requestBodyJson,
          expectedData,
          'Expected request body is not correct'
        );
        return [204, { 'Content-Type': 'application/json' }, ''];
      },
      false
    );
  });
  adapter.updateQuestion('question-id', expectedData).then(
    function() {
      assert.ok(true);
    },
    function() {
      assert.ok(false, 'Update question failed');
    }
  );
});

test('deleteQuestion', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.delete(
      '/api/nucleus/v2/questions/question-id',
      function() {
        return [204, { 'Content-Type': 'application/json; charset=utf-8' }, ''];
      },
      false
    );
  });
  adapter.deleteQuestion('question-id').then(function() {
    assert.ok(true);
  });
});

test('copyQuestion', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/copier/questions/question-id',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'copy-question-id' },
          ''
        ];
      },
      false
    );
  });
  adapter.copyQuestion('question-id').then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});
