import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Error from 'gooru-web/models/error';

moduleForComponent('serializer:error/error', 'Unit | Serializer | error/error');

test('serializeError', function(assert) {
  const serializer = this.subject();
  const error = Error.create({
    timestamp: 12345,
    userId: 1,
    description: 'error description',
    type: 'page',
    details: {
      agent: 'Safari',
      endpoint: {
        status: 404,
        response: 'Not found',
        url: '/test.jsp'
      }
    }
  });

  const serialized = serializer.serializeError(error);
  assert.equal(serialized.client_timestamp, 12345, 'Wrong client_timestamp');
  assert.equal(serialized.user_id, 1, 'Wrong user_id');
  assert.equal(serialized.log_type, 'ERROR', 'Wrong log_type');
  assert.equal(serialized.client_context, 'page', 'Wrong client_context');
  assert.deepEqual(
    serialized.client_info,
    {
      agent: 'Safari',
      endpoint: { status: 404, response: 'Not found', url: '/test.jsp' }
    },
    'Wrong client_info'
  );
  assert.equal(serialized.message, 'error description', 'Wrong message');
  assert.equal(serialized.api, '/test.jsp', 'Wrong endpoint api');
  assert.equal(serialized.api_status, 404, 'Wrong api status');
  assert.equal(serialized.api_response, 'Not found', 'Wrong api response');
});
