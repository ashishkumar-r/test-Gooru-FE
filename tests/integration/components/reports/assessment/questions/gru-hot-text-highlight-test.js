import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'reports/assessment/questions/gru-hot-text-highlight',
  'Integration | Component | reports/assessment/questions/gru-hot-text-highlight',
  {
    integration: true
  }
);

test('Hot Text Highlight User Answer', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HT_HL',
    text: '<p>Seleccione las palabras escritas incorrectamente</p>',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        text:
          '<p>[Le] casa es de [colo] rojo pero pero el [teco] es azul ajax</p>'
      })
    ]),
    hasAnswers: true,
    isHotTextHighlightWord: true,
    order: 2
  });
  var userAnswer = [
    { index: 0, text: 'Le' },
    { index: 1, text: 'casa' },
    { index: 9, text: 'teco' },
    { index: 11, text: 'azul' }
  ];
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-hot-text-highlight question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $ht_hl = $component.find(
    '.reports.assessment.questions.gru-hot-text-highlight'
  );

  T.exists(assert, $ht_hl, 'Missing  component');
  const $correctAnswers = $ht_hl.find('span.correct');
  assert.equal(
    $correctAnswers.length,
    2,
    'There are no correct answers, there should be 2'
  );

  const $incorrectAnswers = $ht_hl.find('span.incorrect');
  assert.equal(
    $incorrectAnswers.length,
    2,
    'There are no incorrect answers, there should be 2'
  );
});

test('Hot Text Highlight Correct Answer', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HT_HL',
    text: '<p>Seleccione las palabras escritas incorrectamente</p>',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        text:
          '<p>[Le] casa es de [colo] rojo pero pero el [teco] es azul ajax</p>'
      })
    ]),
    hasAnswers: true,
    isHotTextHighlightWord: true,
    order: 2
  });
  var userAnswer = [
    { index: 0, text: 'Le' },
    { index: 1, text: 'casa' },
    { index: 9, text: 'teco' },
    { index: 11, text: 'azul' }
  ];
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-hot-text-highlight question=question showCorrect=true}}`
  );
  const $component = this.$(); //component dom element
  const $ht_hl = $component.find(
    '.reports.assessment.questions.gru-hot-text-highlight'
  );

  T.exists(assert, $ht_hl, 'Missing  component');
  const $correctAnswers = $ht_hl.find('span.correct');
  assert.equal(
    $correctAnswers.length,
    3,
    'There are no correct answers, there should be 3'
  );

  const $incorrectAnswers = $ht_hl.find('span.incorrect');
  assert.equal(
    $incorrectAnswers.length,
    0,
    'There are incorrect answers, there should be 0'
  );
});

test('Hot Text Highlight Anonymous', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HT_HL',
    text: '<p>Seleccione las palabras escritas incorrectamente</p>',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        text:
          '<p>[Le] casa es de [colo] rojo pero pero el [teco] es azul ajax</p>'
      })
    ]),
    hasAnswers: true,
    isHotTextHighlightWord: true,
    order: 2
  });
  var userAnswer = [
    { index: 0, text: 'Le' },
    { index: 1, text: 'casa' },
    { index: 9, text: 'teco' },
    { index: 11, text: 'azul' }
  ];
  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-hot-text-highlight question=question showCorrect=true anonymous=true}}`
  );
  const $component = this.$(); //component dom element
  const $ht_hl = $component.find(
    '.reports.assessment.questions.gru-hot-text-highlight'
  );
  const $correctAnswers = $ht_hl.find('span.anonymous');
  assert.equal(
    $correctAnswers.length,
    3,
    'There are no correct answers, there should be 3'
  );
});
