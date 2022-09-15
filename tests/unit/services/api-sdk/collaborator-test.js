import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';

moduleForService(
  'service:api-sdk/collaborator',
  'Unit | Service | api-sdk/collaborator',
  {}
);

test('updateCollaborators', function(assert) {
  const service = this.subject();
  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/collections/10/collaborators',
      function() {
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  var done = assert.async();
  service
    .updateCollaborators(10, 'collections', ['1'])
    .then(function(response) {
      assert.ok(response, 'Wrong response');
      done();
    });
});

test('updateCourseCollaborators', function(assert) {
  const service = this.subject();
  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/courses/10/collaborators',
      function() {
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  var done = assert.async();
  service.updateCourseCollaborators(10, ['1']).then(function(response) {
    assert.ok(response, 'Wrong response');
    done();
  });
});

test('updateCollectionCollaborators', function(assert) {
  const service = this.subject();
  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/collections/10/collaborators',
      function() {
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  var done = assert.async();
  service.updateCollectionCollaborators(10, ['1']).then(function(response) {
    assert.ok(response, 'Wrong response');
    done();
  });
});

test('updateAssessmentCollaborators', function(assert) {
  const service = this.subject();
  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.put(
      '/api/nucleus/v1/assessments/10/collaborators',
      function() {
        return [204, { 'Content-Type': 'text/plain' }, ''];
      },
      false
    );
  });

  var done = assert.async();
  service.updateAssessmentCollaborators(10, ['1']).then(function(response) {
    assert.ok(response, 'Wrong response');
    done();
  });
});
