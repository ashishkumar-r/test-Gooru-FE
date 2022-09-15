import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | sign-up', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: true,
      token: 'sign-up-token',
      user: {
        gooruUId: 'session-id'
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    var $modal = $signUpContainer.find('.modal');
    T.exists(assert, $modal, 'Missing sign-up modal');
    T.exists(assert, $modal.find('.modal-content'), 'Missing modal-content');
    T.notExists(
      assert,
      $modal.find('.modal-content.child-layout'),
      'modal-content child-layout should not be visible'
    );
    const $signUpHeader = $modal.find('.modal-header');
    T.exists(assert, $signUpHeader, 'Missing sign-up-header');
    T.exists(
      assert,
      $signUpHeader.find('.progress-dots'),
      'Missing progress-dots'
    );
    T.exists(assert, $signUpHeader.find('h1'), 'Missing sign-up title');
    assert.equal(
      T.text($signUpHeader.find('h1')),
      'Hello!',
      'Incorrect sign-up title text'
    );
    T.exists(
      assert,
      $signUpHeader.find('.description'),
      'Missing sign-up description'
    );
    assert.equal(
      T.text($signUpHeader.find('.description')),
      'We’re glad you’ve decided to join us.',
      'Incorrect sign-up description text'
    );
    T.exists(
      assert,
      $signUpHeader.find('.sign-in-description'),
      'Missing sign-in description'
    );
    T.exists(
      assert,
      $signUpHeader.find('.google-button'),
      'Missing sign-up google button'
    );

    const $signUpBody = $modal.find('.modal-body');
    var $signUpForm = $signUpBody.find('.sign-up-form form');
    T.exists(assert, $signUpForm, 'Missing sign up form');
    T.exists(
      assert,
      $signUpForm.find('.gru-input.username'),
      'Missing username field'
    );
    T.exists(
      assert,
      $signUpForm.find('.gru-select-date-picker'),
      'Missing gru-select-date-picker component'
    );
    T.exists(
      assert,
      $signUpForm.find('.gru-input.firstName'),
      'Missing firstName field'
    );
    T.exists(
      assert,
      $signUpForm.find('.gru-input.lastName'),
      'Missing lastName field'
    );
    T.exists(
      assert,
      $signUpForm.find('.gru-input.email'),
      'Missing email field'
    );
    T.exists(
      assert,
      $signUpForm.find('.gru-input.password'),
      'Missing password field'
    );
    T.exists(
      assert,
      $signUpForm.find('.gru-input.rePassword'),
      'Missing rePassword field'
    );
    T.exists(
      assert,
      $signUpForm.find('div.sign-up-button button'),
      'Missing sign in button'
    );
  });
});

skip('Layout for Accessibility', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    var $modal = $signUpContainer.find('.modal');
    T.exists(assert, $modal, 'Missing sign-up modal');
    T.exists(assert, $modal.find('.modal-content'), 'Missing modal-content');

    const $googleButtonContainer = $modal.find('.google-button');
    const $linkGoogleButton = $googleButtonContainer.parent('a');
    assert.equal(
      $linkGoogleButton.attr('role'),
      'button',
      'Google button does not have the role needed'
    );

    var $label;
    var $input;

    var $usernameField = $modal.find('.username');
    $label = $usernameField.find('label');
    $input = $label.find('input');
    assert.equal(
      $label.attr('for'),
      $input.attr('id'),
      'The username input does not have a related label'
    );
    assert.equal(
      $input.attr('aria-required'),
      'true',
      'The username input does not have the aria required attribute'
    );

    var $firstNameField = $modal.find('.firstName');
    $label = $firstNameField.find('label');
    $input = $label.find('input');
    assert.equal(
      $label.attr('for'),
      $input.attr('id'),
      'The first name input does not have a related label'
    );
    assert.equal(
      $input.attr('aria-required'),
      'true',
      'The first name input does not have the aria required attribute'
    );

    var $lastNameField = $modal.find('.lastName');
    $label = $lastNameField.find('label');
    $input = $label.find('input');
    assert.equal(
      $label.attr('for'),
      $input.attr('id'),
      'The last name input does not have a related label'
    );
    assert.equal(
      $input.attr('aria-required'),
      'true',
      'The last name input does not have the aria required attribute'
    );

    var $emailField = $modal.find('.email');
    $label = $emailField.find('label');
    $input = $label.find('input');
    assert.equal(
      $label.attr('for'),
      $input.attr('id'),
      'The email input does not have a related label'
    );
    assert.equal(
      $input.attr('aria-required'),
      'true',
      'The email input does not have the aria required attribute'
    );

    var $passwordField = $modal.find('.password');
    $label = $passwordField.find('label');
    $input = $label.find('input');
    assert.equal(
      $label.attr('for'),
      $input.attr('id'),
      'The password input does not have a related label'
    );
    assert.equal(
      $input.attr('aria-required'),
      'true',
      'The password input does not have the aria required attribute'
    );

    var $rePasswordField = $modal.find('.rePassword');
    $label = $rePasswordField.find('label');
    $input = $label.find('input');
    assert.equal(
      $label.attr('for'),
      $input.attr('id'),
      'The re password input does not have a related label'
    );
    assert.equal(
      $input.attr('aria-required'),
      'true',
      'The re password input does not have the aria required attribute'
    );
  });
});

