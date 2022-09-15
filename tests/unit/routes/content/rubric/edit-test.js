import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'route:content/rubric/edit',
  'Unit | Route | content/rubric/edit',
  {
    // Specify the other units that are required for this test.
    needs: ['service:api-sdk/rubric']
  }
);

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
