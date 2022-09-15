import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  '/reports/assessment/questions/gru-multiple-answer',
  'Integration | Component | /reports/assessment/questions/gru multiple answer',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Multiple Answer Correct Answer', function(assert) {
  var question = Ember.Object.create({
    questionType: 'MA',
    text: 'Sample Question MA',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: true, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ]),
    order: 2
  });

  var showCorrect = true;
  this.set('question', question);
  this.set('showCorrect', showCorrect);
  this.render(
    hbs`{{reports/assessment/questions/gru-multiple-answer question=question showCorrect=showCorrect}}`
  );
  const $component = this.$(); //component dom element
  const $multipleAnswer = $component.find(
    '.reports.assessment.questions.gru-multiple-answer'
  );

  T.exists(
    assert,
    $multipleAnswer.find(
      'li:eq(1) span.no-selected.correct i.radio_button_checked'
    ),
    'The first answer should be checked as no-selected and is correct'
  );
  T.exists(
    assert,
    $multipleAnswer.find(
      'li:eq(2) span.selected.correct i.radio_button_checked'
    ),
    'The second answer should be checked as selected and is correct'
  );
  T.exists(
    assert,
    $multipleAnswer.find(
      'li:eq(3) span.selected.correct i.radio_button_checked'
    ),
    'The third answer should be checked as selected and is correct'
  );
  T.notExists(
    assert,
    $multipleAnswer.find('li span.incorrect i.radio_button_checked'),
    'Should not be incorrect answers at all'
  );
});

test('Multiple Answer Your Answer Incorrect', function(assert) {
  var question = Ember.Object.create({
    questionType: 'MA',
    text: 'Sample Question MA',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: true, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ]),
    order: 2
  });

  var userAnswer = Ember.A([
    { id: '1', selection: false },
    { id: '2', selection: false },
    { id: '3', selection: true }
  ]);

  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-multiple-answer question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $multipleAnswer = $component.find(
    '.reports.assessment.questions.gru-multiple-answer'
  );

  T.exists(
    assert,
    $multipleAnswer.find(
      'li:eq(1) span.no-selected.correct i.radio_button_checked'
    ),
    'The first answer should be checked as no-selected and is correct'
  );
  T.exists(
    assert,
    $multipleAnswer.find('li:eq(2) span.no-selected.incorrect'),
    'The second answer should be checked as no-selected and is incorrect'
  );
  T.exists(
    assert,
    $multipleAnswer.find('li:eq(3) span.selected.correct'),
    'The third answer should be checked as selected and is correct'
  );
});

test('Multiple Answer Your Answer Correct', function(assert) {
  var question = Ember.Object.create({
    questionType: 'MA',
    text: 'Sample Question MA',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: true, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ]),
    order: 2
  });

  var userAnswer = Ember.A([
    { id: '1', selection: false },
    { id: '2', selection: true },
    { id: '3', selection: true }
  ]);

  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-multiple-answer question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $multipleAnswer = $component.find(
    '.reports.assessment.questions.gru-multiple-answer'
  );

  T.exists(
    assert,
    $multipleAnswer.find('li:eq(1) span.no-selected.correct'),
    'The first answer should be checked as no-selected and is correct'
  );
  T.exists(
    assert,
    $multipleAnswer.find('li:eq(2) span.selected.correct'),
    'The second answer should be checked as selected and is correct'
  );
  T.exists(
    assert,
    $multipleAnswer.find('li:eq(3) span.selected.correct'),
    'The third answer should be checked as selected and is correct'
  );
  T.notExists(
    assert,
    $multipleAnswer.find('li span.incorrect'),
    'Should not be incorrect answers at all'
  );
});

test('Multiple Answer anonymous', function(assert) {
  var question = Ember.Object.create({
    questionType: 'MA',
    text: 'Sample Question MA',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({ id: '1', isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: '2', isCorrect: true, text: 'Answer 2' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: 'Answer 3' })
    ]),
    order: 2
  });

  var userAnswer = Ember.A([
    { id: '1', selection: false },
    { id: '2', selection: true },
    { id: '3', selection: true }
  ]);

  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-multiple-answer question=question userAnswer=userAnswer anonymous=true}}`
  );
  const $component = this.$(); //component dom element
  const $multipleAnswer = $component.find(
    '.reports.assessment.questions.gru-multiple-answer'
  );

  T.exists(
    assert,
    $multipleAnswer.find('li:eq(1) span.anonymous'),
    'The first answer should be anonymous'
  );
  T.exists(
    assert,
    $multipleAnswer.find('li:eq(2) span.anonymous'),
    'The second answer should be anonymous'
  );
  T.exists(
    assert,
    $multipleAnswer.find('li:eq(3) span.anonymous'),
    'The third answer should be anonymous'
  );
});
