import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'reports/assessment/questions/gru-true-false',
  'Integration | Component | reports/assessment/questions/gru true false',
  {
    integration: true
  }
);

test('True False Correct Answer', function(assert) {
  var question = Ember.Object.create({
    questionType: 'T/F',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'True' }),
      Ember.Object.create({ id: '2', isCorrect: true, text: 'False' })
    ])
  });
  var showCorrect = true;
  this.set('question', question);
  this.set('showCorrect', showCorrect);

  this.render(
    hbs`{{reports/assessment/questions/gru-true-false question=question showCorrect=showCorrect}}`
  );

  const $component = this.$(); //component dom element
  T.exists(
    assert,
    $component.find('li:nth-child(1) span i.radio_button_unchecked'),
    'The first answer should be unchecked'
  );
  T.exists(
    assert,
    $component.find('li:nth-child(2) span.correct i.radio_button_checked'),
    'The second answer should be checked and correct'
  );
});

test('True False Your Answer Incorrect', function(assert) {
  var question = Ember.Object.create({
    questionType: 'T/F',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'True' }),
      Ember.Object.create({ id: '2', isCorrect: true, text: 'False' })
    ])
  });
  var userAnswer = '1';
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-true-false question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  T.exists(
    assert,
    $component.find('li:nth-child(1) span.incorrect i.radio_button_checked'),
    'The first answer should be checked and incorrect'
  );
  T.exists(
    assert,
    $component.find('li:nth-child(2) span i.radio_button_unchecked'),
    'The second answer should be unchecked'
  );
});

test('True False Your Answer Correct', function(assert) {
  var question = Ember.Object.create({
    questionType: 'T/F',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'True' }),
      Ember.Object.create({ id: '2', isCorrect: true, text: 'False' })
    ])
  });
  var userAnswer = '2';
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-true-false question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  T.exists(
    assert,
    $component.find('li:nth-child(1) span i.radio_button_unchecked'),
    'The first answer should be unchecked'
  );
  T.exists(
    assert,
    $component.find('li:nth-child(2) span.correct i.radio_button_checked'),
    'The second answer should be checked and correct'
  );
});

test('True False anonymous', function(assert) {
  var question = Ember.Object.create({
    questionType: 'T/F',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'True' }),
      Ember.Object.create({ id: '2', isCorrect: true, text: 'False' })
    ])
  });
  var userAnswer = '2';
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-true-false question=question userAnswer=userAnswer anonymous=true}}`
  );
  const $component = this.$(); //component dom element
  T.exists(
    assert,
    $component.find('li:nth-child(1) span i.radio_button_unchecked'),
    'The first answer should be unchecked'
  );
  T.exists(
    assert,
    $component.find('li:nth-child(2) span.anonymous'),
    'The second answer should be anonymous'
  );
});
