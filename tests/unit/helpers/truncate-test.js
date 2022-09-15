import { truncate } from '../../../helpers/truncate';
import { module, test } from 'qunit';

module('Unit | Helper | truncate');

test('Truncate text default behavior', function(assert) {
  let result = truncate({}, { text: 'Text having more than 10 characters' });
  assert.equal(result, 'Text havin...', 'Wrong text, should use type = short');
});

test('Truncate text passing maxLength', function(assert) {
  let result = truncate({}, { text: 'My Text', maxLength: 3 });
  assert.equal(result, 'My ...', 'Wrong text');
});

test('Truncate text no suffix', function(assert) {
  let result = truncate({}, { text: 'My Text', maxLength: 3, suffix: false });
  assert.equal(result, 'My ', 'Wrong text');
});

test('Truncate text passing a valid type', function(assert) {
  let result = truncate(
    {},
    { text: 'Text having more than 10 characters', type: 'short' }
  );
  assert.equal(result, 'Text havin...', 'Wrong textd');
});

test('Truncate text passing a valid type and max length', function(assert) {
  let result = truncate(
    {},
    { text: 'Text having more than 10 characters', type: 'short', maxLength: 3 }
  );
  assert.equal(
    result,
    'Text havin...',
    'Wrong text, max length should be ignored'
  );
});

test('Truncate text when not needed', function(assert) {
  let result = truncate({}, { text: 'My Text', maxLength: 100 });
  assert.equal(
    result,
    'My Text',
    'Text should not be truncated since its length is < than maxLength, no suffix should be added'
  );
});
