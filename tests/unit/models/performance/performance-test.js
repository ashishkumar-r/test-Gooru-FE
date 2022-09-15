import { moduleForModel, test } from 'ember-qunit';
import Ember from 'ember';

moduleForModel(
  'performance/performance',
  'Unit | Model | performance/performance',
  {
    // Specify the other units that are required for this test.
    needs: []
  }
);

test('isCompleted test', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('completionDone', 5);
    model.set('completionTotal', 10);
  });

  assert.equal(model.get('isCompleted'), false);
});

test('isCompleted test on Completed unit', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('completionDone', 10);
    model.set('completionTotal', 10);
  });

  assert.equal(model.get('isCompleted'), true);
});

test('isCollection test on collection performance', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'collection');
  });

  assert.equal(model.get('isCollection'), true);
});

test('isAssessment test on assesment performance', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'assessment');
  });

  assert.equal(model.get('isAssessment'), true);
});
test('isCollectionOrAssessment test on collection performance', function(
  assert
) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'collection');
  });

  assert.equal(model.get('isCollectionOrAssessment'), true);
});
test('isCollectionOrAssessment test on assessment performance', function(
  assert
) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'assessment');
  });

  assert.equal(model.get('isCollectionOrAssessment'), true);
});
test('isCollectionOrAssessment test on non collection or assessment performance', function(
  assert
) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'lesson');
  });

  assert.equal(model.get('isCollectionOrAssessment'), false);
});
test('isLesson test on lesson performance', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'lesson');
  });

  assert.equal(model.get('isLesson'), true);
});
test('isLesson test on non lesson performance', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'unit');
  });

  assert.equal(model.get('isLesson'), false);
});

test('isUnit test on unit performance', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'unit');
  });

  assert.equal(model.get('isUnit'), true);
});

test('isUnit test on non unit performance', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'lesson');
  });

  assert.equal(model.get('isUnit'), false);
});

test('isUnitOrLesson test on lesson performance', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'lesson');
  });

  assert.equal(model.get('isUnitOrLesson'), true);
});

test('isUnitOrLesson test on lesson performance', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'lesson');
  });

  assert.equal(model.get('isUnitOrLesson'), true);
});

test('isUnitOrLesson test on non lesson or unit performance', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('type', 'collection');
  });

  assert.equal(model.get('isUnitOrLesson'), false);
});

test('completionValue test', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('completionDone', 5);
    model.set('completionTotal', 10);
  });
  assert.equal(model.get('completionValue'), 50);
});

test('hasStarted test', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('timeSpent', 12);
  });
  assert.equal(model.get('hasStarted'), true);
});

test('hasStarted test on false', function(assert) {
  assert.expect(1);

  let model = this.subject();

  Ember.run(function() {
    model.set('timeSpent', 0);
  });
  assert.equal(model.get('hasStarted'), false);
});
