import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

moduleForComponent(
  'content/questions/answers/gru-multiple-choice',
  'Integration | Component | content/questions/answers/gru multiple choice',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Multiple choice answer layout in editing mode', function(assert) {
  const answers = Ember.A([]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-multiple-choice answers=answers editMode=true}}`
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
    assert.ok($option.find('.check'), 'Correct  button missing');
    const $check = $component.find('.check');
    $check.click();
    return wait().then(function() {
      assert.ok($option.find('.check.correct'), 'The answer should be correct');
    });
  });
});

test('Multiple choice answer view layout', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: true
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option B',
      isCorrect: false
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-multiple-choice answers=answers editMode=false}}`
  );
  var $component = this.$(); //component dom element
  const $option = $component.find('.panel:eq(0)');
  assert.ok($option.find('.letter-container').length, 'Answer letter missing');
  assert.ok(
    $option.find('div.check i.done'.length),
    'Correct  check icon missing'
  );
  assert.ok(
    $option.find('div.check.correct').length,
    'The answer should be correct'
  );
  assert.ok(
    $option.find('.text-area-container p').length,
    'The answer text should be appear'
  );
});

test('Multiple choice answer max answers', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: true
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option B',
      isCorrect: false
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-multiple-choice answers=answers editMode=true maxAnswers=2}}`
  );
  var $component = this.$(); //component dom element
  assert.notOk(
    $component.find('div.add-answer a').length,
    'Add answer should be disabled'
  );
});

test('Load a list of answers and add new answer', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: true
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option B',
      isCorrect: false
    })
  ]);
  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-multiple-choice answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  var $option = $component.find('.panel');
  assert.equal($option.length, 2, 'Incorrect number of answers options');
  const $newAnswer = $component.find('div.add-answer a');
  $newAnswer.click();
  return wait().then(function() {
    var $option = $component.find('.panel');
    assert.equal($option.length, 3, 'Incorrect number of answer');
  });
});

test('Delete answer', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: true
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option B',
      isCorrect: false
    })
  ]);
  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-multiple-choice answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  var $option = $component.find('.panel');
  assert.equal($option.length, 2, 'Incorrect number of answer options');
  const $delete = $component.find('.panel:first-of-type button.delete');
  $delete.click();
  return wait().then(function() {
    var $option = $component.find('.panel');
    assert.equal($option.length, 1, 'Incorrect number of answers');
  });
});

test('Correct answer', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: true
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option B',
      isCorrect: false
    })
  ]);
  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-multiple-choice answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  assert.equal(
    $component.find('.check.correct').length,
    1,
    'Incorrect number of correct answer'
  );
  var $firstOption = $component.find('.panel:nth-child(2)');
  const $check = $firstOption.find('.check');
  assert.notOk($check.hasClass('correct'));
  $check.click();
  return wait().then(function() {
    assert.ok($check.hasClass('correct'));
    assert.equal(
      $component.find('.check.correct').length,
      1,
      'Incorrect number of correct answer'
    );
  });
});

test('Multiple choice answer layout in advanced editor', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: true
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-multiple-choice answers=answers editMode=true showAdvancedEditor=true}}`
  );
  var $component = this.$(); //component dom element
  const $option = $component.find('.panel:eq(0)');
  assert.ok(
    !$option.find('.delete i.delete').length,
    'Delete button should be hidden'
  );
  assert.ok(!$option.find('.check').length, 'Correct  button should be hidden');
});
