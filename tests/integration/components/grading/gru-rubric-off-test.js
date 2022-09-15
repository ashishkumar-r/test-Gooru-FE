import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'grading/gru-rubric-off',
  'Integration | Component | grading/gru rubric off',
  {
    integration: true
  }
);

test('Layout Rubric Off Scoring Off', function(assert) {
  this.render(hbs`{{grading/gru-rubric-off}}`);
  const $component = this.$('.gru-rubric-off');

  assert.ok($component.length, 'Missing component');

  assert.notOk(
    $component.find('.overall-comment .total-score .gru-input-number').length,
    'Total score should not appear'
  );
  assert.ok(
    $component.find('.overall-comment .overall-title').length,
    'Missing overall title'
  );
  assert.ok(
    $component.find('.overall-comment .overall-lead').length,
    'Missing overall lead'
  );
  assert.ok(
    $component.find('textarea').length,
    'Missing overall comment textarea'
  );
});

test('Layout Rubric Off Scoring On', function(assert) {
  let rubric = Ember.Object.create({
    scoring: true,
    maxScore: 10,
    increment: 1
  });
  this.set('rubric', rubric);

  this.render(hbs`{{grading/gru-rubric-off rubric=rubric}}`);
  const $component = this.$('.gru-rubric-off');

  assert.ok($component.length, 'Missing component');
  assert.ok(
    $component.find('.overall-comment .total-score .gru-input-number').length,
    'Missing total score'
  );
  assert.ok(
    T.text($component.find('.overall-comment .total-score')).includes(
      'Total Score'
    ),
    'Missing total score label'
  );

  assert.ok(
    T.text($component.find('.overall-comment .total-score')).includes('/ 10'),
    'Wrong max score'
  );
  assert.ok(
    $component.find('.overall-comment .overall-title').length,
    'Missing overall title'
  );
  assert.ok(
    $component.find('.overall-comment .overall-lead').length,
    'Missing overall lead'
  );
  assert.ok(
    $component.find('textarea').length,
    'Missing overall comment textarea'
  );
});
