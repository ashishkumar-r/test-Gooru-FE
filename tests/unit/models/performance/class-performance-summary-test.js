import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'model:performance/class-performance-summary',
  'Unit | Model | performance/class-performance-summary',
  {
    unit: true
  }
);

test('completedPercentage with no total', function(assert) {
  var model = this.subject({
    totalCompleted: 10
  });

  assert.equal(model.get('completedPercentage'), 0, 'wrong value');
});

test('completedPercentage with 0 total', function(assert) {
  var model = this.subject({
    totalCompleted: 10,
    total: 0
  });

  assert.equal(model.get('completedPercentage'), 0, 'wrong value');
});

test('completedPercentage with total', function(assert) {
  var model = this.subject({
    totalCompleted: 5,
    total: 10
  });

  assert.equal(model.get('completedPercentage'), 50, 'wrong value');
});
