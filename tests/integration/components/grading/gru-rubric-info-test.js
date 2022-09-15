import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import RubricModel from 'gooru-web/models/rubric/rubric';
import RubricCategoryModel from 'gooru-web/models/rubric/rubric-category';

moduleForComponent(
  'grading/gru-rubric-info',
  'Integration | Component | grading/gru rubric info',
  {
    integration: true
  }
);

test('Rubric Information', function(assert) {
  const rubric = RubricModel.create({
    id: '1234',
    title: 'TitleRubric',
    url: 'url',
    categories: Ember.A([
      RubricCategoryModel.create({
        id: 'category-1',
        title: 'title',
        score: 2,
        totalPoints: 4
      }),
      RubricCategoryModel.create({
        id: 'category-2',
        title: 'title',
        score: 3,
        totalPoints: 5
      })
    ])
  });

  this.set('rubric', rubric);

  this.render(hbs`{{grading/gru-rubric-info rubric=rubric}}`);

  var $component = this.$();
  const $information = $component.find('.gru-rubric-info');
  assert.ok(
    $information.find('.categories .total').length,
    'Missing categories total'
  );
  assert.equal(
    $information.find('.categories .category').length,
    2,
    'Missing categories total'
  );
  assert.ok(
    $information.find('.rubric-preview').length,
    'Missing rubric preview'
  );
});
