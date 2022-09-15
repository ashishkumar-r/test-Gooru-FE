import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Pretender from 'pretender';

moduleForComponent('adapter:error/error', 'Unit | Adapter | error', {
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']
  beforeEach: function() {
    this.pretender = new Pretender();
  },
  afterEach: function() {
    this.pretender.shutdown();
  }
});

test('createError', function(assert) {
  const adapter = this.subject();
  const data = {
    body: {
      any: 1
    }
  };
  const routes = function() {
    this.post(
      '/api/nucleus-utils/v1/user-error',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.equal(
          requestBodyJson.any,
          1,
          'The body was not serialize correctly'
        );
        return [200, { 'Content-Type': 'application/json' }, ''];
      },
      false
    );
  };

  this.pretender.map(routes);
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  var done = assert.async();
  adapter.createError(data).then(function(response) {
    assert.deepEqual('', response, 'Wrong response');
    done();
  });
});
