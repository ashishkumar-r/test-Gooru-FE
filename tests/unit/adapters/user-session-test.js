import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Pretender from 'pretender';

moduleForComponent('adapter:user-session', 'Unit | Adapter | user-session', {
  beforeEach: function(assert) {
    this.pretender = new Pretender();
    this.pretender.unhandledRequest = function(verb, path) {
      assert.ok(false, `Wrong request [${verb}] url: ${path}`);
    };
  },
  afterEach: function() {
    this.pretender.shutdown();
  }
});

test('queryRecord method for user session', function(assert) {
  const adapter = this.subject();
  const query = {
    namespace: '/api/nucleus-insights/v2',
    contentId: 'contentId',
    collectionType: 'collectionType',
    unitId: 'unitId',
    lessonId: 'lessonId',
    userId: 'userId',
    classId: 'classId',
    courseId: 'courseId',
    openSession: 'openSession'
  };

  this.pretender.map(function() {
    this.get(
      '/api/nucleus-insights/v2/collectionType/contentId/sessions',
      function(request) {
        assert.equal('userId', request.queryParams.userUid);
        assert.equal('classId', request.queryParams.classGooruId);
        assert.equal('courseId', request.queryParams.courseGooruId);
        assert.equal('unitId', request.queryParams.unitGooruId);
        assert.equal('lessonId', request.queryParams.lessonGooruId);
        assert.equal('openSession', request.queryParams.openSession);
        return [
          200,
          { 'Content-Type': 'application/json' },
          JSON.stringify({})
        ];
      },
      false
    );
  });

  adapter.queryRecord(query).then(function(response) {
    assert.deepEqual({}, response, 'Wrong response');
  });
});
