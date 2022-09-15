import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'adapter:performance/collection-performance',
  'Unit | Adapter | performance/collection-performance',
  {}
);

test('urlForQueryRecord method for collection performance', function(assert) {
  const adapter = this.subject();
  const query = {
    classId: 'the-class-id',
    courseId: 'the-course-id',
    unitId: 'the-unit-id',
    lessonId: 'the-lesson-id'
  };
  const url = adapter.urlForQuery(query);

  //assert.equal(url, '/mocked-api/insights-api-v1/rest/v2/class/the-class-id/course/the-course-id/unit/the-unit-id/lesson/the-lesson-id/performance', 'Wrong url');
  assert.equal(
    url,
    '/api/nucleus-insights/v2/class/the-class-id/course/the-course-id/unit/the-unit-id/lesson/the-lesson-id/performance',
    'Wrong url'
  );
});
