import Ember from 'ember';
import moduleForComponent from 'gooru-web/tests/helpers/module-for-component';
import { test } from 'ember-qunit';
import Category from 'gooru-web/models/rubric/rubric-category';

moduleForComponent('model:rubric/rubric', 'Unit | Model | rubric/rubric', {
  integration: true,
  needs: ['validator:presence']
});

test('hasAudience', function(assert) {
  var model = this.subject({});
  assert.ok(!model.get('hasAudience'), 'It should has no audience');
  model.set('audience', [1]);
  assert.ok(model.get('hasAudience'), 'It should has audience');
});

test('hasCategories', function(assert) {
  var model = this.subject({});
  assert.ok(!model.get('hasCategories'), 'It should has no categories');
  model.set('categories', [1]);
  assert.ok(model.get('hasCategories'), 'It should has categories');
});

test('hasCategories False', function(assert) {
  var model = this.subject({
    categories: Ember.A([])
  });

  assert.notOk(model.get('hasCategories'), 'Should not have categories');
});

test('hasCategories True', function(assert) {
  var model = this.subject({
    categories: Ember.A([Category.create({ id: 'categoryId' })])
  });
  assert.ok(model.get('hasCategories'), 'Should have categories');
});

test('categoriesPoints', function(assert) {
  var model = this.subject({
    categories: Ember.A([
      Category.create({ id: 'categoryId', levels: [{ score: 2 }] }),
      Category.create({ id: 'categoryId2', levels: [{ score: 2 }] })
    ])
  });
  assert.equal(
    model.get('categoriesPoints').length,
    2,
    'Should have 2 total counts'
  );
});

test('totalPoints', function(assert) {
  var model = this.subject({
    categories: Ember.A([
      Category.create({ id: 'categoryId', levels: [{ score: 2 }] }),
      Category.create({ id: 'categoryId2', levels: [{ score: 2 }] })
    ])
  });
  assert.equal(model.get('totalPoints'), 4, 'Should have 4 total points');
});
