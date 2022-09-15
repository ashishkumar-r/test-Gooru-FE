import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'adapter:user/availability',
  'Unit | Adapter | user/availability',
  {
    // Specify the other units that are required for this test.
    // needs: ['serializer:foo']
  }
);

test('urlForQueryRecord querying email availability', function(assert) {
  let adapter = this.subject();

  const query = {
      keyword: '123@test.com',
      isUsername: false
    },
    url = adapter.urlForQueryRecord(query);

  assert.equal(url, '/gooruapi/rest/v2/user/emailId/availability', 'Wrong url');
});

test('urlForQueryRecord querying username availability', function(assert) {
  let adapter = this.subject();

  const query = {
      keyword: 'abc-123',
      isUsername: true
    },
    url = adapter.urlForQueryRecord(query);

  assert.equal(
    url,
    '/gooruapi/rest/v2/user/username/availability',
    'Wrong url'
  );
});
