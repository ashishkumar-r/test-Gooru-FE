import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'adapter:performance/unit-performance',
  'Unit | Adapter | performance/unit-performance',
  {}
);

test('urlForQueryRecord method for unit performance', function(assert) {
  const adapter = this.subject();
  const query = {
    classId: 'the-class-id',
    courseId: 'the-course-id'
  };
  const url = adapter.urlForQuery(query);

  //assert.equal(url, '/mocked-api/insights-api-v1/rest/v2/class/the-class-id/course/the-course-id/performance', 'Wrong url');
  assert.equal(
    url,
    '/api/nucleus-insights/v2/class/the-class-id/course/the-course-id/performance',
    'Wrong url'
  );
});
