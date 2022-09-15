import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import UnitModel from 'gooru-web/models/content/unit';

moduleForService('service:api-sdk/unit', 'Unit | Service | api-sdk/unit', {});

test('createUnit', function(assert) {
  const service = this.subject();
  let unitModel = Ember.Object.create();

  assert.expect(2);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/courses/course-id/units',
      function() {
        return [200, { 'Content-Type': 'text/plain', Location: 'unit-id' }, ''];
      },
      false
    );
  });

  service.set(
    'serializer',
    Ember.Object.create({
      serializeCreateUnit: function(unitObject) {
        assert.deepEqual(unitObject, unitModel, 'Wrong unit object');
        return {};
      }
    })
  );

  var done = assert.async();
  service.createUnit('course-id', unitModel).then(function() {
    assert.equal(unitModel.get('id'), 'unit-id', 'Wrong unit id');
    done();
  });
});

test('updateUnit', function(assert) {
  const service = this.subject();
  let unitModel = UnitModel.create({ title: 'unit', id: 'unit-id' });

  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/courses/course-id/units/unit-id',
      function() {
        return [204, { 'Content-Type': 'application/json' }, ''];
      },
      false
    );
  });

  service.set(
    'serializer',
    Ember.Object.create({
      serializeUpdateUnit: function(unitObject) {
        assert.deepEqual(unitObject, unitModel, 'Wrong unit object');
        return {};
      }
    })
  );

  var done = assert.async();
  service.updateUnit('course-id', unitModel).then(function() {
    done();
  });
});

test('Delete Unit', function(assert) {
  const expectedCourseId = 'course-id';
  const expectedUnitId = 'unit-id';
  const service = this.subject();

  assert.expect(2);

  service.set(
    'adapter',
    Ember.Object.create({
      deleteUnit: function(params) {
        assert.equal(params.courseId, expectedCourseId, 'Wrong course id');
        assert.equal(params.unitId, expectedUnitId, 'Wrong unit id');
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.deleteUnit('course-id', 'unit-id').then(function() {
    done();
  });
});

test('Copy Unit', function(assert) {
  const service = this.subject();

  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
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

  var done = assert.async();
  service.copyUnit('course-id', 'unit-id').then(function(response) {
    assert.equal(response, 'copy-unit-id', 'Wrong unit id');
    done();
  });
});

test('reorderUnit', function(assert) {
  const service = this.subject();
  const expectedUnitId = 'unit-id';

  assert.expect(5);

  service.set(
    'serializer',
    Ember.Object.create({
      serializeReorderUnit: function(lessonIds) {
        assert.equal(lessonIds.length, 2, 'Wrong total lessons');
        assert.equal(lessonIds[0], 'a', 'Wrong id at index 0');
        return 'fake-data';
      }
    })
  );
  service.set(
    'adapter',
    Ember.Object.create({
      reorderUnit: function(courseId, unitId, data) {
        assert.equal(courseId, 'course-id', 'Wrong course id');
        assert.equal(unitId, expectedUnitId, 'Wrong unit id');
        assert.equal(
          data,
          'fake-data',
          'Wrong data parameter coming from serializer'
        );
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.reorderUnit('course-id', expectedUnitId, ['a', 'b']).then(function() {
    done();
  });
});
