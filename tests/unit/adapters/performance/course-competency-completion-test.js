import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForAdapter from 'gooru-web/tests/helpers/module-for-adapter';

const sessionStub = Ember.Service.extend({
  'token-api3': 'token-api-3'
});

moduleForAdapter(
  'adapter:performance/course-competency-completion',
  'Unit | Adapter | performance/course competency completion',
  {
    unit: true,
    beforeEach: function() {
      this.register('service:session', sessionStub);
      this.inject.service('session');
    }
  }
);

test('findCourseCompetencyCompletionByCourseIds', function(assert) {
  assert.expect(4);
  // Mock backend response
  this.pretender.map(function() {
    this.post(
      '/api/nucleus-insights/v3/courses/competency-completion',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.equal(request.queryParams.userId, '23', 'Wrong user id param');
        assert.deepEqual(
          requestBodyJson.courseIds,
          [1, 2, 3],
          'Wrong courseIds'
        );
        assert.equal(
          request.requestHeaders.Authorization,
          'Token token-api-3',
          'Wrong token'
        );
        return [
          200,
          {
            'Content-Type': 'application/json'
          },
          JSON.stringify({})
        ];
      }
    );
  });
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  const adapter = this.subject();

  adapter
    .findCourseCompetencyCompletionByCourseIds('23', [1, 2, 3])
    .then(function() {
      assert.ok(true, 'This should be called once');
    });
});
