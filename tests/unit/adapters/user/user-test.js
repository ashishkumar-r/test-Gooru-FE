import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent('adapter:user/user', 'Unit | Adapter | user/user', {
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']
});

test('urlForQueryRecord querying for users', function(assert) {
  let adapter = this.subject();

  const query = {
      isMembersByClass: true,
      classId: '67a96ec1-7383-4164-8068-5415621b7a34'
    },
    url = adapter.urlForQueryRecord(query);

  assert.equal(
    url,
    '/gooruapi/rest/v3/class/67a96ec1-7383-4164-8068-5415621b7a34/member',
    'Wrong url'
  );
});
