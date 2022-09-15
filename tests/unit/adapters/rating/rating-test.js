import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'adapter:rating/rating',
  'Unit | Adapter | rating/rating',
  {}
);

test('urlForFindRecord querying for a single rating', function(assert) {
  let adapter = this.subject();

  let id = 'any1D';
  let url = adapter.urlForFindRecord(id);

  assert.equal(url, '/gooruapi/rest/v2/content/any1D/rating/star', 'Wrong url');
});

test('urlForCreateRecord querying for creation of a rating', function(assert) {
  let adapter = this.subject();

  let url = adapter.urlForCreateRecord();

  assert.equal(url, '/gooruapi/rest/v2/rating', 'Wrong url');
});
