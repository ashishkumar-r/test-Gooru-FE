import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

moduleForComponent(
  'content/questions/answers/gru-reorder',
  'Integration | Component | content/questions/answers/gru reorder',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Reorder answer layout', function(assert) {
  const answers = Ember.A([]);

  this.set('answers', answers);
  this.set('editMode', true);

  this.render(
    hbs`{{content/questions/answers/gru-reorder answers=answers editMode=editMode}}`
  );
  var $component = this.$(); //component dom element
  const $newAnswer = $component.find('div.add-answer a');
  assert.ok($newAnswer.length, 'Add new answer choice button missing');
  $newAnswer.click();
  return wait().then(function() {
    assert.equal($component.find('.panel').length, 1, 'Number of answers');

    const $option = $component.find('.panel:eq(0)');
    assert.ok($option.find('.letter-container'), 'Answer letter missing');
    assert.ok($option.find('.delete i.delete'), 'Delete button missing');
  });
});

test('Load a list of answers and add new answer', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A'
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option B'
    })
  ]);
  this.set('answers', answers);
  this.set('editMode', true);

  this.render(
    hbs`{{content/questions/answers/gru-reorder answers=answers editMode=editMode}}`
  );
  var $component = this.$(); //component dom element
  var $option = $component.find('.panel');
  assert.equal($option.length, 2, 'Incorrect number of answers');
  const $newAnswer = $component.find('div.add-answer a');
  $newAnswer.click();
  return wait().then(function() {
    var $option = $component.find('.panel');
    assert.equal($option.length, 3, 'Incorrect number of answer after adding');
  });
});

test('Delete answer', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A'
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option B'
    })
  ]);
  this.set('answers', answers);
  this.set('editMode', true);

  this.render(
    hbs`{{content/questions/answers/gru-reorder answers=answers editMode=editMode}}`
  );
  var $component = this.$(); //component dom element
  var $option = $component.find('.panel');
  assert.equal($option.length, 2, 'Incorrect number of answers');
  const $delete = $component.find('.panel:first-of-type button.delete');
  $delete.click();
  return wait().then(function() {
    var $option = $component.find('.panel');
    assert.equal(
      $option.length,
      1,
      'Incorrect number of answers after deleting'
    );
  });
});

test('Unable to add more than a certain number of answers', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A'
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option B'
    })
  ]);

  this.set('answers', answers);
  this.render(
    hbs`{{content/questions/answers/gru-reorder answers=answers editMode=true maxAnswers=2}}`
  );
  var $component = this.$(); //component dom element
  assert.notOk($component.find('.add-answer').length, 'Add answers link');
});

test('Reorder answers layout in advanced editor', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A'
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-reorder answers=answers editMode=true showAdvancedEditor=true}}`
  );
  var $component = this.$(); //component dom element
  var $option = $component.find('.panel');
  assert.ok(
    !$option.find('.delete i.delete').length,
    'Delete button should be hidden'
  );
});
