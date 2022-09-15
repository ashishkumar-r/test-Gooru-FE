import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'content/modals/gru-join-class',
  'Integration | Component | content/modals/gru join class',
  {
    integration: true
  }
);

test('Layout', function(assert) {
  this.render(hbs`{{content/modals/gru-join-class}}`);

  const $component = this.$('.content.modal.gru-join-class');
  assert.ok($component.length, 'Component classes');

  const $header = $component.find('.modal-header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('h3.modal-title').length, 'Header title');
  assert.ok($header.find('p.lead').length, 'Header message');

  const $body = $component.find('.modal-body');
  assert.ok($body.length, 'Body');

  assert.ok(
    $body.find('.class-code-input-container .control-label').length,
    'Class code label'
  );
  assert.ok(
    $body.find('.join-terms-and-conditions').length,
    'Terms and conditions field'
  );

  const $footer = $component.find('.modal-footer');

  assert.equal($footer.find('a').length, 1, 'Number of action link');
  assert.equal($footer.find('button').length, 1, 'Number of button');
  assert.ok($footer.find('a.back-cta').length, 'Not now button');
  assert.ok($footer.find('.join-class-btn').length, 'Join class button');
});

test('it shows an error message if the class code field is left blank and you blur it out', function(
  assert
) {
  this.render(hbs`{{content/modals/gru-join-class}}`);

  const $component = this.$('.content.modal.gru-join-class');

  const $codeField = $component.find('.gru-input.code');

  assert.ok(
    !$codeField.find('.error-messages .error').length,
    'Username error message should not be visible'
  );
  // Try submitting without filling in data
  $component.find('.join-class-btn').click();

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

  this.render(hbs`{{content/modals/gru-join-class onJoinClass='joinClass'}}`);

  const $component = this.$('.content.modal.gru-join-class');

  const $codeField = $component.find('.gru-input.code');

  $codeField.find('input').val('any');
  $codeField.find('input').blur();
  $component.find('.join-class-btn').click();
});

test('it shows an error message if the class code is invalid', function(
  assert
) {
  this.render(hbs`{{content/modals/gru-join-class validCode=null}}`);

  const $component = this.$('.content.modal.gru-join-class');

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

  this.render(hbs`{{content/modals/gru-join-class onJoinClass='joinClass'}}`);

  const $component = this.$('.content.modal.gru-join-class');

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

  this.render(hbs`{{content/modals/gru-join-class validCode=null}}`);

  const $component = this.$('.content.modal.gru-join-class');

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
