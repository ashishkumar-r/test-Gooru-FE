import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

moduleForComponent(
  'content/questions/answers/gru-open-ended',
  'Integration | Component | content/questions/answers/gru open ended',
  {
    integration: true
  }
);

test('it renders in view mode', function(assert) {
  const answers = Ember.A([]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-open-ended answers=answers }}`
  );
  var $component = this.$('.content.questions.answers.gru-open-ended'); //component dom element

  var $viewTextarea = $component.find('> .answer-text textarea');
  assert.ok($viewTextarea.length, 'View textarea');
  assert.ok($viewTextarea.prop('readonly'), 'View textarea is read-only');
  assert.equal($viewTextarea.text(), '', 'View textarea should be empty');
});

test('it renders in edit mode', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Ideal answer text'
    })
  ]);

  this.set('answers', answers);
  this.set('editMode', true);

  this.render(
    hbs`{{content/questions/answers/gru-open-ended answers=answers editMode=editMode}}`
  );
  var $component = this.$('.content.questions.answers.gru-open-ended'); //component dom element

  var $editTextarea = $component.find('> .text-area-container textarea');
  assert.ok($editTextarea.length, 'Edit textarea');
  assert.equal(
    $editTextarea.val(),
    answers[0].get('text'),
    'Edit textarea text'
  );
});
