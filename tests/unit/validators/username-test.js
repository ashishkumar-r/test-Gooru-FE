import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent('validator:username', 'Unit | Validator | username', {
  needs: ['validator:messages', 'service:api-sdk/profile']
});

test('it works', function(assert) {
  var validator = this.subject();
  assert.ok(validator);
});
