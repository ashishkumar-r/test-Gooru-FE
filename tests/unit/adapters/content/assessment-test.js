import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter(
  'adapter:content/assessment',
  'Unit | Adapter | content/assessment',
  {
    // needs: []
  }
);

test('createAssessment', function(assert) {
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
      '/api/nucleus/v1/assessments',
      function() {
        return [201, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });
  adapter.createAssessment(data).then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('readAssessment', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v1/assessments/assessment-id',
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
  adapter.readAssessment('assessment-id').then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});

test('updateAssessment', function(assert) {
  const adapter = this.subject();
  const expectedData = {
    title: 'The Assessment title'
  };
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/assessments/assessment-id',
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
  adapter.updateAssessment('assessment-id', expectedData).then(
    function() {
      assert.ok(true);
    },
    function() {
      assert.ok(false, 'Update Assessment failed');
    }
  );
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
      '/api/nucleus/v1/assessments/assessment-id/questions',
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
  adapter.addQuestion('assessment-id', 'question-id').then(function() {
    assert.ok(true);
  });
});

test('deleteAssessment', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.delete(
      '/api/nucleus/v1/assessments/assessment-id',
      function() {
        return [204, { 'Content-Type': 'application/json; charset=utf-8' }, ''];
      },
      false
    );
  });
  adapter.deleteAssessment('assessment-id').then(function() {
    assert.ok(true);
  });
});

test('deleteExternalAssessment', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.delete(
      '/api/nucleus/v1/assessments-external/assessment-id',
      function() {
        return [204, { 'Content-Type': 'application/json; charset=utf-8' }, ''];
      },
      false
    );
  });
  adapter.deleteExternalAssessment('assessment-id').then(function() {
    assert.ok(true);
  });
});

test('copyAssessment', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/copier/assessments/assessment-id',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'copy-assessment-id' },
          ''
        ];
      },
      false
    );
  });
  adapter.copyAssessment('assessment-id').then(function(response) {
    assert.equal('', response, 'Wrong response');
  });
});

test('reorderAssessment', function(assert) {
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
      '/api/nucleus/v1/assessments/assessment-id/questions/order',
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
  adapter.reorderAssessment('assessment-id', expectedData).then(
    function() {
      assert.ok(true);
    },
    function() {
      assert.ok(false, 'Reorder Assessment failed');
    }
  );
});
