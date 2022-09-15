import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent('validator:email', 'Unit | Validator | email', {
  needs: ['validator:messages', 'service:i18n']
});

test('it works', function(assert) {
  var validator = this.subject();
  assert.ok(validator);
});
