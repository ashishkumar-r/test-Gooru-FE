import Ember from 'ember';
import { moduleForModel, test } from 'ember-qunit';

moduleForModel('class/class', 'Unit | Model | class/class', {
  // Specify the other units that are required for this test.
  needs: []
});

test('isTeacher, empty list', function(assert) {
  let model = this.subject({
    teachers: Ember.A()
  });

  assert.ok(!model.isTeacher('1'), 'Should return false');
});

test('isTeacher, not in list', function(assert) {
  let model = this.subject({
    teachers: Ember.A([{ id: '2' }, { id: '3' }])
  });

  assert.ok(!model.isTeacher('1'), 'Should return false');
});

test('isTeacher, in list', function(assert) {
  let model = this.subject({
    teachers: Ember.A([{ id: '2' }, { id: '3' }, { id: '1' }])
  });

  assert.ok(model.isTeacher('1'), 'Should return true');
});

test('isStudent, empty list', function(assert) {
  let model = this.subject({
    teachers: Ember.A()
  });

  assert.ok(
    model.isStudent('1'),
    'Should return true, if no teacher is a student'
  );
});

test('isStudent, not in teacher\'s list', function(assert) {
  let model = this.subject({
    teachers: Ember.A([{ id: '2' }, { id: '3' }])
  });

  assert.ok(
    model.isStudent('1'),
    'Should return true, if it is not a teacher is a student'
  );
});

test('isStudent, in teacher\'s list', function(assert) {
  let model = this.subject({
    teachers: Ember.A([{ id: '2' }, { id: '3' }, { id: '1' }])
  });

  assert.ok(!model.isStudent('1'), 'Should return false, it is a teacher');
});
