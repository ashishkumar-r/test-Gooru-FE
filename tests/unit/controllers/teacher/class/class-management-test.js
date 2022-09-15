import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { skip } from 'ember-qunit';
import Ember from 'ember';

moduleForComponent(
  'controller:teacher/class/class-management',
  'Unit | Controller | teacher/class/class-management',
  {
    integration: true,
    beforeEach: function() {
      this.register('controller:teacher.class', Ember.Service.extend({}));
      this.register('service:api-sdk/taxonomy', Ember.Service.extend({}));
      this.register('service:api-sdk/multiple-class', Ember.Service.extend({}));
      this.inject.service('api-sdk/taxonomy');
      this.inject.service('api-sdk/multiple-class');
    }
  }
);

skip('Delete Student', function(assert) {
  let component = this.subject({
    classService: {
      removeStudentFromClass: (classId, studentId) => {
        assert.equal(classId, 'class-id', 'Class id should match');
        assert.equal(studentId, 'student-id', 'Student id should match');
        return true;
      }
    },
    class: Ember.Object.create({
      id: 'class-id'
    })
  });

  let deleteFunction = function() {
    return true;
  };

  var expectedModel = Ember.Object.create({
    content: Ember.Object.create({ id: 'student-id' }),
    deleteMethod: () => deleteFunction,
    callback: {
      success: function() {
        return true;
      }
    }
  });

  let done = assert.async();
  component.set('actions.showModal', function(componentName, model) {
    assert.ok(model.deleteMethod(), 'Should have a delete function');
    assert.deepEqual(
      model.content,
      expectedModel.content,
      'Model content  should match'
    );
    assert.equal(
      componentName,
      'content.modals.gru-remove-student',
      'Component name should match'
    );
    done();
  });
  component.send('removeStudent', Ember.Object.create({ id: 'student-id' }));
});
