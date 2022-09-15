import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

const sessionStub = Ember.Service.extend({
  'token-api3': 'token-api-3'
});

moduleForAdapter('adapter:content/unit', 'Unit | Adapter | content/unit', {
  unit: true,
  beforeEach: function() {
    this.register('service:session', sessionStub);
    this.inject.service('session');
  }
});

test('Unit creation, success', function(assert) {
  // Mock backend response
  this.pretender.map(function() {
    this.post('/api/nucleus/v1/courses/course-id-123/units', function() {
      return [
        201,
        {
          'Content-Type': 'text/plain',
          location: 'unit-id-456'
        },
        ''
      ];
    });
  });

  const adapter = this.subject();

  const params = {
    courseId: 'course-id-123',
    unit: { title: 'Sample Unit' }
  };

  adapter.createUnit(params).then(function(response) {
    assert.equal(
      response,
      'unit-id-456',
      'Should respond with the newly created ID for the unit'
    );
  });
});

test('Unit creation, failure', function(assert) {
  // Mock backend response
  this.pretender.map(function() {
    this.post('/api/nucleus/v1/courses/course-id-123/units', function() {
      return [500, { 'Content-Type': 'text/plain' }, ''];
    });
  });

  const adapter = this.subject();

  const params = {
    courseId: 'course-id-123',
    unit: { title: 'Sample Unit' }
  };

  adapter.createUnit(params).catch(function(response) {
    assert.equal(response.status, '500', 'Error code');
  });
});

test('Unit update, success', function(assert) {
  // Mock backend response
  this.pretender.map(function() {
    this.put('/api/nucleus/v1/courses/course-id/units/unit-id', function() {
      return [204, { 'Content-Type': 'text/plain' }, ''];
    });
  });

  const adapter = this.subject();

  const params = {
    courseId: 'course-id',
    unitId: 'unit-id',
    unit: { title: 'Sample Unit' }
  };

  adapter.updateUnit(params).then(function(response) {
    assert.equal(response, '', 'Should respond with no content');
  });
});

test('Get unit by ID', function(assert) {
  const unitData = {
    title: 'Unit Title'
  };

  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v1/courses/course-id-123/units/unit-id-456',
      function() {
        return [
          200,
          {
            'Content-Type': 'application/json; charset=utf-8'
          },
          JSON.stringify(unitData)
        ];
      }
    );
  });

  const adapter = this.subject();
  adapter
    .getUnitById({
      courseId: 'course-id-123',
      unitId: 'unit-id-456'
    })
    .then(function(response) {
      assert.deepEqual(
        response,
        unitData,
        'Should respond with the corresponding unit data'
      );
    });
});

test('Delete Unit', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.delete(
      '/api/nucleus/v1/courses/course-id/units/unit-id',
      function() {
        return [204, { 'Content-Type': 'application/json; charset=utf-8' }, ''];
      },
      false
    );
  });
  adapter
    .deleteUnit({ courseId: 'course-id', unitId: 'unit-id' })
    .then(function() {
      assert.ok(true);
    });
});

test('Copy Unit', function(assert) {
  const adapter = this.subject();
  adapter.set(
    'session',
    Ember.Object.create({
      'token-api3': 'token-api-3'
    })
  );
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/copier/courses/course-id/units/unit-id',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'copy-unit-id' },
          ''
        ];
      },
      false
    );
  });
  adapter
    .copyUnit({
      courseId: 'course-id',
      unitId: 'unit-id'
    })
    .then(function(response) {
      assert.equal('', response, 'Wrong response');
    });
});

test('reorderUnit', function(assert) {
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
      '/api/nucleus/v1/courses/course-id/units/unit-id/order',
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
  adapter.reorderUnit('course-id', 'unit-id', expectedData).then(
    function() {
      assert.ok(true);
    },
    function() {
      assert.ok(false, 'Reorder Unit failed');
    }
  );
});
