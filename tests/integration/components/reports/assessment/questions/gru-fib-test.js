import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'reports/assessment/questions/gru-fib',
  'Integration | Component | reports/assessment/questions/gru-fib',
  {
    integration: true
  }
);

test('Fill in the blank Correct Answer', function(assert) {
  var question = Ember.Object.create({
    questionType: 'FIB',
    text: 'The mountain is [green] and the sky [blue]',
    fibText: 'The mountain is _______ and the sky _______',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: 1, text: 'green' }),
      Ember.Object.create({ id: 2, text: 'blue' })
    ]),
    order: 1
  });

  var showCorrect = true;
  this.set('question', question);
  this.set('showCorrect', showCorrect);
  this.render(
    hbs`{{reports/assessment/questions/gru-fib question=question showCorrect=showCorrect}}`
  );
  const $component = this.$(); //component dom element
  const $fib = $component.find('.reports.assessment.questions.gru-fib');

  T.exists(assert, $fib, 'Missing fill in the blank component');
  T.exists(
    assert,
    $fib.find('> span:eq(1).answer.correct'),
    'The first answer should be correct'
  );
  T.exists(
    assert,
    $fib.find('> span:eq(3).answer.correct'),
    'The second answer should be correct'
  );
  T.notExists(
    assert,
    $fib.find('span.answer.incorrect'),
    'Should not be incorrect answers at all'
  );
});

test('Fill in the blank Your Answer Incorrect', function(assert) {
  var question = Ember.Object.create({
    questionType: 'FIB',
    text: 'The mountain is [green] and the sky [blue]',
    fibText: 'The mountain is _______ and the sky _______',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: 1, text: 'green' }),
      Ember.Object.create({ id: 2, text: 'blue' })
    ]),
    order: 1
  });
  var userAnswer = Ember.A(['yellow', 'blue']);
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-fib question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $fib = $component.find('.reports.assessment.questions.gru-fib');
  T.exists(assert, $fib, 'Missing fill in the blank component');
  T.exists(
    assert,
    $fib.find('> span:eq(1).answer.incorrect'),
    'The first answer should be incorrect'
  );
  T.exists(
    assert,
    $fib.find('> span:eq(3).answer.correct'),
    'The second answer should be correct'
  );
});

test('Fill in the blank Your Answer Correct', function(assert) {
  var question = Ember.Object.create({
    questionType: 'FIB',
    text: 'The mountain is [green] and the sky [blue]',
    fibText: 'The mountain is _______ and the sky _______',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: 1, text: 'green' }),
      Ember.Object.create({ id: 2, text: 'blue' })
    ]),
    order: 1
  });
  var userAnswer = Ember.A(['green', 'blue']);
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-fib question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $fib = $component.find('.reports.assessment.questions.gru-fib');
  T.exists(assert, $fib, 'Missing fill in the blank component');
  T.exists(
    assert,
    $fib.find('> span:eq(1).answer.correct'),
    'The first answer should be correct'
  );
  T.exists(
    assert,
    $fib.find('> span:eq(3).answer.correct'),
    'The second answer should be correct'
  );
  T.notExists(
    assert,
    $fib.find('span.answer.incorrect'),
    'Should not be incorrect answers at all'
  );
});

test('Fill in the blank anonymous', function(assert) {
  var question = Ember.Object.create({
    questionType: 'FIB',
    text: 'The mountain is [green] and the sky [blue]',
    fibText: 'The mountain is _______ and the sky _______',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: 1, text: 'green' }),
      Ember.Object.create({ id: 2, text: 'blue' })
    ]),
    order: 1
  });
  var userAnswer = Ember.A(['green', 'blue']);
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-fib question=question userAnswer=userAnswer anonymous=true}}`
  );
  const $component = this.$(); //component dom element
  const $fib = $component.find('.reports.assessment.questions.gru-fib');
  T.exists(assert, $fib, 'Missing fill in the blank component');
  T.exists(
    assert,
    $fib.find('> span:eq(1).answer.anonymous'),
    'The first answer should be anonymous'
  );
  T.exists(
    assert,
    $fib.find('> span:eq(3).answer.anonymous'),
    'The second answer should be anonymous'
  );
});
