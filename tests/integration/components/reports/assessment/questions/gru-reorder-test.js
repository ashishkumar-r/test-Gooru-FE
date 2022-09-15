import { moduleForComponent, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

//TestCommpent
moduleForComponent(
  'reports/assessment/questions/gru-reorder',
  'Integration | Component | reports/assessment/questions/gru reorder',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

skip('Reoder Question - Show Correct Answer', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HT_RO',
    answers: Ember.A([
      Ember.Object.create({ id: 'crc', text: 'Costa Rica', order: 2 }),
      Ember.Object.create({ id: 'bra', text: 'Brasil', order: 3 }),
      Ember.Object.create({ id: 'pan', text: 'Panamá', order: 1 }),
      Ember.Object.create({ id: 'chi', text: 'Chile', order: 4 })
    ])
  });
  var showCorrect = true;
  this.set('question', question);
  this.set('showCorrect', showCorrect);

  this.render(
    hbs`{{reports/assessment/questions/gru-reorder question=question showCorrect=showCorrect}}`
  );

  const $component = this.$(); //component dom element
  T.exists(
    assert,
    $component.find('li:nth-child(1) span.correct'),
    'Answer 1 should be correct'
  );
  assert.equal(
    T.text($component.find('li:nth-child(1) span.correct')),
    '1',
    'Wrong order text for answer 1'
  );
  assert.equal(
    T.text($component.find('li:nth-child(1) span.answer-text')),
    'Panamá',
    'Wrong text for answer 1'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(2) span.correct'),
    'Answer 2 should be correct'
  );
  assert.equal(
    T.text($component.find('li:nth-child(2) span.correct')),
    '2',
    'Wrong order text for answer 2'
  );
  assert.equal(
    T.text($component.find('li:nth-child(2) span.answer-text')),
    'Costa Rica',
    'Wrong text for answer 2'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(3) span.correct'),
    'Answer 3 should be correct'
  );
  assert.equal(
    T.text($component.find('li:nth-child(3) span.correct')),
    '3',
    'Wrong order text for answer 3'
  );
  assert.equal(
    T.text($component.find('li:nth-child(3) span.answer-text')),
    'Brasil',
    'Wrong text for answer 3'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(4) span.correct'),
    'Answer 4 should be correct'
  );
  assert.equal(
    T.text($component.find('li:nth-child(4) span.correct')),
    '4',
    'Wrong order text for answer 4'
  );
  assert.equal(
    T.text($component.find('li:nth-child(4) span.answer-text')),
    'Chile',
    'Wrong text for answer 4'
  );
});

skip('Reoder Question - User answer correct', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HT_RO',
    answers: Ember.A([
      Ember.Object.create({ id: 'crc', text: 'Costa Rica', order: 2 }),
      Ember.Object.create({ id: 'bra', text: 'Brasil', order: 3 }),
      Ember.Object.create({ id: 'pan', text: 'Panamá', order: 1 }),
      Ember.Object.create({ id: 'chi', text: 'Chile', order: 4 })
    ])
  });
  var showCorrect = true;
  this.set('question', question);
  this.set('showCorrect', showCorrect);
  this.set('userAnswer', ['pan', 'crc', 'bra', 'chi']);

  this.render(
    hbs`{{reports/assessment/questions/gru-reorder question=question userAnswer=userAnswer}}`
  );

  const $component = this.$(); //component dom element
  T.exists(
    assert,
    $component.find('li:nth-child(1) span.correct'),
    'Answer 1 should be correct'
  );
  assert.equal(
    T.text($component.find('li:nth-child(1) span.correct')),
    '1',
    'Wrong order text for answer 1'
  );
  assert.equal(
    T.text($component.find('li:nth-child(1) span.answer-text')),
    'Panamá',
    'Wrong text for answer 1'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(2) span.correct'),
    'Answer 2 should be correct'
  );
  assert.equal(
    T.text($component.find('li:nth-child(2) span.correct')),
    '2',
    'Wrong order text for answer 2'
  );
  assert.equal(
    T.text($component.find('li:nth-child(2) span.answer-text')),
    'Costa Rica',
    'Wrong text for answer 2'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(3) span.correct'),
    'Answer 3 should be correct'
  );
  assert.equal(
    T.text($component.find('li:nth-child(3) span.correct')),
    '3',
    'Wrong order text for answer 3'
  );
  assert.equal(
    T.text($component.find('li:nth-child(3) span.answer-text')),
    'Brasil',
    'Wrong text for answer 3'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(4) span.correct'),
    'Answer 4 should be correct'
  );
  assert.equal(
    T.text($component.find('li:nth-child(4) span.correct')),
    '4',
    'Wrong order text for answer 4'
  );
  assert.equal(
    T.text($component.find('li:nth-child(4) span.answer-text')),
    'Chile',
    'Wrong text for answer 4'
  );
});

