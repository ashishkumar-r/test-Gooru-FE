import { gruFullName } from 'gooru-web/helpers/gru-full-name';
import { module, test } from 'qunit';

module('Unit | Helper | gru full name');

// Replace this with your real tests.
test('it works', function(assert) {
  let nameobj = {};
  nameobj.firstName = 'tfirst';
  nameobj.lastName = 'tlast';
  let result = gruFullName(nameobj);
  assert.ok(result);
});
