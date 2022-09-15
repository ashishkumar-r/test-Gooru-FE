import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import GradeCategoryScore from 'gooru-web/models/rubric/grade-category-score';

moduleForComponent(
  'model:rubric/rubric-grade',
  'Unit | Model | rubric/rubric-grade',
  {
    needs: ['validator:presence'],
    unit: true
  }
);

test('scores', function(assert) {
  var model = this.subject({
    categoriesScore: [
      GradeCategoryScore.create({ levelScore: 2 }),
      GradeCategoryScore.create({ levelScore: 3 }),
      GradeCategoryScore.create({ levelScore: 4 })
    ]
  });
  assert.equal(model.get('scores').length, 3, 'Should have 3 scores');
  assert.equal(model.get('scores')[0], 2, 'First score should match');
  assert.equal(model.get('scores')[1], 3, 'Second score should match');
  assert.equal(model.get('scores')[2], 4, 'Third score should match');
});

test('currentScore', function(assert) {
  var model = this.subject({
    categoriesScore: [
      GradeCategoryScore.create({ levelScore: 2 }),
      GradeCategoryScore.create({ levelScore: 3 }),
      GradeCategoryScore.create({ levelScore: 4 })
    ]
  });
  assert.equal(model.get('currentScore'), 9, 'Should have a score of 9');
});

test('hasScore', function(assert) {
  var model = this.subject({
    categoriesScore: [
      GradeCategoryScore.create({ hasScore: true }),
      GradeCategoryScore.create({ hasScore: false }),
      GradeCategoryScore.create({ hasScore: false })
    ]
  });
  assert.ok(model.get('hasScore'), 'hasScore should be true');
  model.setProperties({
    categoriesScore: [
      GradeCategoryScore.create({ hasScore: false }),
      GradeCategoryScore.create({ hasScore: false }),
      GradeCategoryScore.create({ hasScore: false })
    ]
  });
  assert.notOk(model.get('hasScore'), 'hasScore should be false');
});
