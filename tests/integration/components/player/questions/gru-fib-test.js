import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'player/questions/gru-fib',
  'Integration | Component | player/questions/gru fib',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Fill in the blanks layout', function(assert) {
  assert.expect(3);
  const question = Ember.Object.create({
    id: '569906aacea8416665209d53',
    questionType: 'FIB',
    text: 'The sun is [yellow] and the moon [white]',
    fibText: 'The sun is _______ and the moon _______',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: 1, text: 'yellow' }),
      Ember.Object.create({ id: 2, text: 'white' })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 4,
    hasAnswers: true
  });

  this.set('question', question);
  this.render(hbs`{{player/questions/gru-fib question=question}}`);

  var $component = this.$(); //component dom element
  T.exists(assert, $component.find('.instructions'), 'Missing instructions');
  T.exists(
    assert,
    $component.find('.fib-answers'),
    'Missing fill in the blanks answers'
  );
  assert.equal(
    $component.find('.fib-answers input').length,
    2,
    'Incorrect number of inputs'
  );
});

test('Fill in the blanks events', function(assert) {
  assert.expect(8);
  const question = Ember.Object.create({
    id: '569906aacea8416665209d53',
    questionType: 'FIB',
    text: 'The sun is [yellow] and the moon [white]',
    fibText: 'The sun is _______ and the moon _______',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: 1, text: 'yellow' }),
      Ember.Object.create({ id: 2, text: 'white' })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 4,
    hasAnswers: true
  });

  let answers = [];

  this.set('question', question);
  this.on('myOnAnswerChanged', function(question, stats) {
    //called 4 times
    assert.deepEqual(
      stats,
      answers,
      'Answer changed, but the answers are not correct'
    );
  });

  this.on('myOnAnswerCompleted', function(question, stats) {
    //called 3 times
    assert.deepEqual(
      stats,
      answers,
      'Answer completed, but the answers are not correct'
    );
  });

  this.on('myOnAnswerCleared', function(question, stats) {
    //called 1 time
    assert.deepEqual(
      stats,
      answers,
      'Answer cleared, but the answers are not correct'
    );
  });

  this.render(hbs`{{player/questions/gru-fib question=question
        onAnswerChanged="myOnAnswerChanged"
        onAnswerCleared="myOnAnswerCleared"
        onAnswerCompleted="myOnAnswerCompleted"}}`);

  var $component = this.$(); //component dom element
  //enter response
  answers = { answer: ['yellow', ''], correct: false };
  $component.find('.fib-answers input:eq(0)').first().val('yellow');
  $component.find('.fib-answers input').first().keyup();

  //enter response
  answers = { answer: ['yellow', 'white'], correct: true };
  $component.find('.fib-answers input:eq(1)').first().val('white');
  $component.find('.fib-answers input').first().keyup();

  //clear response
  answers = { answer: ['', 'white'], correct: false };
  $component.find('.fib-answers input:eq(0)').first().val('');
  $component.find('.fib-answers input').first().keyup();

  //clear response
  answers = { answer: ['', ''], correct: false };
  $component.find('.fib-answers input:eq(1)').first().val('');
  $component.find('.fib-answers input').first().keyup();
});

test('Fill in the blanks layout - read only', function(assert) {
  assert.expect(1);
  const question = Ember.Object.create({
    id: '569906aacea8416665209d53',
    questionType: 'FIB',
    text: 'The sun is [yellow] and the moon [white]',
    fibText: 'The sun is _______ and the moon _______',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: 1, text: 'yellow' }),
      Ember.Object.create({ id: 2, text: 'white' })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 4,
    hasAnswers: true
  });

  this.set('question', question);
  this.render(
    hbs`{{player/questions/gru-fib question=question readOnly=true}}`
  );

  var $component = this.$(); //component dom element
  assert.equal(
    $component.find('.fib-answers input[disabled]').length,
    2,
    'Incorrect number of inputs'
  );
});

test('Fill in the blanks layout - with user answer', function(assert) {
  assert.expect(5);
  const question = Ember.Object.create({
    id: '569906aacea8416665209d53',
    questionType: 'FIB',
    text: 'The sun is [yellow] and the moon [white]',
    fibText: 'The sun is _______ and the moon _______',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: 1, text: 'yellow' }),
      Ember.Object.create({ id: 2, text: 'white' })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 4,
    hasAnswers: true
  });

  const answers = { answer: ['amarillo', 'gris'], correct: false };
  this.on('changeAnswer', function(question, stats) {
    assert.deepEqual(
      stats,
      answers,
      'Answer changed, but the answers are not correct'
    );
  });
  this.on('loadAnswer', function(question, stats) {
    assert.deepEqual(
      stats,
      answers,
      'Answer loaded, but the answers are not correct'
    );
  });
  this.set('question', question);
  this.set('userAnswer', ['amarillo', 'gris']);
  this.render(hbs`{{player/questions/gru-fib question=question 
                    userAnswer=userAnswer
                    onAnswerChanged="changeAnswer"
                    onAnswerLoaded="loadAnswer"}}`);

  var $component = this.$(); //component dom element
  assert.equal(
    $component.find('.fib-answers input').length,
    2,
    'Incorrect number of inputs'
  );
  assert.equal(
    $component.find('.fib-answers input:eq(0)').val(),
    'amarillo',
    'Wrong answer for input 1'
  );
  assert.equal(
    $component.find('.fib-answers input:eq(1)').val(),
    'gris',
    'Wrong answer for input 2'
  );
});

test('Set two questions', function(assert) {
  assert.expect(2);
  const question = Ember.Object.create({
    id: '569906aacea8416665209d53',
    questionType: 'FIB',
    text: 'The sun is[yellow] and the moon[white]',
    fibText: 'The sun is_______ and the moon_______',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: 1, text: 'yellow' }),
      Ember.Object.create({ id: 2, text: 'white' })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 4,
    hasAnswers: true
  });

  const question1 = Ember.Object.create({
    id: '569906aacea8416665209d53',
    questionType: 'FIB',
    text: 'The sun is[yellow] ,the moon[white] and the stars_______',
    fibText: 'The sun is_______ ,the moon_______ and the stars_______',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: 1, text: 'yellow' }),
      Ember.Object.create({ id: 2, text: 'white' })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 4,
    hasAnswers: true
  });

  this.set('question', question);
  this.render(hbs`{{player/questions/gru-fib question=question}}`);

  var $component = this.$(); //component dom element
  assert.equal(
    $component.find('.fib-answers').text().trim(),
    'The sun is and the moon',
    'Incorrect answer'
  );

  this.set('question', question1);

  assert.equal(
    $component.find('.fib-answers').text().trim(),
    'The sun is ,the moon and the stars',
    'Incorrect answer'
  );
});
