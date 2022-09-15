import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'adapter:performance/class-lesson-performance',
  'Unit | Adapter | performance/class-lesson-performance',
  {}
);

test('urlForQueryRecord method for lesson class performance', function(assert) {
  const adapter = this.subject();
  const query = {
    classId: 'the-class-id',
    courseId: 'the-course-id',
    unitId: 'the-unit-id'
  };
  const url = adapter.urlForQueryRecord(query);

  //assert.equal(url, '/mocked-api/insights/api/v2/class/the-class-id/course/the-course-id/unit/the-unit-id/performance', 'Wrong url');
  assert.equal(
    url,
    '/api/nucleus-insights/v2/class/the-class-id/course/the-course-id/unit/the-unit-id/performance',
    'Wrong url'
  );
});
