import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'new-cards/gru-new-class-card',
  'Integration | Component | new-cards/gru new class card',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('new Class Card Layout', function(assert) {
  this.render(hbs`{{new-cards/gru-new-class-card}}`);

  var $component = this.$(); //component dom element

  const $newClassCard = $component.find('.gru-new-class-card');
  const $panel = $newClassCard.find('.panel');
  const $panelBody = $panel.find('.panel-body');
  const $panelFooter = $panel.find('.panel-footer');

  T.exists(assert, $newClassCard, 'Missing new class card section');
  T.exists(assert, $panel, 'Missing new class card panel');
  T.exists(assert, $panelBody, 'Missing new class card panel body');
  T.exists(assert, $panelFooter, 'Missing new class card panel footer');

  T.exists(assert, $panelBody.find('.image'), 'Missing card image');

  assert.ok($panelBody.find('.gru-input').length, 'class code input');

  assert.ok($panelFooter.find('.join-class-btn').length, 'new class button');
});

test('it shows an error message if the class code field is left blank and you blur it out', function(
  assert
) {
  this.render(hbs`{{new-cards/gru-new-class-card}}`);

  const $component = this.$(); //component dom element

  const $codeField = $component.find('.gru-input');

  assert.ok(
    !$codeField.find('.error-messages .error').length,
    'Username error message should not be visible'
  );

  $codeField.find('input').blur();
  return wait().then(function() {
    $codeField.find('input').val('Class code');
    $codeField.find('input').blur();

    return wait().then(function() {
      assert.ok(
        !$codeField.find('.error-messages .error').length,
        'Username error message was hidden'
      );
    });
  });
});

test('it shows an error message if the class code is invalid', function(
  assert
) {
  this.render(
    hbs`{{new-cards/gru-new-class-card validCode=null allowedButton=true}}`
  );

  const $component = this.$(); //component dom element

  const $codeField = $component.find('.gru-input');

  // Fill in the input field
  $codeField.find('input').val('class code');

  // Try submitting without filling in data
  $component.find('.join-class-btn').click();

  return wait().then(function() {
    assert.ok(
      $codeField.find('.error-messages .error').length,
      'Invalid code message should appear'
    );
  });
});

test('Disable spinner button after showing an error', function(assert) {
  assert.expect(2);

  this.on('createClass', function(code) {
    assert.equal(code, 'any', 'The event should be thrown');
  });

  this.render(
    hbs`{{new-cards/gru-new-class-card validCode=null allowedButton=true code='YDFCS4'}}`
  );

  const $component = this.$(); //component dom element

  const $codeField = $component.find('.gru-input');

  // Fill in the input field
  $codeField.find('input').val('Class code');

  // Try submitting without filling in data
  $component.find('.join-class-btn').click();

  return wait().then(function() {
    assert.ok(
      $codeField.find('.error-messages .error').length,
      'Invalid code message should appear'
    );
    assert.notOk(
      $component.find('.gru-spinner-button .has-spinner').length,
      'Spinner button should not appear'
    );
  });
});
