import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

moduleForAdapter('adapter:map/course-map', 'Unit | Adapter | map/course-map', {
  // needs: []
});

test('getLessonInfo', function(assert) {
  const adapter = this.subject();
  const expectedData = 'any-data';
  this.pretender.map(function() {
    this.get(
      '/api/nucleus/v2/course-map/course-id/units/unit-id/lessons/lesson-id',
      () => [200, { 'Content-Type': 'text/plain' }, expectedData],
      false
    );
  });
  this.pretender.unhandledRequest = (verb, path) =>
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  let done = assert.async();
  adapter
    .getLessonInfo('class-id', 'course-id', 'unit-id', 'lesson-id')
    .then(response => {
      assert.equal(response, expectedData, 'Response should match');
      done();
    });
});
