import Ember from 'ember';
import { moduleFor, test } from 'ember-qunit';

moduleFor(
  'model:collection/collection',
  'Unit | Model | collection/collection',
  {
    unit: true
  }
);

test('isAssessment', function(assert) {
  assert.expect(1);
  let model = this.subject({
    collectionType: 'assessment',
    resources: Ember.A()
  });

  assert.ok(model.get('isAssessment'), 'Should return true');
});

test('hasResources empty', function(assert) {
  assert.expect(1);
  let model = this.subject({
    resources: Ember.A()
  });
  // let store = this.store();
  assert.ok(!model.get('hasResources'), 'Should return false');
});

test('hasResources not empty', function(assert) {
  assert.expect(1);

  var resources = Ember.A();
  Ember.run(function() {
    resources.pushObject(Ember.Object.create({ id: 1 }));
  });
  let model = this.subject({
    resources: resources
  });

  assert.ok(model.get('hasResources'), 'Should return false');
});

test('prevResource without resources', function(assert) {
  assert.expect(1);
  var resource = null;
  Ember.run(function() {
    resource = Ember.Object.create({ id: 1 });
  });

  let model = this.subject({
    resources: Ember.A()
  });

  var prevResource = model.prevResource(resource);
  assert.ok(!prevResource, 'Resource should not be found');
});

test('prevResource', function(assert) {
  assert.expect(3);

  var resources = Ember.A(),
    resourceA = null,
    resourceB = null;

  Ember.run(function() {
    resourceA = Ember.Object.create({ id: 1 });
    resourceB = Ember.Object.create({ id: 2 });

    resources.pushObject(resourceA);
    resources.pushObject(resourceB);
  });
  let model = this.subject({
    resources: resources
  });

  var prevResource = model.prevResource(resourceB);
  assert.ok(prevResource, 'Resource should be found');
  assert.equal(prevResource.get('id'), 1, 'Wrong resource id');

  prevResource = model.prevResource(resourceA);
  assert.ok(!prevResource, 'Resource should not be found');
});

test('nextResource without resources', function(assert) {
  assert.expect(1);

  var resource = null;
  Ember.run(function() {
    resource = Ember.Object.create({ id: 1 });
  });

  let model = this.subject({
    resources: Ember.A()
  });

  var nextResource = model.nextResource(resource);
  assert.ok(!nextResource, 'Resource should not be found');
});

test('nextResource', function(assert) {
  assert.expect(3);

  var resources = Ember.A(),
    resourceA = null,
    resourceB = null;

  Ember.run(function() {
    resourceA = Ember.Object.create({ id: 1 });
    resourceB = Ember.Object.create({ id: 2 });

    resources.pushObject(resourceA);
    resources.pushObject(resourceB);
  });
  let model = this.subject({
    resources: resources
  });

  var nextResource = model.nextResource(resourceA);
  assert.ok(nextResource, 'Resource should be found');
  assert.equal(nextResource.get('id'), 2, 'Wrong resource id');

  nextResource = model.nextResource(resourceB);
  assert.ok(!nextResource, 'Resource should not be found');
});

test('getResourceById without resources', function(assert) {
  assert.expect(1);

  let model = this.subject({
    resources: Ember.A()
  });

  var nextResource = model.getResourceById(1);
  assert.ok(!nextResource, 'Resource should not be found');
});

test('getResourceById', function(assert) {
  assert.expect(2);

  var resources = Ember.A(),
    resourceA = null,
    resourceB = null;

  Ember.run(function() {
    resourceA = Ember.Object.create({ id: 1 });
    resourceB = Ember.Object.create({ id: 2 });

    resources.pushObject(resourceA);
    resources.pushObject(resourceB);
  });
  let model = this.subject({
    resources: resources
  });

  var resource = model.getResourceById(resourceA.get('id'));
  assert.ok(resource, 'Resource should be found');
  assert.equal(resource.get('id'), 1, 'Wrong resource id');
});

test('isLastResource', function(assert) {
  assert.expect(2);

  var resources = Ember.A(),
    resourceA = null,
    resourceB = null;

  Ember.run(function() {
    resourceA = Ember.Object.create({ id: 1 });
    resourceB = Ember.Object.create({ id: 2 });

    resources.pushObject(resourceA);
    resources.pushObject(resourceB);
  });
  let model = this.subject({
    resources: resources
  });

  var lastResource = model.isLastResource(resourceB);
  assert.ok(lastResource, 'It is not the last resource');

  lastResource = model.isLastResource(resourceA);
  assert.ok(!lastResource, 'It is the last resource');
});
