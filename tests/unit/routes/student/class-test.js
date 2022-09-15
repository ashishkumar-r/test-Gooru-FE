import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent('route:student/class', 'Unit | Route | student/class', {
  // Specify the other units that are required for this test.
  needs: ['service:taxonomy']
});

test('it exists', function(assert) {
  let route = this.subject();
  assert.ok(route);
});
