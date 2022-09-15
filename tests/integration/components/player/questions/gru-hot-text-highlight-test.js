import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'player/questions/gru-hot-text-highlight',
  'Integration | Component | player/questions/gru hot text highlight',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  assert.expect(4);

  let question = Ember.Object.create({
    id: '569906aa68f276ae7ea03c30',
    questionType: 'HT_HL',
    text: '<p>Seleccione las palabras escritas incorrectamente</p>',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        text:
          '<p>Sentence 1 [Sentence 2.] Sentence 3 [Sentence 4.] Sentence 5</p>'
      })
    ]),
    isHotTextHighlightWord: false,
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 6,
    hasAnswers: true
  });

  this.set('question', question);

  this.render(
    hbs`{{player/questions/gru-hot-text-highlight question=question}}`
  );

  var $component = this.$(), //component dom element
    $phrasesContainer = $component.find('.phrases');

  assert.ok($component.find('.instructions'), 'Missing instructions');
  assert.ok($component.find('.phrases'), 'Missing phrases');
  assert.equal(
    $phrasesContainer.find('span.item').length,
    5,
    'Incorrect number of sentences'
  );
  assert.equal(
    $phrasesContainer.find('span.item.selected').length,
    0,
    'Incorrect number of sentences selected'
  );
});

test('markItem', function(assert) {
  assert.expect(14);

  let question = Ember.Object.create({
    id: '569906aa68f276ae7ea03c30',
    questionType: 'HT_HL',
    text: '<p>Seleccione las palabras escritas incorrectamente</p>',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      // ["le", "colo", "teco"]
      Ember.Object.create({
        id: '1',
        text:
          '<p>Sentence 1 [Sentence 2.] Sentence 3 [Sentence 4.] Sentence 5</p>'
      })
    ]),
    isHotTextHighlightWord: false,
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 6,
    hasAnswers: true
  });

  let answers = [];

  this.set('question', question);
  this.on('myOnAnswerChanged', function(question, stats) {
    assert.deepEqual(
      stats,
      answers,
      'Answer changed, but the answers are not correct'
    );
  });

  this.on('myOnAnswerCompleted', function(question, stats) {
    assert.deepEqual(
      stats,
      answers,
      'Answer completed, but the answers are not correct'
    );
  });

  this.on('myOnAnswerCleared', function(question, stats) {
    assert.deepEqual(
      stats,
      answers,
      'Answer cleared, but the answers are not correct'
    );
  });

  this.render(hbs`{{player/questions/gru-hot-text-highlight
        question=question
        onAnswerChanged="myOnAnswerChanged"
        onAnswerCleared="myOnAnswerCleared"
        onAnswerCompleted="myOnAnswerCompleted"}}`);

  var $component = this.$(), //component dom element
    $phrasesContainer = $component.find('.phrases'),
    $item1 = $phrasesContainer.find('span.item:eq(1)'),
    $item3 = $phrasesContainer.find('span.item:eq(3)');

  //selecting items
  answers = { answer: [{ index: 1, text: 'Sentence 2.' }], correct: false };
  $item1.click();
  assert.ok($item1.hasClass('selected'), 'Item 1 should be selected');

  answers = {
    answer: [
      { index: 1, text: 'Sentence 2.' },
      { index: 3, text: 'Sentence 4.' }
    ],
    correct: true
  };
  $item3.click();
  assert.ok($item3.hasClass('selected'), 'Item 3 should be selected');

  //deselecting items
  answers = { answer: [{ index: 3, text: 'Sentence 4.' }], correct: false };
  $item1.click();
  assert.ok(!$item1.hasClass('selected'), 'Item 1 should not be selected');
  assert.ok($item3.hasClass('selected'), 'Item 3 should be selected');

  answers = { answer: [], correct: false };
  $item3.click();
  assert.ok(!$item1.hasClass('selected'), 'Item 1 should not be selected');
  assert.ok(!$item3.hasClass('selected'), 'Item 3 should not be selected');
});

test('Layout - read only', function(assert) {
  assert.expect(1);

  let question = Ember.Object.create({
    id: '569906aa68f276ae7ea03c30',
    questionType: 'HT_HL',
    text: '<p>Seleccione las palabras escritas incorrectamente</p>',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        text:
          '<p>Sentence 1 [Sentence 2.] Sentence 3 [Sentence 4.] Sentence 5</p>'
      })
    ]),
    isHotTextHighlightWord: false,
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 6,
    hasAnswers: true
  });

  this.set('question', question);

  this.render(
    hbs`{{player/questions/gru-hot-text-highlight question=question readOnly=true}}`
  );

  var $component = this.$(), //component dom element
    $phrasesContainer = $component.find('.phrases');

  assert.equal(
    $phrasesContainer.find('span.item.disabled').length,
    5,
    'Incorrect number of sentences'
  );
});

test('Layout - with user answer', function(assert) {
  assert.expect(4);

  let question = Ember.Object.create({
    id: '569906aa68f276ae7ea03c30',
    questionType: 'HT_HL',
    text: '<p>Seleccione las palabras escritas incorrectamente</p>',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        text:
          '<p>Sentence 1 [Sentence 2.] Sentence 3 [Sentence 4.] Sentence 5</p>'
      })
    ]),
    isHotTextHighlightWord: false,
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 6,
    hasAnswers: true
  });

  const answers = {
    answer: [
      {
        index: 1,
        text: 'Sentence 2.'
      },
      {
        index: 3,
        text: 'Sentence 4.'
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
  this.set('userAnswer', [{ index: 1 }, { index: 3 }]);

  this.render(hbs`{{player/questions/gru-hot-text-highlight question=question
                    userAnswer=userAnswer
                    onAnswerChanged="changeAnswer"
                    onAnswerLoaded="loadAnswer"}}`);

  var $component = this.$(), //component dom element
    $phrasesContainer = $component.find('.phrases');

  assert.equal(
    $phrasesContainer.find('span.item').length,
    5,
    'Incorrect number of sentences'
  );
  assert.equal(
    $phrasesContainer.find('span.item.selected').length,
    2,
    '2 should be selected'
  );
});

test('Set two questions', function(assert) {
  assert.expect(2);

  let question = Ember.Object.create({
    id: '569906aa68f276ae7ea03c30',
    questionType: 'HT_HL',
    text: '<p>Seleccione las palabras escritas incorrectamente</p>',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        text:
          '<p>Sentence 1 [Sentence 2.] Sentence 3 [Sentence 4.] Sentence 5</p>'
      })
    ]),
    isHotTextHighlightWord: false,
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 6,
    hasAnswers: true
  });

  let question1 = Ember.Object.create({
    id: '569906aa68f276ae7ea03c30',
    questionType: 'HT_HL',
    text: '<p>Seleccione las palabras escritas incorrectamente2</p>',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        text:
          '<p>Question 2[Sentence 2.] Question 2 [Sentence 4.] Question 2</p>'
      })
    ]),
    isHotTextHighlightWord: false,
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 6,
    hasAnswers: true
  });

  this.set('question', question);

  this.render(
    hbs`{{player/questions/gru-hot-text-highlight question=question}}`
  );

  var $component = this.$(), //component dom element
    $phrasesContainer = $component.find('.phrases');

  assert.equal(
    $phrasesContainer.find('span:nth-child(1)').text().trim(),
    'Sentence 1',
    'Incorrect answer'
  );

  this.set('question', question1);

  assert.equal(
    $phrasesContainer.find('span:nth-child(1)').text().trim(),
    'Question 2',
    'Incorrect answer'
  );
});
