import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Answer from 'gooru-web/models/content/answer';
import Question from 'gooru-web/models/content/question';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';

moduleForComponent(
  'content/questions/answers/gru-true-false',
  'Integration | Component | content/questions/answers/gru true false',
  {
    integration: true
  }
);

test('True/False answer layout', function(assert) {
  const question = Question.create({
    answers: Ember.A([])
  });
  this.set('question', question);
  this.render(
    hbs`{{content/questions/answers/gru-true-false answers=question.answers}}`
  );
  var $component = this.$(); //component dom element
  const $option = $component.find('.answer-content');
  assert.equal($option.length, 2, 'True/False answer missing');
  assert.ok($option.find('.letter-container').length, 'Answer letter missing');
  assert.ok(
    $component.find('.answer-content:nth-child(1) .correct-choice .done')
      .length,
    'Correct  check missing'
  );
});
test('True/False answer layout Edit Mode', function(assert) {
  const question = Question.create({
    answers: Ember.A([])
  });
  this.set('question', question);
  this.render(
    hbs`{{content/questions/answers/gru-true-false answers=question.answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  const $option = $component.find('.answer-content');
  assert.equal($option.length, 2, 'True/False answer missing');
  assert.ok($option.find('.letter-container').length, 'Answer letter missing');
  assert.ok($option.find('button.check').length, 'Correct  button missing');
  assert.ok(
    $component.find('.answer-content:nth-child(1) .check.correct').length,
    'Correct  button missing'
  );
});

test('Load a list of answers', function(assert) {
  const question = Question.create({
    answers: Ember.A([
      Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: 'True',
        isCorrect: false
      }),
      Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: 'False',
        isCorrect: true
      })
    ])
  });
  this.set('question', question);

  this.render(
    hbs`{{content/questions/answers/gru-true-false answers=question.answers}}`
  );
  var $component = this.$(); //component dom element
  var $option = $component.find('.answer-content');
  assert.equal($option.length, 2, 'True/False answer missing');
  assert.notOk(
    $component.find('.panel:nth-child(1) .correct-choice .done').length,
    'True should don\'t be checked'
  );
  assert.ok(
    $component.find('.panel:nth-child(2) .correct-choice .done').length,
    'False should be checked'
  );
});

test('Correct answer', function(assert) {
  const question = Question.create({
    answers: Ember.A([
      Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: 'True',
        isCorrect: true
      }),
      Answer.create(Ember.getOwner(this).ownerInjection(), {
        text: 'False',
        isCorrect: false
      })
    ])
  });
  this.set('question', question);

  this.render(
    hbs`{{content/questions/answers/gru-true-false answers=question.answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  assert.equal(
    $component.find('.check.correct').length,
    1,
    'Incorrect number of correct answer'
  );
  var $option = $component.find('.panel:nth-child(2)');
  const $check = $option.find('.check');
  $check.click();
  return wait().then(function() {
    assert.equal(
      $component.find('.check.correct').length,
      1,
      'Incorrect number of correct answer'
    );
  });
});
