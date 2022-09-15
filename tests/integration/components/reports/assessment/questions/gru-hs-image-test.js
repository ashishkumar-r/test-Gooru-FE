import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';
import { DEFAULT_IMAGES } from 'gooru-web/config/config';

moduleForComponent(
  'reports/assessment/questions/gru-hs-image',
  'Integration | Component | reports/assessment/questions/gru hs image',
  {
    integration: true
  }
);

test('Hot Spot Image Correct Answer', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        isCorrect: true,
        text:
          'http://qacdn.gooru.org/qalive/f000/2441/3272/4a12b833-9106-48ef-95b5-ac3ff73575ae.png'
      }),
      Ember.Object.create({ id: '2', isCorrect: false, text: '' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: '' })
    ]),
    order: 2
  });

  var showCorrect = true;
  this.set('question', question);
  this.set('showCorrect', showCorrect);
  this.render(
    hbs`{{reports/assessment/questions/gru-hs-image question=question showCorrect=showCorrect}}`
  );
  const $component = this.$(); //component dom element
  const $hsImage = $component.find(
    '.reports.assessment.questions.gru-hs-image'
  );

  T.exists(
    assert,
    $hsImage.find('li:eq(0) span.correct'),
    'The first answer should be correct'
  );
  assert.equal(
    $hsImage.find('li:eq(0) span img').prop('src'),
    'http://qacdn.gooru.org/qalive/f000/2441/3272/4a12b833-9106-48ef-95b5-ac3ff73575ae.png',
    'First image src does not coincide'
  );
  T.exists(
    assert,
    $hsImage.find('li:eq(2) span.correct'),
    'The third answer should be correct'
  );
  assert.ok(
    $hsImage
      .find('li:eq(2) span img')
      .prop('src')
      .indexOf(DEFAULT_IMAGES.QUESTION_PLACEHOLDER_IMAGE) >= 0,
    'Image with empty image value should have a placeholder image'
  );
  T.notExists(
    assert,
    $hsImage.find('li span.incorrect'),
    'Should not be incorrect answers at all'
  );
});

test('Hot Spot Image Your Answer Incorrect', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        isCorrect: true,
        text:
          'http://qacdn.gooru.org/qalive/f000/2441/3272/4a12b833-9106-48ef-95b5-ac3ff73575ae.png'
      }),
      Ember.Object.create({ id: '2', isCorrect: false, text: '' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: '' })
    ]),
    order: 2
  });

  var userAnswer = Ember.A(['1', '2']);

  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-hs-image question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $hsImage = $component.find(
    '.reports.assessment.questions.gru-hs-image'
  );

  T.exists(
    assert,
    $hsImage.find('li:eq(0) span.selected.correct'),
    'The first answer should be correct and selected'
  );
  T.exists(
    assert,
    $hsImage.find('li:eq(1) span.selected.incorrect'),
    'The second answer should be incorrect and selected'
  );
  T.exists(
    assert,
    $hsImage.find('li:eq(2) span.no-selected'),
    'The third answer should not be selected'
  );
});

test('Hot Spot Image Your Answer Correct', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        isCorrect: true,
        text:
          'http://qacdn.gooru.org/qalive/f000/2441/3272/4a12b833-9106-48ef-95b5-ac3ff73575ae.png'
      }),
      Ember.Object.create({ id: '2', isCorrect: false, text: '' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: '' })
    ]),
    order: 2
  });

  var userAnswer = Ember.A(['1', '3']);

  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-hs-image question=question userAnswer=userAnswer}}`
  );
  const $component = this.$(); //component dom element
  const $hsImage = $component.find(
    '.reports.assessment.questions.gru-hs-image'
  );

  T.exists(
    assert,
    $hsImage.find('li:eq(0) span.selected.correct'),
    'The first answer should be correct and selected'
  );
  T.exists(
    assert,
    $hsImage.find('li:eq(1) span.no-selected'),
    'The second answer should not be selected'
  );
  T.exists(
    assert,
    $hsImage.find('li:eq(2) span.selected.correct'),
    'The third answer should be correct and selected'
  );
  T.notExists(
    assert,
    $hsImage.find('li span.incorrect'),
    'Should not be incorrect answers at all'
  );
});

test('Hot Spot Image anonymous', function(assert) {
  var question = Ember.Object.create({
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        isCorrect: true,
        text:
          'http://qacdn.gooru.org/qalive/f000/2441/3272/4a12b833-9106-48ef-95b5-ac3ff73575ae.png'
      }),
      Ember.Object.create({ id: '2', isCorrect: false, text: '' }),
      Ember.Object.create({ id: '3', isCorrect: true, text: '' })
    ]),
    order: 2
  });

  var userAnswer = Ember.A(['1', '3']);

  this.set('question', question);
  this.set('userAnswer', userAnswer);

  this.render(
    hbs`{{reports/assessment/questions/gru-hs-image question=question userAnswer=userAnswer anonymous=true}}`
  );
  const $component = this.$(); //component dom element
  const $hsImage = $component.find(
    '.reports.assessment.questions.gru-hs-image'
  );

  T.exists(
    assert,
    $hsImage.find('li:eq(0) span.selected.anonymous'),
    'The first answer should be anonymous'
  );
  T.exists(
    assert,
    $hsImage.find('li:eq(1) span.no-selected'),
    'The second answer should not be selected'
  );
  T.exists(
    assert,
    $hsImage.find('li:eq(2) span.selected.anonymous'),
    'The third answer should be anonymous and selected'
  );
});
