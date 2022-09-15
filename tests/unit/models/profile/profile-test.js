import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent('model:profile/profile', 'Unit | Model | profile/profile', {
  unit: true
});

test('isStudent', function(assert) {
  assert.expect(1);
  let model = this.subject({
    role: 'student'
  });

  assert.ok(model.get('isStudent'), 'It should be student');
});

test('isTeacher', function(assert) {
  assert.expect(1);
  let model = this.subject({
    role: 'teacher'
  });

  assert.ok(model.get('isTeacher'), 'It should be teacher');
});

test('isProvider', function(assert) {
  assert.expect(1);
  let model = this.subject({
    role: 'other'
  });

  assert.ok(model.get('isProvider'), 'It should be provider');
});
