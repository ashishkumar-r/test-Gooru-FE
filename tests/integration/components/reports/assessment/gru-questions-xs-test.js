import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'reports/assessment/gru-questions-xs',
  'Integration | Component | reports/assessment/gru questions xs',
  {
    integration: true
  }
);

test('Questions Details Mobile Layout', function(assert) {
  assert.expect(6);

  const questions = Ember.A([
    Ember.Object.create({
      question: Ember.Object.create({
        text: 'This is a question 1',
        questionType: 'OE',
        order: 1
      }),
      correct: true,
      timeSpent: 10, //seconds
      reaction: 5,
      answer: 'answer'
    }),
    Ember.Object.create({
      question: Ember.Object.create({
        text: 'This is a question 2',
        questionType: 'OE',
        order: 2
      }),
      correct: false,
      timeSpent: 25, //seconds
      reaction: 2,
      answer: 'answer'
    })
  ]);

  this.set('questions', questions);
  this.render(hbs`{{reports/assessment/gru-questions-xs results=questions}}`);
  const $component = this.$(); //component dom element
  const $question = $component.find('.gru-questions-xs');

  T.exists(assert, $question, 'Missing questions-xs component');
  T.exists(
    assert,
    $question.find('.question-number'),
    'Missing question number column'
  );
  T.exists(
    assert,
    $question.find('.question-text'),
    'Missing question text column'
  );
  T.exists(
    assert,
    $question.find('.question-container'),
    'Missing question container'
  );
  T.exists(assert, $question.find('.question'), 'Missing question section');
  T.exists(assert, $question.find('.answer'), 'Missing answer section');
});
