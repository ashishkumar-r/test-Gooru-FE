import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';

moduleForComponent(
  'gru-question-options',
  'Integration | Component | resource options',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('gru-question-options-default', function(assert) {
  const selectedOptionType = Ember.A(['multiple-choice']);

  this.set('selectedOptionType', selectedOptionType);

  this.render(
    hbs`{{search/gru-question-options selectedOptionType=selectedOptionType}}`
  ); //render the component
  var $component = this.$(); //component dom element

  assert.expect(18); //making sure all asserts are called

  const $menuOptions = $component.find('.options');
  const $multipleChoiceButton = $menuOptions.find('.multiple-choice');
  T.exists(assert, $multipleChoiceButton, 'Missing multiple choice button');

  assert.equal(
    T.text($multipleChoiceButton.find('.text')),
    'Multiple Choice',
    'Incorrect multiple choice button text'
  );

  const $multipleAnswerButton = $menuOptions.find('.multiple-answer');
  T.exists(assert, $multipleAnswerButton, 'Missing multiple answer button');

  assert.equal(
    T.text($multipleAnswerButton.find('.text')),
    'Multiple Answer',
    'Incorrect multiple answer button text'
  );

  const $trueFalseButton = $component.find('.true-false');
  T.exists(assert, $trueFalseButton, 'Missing true-false button');

  assert.equal(
    T.text($trueFalseButton.find('.text')),
    'True or False',
    'Incorrect true-false button text'
  );

  const $fibButton = $component.find('.fib');
  T.exists(assert, $fibButton, 'Missing fib button');

  assert.equal(
    T.text($fibButton.find('.text')),
    'Fill in the Blank',
    'Incorrect fib button text'
  );

  const $htReorderButton = $component.find('.ht-reorder');
  T.exists(assert, $htReorderButton, 'Missing ht-reorder button');

  assert.equal(
    T.text($htReorderButton.find('.text')),
    'Drag & Drop Order',
    'Incorrect ht-reorder button text'
  );

  const $htHighlightButton = $component.find('.ht-highlight');
  T.exists(assert, $htHighlightButton, 'Missing ht-highlight button');

  assert.equal(
    T.text($htHighlightButton.find('.text')),
    'Hot-Text Highlight',
    'Incorrect ht-highlight button text'
  );

  const $hsTextButton = $component.find('.hs-text');
  T.exists(assert, $hsTextButton, 'Missing hs-text button');

  assert.equal(
    T.text($hsTextButton.find('.text')),
    'Multiple Select Text',
    'Incorrect hs-text button text'
  );

  const $hsImagestButton = $component.find('.hs-images');
  T.exists(assert, $hsImagestButton, 'Missing hs-images button');

  assert.equal(
    T.text($hsImagestButton.find('.text')),
    'Multiple Select Image',
    'Incorrect hs-images button text'
  );

  const $freeResponseButton = $component.find('.free-response');
  T.exists(assert, $freeResponseButton, 'Missing free response button');

  assert.equal(
    T.text($freeResponseButton.find('.text')),
    'Free Response',
    'Incorrect free response button text'
  );
});

test('search-filter-onMultipleChoiceClick', function(assert) {
  assert.expect(1); //making sure all asserts are called

  this.on('selectMenuOption', function(options) {
    assert.equal(
      options[0],
      'multiple-choice',
      'Incorrect multiple-choice option type'
    );
  });

  this.render(
    hbs`{{search/gru-question-options onSelectMenuOption='selectMenuOption'}}`
  );

  var $component = this.$(); //component dom element

  const $multipleChoiceOptionButton = $component.find(
    '.multiple-choice.btn-option'
  );

  $multipleChoiceOptionButton.click();
  assert.ok(
    !$multipleChoiceOptionButton.hasClass('selected'),
    'Missing multiple choice option selected'
  );
});
