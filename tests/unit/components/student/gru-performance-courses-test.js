import { moduleForComponent, test } from 'ember-qunit';

moduleForComponent(
  'student/gru-performance-courses',
  'Unit | Component | student/gru performance courses',
  {
    unit: true
  }
);

test('selectCourse', function(assert) {
  let component = this.subject();
  let course = 'course-id';
  component.set('sendAction', function(actionName, courseId) {
    assert.equal(actionName, 'onSelectCourse', 'Action sent should match');
    assert.equal(courseId, course, 'Course id should match');
  });
  component.send('selectCourse', 'course-id');
});
