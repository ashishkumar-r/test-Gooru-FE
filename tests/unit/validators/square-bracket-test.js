import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import { validateSquareBracket } from 'gooru-web/utils/utils';

moduleForComponent(
  'validator:square-bracket',
  'Unit | Validator | square-bracket',
  {
    needs: ['validator:messages', 'service:i18n']
  }
);

test('Text is invalid', function(assert) {
  assert.notOk(
    validateSquareBracket('I am [] Smart'),
    'String is not validate empty bracket'
  );

  assert.notOk(
    validateSquareBracket('I am Smart'),
    'String is not validate without bracket'
  );

  assert.notOk(
    validateSquareBracket('I am [Smart] []'),
    'String is not validate unknown bracket'
  );
});

test('Text is Valid', function(assert) {
  assert.ok(validateSquareBracket('I am [smart]'), 'String validated');
});
