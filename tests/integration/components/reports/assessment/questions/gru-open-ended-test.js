import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'reports/assessment/questions/gru-open-ended',
  'Integration | Component | reports/assessment/questions/gru-open-ended',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Open ended Layout showing correct answer', function(assert) {
  assert.expect(2);

  var showCorrect = true;
  this.set(
    'question',
    Ember.Object.create({
      answers: [
        {
          text: 'Correct answer'
        }
      ]
    })
  );
  this.set('showCorrect', showCorrect);

  this.render(
    hbs`{{reports/assessment/questions/gru-open-ended showCorrect=showCorrect question=question}}`
  );

  const $component = this.$(); //component dom element
  const $answer = $component.find('.answer');

  T.exists(assert, $answer, 'Missing answer');
  assert.equal(T.text($answer), 'Correct answer', 'Wrong correct answer');
});

test('Open ended Layout showing user answer', function(assert) {
  assert.expect(2);

  this.set('question', 'fake');
  this.set('answer', 'My Answer');

  this.render(
    hbs`{{reports/assessment/questions/gru-open-ended question=question userAnswer=answer}}`
  );

  const $component = this.$(); //component dom element
  const $answer = $component.find('.answer');

  T.exists(assert, $answer, 'Missing answer');
  assert.equal(T.text($answer), 'My Answer', 'Wrong answer text');
});

test('Open ended Layout when no answer provided', function(assert) {
  assert.expect(2);

  this.set('question', 'fake');

  this.render(
    hbs`{{reports/assessment/questions/gru-open-ended question=question userAnswer=answer}}`
  );

  const $component = this.$(); //component dom element
  const $answer = $component.find('.answer');

  T.exists(assert, $answer, 'Missing answer');
  assert.equal(T.text($answer), '', 'Wrong answer text');
});

test('Open ended Layout supporting math', function(assert) {
  this.set('question', 'fake');
  this.set('answer', 'My Answer');

  this.render(
    hbs`{{reports/assessment/questions/gru-open-ended question=question userAnswer=answer}}`
  );

  const $component = this.$();
  const $math = $component.find('.gru-math-text');

  T.exists(assert, $math, 'Missing math support');
});
