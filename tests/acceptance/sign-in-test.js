import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';
import { KEY_CODES } from 'gooru-web/config/config';

moduleForAcceptance('Acceptance | sign-in', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: true,
      token: 'sign-in-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/sign-in');

  andThen(function() {
    assert.equal(currentURL(), '/sign-in');

    const $signInContainer = find('.sign-in');
    T.exists(assert, $signInContainer, 'Missing sign-in container');
    T.exists(
      assert,
      $signInContainer.find('.sign-in-wrapper'),
      'Missing sign-in-wrapper'
    );
    const $signInHeader = $signInContainer.find('.sign-in-header');
    T.exists(assert, $signInHeader, 'Missing sign-in-header');
    T.exists(assert, $signInHeader.find('h1'), 'Missing sign-in title');
    assert.equal(
      T.text($signInHeader.find('h1')),
      'Welcome Back!',
      'Incorrect sign-in title text'
    );
    T.exists(
      assert,
      $signInHeader.find('.description'),
      'Missing sign-in description'
    );
    assert.equal(
      T.text($signInHeader.find('.description')),
      'Learning is just around the corner.',
      'Incorrect sign-in description text'
    );
    T.exists(
      assert,
      $signInHeader.find('.google-button'),
      'Missing sign-in google button'
    );

    var $signInForm = $signInContainer.find('.sign-in-form form');
    T.exists(assert, $signInForm, 'Missing sign in form');
    T.exists(
      assert,
      $signInForm.find('.gru-input.username'),
      'Missing username field'
    );
    T.exists(
      assert,
      $signInForm.find('.gru-input.password'),
      'Missing password field'
    );
    T.exists(
      assert,
      $signInForm.find('div.forgot-password a'),
      'Missing forgot password link'
    );
    T.exists(
      assert,
      $signInForm.find('div.log-in-button button'),
      'Missing sign in button'
    );
  });
});

skip('Layout for Accessibility', function(assert) {
  visit('/sign-in');

  andThen(function() {
    assert.equal(currentURL(), '/sign-in');

    const $signInContainer = find('.sign-in');
    var $signInForm = $signInContainer.find('.sign-in-form form');

    var $label;
    var $input;

    var $usernameField = $signInForm.find('.username');
    $label = $usernameField.find('label');
    $input = $label.find('input');
    assert.equal(
      $label.attr('for'),
      $input.attr('id'),
      'The username input does not have a related label'
    );

    var $passwordField = $signInForm.find('.password');
    $label = $passwordField.find('label');
    $input = $label.find('input');
    assert.equal(
      $label.attr('for'),
      $input.attr('id'),
      'The password input does not have a related label'
    );
  });
});

skip('it shows an error message if the username field is left blank', function(assert) {
  visit('/sign-in');

  andThen(function() {
    assert.equal(currentURL(), '/sign-in');

    const $signInContainer = find('.sign-in');
    const $usernameField = $signInContainer.find('.gru-input.username');

    assert.ok(
      !$usernameField.find('.error-messages .error').length,
      'Username error message not visible'
    );

    // Try submitting without filling in data
    $signInContainer.find('button.submit-sign-in').click();

    return wait().then(function() {
      assert.ok(
        $usernameField.find('.error-messages .error').length,
        'Username error message visible'
      );
      // Fill in the input field
      $usernameField.find('input').val('Username');
      $usernameField.find('input').blur();

      return wait().then(function() {
        assert.ok(
          !$usernameField.find('.error-messages .error').length,
          'Username error message was hidden'
        );
      });
    });
  });
});

skip('it shows an error message if the password field is left blank', function(assert) {
  visit('/sign-in');

  andThen(function() {
    assert.equal(currentURL(), '/sign-in');

    const $signInContainer = find('.sign-in');
    const $passwordField = $signInContainer.find('.gru-input.password');

    assert.ok(
      !$passwordField.find('.error-messages .error').length,
      'Password error message not visible'
    );

    // Try submitting without filling in data
    $signInContainer.find('button.submit-sign-in').click();

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
skip('it shows an error message if the password and username field has only blank spaces', function(assert) {
  visit('/sign-in');

  andThen(function() {
    assert.equal(currentURL(), '/sign-in');

    const $signInContainer = find('.sign-in');
    const $usernameField = $signInContainer.find('.gru-input.username');

    assert.ok(
      !$usernameField.find('.error-messages .error').length,
      'Username error message not visible'
    );

    $usernameField.find('input').val('    ');
    $usernameField.find('input').blur();

    return wait().then(function() {
      assert.ok(
        $usernameField.find('.error-messages .error').length,
        'Username error message should be visible'
      );
      // Fill in the input field
      const $passwordField = $signInContainer.find('.gru-input.password');
      $passwordField.find('input').val('    ');
      $passwordField.find('input').blur();

      return wait().then(function() {
        assert.ok(
          $passwordField.find('.error-messages .error').length,
          'Password error message should be visible'
        );
      });
    });
  });
});

skip('Sign in after try with wrong credentials when press key Enter', function(assert) {
  visit('/sign-in');

  andThen(function() {
    assert.equal(currentURL(), '/sign-in');
    const $signInContainer = find('.controller.sign-in .sign-in-form');
    const $usernameField = $signInContainer.find('.gru-input.username');

    assert.ok(
      !$usernameField.find('.error-messages .error').length,
      'Username error message not visible'
    );

    $usernameField.find('input').val('');
    $usernameField.find('input').blur();
    const $passwordField = $signInContainer.find('.gru-input.password');
    $passwordField.find('input').val('pochita');
    // Try submitting without filling in data
    keyEvent($signInContainer, 'keyup', KEY_CODES.ENTER);
    andThen(function() {
      assert.ok(
        $usernameField.find('.error-messages .error').length,
        'Username error message should be visible'
      );
    });
  });
});
