import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | forgot-password', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: true,
      token: 'forgot-password-token',
      'token-api3': 'forgot-password-token',
      user: {
        gooruUId: 'session-id',
        providedAt: Date.now()
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/forgot-password');

  andThen(function() {
    assert.equal(currentURL(), '/forgot-password');

    const $forgotPasswordContainer = find('.forgot-password');
    var $modal = $forgotPasswordContainer.find('.modal');
    T.exists(assert, $modal, 'Missing forgot-password modal');
    T.exists(
      assert,
      $modal.find('.modal-content.first-step'),
      'Missing modal-content first-step'
    );
    T.notExists(
      assert,
      $modal.find('.modal-content.second-step'),
      'modal-content second-step should be hidden'
    );
    const $forgotPasswordHeader = $modal.find('.modal-header');
    T.exists(assert, $forgotPasswordHeader, 'Missing forgot-password-header');
    T.exists(
      assert,
      $forgotPasswordHeader.find('h3'),
      'Missing forgot-password title'
    );
    assert.equal(
      T.text($forgotPasswordHeader.find('h3')),
      'Forgot your password?',
      'Incorrect forgot-password title text'
    );
    T.exists(
      assert,
      $forgotPasswordHeader.find('.description'),
      'Missing forgot-password description'
    );
    assert.equal(
      T.text($forgotPasswordHeader.find('.description')),
      'It happens to all of us.',
      'Incorrect forgot-password description text'
    );

    const $forgotPasswordBody = $modal.find('.modal-body');
    var $forgotPasswordForm = $forgotPasswordBody.find(
      '.forgot-password-form form'
    );
    T.exists(assert, $forgotPasswordForm, 'Missing sign up form');
    T.exists(
      assert,
      $forgotPasswordForm.find('.gru-input.email'),
      'Missing email field'
    );
    T.exists(
      assert,
      $forgotPasswordForm.find('.footer-description'),
      'Missing footer-description div'
    );
    T.exists(
      assert,
      $forgotPasswordForm.find('div.submit-button button'),
      'Missing submit button'
    );
  });
});

skip('it shows an error message if the email field is left blank', function(assert) {
  visit('/forgot-password');

  andThen(function() {
    assert.equal(currentURL(), '/forgot-password');

    const $forgotPasswordContainer = find('.forgot-password');
    const $emailField = $forgotPasswordContainer.find('.gru-input.email');

    assert.ok(
      !$emailField.find('.error-messages .error').length,
      'Email error message not visible'
    );

    // Try submitting without filling in data
    $forgotPasswordContainer.find('div.submit-button button').click();

    return wait().then(function() {
      assert.ok(
        $emailField.find('.error-messages .error').length,
        'Email error message visible'
      );
      // Fill in the input field
      $emailField.find('input').val('test@gooru.cr');
      $emailField.find('input').blur();

      return wait().then(function() {
        assert.ok(
          !$emailField.find('.error-messages .error').length,
          'Email error message was hidden'
        );
      });
    });
  });
});

skip('it shows an error message if the email is wrong', function(assert) {
  visit('/forgot-password');

  authenticateSession(this.application, {
    isAnonymous: true,
    'token-api3': 'fail-token',
    user: {
      gooruUId: 'session-id'
    }
  });

  andThen(function() {
    assert.equal(currentURL(), '/forgot-password');

    let $forgotPasswordContainer = find('.forgot-password-form');
    const $emailField = $forgotPasswordContainer.find('.gru-input.email');

    assert.ok(
      !$forgotPasswordContainer.find('.validation.error.email-error').length,
      'Email error message not visible'
    );

    fillIn($emailField.find('input'), 'test@gooru.org');
    click($forgotPasswordContainer.find('div.submit-button button'));

    andThen(function() {
      $forgotPasswordContainer = find('.forgot-password-form');
      assert.ok(
        $forgotPasswordContainer.find('.validation.error.email-error').length,
        'Email error message should be visible'
      );
    });
  });
});
