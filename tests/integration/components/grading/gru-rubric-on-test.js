import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Grade from 'gooru-web/models/rubric/rubric-grade';
import Rubric from 'gooru-web/models/rubric/rubric';
import Category from 'gooru-web/models/rubric/rubric-category';

moduleForComponent(
  'grading/gru-rubric-on',
  'Integration | Component | grading/gru rubric on',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  this.set('grade', Grade.create(Ember.getOwner(this).ownerInjection()));
  this.set(
    'rubric',
    Rubric.create(Ember.getOwner(this).ownerInjection(), {
      categories: Ember.A([
        Category.create({
          title: 'first-category',
          levels: [
            { name: 'first-level', score: null },
            { name: 'second-level', score: null }
          ]
        }),
        Category.create({
          title: 'second-category',
          levels: [
            { name: 'max-level', score: 5 },
            { name: 'mid-level', score: 3 },
            { name: 'min-level', score: 1 }
          ]
        })
      ])
    })
  );
  this.render(hbs`{{grading/gru-rubric-on rubric=rubric grade=grade}}`);

  let $totalScore = this.$('.total-score');
  let $categories = this.$('.rubric-categories');
  let $overallComments = this.$('.overall-comments');
  let $firstCategory = $categories.find('.rubric-category:nth-child(1)');
  let $firstArrow = $firstCategory.find('.show-arrow');
  let $secondCategory = $categories.find('.rubric-category:nth-child(2)');
  let $secondArrow = $secondCategory.find('.show-arrow');

  T.exists(assert, $totalScore, 'Missing total score');
  assert.ok(
    T.text($totalScore.find('.score')).includes('( - / 5 )'),
    'Wrong text in total score'
  );
  assert.equal(
    $categories.find('.rubric-category').length,
    2,
    'Wrong number of categories'
  );
  T.exists(assert, $overallComments, 'Missing overall comment');

  assert.ok(
    T.text($firstCategory.find('.category-title .title')).includes(
      'first-category'
    ),
    'Wrong text in first category title'
  );
  T.notExists(
    assert,
    $firstCategory.find('.category-title .score'),
    'First category score should not show'
  );
  T.exists(
    assert,
    $firstArrow.find('.keyboard_arrow_down'),
    'Arrow icon for first category should show'
  );
  T.exists(
    assert,
    $firstCategory.find('.chat'),
    'Chat icon for first category should show'
  );

  assert.ok(
    T.text($secondCategory.find('.category-title .title')).includes(
      'second-category'
    ),
    'Wrong text in second category title'
  );
  T.exists(
    assert,
    $secondCategory.find('.category-title .score'),
    'Missing second category score'
  );
  assert.ok(
    T.text($secondCategory.find('.category-title .score')).includes(
      '( - / 5 )'
    ),
    'Wrong text in second category score'
  );
  T.exists(
    assert,
    $secondArrow.find('.keyboard_arrow_down'),
    'Arrow icon for second category should show'
  );
  T.exists(
    assert,
    $secondCategory.find('.chat'),
    'Chat icon for first category should show'
  );

  $firstArrow.click();
  T.exists(
    assert,
    $firstArrow.find('.keyboard_arrow_up'),
    'Arrow icon after click for first category'
  );
  T.exists(
    assert,
    $firstCategory.find('.category-level'),
    'Levels dropdown for first category'
  );
  T.exists(
    assert,
    $firstCategory.find('.category-comment'),
    'Comment for first category'
  );

  $secondArrow.click();
  T.exists(
    assert,
    $secondArrow.find('.keyboard_arrow_up'),
    'Arrow icon after click for second category'
  );
  T.exists(
    assert,
    $secondCategory.find('.category-level'),
    'Levels dropdown for second category'
  );
  T.exists(
    assert,
    $secondCategory.find('.category-comment'),
    'Comment for second category'
  );
});
