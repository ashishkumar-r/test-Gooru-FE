import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'model:rubric/rubric-category',
  'Unit | Model | rubric/rubric-category',
  {
    needs: ['validator:presence'],
    unit: true
  }
);

test('scores', function(assert) {
  var model = this.subject({
    levels: [{ score: 2 }, { score: 2 }, { score: 2 }]
  });
  assert.equal(model.get('scores').length, 3, 'Should have 3 total counts');
});

test('totalPoints', function(assert) {
  var model = this.subject({
    levels: [{ score: 6 }, { score: 2 }, { score: 5 }]
  });
  assert.equal(model.get('totalPoints'), 6, 'Should have 6 total points');
});
