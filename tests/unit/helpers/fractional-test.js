import { fractional } from '../../../helpers/fractional';
import { module, test } from 'qunit';

module('Unit | Helper | fractional');

test('Fractional Helper', function(assert) {
  let result = fractional({}, { numerator: 1, denominator: 2 });
  assert.equal(
    result.string,
    '<span class="top">1</span><span class="bottom">2</span>',
    'Wrong response'
  );
});

test('Fractional Helper With Expression', function(assert) {
  let result = fractional({}, { expression: '1/2' });
  assert.equal(
    result.string,
    '<span class="top">1</span><span class="bottom">2</span>',
    'Wrong response'
  );
});
