import { moduleForComponent, test } from 'ember-qunit';
import Answer from 'gooru-web/models/content/answer';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'content/questions/answers/gru-hot-text-highlight',
  'Integration | Component | content/questions/answers/gru hot text highlight',
  {
    integration: true
  }
);

test('Hot Spot Text answer layout', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'The quick brown fox jumps over the lazy dog. [The end.]',
      type: 'text',
      isCorrect: true,
      highlightType: 'sentence'
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-hot-text-highlight answers=answers}}`
  );
  var $component = this.$(); //component dom element
  assert.ok(
    $component.find('.answer-instructions'),
    'Answer instructions missing'
  );
  assert.ok($component.find('.answer-text'), 'Answer text missing');
});

test('Hot Spot Text answer layout on edit mode', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'The quick brown fox jumps over the lazy dog. [The end.]',
      type: 'text',
      isCorrect: true,
      highlightType: 'sentence'
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-hot-text-highlight answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  assert.equal(
    $component.find('.form-group input').length,
    2,
    'Answer type radio buttons missing'
  );
  assert.ok(
    $component.find('.gru-textarea textarea'),
    'Answer textarea missing'
  );
});
