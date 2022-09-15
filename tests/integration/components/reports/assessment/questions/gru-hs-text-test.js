import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'reports/assessment/questions/gru-hs-text',
  'Integration | Component | reports/assessment/questions/gru hs text',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Hot Spot Text Correct Answer', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HS_TXT',
    text: 'Sample Question HS_TXT',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: true, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ]),
    order: 2
  });

  var showCorrect = true;
  this.set('question', question);
  this.set('showCorrect', showCorrect);
  this.render(
    hbs`{{reports/assessment/questions/gru-hs-text question=question showCorrect=showCorrect}}`
  );
  const $component = this.$(); //component dom element
  const $hsText = $component.find('.reports.assessment.questions.gru-hs-text');

  T.exists(
    assert,
    $hsText.find('li:eq(0).selected.correct'),
    'The first answer should be correct'
  );
  T.exists(
    assert,
    $hsText.find('li:eq(2).selected.correct'),
    'The third answer should be correct'
  );
  T.notExists(
    assert,
    $hsText.find('li.incorrect'),
    'Should not be incorrect answers at all'
  );
});

test('Hot Spot Text Your Answer Incorrect', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HS_TXT',
    text: 'Sample Question HS_TXT',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: true, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ]),
    order: 2
  });

  var userAnswer = Ember.A(['1', '2']);

  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-hs-text question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $hsText = $component.find('.reports.assessment.questions.gru-hs-text');

  T.exists(
    assert,
    $hsText.find('li:eq(0).selected.correct'),
    'The first answer should be correct and selected'
  );
  T.exists(
    assert,
    $hsText.find('li:eq(1).selected.incorrect'),
    'The second answer should be incorrect and selected'
  );
  T.notExists(
    assert,
    $hsText.find('li:eq(2).selected'),
    'The third answer should not be selected'
  );
});

test('Hot Spot Text Your Answer Correct', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HS_TXT',
    text: 'Sample Question HS_TXT',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: true, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ]),
    order: 2
  });

  var userAnswer = Ember.A(['1', '3']);

  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-hs-text question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $hsText = $component.find('.reports.assessment.questions.gru-hs-text');

  T.exists(
    assert,
    $hsText.find('li:eq(0).selected.correct'),
    'The first answer should be correct'
  );
  T.exists(
    assert,
    $hsText.find('li:eq(2).selected.correct'),
    'The third answer should be correct'
  );
  T.notExists(
    assert,
    $hsText.find('li.incorrect'),
    'Should not be incorrect answers at all'
  );
});

test('Hot Spot Text Anonymous', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HS_TXT',
    text: 'Sample Question HS_TXT',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: true, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ]),
    order: 2
  });

  var userAnswer = Ember.A(['1', '3']);

  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-hs-text question=question userAnswer=userAnswer anonymous=true}}`
  );
  const $component = this.$(); //component dom element
  const $hsText = $component.find('.reports.assessment.questions.gru-hs-text');

  T.exists(
    assert,
    $hsText.find('li:eq(0).selected.anonymous'),
    'The first answer should be anonymous'
  );
  T.exists(
    assert,
    $hsText.find('li:eq(2).selected.anonymous'),
    'The third answer should be anonymous'
  );
});
