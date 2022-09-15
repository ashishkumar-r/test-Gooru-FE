import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | reset-password', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: true,
      token: 'reset-password-token',
      user: {
        gooruUId: 'session-id',
        providedAt: Date.now()
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/reset-password');

  andThen(function() {
    assert.equal(currentURL(), '/reset-password');

    const $resetPasswordContainer = find('.reset-password');
    T.exists(
      assert,
      $resetPasswordContainer,
      'Missing reset-password container'
    );
    const $resetPasswordHeader = $resetPasswordContainer.find('.modal-header');
    T.exists(assert, $resetPasswordHeader, 'Missing modal-header');
    T.exists(assert, $resetPasswordHeader.find('h3'), 'Missing modal title');
    assert.equal(
      T.text($resetPasswordHeader.find('h3')),
      'Reset password',
      'Incorrect reset-password title text'
    );

    var $resetPasswordForm = $resetPasswordContainer.find(
      '.reset-password-form'
    );
    T.exists(assert, $resetPasswordForm, 'Missing reset password form');
    T.exists(
      assert,
      $resetPasswordForm.find('.gru-input.password'),
      'Missing password field'
    );
    T.exists(
      assert,
      $resetPasswordForm.find('.gru-input.rePassword'),
      'Missing confirm password field'
    );
    var $resetPasswordFooter = $resetPasswordContainer.find('.modal-footer');
    T.exists(assert, $resetPasswordFooter, 'Missing modal-footer');
    T.exists(
      assert,
      $resetPasswordFooter.find('a.cancel'),
      'Missing cancel button'
    );
    T.exists(
      assert,
      $resetPasswordFooter.find('div.submit-button button'),
      'Missing submit button'
    );
  });
});

skip('it shows an error message if the password field is left blank', function(assert) {
  visit('/reset-password');

  andThen(function() {
    assert.equal(currentURL(), '/reset-password');

    const $resetPasswordContainer = find('.reset-password');
    const $passwordField = $resetPasswordContainer.find('.gru-input.password');

    assert.ok(
      !$passwordField.find('.error-messages .error').length,
      'Password error message not visible'
    );

    // Try submitting without filling in data
    $resetPasswordContainer.find('button.submit').click();

    return wait().then(function() {
      assert.ok(
        $passwordField.find('.error-messages .error').length,
        'Password error message visible'
      );
      // Fill in the input field
      $passwordField.find('input').val('Password');
      $passwordField.find('input').blur();

      return wait().then(function() {
        assert.ok(
          !$passwordField.find('.error-messages .error').length,
          'Password error message was hidden'
        );
      });
    });
  });
});

skip('it shows an error message if the confirm password field is different than password', function(assert) {
  visit('/reset-password');

  andThen(function() {
    assert.equal(currentURL(), '/reset-password');

    const $resetPasswordContainer = find('.reset-password');
    const $passwordField = $resetPasswordContainer.find('.gru-input.password');
    const $confirmPasswordField = $resetPasswordContainer.find(
      '.gru-input.rePassword'
    );

    assert.ok(
      !$confirmPasswordField.find('.error-messages .error').length,
      'Confirm password error message not visible'
    );

    $passwordField.find('input').val('Password');
    // Try submitting without filling in data
    $resetPasswordContainer.find('button.submit').click();

    return wait().then(function() {
      assert.ok(
        $confirmPasswordField.find('.error-messages .error').length,
        'Confirm password error message visible'
      );
      // Fill in the input field
      $confirmPasswordField.find('input').val('Password');
      $confirmPasswordField.find('input').blur();

      return wait().then(function() {
        assert.ok(
          !$confirmPasswordField.find('.error-messages .error').length,
          'Confirm password error message was hidden'
        );
      });
    });
  });
});

skip('it shows an error message if the password and confirm password field has only blank spaces', function(assert) {
  visit('/reset-password');

  andThen(function() {
    assert.equal(currentURL(), '/reset-password');

    const $resetPasswordContainer = find('.reset-password');
    const $passwordField = $resetPasswordContainer.find('.gru-input.password');
    $passwordField.find('input').val('    ');
    $passwordField.find('input').blur();

    return wait().then(function() {
      assert.ok(
        $passwordField.find('.error-messages .error').length,
        'Password error message should be visible'
      );
      // Fill in the input field
      const $confirmPasswordField = $resetPasswordContainer.find(
        '.gru-input.rePassword'
      );
      $confirmPasswordField.find('input').val('    ');
      $confirmPasswordField.find('input').blur();

      return wait().then(function() {
        assert.ok(
          $confirmPasswordField.find('.error-messages .error').length,
          'Confirm password error message should be visible'
        );
      });
    });
  });
});