skip('it shows error messages if the all fields are left blank', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $usernameField = $signUpContainer.find('.gru-input.username');
    const $birthDayField = $signUpContainer.find(
      '.gru-select-date-picker .birth-day-date'
    );
    const $firstNameField = $signUpContainer.find('.gru-input.firstName');
    const $lastNameField = $signUpContainer.find('.gru-input.lastName');
    const $emailField = $signUpContainer.find('.gru-input.email');
    const $passwordField = $signUpContainer.find('.gru-input.password');
    const $rePasswordField = $signUpContainer.find('.gru-input.rePassword');

    assert.ok(
      !$usernameField.find('.error-messages .error').length,
      'Username error message not visible'
    );
    assert.ok(
      !$birthDayField.find('.error-messages .error').length,
      'Birth day error message not visible'
    );
    assert.ok(
      !$firstNameField.find('.error-messages .error').length,
      'First name error message not visible'
    );
    assert.ok(
      !$lastNameField.find('.error-messages .error').length,
      'Last name error message not visible'
    );
    assert.ok(
      !$emailField.find('.error-messages .error').length,
      'Email error message not visible'
    );
    assert.ok(
      !$passwordField.find('.error-messages .error').length,
      'Password error message not visible'
    );
    assert.ok(
      !$rePasswordField.find('.error-messages .error').length,
      'Repassword error message not visible'
    );

    // Try submitting without filling in data
    $signUpContainer.find('button.submit-sign-up').click();

    return wait().then(function() {
      assert.ok(
        $usernameField.find('.error-messages .error').length,
        'Username error message visible'
      );
      assert.ok(
        $birthDayField.find('.error-messages .error').length,
        'Birth day error message visible'
      );
      assert.ok(
        $firstNameField.find('.error-messages .error').length,
        'First name error message visible'
      );
      assert.ok(
        $lastNameField.find('.error-messages .error').length,
        'Last name error message visible'
      );
      assert.ok(
        $emailField.find('.error-messages .error').length,
        'Email error message visible'
      );
      assert.ok(
        $passwordField.find('.error-messages .error').length,
        'Password error message visible'
      );
      assert.ok(
        $rePasswordField.find('.error-messages .error').length,
        'Repassword error message visible'
      );
    });
  });
});

skip('it shows an error message if the first name field is left blank', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $firstNameField = $signUpContainer.find('.gru-input.firstName');

    // Invalid
    $firstNameField.find('input').val('');
    $firstNameField.find('input').blur();
    return wait().then(function() {
      assert.ok(
        $firstNameField.find('.error-messages .error').length,
        'firstName error message visible'
      );
      // Valid
      $firstNameField.find('input').val('firstName');
      $firstNameField.find('input').blur();
      return wait().then(function() {
        assert.ok(
          !$firstNameField.find('.error-messages .error').length,
          'firstName error message was hidden'
        );
      });
    });
  });
});

