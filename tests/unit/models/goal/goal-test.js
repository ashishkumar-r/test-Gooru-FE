import { GOAL_STATUS } from 'gooru-web/config/config';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent('model:goal/goal', 'Unit | Model | goal/goal', {
  unit: true
});

test('dropped', function(assert) {
  var model = this.subject({
    status: GOAL_STATUS.DROPPED
  });

  assert.ok(model.get('dropped'), 'wrong status');
});

test('active', function(assert) {
  var model = this.subject({
    status: GOAL_STATUS.ACTIVE
  });

  assert.ok(model.get('active'), 'wrong status');
});

test('completed', function(assert) {
  var model = this.subject({
    status: GOAL_STATUS.COMPLETED
  });

  assert.ok(model.get('completed'), 'wrong status');
});

test('notStarted', function(assert) {
  var model = this.subject({
    status: GOAL_STATUS.NOT_STARTED
  });

  assert.ok(model.get('notStarted'), 'wrong status');
});
