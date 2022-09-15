import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent(
  'grading/gru-student-roster',
  'Unit | Component | grading/gru student roster',
  {
    // Specify the other units that are required for this test
    // needs: ['component:foo', 'helper:bar'],
    unit: true
  }
);

test('selectStudent', function(assert) {
  assert.expect(2);
  let users = Ember.A([
    Ember.Object.create({ id: 'id-for-test', name: 'User for test' })
  ]);
  let student = Ember.Object.create({ id: 'id-for-test' });

  let component = this.subject({
    users: users
  });

  component.set('sendAction', function(actionName, userId) {
    assert.equal(actionName, 'onChangeUser', 'Action sent should match');
    assert.equal(userId, 'id-for-test', 'Action sent should match');
  });

  component.send('selectStudent', student);
});
