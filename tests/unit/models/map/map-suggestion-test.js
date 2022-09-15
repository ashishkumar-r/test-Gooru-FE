import { ASSESSMENT_SUB_TYPES } from 'gooru-web/config/config';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'model:map/map-suggestion',
  'Unit | Model | map/map-suggestion',
  {
    unit: true
  }
);

test('isPreTest', function(assert) {
  var model = this.subject({
    subType: ASSESSMENT_SUB_TYPES.PRE_TEST
  });

  assert.ok(model.get('isPreTest'), 'Should be pretest');
});

test('isPostTest', function(assert) {
  var model = this.subject({
    subType: ASSESSMENT_SUB_TYPES.POST_TEST
  });

  assert.ok(model.get('isPostTest'), 'Should be post test');
});

test('isBackFill', function(assert) {
  var model = this.subject({
    subType: ASSESSMENT_SUB_TYPES.BACKFILL
  });

  assert.ok(model.get('isBackFill'), 'Should be benchmark');
});

test('isBenchmark', function(assert) {
  var model = this.subject({
    subType: ASSESSMENT_SUB_TYPES.BENCHMARK
  });

  assert.ok(model.get('isBenchmark'), 'Should be benchmark');
});

test('isResource', function(assert) {
  var model = this.subject({
    subType: ASSESSMENT_SUB_TYPES.RESOURCE
  });

  assert.ok(model.get('isResource'), 'Should be resource');
});

test('is not pre-test, post-test or benchmark', function(assert) {
  var model = this.subject({
    subType: 'any'
  });

  assert.ok(!model.get('isPreTest'), 'Should not be pre test');
  assert.ok(!model.get('isPostTest'), 'Should not be post test');
  assert.ok(!model.get('isBackFill'), 'Should not be back fill');
  assert.ok(!model.get('isBenchmark'), 'Should not be benchmark');
  assert.ok(!model.get('isResource'), 'Should not be resource');
});
