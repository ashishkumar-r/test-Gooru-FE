import { isEven } from '../../../helpers/is-even';
import { module, test } from 'qunit';

module('Unit | Helper | is-even');

test('Is Even Helper', function(assert) {
  let evenResult = isEven(0);
  assert.equal(evenResult, true);

  let oddResult = isEven(1);
  assert.equal(oddResult, false);
});
