import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

let activeClasses = [
  Ember.Object.create({
    id: 'class2',
    isArchived: false,
    isTeacher: function() {
      return false;
    }
  })
];
var applicationController = Ember.Object.create({
  profile: Ember.Object.create({ id: 'profile-id' }),
  getLocalStorage: () => ({ getItem: () => null })
});
moduleForComponent(
  'controller:student-home',
  'Unit | Controller | student-home',
  {
    needs: ['controller:application', 'service:notifications']
  }
);

test('profile', function(assert) {
  assert.expect(1);
  let controller = this.subject({ applicationController, activeClasses });
  assert.deepEqual(
    controller.get('profile'),
    applicationController.profile,
    'profile should be equal than application controller classes'
  );
});

test('activeClasses', function(assert) {
  assert.expect(1);
  let controller = this.subject({ applicationController, activeClasses });
  assert.equal(
    controller.get('activeClasses').length,
    1,
    'Should have one active classes'
  );
});

test('totalJoinedClasses', function(assert) {
  assert.expect(1);
  let controller = this.subject({ applicationController, activeClasses });
  assert.equal(
    controller.get('totalJoinedClasses'),
    1,
    'Total joined should be 1'
  );
});

test('hasClasses', function(assert) {
  assert.expect(1);
  let controller = this.subject({ applicationController, activeClasses });
  assert.equal(controller.get('hasClasses'), true, 'Should have classes');
});
