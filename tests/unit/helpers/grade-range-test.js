import { gradeRange } from 'gooru-web/helpers/grade-range';
import { module, test } from 'qunit';

module('Unit | Helper | grade range');

test('get range', function(assert) {
  let result = gradeRange([42]);
  assert.ok(result, '0-59', 'Wrong range value');
});