skip('Reoder Question - User answer all incorrect', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HT_RO',
    answers: Ember.A([
      Ember.Object.create({ id: 'crc', text: 'Costa Rica', order: 2 }),
      Ember.Object.create({ id: 'bra', text: 'Brasil', order: 3 }),
      Ember.Object.create({ id: 'pan', text: 'Panamá', order: 1 }),
      Ember.Object.create({ id: 'chi', text: 'Chile', order: 4 })
    ])
  });
  var showCorrect = true;
  this.set('question', question);
  this.set('showCorrect', showCorrect);
  this.set('userAnswer', ['crc', 'pan', 'chi', 'bra']);

  this.render(
    hbs`{{reports/assessment/questions/gru-reorder question=question userAnswer=userAnswer}}`
  );

  const $component = this.$(); //component dom element
  T.exists(
    assert,
    $component.find('li:nth-child(1) span.incorrect'),
    'Answer 1 should be incorrect'
  );
  assert.equal(
    T.text($component.find('li:nth-child(1) span.incorrect')),
    '2',
    'Wrong order text for answer 1'
  );
  assert.equal(
    T.text($component.find('li:nth-child(1) span.answer-text')),
    'Panamá',
    'Wrong text for answer 1'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(2) span.incorrect'),
    'Answer 2 should be incorrect'
  );
  assert.equal(
    T.text($component.find('li:nth-child(2) span.incorrect')),
    '1',
    'Wrong order text for answer 2'
  );
  assert.equal(
    T.text($component.find('li:nth-child(2) span.answer-text')),
    'Costa Rica',
    'Wrong text for answer 2'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(3) span.incorrect'),
    'Answer 3 should be incorrect'
  );
  assert.equal(
    T.text($component.find('li:nth-child(3) span.incorrect')),
    '4',
    'Wrong order text for answer 3'
  );
  assert.equal(
    T.text($component.find('li:nth-child(3) span.answer-text')),
    'Brasil',
    'Wrong text for answer 3'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(4) span.incorrect'),
    'Answer 4 should be incorrect'
  );
  assert.equal(
    T.text($component.find('li:nth-child(4) span.incorrect')),
    '3',
    'Wrong order text for answer 4'
  );
  assert.equal(
    T.text($component.find('li:nth-child(4) span.answer-text')),
    'Chile',
    'Wrong text for answer 4'
  );
});

skip('Reoder Question - User answer some incorrect', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HT_RO',
    answers: Ember.A([
      Ember.Object.create({ id: 'crc', text: 'Costa Rica', order: 2 }),
      Ember.Object.create({ id: 'bra', text: 'Brasil', order: 3 }),
      Ember.Object.create({ id: 'pan', text: 'Panamá', order: 1 }),
      Ember.Object.create({ id: 'chi', text: 'Chile', order: 4 })
    ])
  });
  var showCorrect = true;
  this.set('question', question);
  this.set('showCorrect', showCorrect);
  this.set('userAnswer', ['crc', 'pan', 'bra', 'chi']);

  this.render(
    hbs`{{reports/assessment/questions/gru-reorder question=question userAnswer=userAnswer}}`
  );

  const $component = this.$(); //component dom element
  T.exists(
    assert,
    $component.find('li:nth-child(1) span.incorrect'),
    'Answer 1 should be incorrect'
  );
  assert.equal(
    T.text($component.find('li:nth-child(1) span.incorrect')),
    '2',
    'Wrong order text for answer 1'
  );
  assert.equal(
    T.text($component.find('li:nth-child(1) span.answer-text')),
    'Panamá',
    'Wrong text for answer 1'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(2) span.incorrect'),
    'Answer 2 should be incorrect'
  );
  assert.equal(
    T.text($component.find('li:nth-child(2) span.incorrect')),
    '1',
    'Wrong order text for answer 2'
  );
  assert.equal(
    T.text($component.find('li:nth-child(2) span.answer-text')),
    'Costa Rica',
    'Wrong text for answer 2'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(3) span.correct'),
    'Answer 3 should be correct'
  );
  assert.equal(
    T.text($component.find('li:nth-child(3) span.correct')),
    '3',
    'Wrong order text for answer 3'
  );
  assert.equal(
    T.text($component.find('li:nth-child(3) span.answer-text')),
    'Brasil',
    'Wrong text for answer 3'
  );

  T.exists(
    assert,
    $component.find('li:nth-child(4) span.correct'),
    'Answer 4 should be correct'
  );
  assert.equal(
    T.text($component.find('li:nth-child(4) span.correct')),
    '4',
    'Wrong order text for answer 4'
  );
  assert.equal(
    T.text($component.find('li:nth-child(4) span.answer-text')),
    'Chile',
    'Wrong text for answer 4'
  );
});
