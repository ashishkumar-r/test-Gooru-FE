import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'class/analytics/performance/gru-data-picker',
  'Integration | Component | class/analytics/performance/gru data picker',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Data Picker Layout', function(assert) {
  assert.expect(7);

  this.render(hbs`{{class/analytics/performance/gru-data-picker }}`);

  const $component = this.$(); //component dom element
  const $dataPicker = $component.find('.gru-data-picker');

  T.exists(assert, $dataPicker, 'Missing performance data picker');

  const $options = $component.find('.option-picker li');
  assert.equal($options.length, 5, 'Incorrect number of options displayed');

  const $optionScore = $component.find('.option-picker li div.score');
  T.exists(assert, $optionScore, 'Missing Score option');

  const $optionCompletion = $component.find('.option-picker li div.completion');
  T.exists(assert, $optionCompletion, 'Missing Completion option');

  const $optionTime = $component.find('.option-picker li div.timeSpent');
  T.exists(assert, $optionTime, 'Missing Time option');

  const $optionReaction = $component.find('.option-picker li div.reaction');
  T.exists(assert, $optionReaction, 'Missing Reaction option');

  const $optionAttempt = $component.find('.option-picker li div.attempts');
  T.exists(assert, $optionAttempt, 'Missing Attempts option');
});

test('Data Picker Default', function(assert) {
  assert.expect(3);

  this.render(hbs`{{class/analytics/performance/gru-data-picker}}`);

  const $component = this.$(); //component dom element

  const $optionsActive = $component.find('input[checked]');
  assert.equal($optionsActive.length, 1, 'Incorrect number of checked options');

  const $optionScore = $component.find(
    '.option-picker li div.score input[checked]'
  );
  assert.ok($optionScore.length, 'Score option should be checked by default');

  const $optionCompletion = $component.find(
    '.option-picker li div.completion input[checked]'
  );
  assert.ok(
    !$optionCompletion.length,
    'Completion option should not be checked by default'
  );
});

test('Select option', function(assert) {
  assert.expect(1);

  this.on('parentAction', function(options) {
    assert.equal('score', options[0].get('value'));
  });

  this.render(
    hbs`{{class/analytics/performance/gru-data-picker onOptionsChange='parentAction'}}`
  );
  var $component = this.$(); //component dom element
  var $dataPicker = $component.find('.option-picker');
  $dataPicker.find('li:first-child input').click();
});

test('Verify selected option with specific max value', function(assert) {
  assert.expect(4);

  const max = 3;
  this.on('parentAction', function(options) {
    assert.ok(
      options.get('length') <= 3,
      'Selected options should be less than max'
    ); //this is called 4 times
  });

  this.set('max', max);

  this.render(
    hbs`{{class/analytics/performance/gru-data-picker max=max onOptionsChange='parentAction'}}`
  );
  var $component = this.$(); //component dom element
  var $dataPicker = $component.find('.option-picker');
  $dataPicker.find('li:eq(1) input').click(); //try select completion option
  $dataPicker.find('li:eq(0) input').click();
  $dataPicker.find('li:eq(2) input').click();
  $dataPicker.find('li:eq(3) input').click();
});

test('Verify that there is at least one selected', function(assert) {
  assert.expect(2);

  this.on('parentAction', function(selectedOptions) {
    assert.ok(
      selectedOptions.get('length') === 1,
      'Selected options should be equal than min'
    );
  });

  this.render(
    hbs`{{class/analytics/performance/gru-data-picker onOptionsChange='parentAction'}}`
  );
  var $component = this.$(); //component dom element
  var $dataPicker = $component.find('.option-picker');
  $dataPicker.find('li:eq(0) input').click(); //try unselected score
  $dataPicker.find('li:eq(1) input').click(); //change option
});
test('Verify the option can not be unselected when is readOnly', function(
  assert
) {
  assert.expect(1);

  const options = Ember.A([
    Ember.Object.create({
      value: 'score',
      selected: true,
      readOnly: true
    }),
    Ember.Object.create({
      value: 'completion',
      selected: true,
      readOnly: false
    }),
    Ember.Object.create({
      value: 'study-time',
      selected: true,
      readOnly: false
    }),
    Ember.Object.create({
      value: 'reaction',
      selected: false,
      readOnly: false
    }),
    Ember.Object.create({
      value: 'attempt',
      selected: false,
      readOnly: false
    })
  ]);
  const max = 3;
  this.set('options', options);
  this.set('max', max);

  this.render(
    hbs`{{class/analytics/performance/gru-data-picker  options=options max=max}}`
  );
  var $component = this.$(); //component dom element
  var $dataPicker = $component.find('.option-picker');
  $dataPicker.find('li:eq(1) input').click(); //Select completion
  $dataPicker.find('li:eq(0) input').click(); //try unselected score
  const $optionScore = $component.find(
    '.option-picker li div.score input[checked]'
  );
  assert.ok($optionScore.length, 'Score can not be unselected');
});

test('Do not show the option if is disabled', function(assert) {
  assert.expect(1);

  const options = Ember.A([
    Ember.Object.create({
      value: 'score',
      selected: true,
      readOnly: true,
      isDisabled: true
    }),
    Ember.Object.create({
      value: 'completion',
      selected: true,
      readOnly: false,
      isDisabled: false
    })
  ]);
  const max = 3;
  this.set('options', options);
  this.set('max', max);

  this.render(
    hbs`{{class/analytics/performance/gru-data-picker  options=options max=max}}`
  );
  var $component = this.$();
  const $options = $component.find('.option-picker li');
  assert.equal($options.length, 1, 'Should have only one option');
});
