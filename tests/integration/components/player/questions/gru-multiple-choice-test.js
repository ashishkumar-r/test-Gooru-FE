import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'player/questions/gru-multiple-choice',
  'Integration | Component | player/questions/gru multiple choice',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Multiple choice question layout', function(assert) {
  assert.expect(10);
  let question = Ember.Object.create({
    id: '569906aa20b7dfae1bcd5',
    questionType: 'MC',
    text: 'Sample Question MC',
    answers: Ember.A([
      Ember.Object.create({
        id: 1,
        text: '<p>An aquifer</p>',
        answerType: 'text',
        isCorrect: true,
        sequence: 1
      }),
      Ember.Object.create({
        id: 2,
        text: '<p>A well</p>',
        answerType: 'text',
        isCorrect: false,
        sequence: 2
      }),
      Ember.Object.create({
        aid: 3,
        text: '<p>A pump</p>',
        answerType: 'text',
        isCorrect: false,
        sequence: 3
      })
    ]),
    order: 1,
    hasAnswers: true,
    hasNarration: true
  });

  let answers = [];

  this.set('question', question);
  this.on('myOnAnswerChanged', function(question, stats) {
    //called 2 times
    assert.deepEqual(
      stats,
      answers,
      'Answer changed, but the answers are not correct'
    );
  });

  this.on('myOnAnswerCompleted', function(question, stats) {
    //called 2 times
    assert.deepEqual(
      stats,
      answers,
      'Answer completed, but the answers are not correct'
    );
  });

  this.render(hbs`{{player/questions/gru-multiple-choice question=question
        onAnswerChanged="myOnAnswerChanged" onAnswerCompleted="myOnAnswerCompleted"}}`);

  var $component = this.$(); //component dom element
  T.exists(assert, $component.find('.instructions'), 'Missing instructions');
  assert.equal(
    $component.find('.answer-choices .radio').length,
    3,
    'Missing answer choices'
  );
  assert.equal(
    $component.find('.answer-choices .radio input[type=radio]').length,
    3,
    'Missing answer choices radio inputs'
  );
  assert.ok(
    $component
      .find('.answer-choices .radio:eq(0)')
      .html()
      .indexOf('(A)An aquifer'),
    'Incorrect Message'
  );
  assert.ok(
    $component.find('.answer-choices .radio:eq(1)').html().indexOf('(B)A well'),
    'Incorrect Message'
  );
  assert.ok(
    $component.find('.answer-choices .radio:eq(2)').html().indexOf('(C)A pump'),
    'Incorrect Message'
  );

  //select a radio button
  answers = { answer: 2, correct: false };
  $component.find('.answer-choices .radio input[type=radio]:eq(1)').click();

  answers = { answer: 1, correct: true };
  $component.find('.answer-choices .radio input[type=radio]:eq(0)').click();
});

test('Multiple choice question layout - read only', function(assert) {
  assert.expect(2);
  let question = Ember.Object.create({
    id: '569906aa20b7dfae1bcd5',
    questionType: 'MC',
    text: 'Sample Question MC',
    answers: Ember.A([
      Ember.Object.create({
        id: 1,
        text: '<p>An aquifer</p>',
        answerType: 'text',
        isCorrect: true,
        sequence: 1
      }),
      Ember.Object.create({
        id: 2,
        text: '<p>A well</p>',
        answerType: 'text',
        isCorrect: false,
        sequence: 2
      }),
      Ember.Object.create({
        aid: 3,
        text: '<p>A pump</p>',
        answerType: 'text',
        isCorrect: false,
        sequence: 3
      })
    ]),
    order: 1,
    hasAnswers: true,
    hasNarration: true
  });

  this.set('question', question);
  this.render(
    hbs`{{player/questions/gru-multiple-choice question=question readOnly=true}}`
  );

  var $component = this.$(); //component dom element
  assert.equal(
    $component.find('.answer-choices .radio.disabled').length,
    3,
    'Missing answer choices'
  );
  assert.equal(
    $component.find('.answer-choices .radio input[disabled]').length,
    3,
    'Missing answer choices radio inputs'
  );
});

test('Multiple choice question with user answer', function(assert) {
  assert.expect(5);
  let question = Ember.Object.create({
    id: '569906aa20b7dfae1bcd5',
    questionType: 'MC',
    text: 'Sample Question MC',
    answers: Ember.A([
      Ember.Object.create({
        id: 1,
        text: '<p>An aquifer</p>',
        answerType: 'text',
        isCorrect: true,
        sequence: 1
      }),
      Ember.Object.create({
        id: 2,
        text: '<p>A well</p>',
        answerType: 'text',
        isCorrect: false,
        sequence: 2
      }),
      Ember.Object.create({
        id: 3,
        text: '<p>A pump</p>',
        answerType: 'text',
        isCorrect: false,
        sequence: 3
      })
    ]),
    order: 1,
    hasAnswers: true,
    hasNarration: true
  });

  const answers = { answer: 2, correct: false };
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
  this.render(hbs`{{player/questions/gru-multiple-choice question=question 
                    userAnswer=2
                    onAnswerChanged="changeAnswer"
                    onAnswerLoaded="loadAnswer"}}`);

  var $component = this.$(); //component dom element
  T.exists(assert, $component.find('.instructions'), 'Missing instructions');
  assert.equal(
    $component.find('.answer-choices .radio').length,
    3,
    'Missing answer choices'
  );
  assert.ok(
    $component.find('.answer-choices .radio:eq(1) input:checked').length,
    'Answer choice 2 should be selected'
  );
});
