import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';
import Answer from 'gooru-web/models/content/answer';

moduleForComponent(
  'content/questions/answers/gru-hs-text',
  'Integration | Component | content/questions/answers/gru hs text',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Hot Spot Text answer layout', function(assert) {
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

  this.render(hbs`{{content/questions/answers/gru-hs-text answers=answers}}`);
  var $component = this.$(); //component dom element
  assert.equal($component.find('.panel').length, 2, 'Number of answers');

  const $option = $component.find('.panel:eq(0)');
  assert.ok($option.find('.letter-container'), 'Answer letter missing');
  assert.ok($option.find('.answer-text'), 'Answer text missing');
  assert.ok($option.find('.correct-choice'), 'Correct icon missing');
});

test('Hot Spot Text answer layout in edit mode', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: false
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-hs-text answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  const $newAnswer = $component.find('div.add-answer a');
  assert.ok($newAnswer.length, 'Add new answer choice button missing');
  $newAnswer.click();
  return wait().then(function() {
    assert.equal($component.find('.panel').length, 2, 'Number of answers');

    const $option = $component.find('.panel:eq(0)');
    assert.ok($option.find('.letter-container'), 'Answer letter missing');
    assert.ok($option.find('.delete i.delete'), 'Delete button missing');
    assert.ok($option.find('.text-area-container'), 'Input area missing');
    assert.ok($option.find('.check'), 'Correct  button missing');
    const $check = $component.find('.check');
    $check.click();
    return wait().then(function() {
      assert.ok($option.find('.check.correct'), 'The answer should be correct');
    });
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
    hbs`{{content/questions/answers/gru-hs-text answers=answers editMode=true}}`
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

test('Hot Spot Text answer, reach max answers', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: false
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option B',
      isCorrect: false
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option C',
      isCorrect: false
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option D',
      isCorrect: false
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option E',
      isCorrect: false
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option F',
      isCorrect: false
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option G',
      isCorrect: false
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option H',
      isCorrect: false
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option I',
      isCorrect: false
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-hs-text answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  const $newAnswer = $component.find('div.add-answer a');
  assert.ok($newAnswer.length, 'Add new answer choice button missing');
  assert.notOk(
    $component.find('.max-length-error').length,
    'Max answers error must not exist'
  );
  $newAnswer.click();
  return wait().then(function() {
    assert.equal($component.find('.panel').length, 10, 'Number of answers');
    assert.ok(
      $component.find('.max-length-error').length,
      'Max answers error must exist'
    );

    $newAnswer.click();
    return wait().then(function() {
      assert.equal(
        $component.find('.panel').length,
        10,
        'Must not add new answer'
      );
    });
  });
});

test('Hot Spot Text answer layout in advanced editor', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: false
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-hs-text answers=answers editMode=true showAdvancedEditor=true}}`
  );
  var $component = this.$(); //component dom element
  const $option = $component.find('.panel:eq(0)');
  assert.ok(
    !$option.find('.delete i.delete').length,
    'Delete button should be hidden'
  );
  assert.ok(!$option.find('.check').length, 'Correct  button should be hidden');
});
