import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'player/questions/gru-multiple-answer',
  'Integration | Component | player/questions/gru multiple answer',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Multiple answer question layout', function(assert) {
  assert.expect(6);

  let question = Ember.Object.create({
    id: '569906aa77bebed003fa6eb1',
    questionType: 'MA',
    text: 'Sample Question MA',
    hints: [],
    explanation: 'Sample explanation text',
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
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 5,
    hasAnswers: true
  });

  this.set('question', question);

  this.render(hbs`{{player/questions/gru-multiple-answer question=question}}`);

  var $component = this.$(); //component dom element
  T.exists(assert, $component.find('.instructions'), 'Missing instructions');
  assert.equal(
    $component.find('.answer-choices tbody tr').length,
    3,
    'Missing answer choices'
  );
  assert.equal(
    $component.find('.answer-choices tr input[type=radio]').length,
    6,
    'Missing answer choices radio inputs'
  );
  assert.ok(
    $component
      .find('.answer-choices tbody tr:eq(0) td:eq(2)')
      .html()
      .indexOf('(A)An aquifer'),
    'Incorrect Message'
  );
  assert.ok(
    $component
      .find('.answer-choices tbody tr:eq(1) td:eq(2)')
      .html()
      .indexOf('(B)A well'),
    'Incorrect Message'
  );
  assert.ok(
    $component
      .find('.answer-choices tbody tr:eq(2) td:eq(2)')
      .html()
      .indexOf('(C)A pump'),
    'Incorrect Message'
  );
});

test('Multiple answer question events', function(assert) {
  assert.expect(6);

  let question = Ember.Object.create({
    id: '569906aa77bebed003fa6eb1',
    questionType: 'MA',
    text: 'Sample Question MA',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        text: '<p>An aquifer</p>',
        answerType: 'text',
        isCorrect: true,
        sequence: 1
      }),
      Ember.Object.create({
        id: '2',
        text: '<p>A well</p>',
        answerType: 'text',
        isCorrect: false,
        sequence: 2
      }),
      Ember.Object.create({
        id: '3',
        text: '<p>A pump</p>',
        answerType: 'text',
        isCorrect: true,
        sequence: 3
      })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 5,
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
    //called 2 times
    assert.deepEqual(
      stats,
      answers,
      'Answer completed, but the answers are not correct'
    );
  });

  this.render(hbs`{{player/questions/gru-multiple-answer question=question
        onAnswerChanged="myOnAnswerChanged" onAnswerCompleted="myOnAnswerCompleted"}}`);

  var $component = this.$(); //component dom element

  //select a radio button
  answers = { answer: [{ id: '1', selection: true }], correct: false };
  $component
    .find('.answer-choices tbody tr:eq(0) input[type=radio]:eq(0)')
    .click(); //Yes

  answers = {
    answer: [{ id: '1', selection: true }, { id: '2', selection: true }],
    correct: false
  };
  $component
    .find('.answer-choices tbody tr:eq(1) input[type=radio]:eq(0)')
    .click(); //Yes

  answers = {
    answer: [
      { id: '1', selection: true },
      { id: '2', selection: true },
      { id: '3', selection: true }
    ],
    correct: false
  };
  $component
    .find('.answer-choices tbody tr:eq(2) input[type=radio]:eq(0)')
    .click(); //Yes

  answers = {
    answer: [
      { id: '1', selection: true },
      { id: '2', selection: false },
      { id: '3', selection: true }
    ],
    correct: true
  };
  $component
    .find('.answer-choices tbody tr:eq(1) input[type=radio]:eq(1)')
    .click(); //No
});

test('Multiple answer question layout - read only', function(assert) {
  assert.expect(2);

  let question = Ember.Object.create({
    id: '569906aa77bebed003fa6eb1',
    questionType: 'MA',
    text: 'Sample Question MA',
    hints: [],
    explanation: 'Sample explanation text',
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
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 5,
    hasAnswers: true
  });

  this.set('question', question);

  this.render(
    hbs`{{player/questions/gru-multiple-answer question=question readOnly=true}}`
  );

  var $component = this.$(); //component dom element
  T.exists(assert, $component.find('.instructions'), 'Missing instructions');
  assert.equal(
    $component.find('.answer-choices tr input[disabled]').length,
    6,
    'Missing answer choices radio inputs'
  );
});

test('Multiple answer question layout - with user answer', function(assert) {
  assert.expect(7);

  let question = Ember.Object.create({
    id: '569906aa77bebed003fa6eb1',
    questionType: 'MA',
    text: 'Sample Question MA',
    hints: [],
    explanation: 'Sample explanation text',
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
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 5,
    hasAnswers: true
  });

  const answers = {
    answer: [
      {
        id: 1,
        selection: true
      },
      {
        id: 2,
        selection: false
      },
      {
        id: 3,
        selection: false
      }
    ],
    correct: true
  };
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
  this.set('userAnswer', [
    { id: 1, selection: true },
    { id: 2, selection: false },
    { id: 3, selection: false }
  ]);

  this.render(hbs`{{player/questions/gru-multiple-answer question=question 
                    userAnswer=userAnswer
                    onAnswerChanged="changeAnswer"
                    onAnswerLoaded="loadAnswer"}}`);

  var $component = this.$(); //component dom element
  T.exists(assert, $component.find('.instructions'), 'Missing instructions');
  assert.equal(
    $component.find('.answer-choices tbody tr input').length,
    6,
    'Missing answer choices radio inputs'
  );
  assert.equal(
    $component.find('.answer-choices tbody tr:eq(0) input:checked').val(),
    'yes|1',
    'Wrong selection for answer 1'
  );
  assert.equal(
    $component.find('.answer-choices tbody tr:eq(1) input:checked').val(),
    'no|2',
    'Wrong selection for answer 1'
  );
  assert.equal(
    $component.find('.answer-choices tbody tr:eq(2) input:checked').val(),
    'no|3',
    'Wrong selection for answer 1'
  );
});
