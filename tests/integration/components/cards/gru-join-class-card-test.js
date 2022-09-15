import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'cards/gru-join-class-card',
  'Integration | Component | cards/gru join class card',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
      this.inject.service('i18n');
    }
  }
);

test('Join Class Card Layout', function(assert) {
  this.render(hbs`{{cards/gru-join-class-card}}`);

  var $component = this.$(); //component dom element

  const $joinClassCard = $component.find('.gru-join-class-card');
  const $panel = $joinClassCard.find('.panel');
  const $panelBody = $panel.find('.panel-body');
  const $panelFooter = $panel.find('.panel-footer');

  T.exists(assert, $joinClassCard, 'Missing join class card section');
  T.exists(assert, $panel, 'Missing join class card panel');
  T.exists(assert, $panelBody, 'Missing join class card panel body');
  T.exists(assert, $panelFooter, 'Missing join class card panel footer');

  T.exists(assert, $panelBody.find('.image'), 'Missing card image');

  assert.ok(
    $panelBody.find('.class-code-input-container .gru-input').length,
    'class code input'
  );
  assert.ok(
    $panelBody.find('.terms-and-conditions').length,
    'Terms and conditions field'
  );

  assert.ok($panelFooter.find('.join-class-btn').length, 'Join class button');
});

test('it shows an error message if the class code field is left blank and you blur it out', function(
  assert
) {
  this.render(hbs`{{cards/gru-join-class-card}}`);

  const $component = this.$(); //component dom element

  const $codeField = $component.find('.gru-input.code');

  assert.ok(
    !$codeField.find('.error-messages .error').length,
    'Username error message should not be visible'
  );

  $codeField.find('input').blur();
  return wait().then(function() {
    assert.ok(
      $codeField.find('.error-messages .error').length,
      'Username error message should be visible'
    );
    // Fill in the input field
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

test('onJoinClass event', function(assert) {
  assert.expect(1);

  this.on('joinClass', function(code) {
    assert.equal(code, 'any', 'The event should be thrown');
  });

  this.render(hbs`{{cards/gru-join-class-card onJoinClass='joinClass'}}`);

  const $component = this.$(); //component dom element

  const $codeField = $component.find('.gru-input.code');

  $codeField.find('input').val('any');
  $codeField.find('input').blur();
  $component.find('.join-class-btn').click();
});

test('it shows an error message if the class code is invalid', function(
  assert
) {
  this.render(
    hbs`{{cards/gru-join-class-card validCode=null allowedButton=true}}`
  );

  const $component = this.$(); //component dom element

  const $codeField = $component.find('.gru-input.code');

  // Fill in the input field
  $codeField.find('input').val('Class code');

  // Try submitting without filling in data
  $component.find('.join-class-btn').click();

  return wait().then(function() {
    assert.ok(
      $codeField.find('.error-messages .error').length,
      'Invalid code message should appear'
    );
  });
});

test('show spinner button component while the server response, after clicking on join button', function(
  assert
) {
  assert.expect(2);

  this.on('joinClass', function(code) {
    assert.equal(code, 'any', 'The event should be thrown');
  });

  this.render(
    hbs`{{cards/gru-join-class-card onJoinClass='joinClass' allowedButton=true}}`
  );

  const $component = this.$(); //component dom element

  const $codeField = $component.find('.gru-input.code');

  $codeField.find('input').val('any');
  $codeField.find('input').blur();
  $component.find('.join-class-btn').click();

  return wait().then(function() {
    assert.ok(
      $component.find('.gru-spinner-button .has-spinner').length,
      'Spinner button should appear'
    );
  });
});

test('Disable spinner button after showing an error', function(assert) {
  assert.expect(2);

  this.on('joinClass', function(code) {
    assert.equal(code, 'any', 'The event should be thrown');
  });

  this.render(
    hbs`{{cards/gru-join-class-card validCode=null allowedButton=true}}`
  );

  const $component = this.$(); //component dom element

  const $codeField = $component.find('.gru-input.code');

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
