import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'reports/assessment/questions/gru-multiple-choice',
  'Integration | Component | reports/assessment/questions/gru multiple choice',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Multiple Choice Correct Answer', function(assert) {
  var question = Ember.Object.create({
    questionType: 'MC',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ])
  });
  var showCorrect = true;
  this.set('question', question);
  this.set('showCorrect', showCorrect);
  this.render(
    hbs`{{reports/assessment/questions/gru-multiple-choice question=question showCorrect=showCorrect}}`
  );
  const $component = this.$(); //component dom element
  const $multipleChoice = $component.find(
    '.reports.assessment.questions.gru-multiple-choice'
  );

  T.exists(assert, $multipleChoice, 'Missing multiple choice component');
  T.exists(
    assert,
    $multipleChoice.find('li:nth-child(1) span i.radio_button_unchecked'),
    'The first answer should be unchecked'
  );
  T.exists(
    assert,
    $multipleChoice.find('li:nth-child(2) span i.radio_button_unchecked'),
    'The second answer should be unchecked'
  );
  T.exists(
    assert,
    $multipleChoice.find('li:nth-child(3) span.correct i.radio_button_checked'),
    'The third answer should be checked and correct'
  );
});

test('Multiple Choice Your Answer Incorrect', function(assert) {
  var question = Ember.Object.create({
    questionType: 'MC',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ])
  });
  var userAnswer = '1';
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-multiple-choice question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $multipleChoice = $component.find(
    '.reports.assessment.questions.gru-multiple-choice'
  );
  T.exists(assert, $multipleChoice, 'Missing multiple choice component');
  T.exists(
    assert,
    $multipleChoice.find(
      'li:nth-child(1) span.incorrect i.radio_button_checked'
    ),
    'The third answer should be checked and incorrect'
  );
  T.exists(
    assert,
    $multipleChoice.find('li:nth-child(2) span i.radio_button_unchecked'),
    'The second answer should be unchecked'
  );
  T.exists(
    assert,
    $multipleChoice.find('li:nth-child(3) span i.radio_button_unchecked'),
    'The third answer should be unchecked'
  );
});

test('Multiple Choice Your Answer Correct', function(assert) {
  var question = Ember.Object.create({
    questionType: 'MC',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ])
  });
  var userAnswer = '3';
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-multiple-choice question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $multipleChoice = $component.find(
    '.reports.assessment.questions.gru-multiple-choice'
  );
  T.exists(assert, $multipleChoice, 'Missing multiple choice component');
  T.exists(
    assert,
    $multipleChoice.find('li:nth-child(1) span i.radio_button_unchecked'),
    'The first answer should be unchecked'
  );
  T.exists(
    assert,
    $multipleChoice.find('li:nth-child(2) span i.radio_button_unchecked'),
    'The second answer should be unchecked'
  );
  T.exists(
    assert,
    $multipleChoice.find('li:nth-child(3) span.correct i.radio_button_checked'),
    'The third answer should be checked and correct'
  );
});

test('Multiple Choice anonymous', function(assert) {
  var question = Ember.Object.create({
    questionType: 'MC',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ])
  });
  var userAnswer = '3';
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-multiple-choice question=question userAnswer=userAnswer anonymous=true}}`
  );
  const $component = this.$(); //component dom element
  const $multipleChoice = $component.find(
    '.reports.assessment.questions.gru-multiple-choice'
  );
  T.exists(assert, $multipleChoice, 'Missing multiple choice component');
  T.exists(
    assert,
    $multipleChoice.find('li:nth-child(3) span.anonymous'),
    'The third answer is anonymous'
  );
});
