import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import Answer from 'gooru-web/models/content/answer';

moduleForComponent(
  'content/questions/answers/gru-hs-image',
  'Integration | Component | content/questions/answers/gru hs image',
  {
    integration: true
  }
);

test('HS-Image answer layout in editing mode', function(assert) {
  const answers = Ember.A([]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-hs-image answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  const $newAnswer = $component.find('div.add-answer a');
  assert.ok($newAnswer.length, 'Add new answer choice button missing');
  $newAnswer.click();
  return wait().then(function() {
    assert.equal(
      $component.find('.hs-container').length,
      1,
      'Number of answers'
    );

    const $option = $component.find('.hs-container');
    assert.ok($option.find('.letter-container'), 'Answer letter missing');
    assert.ok($option.find('.gru-image'), 'Upload image missing');
    assert.ok(
      $option.find('.panel-footer .delete i.delete'),
      'Delete button missing'
    );
    assert.ok($option.find('.panel-footer .check'), 'Correct  button missing');
    const $check = $component.find('.panel-footer .check');
    $check.click();
    return wait().then(function() {
      assert.ok(
        $option.find('.panel-footer .correct .check'),
        'The answer should be correct'
      );
    });
  });
});

test('HS-Image answer view layout', function(assert) {
  const answers = Ember.A([
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: '122344',
      isCorrect: true
    }),
    Answer.create(Ember.getOwner(this).ownerInjection(), {
      text: '12344t',
      isCorrect: false
    })
  ]);

  this.set('answers', answers);

  this.render(
    hbs`{{content/questions/answers/gru-hs-image answers=answers editMode=false}}`
  );
  var $component = this.$(); //component dom element
  const $option = $component.find('.hs-container:eq(0)');
  assert.ok($option.find('.letter-container').length, 'Answer letter missing');
  assert.ok($option.find('.gru-image').length, 'Image missing');
  assert.ok(
    $option.find('.panel-footer .correct .check'.length),
    'Correct  check icon missing'
  );

  const $option2 = $component.find('.hs-container:eq(1)');
  assert.ok($option2.find('.letter-container').length, 'Answer letter missing');
  assert.ok($option2.find('.gru-image').length, 'Image missing');
  assert.notOk(
    $option2.find('.panel-footer .correct .check').length,
    'Correct  check icon should not appear'
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
    hbs`{{content/questions/answers/gru-hs-image answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  var $option = $component.find('.hs-container');
  assert.equal($option.length, 2, 'Incorrect number of answers options');
  const $newAnswer = $component.find('div.add-answer a');
  $newAnswer.click();
  return wait().then(function() {
    var $option = $component.find('.hs-container');
    assert.equal($option.length, 3, 'Incorrect number of answer');
  });
});
skip('Delete answer', function(assert) {
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
    hbs`{{content/questions/answers/gru-hs-image answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  var $option = $component.find('.hs-container');
  assert.equal($option.length, 2, 'Incorrect number of answer options');
  const $delete = $component.find('.hs-container:first-of-type button.delete');
  $delete.click();
  return wait().then(function() {
    var $option = $component.find('.hs-container');
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
    hbs`{{content/questions/answers/gru-hs-image answers=answers editMode=true}}`
  );
  var $component = this.$(); //component dom element
  assert.equal(
    $component.find('.panel-footer .check.correct').length,
    1,
    'Incorrect number of correct answer'
  );
  var $secondOption = $component.find('.hs-container:nth-child(2)');
  const $check = $secondOption.find('.panel-footer .check');
  assert.notOk($check.hasClass('correct'));
  $check.click();
  return wait().then(function() {
    assert.ok($check.hasClass('correct'));
    assert.equal(
      $component.find('.check.correct').length,
      2,
      'Incorrect number of correct answer'
    );
  });
});
