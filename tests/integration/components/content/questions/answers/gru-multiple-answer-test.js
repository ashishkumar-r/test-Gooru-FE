import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';
import Answer from 'gooru-web/models/content/answer';

moduleForComponent(
  'content/questions/answers/gru-multiple-answer',
  'Integration | Component | content/questions/answers/gru multiple answer',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Multiple answer layout', function(assert) {
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
    hbs`{{content/questions/answers/gru-multiple-answer answers=answers}}`
  );
  var $component = this.$(); //component dom element
  assert.equal($component.find('.panel').length, 2, 'Number of answers');

  const $option = $component.find('.panel:eq(0)');
  assert.ok($option.find('.letter-container'), 'Answer letter missing');
  assert.ok($option.find('.answer-text'), 'Answer text missing');
  assert.ok(
    $option.find('.choice-answers'),
    'Choices answers container missing'
  );
  assert.equal(
    $option.find('.choice-answers span').length,
    2,
    'Choices answers icons missing'
  );
});

test('Multiple answer layout in edit mode', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: false
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-multiple-answer answers=answers editMode=true}}`
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
    assert.ok($option.find('.yes'), 'Correct button missing');
    assert.ok($option.find('.no'), 'Incorrect button missing');
    const $check = $component.find('.yes');
    $check.click();
    return wait().then(function() {
      assert.ok(
        $option.find('.check.yes.correct'),
        'The answer should be correct'
      );
    });
  });
});

test('Multiple answer change between yes and no in edit mode', function(
  assert
) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: false
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-multiple-answer answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  const $option = $component.find('.panel:eq(0)');
  const $yesButton = $option.find('button.yes');
  const $noButton = $option.find('button.no');
  assert.ok($noButton.hasClass('correct'), 'The no button should be selected');
  assert.notOk(
    $yesButton.hasClass('correct'),
    'The yes button should not be selected'
  );
  $yesButton.click();
  return wait().then(function() {
    assert.notOk(
      $noButton.hasClass('correct'),
      'The no button should not be selected'
    );
    assert.ok(
      $yesButton.hasClass('correct'),
      'The yes button should be selected'
    );
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
    hbs`{{content/questions/answers/gru-multiple-answer answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  var $option = $component.find('.panel');
  assert.equal($option.length, 2, 'Incorrect number of answer options');
  const $delete = $component.find('.panel:first button.delete');
  $delete.click();
  return wait().then(function() {
    var $option = $component.find('.panel');
    assert.equal($option.length, 1, 'Incorrect number of answers');
  });
});

test('Multiple answer, reach max answers', function(assert) {
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
    hbs`{{content/questions/answers/gru-multiple-answer answers=answers editMode=true}}`
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

test('Multiple answer layout in advanced editor', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: 'Option A',
      isCorrect: false
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-multiple-answer answers=answers editMode=true showAdvancedEditor=true}}`
  );
  var $component = this.$(); //component dom element

  const $option = $component.find('.panel:eq(0)');
  assert.ok(
    !$option.find('.delete i.delete').length,
    'Delete button should be hidden'
  );
  assert.ok(!$option.find('.yes').length, 'Correct button should be hidden');
  assert.ok(!$option.find('.no').length, 'Incorrect button should be hidden');
});
