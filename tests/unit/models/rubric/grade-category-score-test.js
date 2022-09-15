import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';

moduleForComponent(
  'model:rubric/grade-category-score',
  'Unit | Model | rubric/grade-category-score',
  {
    needs: ['validator:presence'],
    unit: true
  }
);

test('hasScore', function(assert) {
  var model = this.subject({
    levelScore: 0
  });
  assert.ok(model.get('hasScore'), 'hasScore should be true when score is 0');

  model.set('levelScore', null);
  assert.notOk(
    model.get('hasScore'),
    'hasScore should be false when score is null'
  );

  model.set('levelScore', 2);
  assert.ok(
    model.get('hasScore'),
    'hasScore should be false when score is greater than 0'
  );
});
