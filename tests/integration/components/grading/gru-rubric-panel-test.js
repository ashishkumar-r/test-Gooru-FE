import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import wait from 'ember-test-helpers/wait';
import hbs from 'htmlbars-inline-precompile';
import RubricModel from 'gooru-web/models/rubric/rubric';
import RubricGradeModel from 'gooru-web/models/rubric/rubric-grade';

moduleForComponent(
  'grading/gru-rubric-panel',
  'Integration | Component | grading/gru rubric panel',
  {
    integration: true
  }
);

test('Show full rubric', function(assert) {
  this.set('showFullRubric', false);
  this.render(hbs`{{grading/gru-rubric-panel showFullRubric=showFullRubric}}`);

  let $component = this.$();
  let $panel = $component.find('.gru-rubric-panel');
  let $icon = $component.find('.rubric-information .header .icon');

  assert.notOk(this.get('showFullRubric'), 'Wrong value of showFullRubric');
  assert.notOk(
    $panel.hasClass('full-rubric'),
    'The component must not have the class full-rubric'
  );
  $icon.click();
  assert.ok(this.get('showFullRubric'), 'Wrong value of showFullRubric');
  assert.ok(
    $panel.hasClass('full-rubric'),
    'The component must have the class full-rubric'
  );
});

test('Change tabs', function(assert) {
  this.set('showFullRubric', false);
  this.set(
    'rubric',
    RubricModel.create(Ember.getOwner(this).ownerInjection(), {
      rubricOn: true,
      categories: Ember.A()
    })
  );
  this.set(
    'grade',
    RubricGradeModel.create(Ember.getOwner(this).ownerInjection(), {
      categories: Ember.A()
    })
  );
  this.render(hbs`{{grading/gru-rubric-panel rubric=rubric grade=grade}}`);

  let $component = this.$();
  let $header = $component.find('.rubric-information .header');
  let $rubricTab = $header.find('.rubric-tab');
  let $gradingTab = $header.find('.grading-tab');
  let $rubric = $component.find('.content .rubric');
  let $grading = $component.find('.content .grading');
  assert.ok(
    $gradingTab.hasClass('active'),
    'Grading tab must be active by default'
  );
  assert.notOk(
    $rubricTab.hasClass('active'),
    'Rubric tab must not be active by default'
  );
  assert.ok($grading.hasClass('active'), 'Grading must be active by default');
  assert.notOk(
    $rubric.hasClass('active'),
    'Rubric must not be active by default'
  );

  $rubricTab.click();
  return wait().then(function() {
    assert.notOk(
      $gradingTab.hasClass('active'),
      'Grading tab must not be active'
    );
    assert.ok($rubricTab.hasClass('active'), 'Rubric must be active');
    assert.notOk($grading.hasClass('active'), 'Grading tab must not be active');
    assert.ok($rubric.hasClass('active'), 'Rubric must be active');

    $gradingTab.click();
    assert.ok($gradingTab.hasClass('active'), 'Grading tab must be active');
    assert.notOk(
      $rubricTab.hasClass('active'),
      'Rubric tab must not be active'
    );
    assert.ok($grading.hasClass('active'), 'Grading must be active');
    assert.notOk($rubric.hasClass('active'), 'Rubric must not be active');
  });
});

test('Show answer tab', function(assert) {
  this.set(
    'rubric',
    RubricModel.create(Ember.getOwner(this).ownerInjection(), {
      rubricOn: true,
      categories: Ember.A()
    })
  );
  this.set('answer', 'This is my answer.');
  this.render(hbs`{{grading/gru-rubric-panel rubric=rubric answer=answer}}`);

  let $component = this.$();
  let $header = $component.find('.rubric-information .header');
  let $answerTab = $header.find('.answer-tab');
  let $response = $component.find('.content .answer');
  assert.ok(
    $answerTab.hasClass('active'),
    'Answer tab must be active by default'
  );
  assert.ok($response.hasClass('active'), 'Answer must be active by default');
});

test('Show navigation', function(assert) {
  this.render(hbs`{{grading/gru-rubric-panel showNavigation=true}}`);

  let $component = this.$();
  T.exists(
    assert,
    $component.find('.rubric-information .footer'),
    'Navigation is not being shown'
  );
});

test('Do not show navigation', function(assert) {
  this.render(hbs`{{grading/gru-rubric-panel showNavigation=false}}`);

  let $component = this.$();
  T.notExists(
    assert,
    $component.find('.rubric-information .footer'),
    'Navigation is being shown'
  );
});