skip('it shows an error message if the last name field has less than 2 characters', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $lastNameField = $signUpContainer.find('.gru-input.lastName');

    // Invalid
    $lastNameField.find('input').val('l');
    $lastNameField.find('input').blur();
    return wait().then(function() {
      assert.ok(
        $lastNameField.find('.error-messages .error').length,
        'lastName error message visible'
      );
      // Valid
      $lastNameField.find('input').val('lastName');
      $lastNameField.find('input').blur();
      return wait().then(function() {
        assert.ok(
          !$lastNameField.find('.error-messages .error').length,
          'lastName error message was hidden'
        );
      });
    });
  });
});

skip('it shows an error message if the email has incorrect format', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $emailField = $signUpContainer.find('.gru-input.email');

    // Invalid format
    $emailField.find('input').val('notAnEmail.com');
    $emailField.find('input').blur();

    return wait().then(function() {
      assert.ok(
        $emailField.find('.error-messages .error').length,
        'email error message visible'
      );
      // Valid format
      $emailField.find('input').val('jennifer@gooru.org');
      $emailField.find('input').blur();
      return wait().then(function() {
        assert.ok(
          !$emailField.find('.error-messages .error').length,
          'email error message was hidden'
        );
      });
    });
  });
});

skip('it shows an error message if the password and rePassword fields do not match', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $passwordField = $signUpContainer.find('.gru-input.password');
    const $rePasswordField = $signUpContainer.find('.gru-input.rePassword');

    assert.ok(
      !$rePasswordField.find('.error-messages .error').length,
      'rePassword error message not visible'
    );

    // Invalid format
    $passwordField.find('input').val('password');
    $rePasswordField.find('input').val('notTheSame');

    // Try submitting without filling in data
    $signUpContainer.find('button.submit-sign-up').click();

    return wait().then(function() {
      assert.ok(
        $rePasswordField.find('.error-messages .error').length,
        'passwords do not match'
      );
    });
  });
});

skip('first name field has blanks', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $firstNameField = $signUpContainer.find('.gru-input.firstName');

    // Has blanks should be valid too....so check for error not there
    $firstNameField.find('input').val('one first name');
    $firstNameField.find('input').blur();
    return wait().then(function() {
      assert.ok(
        !$firstNameField.find('.error-messages .error').length,
        'firstName error message visible'
      );
      // Valid
      $firstNameField.find('input').val('one-first-name');
      $firstNameField.find('input').blur();
      return wait().then(function() {
        assert.ok(
          !$firstNameField.find('.error-messages .error').length,
          'firstName error message was hidden'
        );
      });
    });
  });
});

skip('last name field has blanks and special characters', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $lastNameField = $signUpContainer.find('.gru-input.lastName');

    // Invalid
    $lastNameField.find('input').val('last #%name');
    $lastNameField.find('input').blur();
    return wait().then(function() {
      assert.ok(
        !$lastNameField.find('.error-messages .error').length,
        'lastName error message visible'
      );
      // Valid
      $lastNameField.find('input').val('lastname');
      $lastNameField.find('input').blur();
      return wait().then(function() {
        assert.ok(
          !$lastNameField.find('.error-messages .error').length,
          'lastName error message was hidden'
        );
      });
    });
  });
});

