import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Pretender from 'pretender';

moduleForComponent(
  'adapter:analytics/analytics',
  'Unit | Adapter | analytics/analytics',
  {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
    beforeEach: function() {
      this.pretender = new Pretender();
    },
    afterEach: function() {
      this.pretender.shutdown();
    }
  }
);

test('queryRecord', function(assert) {
  const adapter = this.subject();
  assert.expect(1);
  const query = {
    classId: 'the-class-id',
    courseId: 'the-course-id',
    unitId: 'the-unit-id',
    lessonId: 'the-lesson-id',
    collectionId: 'the-collection-id',
    collectionType: 'the-collection-type'
  };
  const routes = function() {
    this.get(
      '/api/nucleus-insights/v2/class/the-class-id/course/the-course-id/unit/the-unit-id/lesson/the-lesson-id/the-collection-type/the-collection-id/performance',
      function() {
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({})
        ];
      },
      false
    );
  };

  this.pretender.map(routes);
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  adapter.queryRecord(query).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});
