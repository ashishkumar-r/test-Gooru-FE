import { moduleFor, test } from 'ember-qunit';

moduleFor(
  'adapter:performance/class-unit-performance',
  'Unit | Adapter | performance/class-unit-performance',
  {}
);

test('urlForQueryRecord method for unit class performance', function(assert) {
  const adapter = this.subject();
  const query = {
    classId: 'the-class-id',
    courseId: 'the-course-id'
  };
  const url = adapter.urlForQueryRecord(query);

  //assert.equal(url, '/mocked-api/insights/api/v2/class/the-class-id/course/the-course-id/performance', 'Wrong url');
  assert.equal(
    url,
    '/api/nucleus-insights/v2/class/the-class-id/course/the-course-id/performance',
    'Wrong url'
  );
});