skip('it shows an error message if the username has reserved words', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $usernameField = $signUpContainer.find('.gru-input.username');

    // Invalid format
    $usernameField.find('input').val('home');
    $usernameField.find('input').blur();

    return wait().then(function() {
      assert.ok(
        $usernameField.find('.error-messages .error').length,
        'Username error message visible'
      );
      // Valid format
      $usernameField.find('input').val('skip');
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

skip('it finishes the sign up correctly and can navigate to home without issues', function(assert) {
  visit('/sign-up');
  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $usernameField = $signUpContainer.find('.gru-input.username');
    const $firstNameField = $signUpContainer.find('.gru-input.firstName');
    const $lastNameField = $signUpContainer.find('.gru-input.lastName');
    const $emailField = $signUpContainer.find('.gru-input.email');
    const $passwordField = $signUpContainer.find('.gru-input.password');
    const $confirmPasswordField = $signUpContainer.find(
      '.gru-input.rePassword'
    );
    // Invalid format
    $usernameField.find('input').val('anyusername');
    $firstNameField.find('input').val('javier');
    $lastNameField.find('input').val('perez');
    $emailField.find('input').val('anyusername@gooru.org');
    $passwordField.find('input').val('test1234@');
    $confirmPasswordField.find('input').val('test1234@');
    var $birthMonthsField = $signUpContainer.find(
      'select#months.selectpicker.months'
    );
    var $birthDaysField = $signUpContainer.find(
      'select#days.selectpicker.days'
    );
    var $birthYearsField = $signUpContainer.find(
      'select#years.selectpicker.years'
    );

    //Filling inputs
    $birthMonthsField.val('09');
    $birthDaysField.val('11');
    $birthYearsField.val('1980');

    // Try submitting without filling in data
    click($signUpContainer.find('button.submit-sign-up'));

    andThen(function() {
      assert.equal(currentURL(), '/sign-up-finish');
      visit('/teacher-home');
      andThen(function() {
        assert.equal(currentURL(), '/teacher-home');
      });
    });
  });
});

skip('Sign up as student', function(assert) {
  authenticateSession(this.application, {
    isAnonymous: true,
    token: 'student-token',
    user: {
      gooruUId: 'student-token'
    }
  });
  visit('/sign-up');
  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $usernameField = $signUpContainer.find('.gru-input.username');
    const $firstNameField = $signUpContainer.find('.gru-input.firstName');
    const $lastNameField = $signUpContainer.find('.gru-input.lastName');
    const $emailField = $signUpContainer.find('.gru-input.email');
    const $passwordField = $signUpContainer.find('.gru-input.password');
    const $confirmPasswordField = $signUpContainer.find(
      '.gru-input.rePassword'
    );
    // Invalid format
    $usernameField.find('input').val('anyusername');
    $firstNameField.find('input').val('javier');
    $lastNameField.find('input').val('perez');
    $emailField.find('input').val('anyusername@gooru.org');
    $passwordField.find('input').val('test1234@');
    $confirmPasswordField.find('input').val('test1234@');
    var $birthMonthsField = $signUpContainer.find(
      'select#months.selectpicker.months'
    );
    var $birthDaysField = $signUpContainer.find(
      'select#days.selectpicker.days'
    );
    var $birthYearsField = $signUpContainer.find(
      'select#years.selectpicker.years'
    );

    //Filling inputs
    $birthMonthsField.val('09');
    $birthDaysField.val('11');
    $birthYearsField.val('1980');

    // Try submitting without filling in data
    click($signUpContainer.find('button.submit-sign-up'));
    andThen(function() {
      assert.equal(currentURL(), '/sign-up-finish');
      const $signUpContainer = find('.sign-up .sign-up-finish-form');
      var $country = $signUpContainer.find('.gru-select select');
      fillIn($country, '2794ea94-d478-11e4-bfe7-22000abfab1d');
      triggerEvent($country, 'loaded.bs.select');
      triggerEvent($country, 'change');
      const $role = $signUpContainer.find('.roles .gru-radio:eq(1) input');
      click($role);
      andThen(function() {
        click($signUpContainer.find('button.submit-sign-up'));
      });
    });
  });
});

//TODO

//skip('it shows a child-layout when user is under 13 years old', function (assert) {
//  visit('/sign-up');
//
//  andThen(function() {
//    assert.equal(currentURL(), '/sign-up');
//
//
//    var $signUpContainer = find('.sign-up');
//    var $modal = $signUpContainer.find('.modal');
//
//    var $birthMonthsField = $signUpContainer.find('select#months.selectpicker.months');
//    var $birthDaysField = $signUpContainer.find('select#days.selectpicker.days');
//    var $birthYearsField = $signUpContainer.find('select#years.selectpicker.years');
//
//    //Filling inputs
//
//    $birthMonthsField.val('09');
//    $birthDaysField.val('11');
//    $birthYearsField.val('2004');
//
//    assert.ok($birthMonthsField.length, '$birthMonthsField');
//
//    $signUpContainer.find('.birth-day-date').blur();
//
//    return wait().then(function () {
//      assert.ok($modal.find('.modal-content.child-layout').length, 'modal-content child-layout should be visible');
//    });
//  });
//});
