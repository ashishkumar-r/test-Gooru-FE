import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent('adapter:class/class', 'Unit | Adapter | class/class', {
  // Specify the other units that are required for this test.
  // needs: ['serializer:foo']
});

test('urlForQueryRecord querying for classes as student', function(assert) {
  let adapter = this.subject();

  const query = {
      isStudent: true
    },
    url = adapter.urlForQuery(query);

  assert.equal(url, '/gooruapi/rest/v3/class/study', 'Wrong url');
});

test('urlForQueryRecord querying for classes as teacher', function(assert) {
  let adapter = this.subject();

  const query = {},
    url = adapter.urlForQuery(query);

  assert.equal(url, '/gooruapi/rest/v3/class/teach', 'Wrong url');
});
