import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Pretender from 'pretender';

moduleForComponent(
  'adapter:events/collection-play',
  'Unit | Adapter | events/collection-play',
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

test('postData', function(assert) {
  const adapter = this.subject();
  const data = {
    query: { apiKey: 'api-key-1' },
    body: {
      eventName: 'event-name',
      context: {}
    }
  };
  const routes = function() {
    this.post(
      '/api/nucleus-insights/v2/event',
      function(request) {
        let requestBodyJson = JSON.parse(request.requestBody);
        assert.equal('api-key-1', request.queryParams.apiKey);
        assert.equal('event-name', requestBodyJson.eventName);
        assert.deepEqual({}, requestBodyJson.context);
        return [200, { 'Content-Type': 'application/json' }, ''];
      },
      false
    );
  };

  this.pretender.map(routes);
  this.pretender.unhandledRequest = function(verb, path) {
    assert.ok(false, `Wrong request [${verb}] url: ${path}`);
  };

  adapter.postData(data).then(function(response) {
    assert.deepEqual('', response, 'Wrong response');
  });
});
