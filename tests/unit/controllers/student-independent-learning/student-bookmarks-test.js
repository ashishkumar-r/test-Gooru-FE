import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'controller:student-independent-learning/student-bookmarks',
  'Unit | Controller | student independent learning/student bookmarks',
  {
    // Specify the other units that are required for this test.
    needs: ['service:api-sdk/bookmark']
  }
);

test('Show more togglePanel', function(assert) {
  assert.expect(1);
  let controller = this.subject();
  assert.equal(
    controller.get('showMoreToggle'),
    false,
    'Show More should be Disabled by default'
  );
});
