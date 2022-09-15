import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | SignUp', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: true,
      token: 'player-token',
      user: {
        gooruUId: 'player-token-user-id'
      }
    });
  }
});

//test('Sign up test', function(assert) {
//
//  visit('/');
//  andThen(function() {
//
//    assert.equal(currentURL(), '/');
//
//    var $signUpLink = find('.sign-up-button');
//    var $modal = find(".gru-modal");
//
//    assert.ok(!$modal.hasClass('in'), "Modal should not be visible");
//
//    click($signUpLink);
//
//    andThen(function() {
//
//      $modal = find(".gru-modal");
//
//      assert.ok($modal.hasClass('in'), "Modal should be visible");
//
//      $signUpLink = find('.email-sign-up button.btn');
//
//      click($signUpLink);
//
//      andThen(function() {
//        var $signUpForm = $modal.find('.gru-user-sign-up');
//        var $signUpButton = $signUpForm.find('button.btn-sign-up');
//
//        click($signUpButton);
//
//        var $errorSpan;
//
//        $errorSpan = $signUpForm.find('.firstName span.error');
//
//        assert.ok($errorSpan, "First Name error message is not showing");
//
//
//         var $usernameInput = $signUpForm.find('.gru-input.username input');
//         var $emailInput = $signUpForm.find('.gru-input.email input');
//         var $passwordInput = $signUpForm.find('.gru-input.password input');
//         var $rePasswordInput = $signUpForm.find('.gru-input.rePassword input');
//
//         $errorSpan = $signUpForm.find('.lastName span.error');
//         assert.ok($errorSpan, "Last name error message is not showing");
//
//         $errorSpan = $signUpForm.find('.gru-radio span.error');
//         assert.ok($errorSpan, "Role error message is not showing");
//
//         //Username field
//         $errorSpan = $signUpForm.find('.username span.error');
//
//         assert.ok($errorSpan, "Username error message is not showing when empty");
//
//         fillIn($usernameInput, 'gooruTest$');
//         $usernameInput.trigger('blur');
//         $errorSpan = $signUpForm.find('.username span.error');
//         assert.ok($errorSpan, "Username accepted a symbol");
//
//         fillIn($usernameInput, 'Neque porro quisquam est qui dolorem ipsum quia dolor sit amet consectetur adipisci velit');
//         $usernameInput.trigger('blur');
//         $errorSpan = $signUpForm.find('.username span.error');
//         assert.ok($errorSpan, "Username accepted too many characters");
//
//         fillIn($usernameInput, 'go');
//         $usernameInput.trigger('blur');
//         $errorSpan = $signUpForm.find('.username span.error');
//         assert.ok($errorSpan, "Username accepted less than 4 characters");
//
//         // Datepicker date of birth field
//         $errorSpan = $signUpForm.find('.gru-datepicker span.error');
//
//         assert.ok($errorSpan, "Datepicker error message is not showing");
//
//         // Email field
//         $errorSpan = $signUpForm.find('.email span.error');
//
//         assert.ok($errorSpan, "Email error message is not showing");
//
//         fillIn($emailInput, 'notAnEmail.com'); // invalid format
//         $emailInput.trigger('blur');
//         $errorSpan = $signUpForm.find('.email span.error');
//         assert.ok($errorSpan, "Email accepted an invalid format");
//
//         // Password field
//         $errorSpan = $signUpForm.find('.password span.error');
//
//         assert.ok($errorSpan, "Password error message is not showing");
//
//         fillIn($passwordInput, '1234'); // less than 4
//         $passwordInput.trigger('blur');
//         $errorSpan = $signUpForm.find('.password span.error');
//         assert.ok($errorSpan, "Password is accepting less than 4 characters");
//
//         fillIn($passwordInput, '123456789012345678901');// more than 20
//         $passwordInput.trigger('blur');
//         $errorSpan = $signUpForm.find('.password span.error');
//         assert.ok($errorSpan, "Password is accepting more than 20 characters");
//
//         // Re-Password field
//         $errorSpan = $signUpForm.find('.rePassword span.error');
//
//         assert.ok($errorSpan, "RePassword error message is not showing");
//
//         fillIn($rePasswordInput, '1234'); // less than 4
//         $rePasswordInput.trigger('blur');
//         $errorSpan = $signUpForm.find('.rePassword span.error');
//         assert.ok($errorSpan, "RePassword error message is not showing");
//
//         fillIn($rePasswordInput, '123456789012345678901');//more than 20
//         $rePasswordInput.trigger('blur');
//         $errorSpan = $signUpForm.find('.rePassword span.error');
//         assert.ok($errorSpan, "RePassword error message is not showing");
//
//         fillIn($rePasswordInput, 'notTheSame');//passwords dont match
//         $rePasswordInput.trigger('blur');
//         $errorSpan = $signUpForm.find('.rePassword span.error');
//         assert.ok($errorSpan, "RePassword error message is not showing");
//
//
//      });
//    });
//  });
//});

skip('it shows error messages if username or email are taken', function(assert) {
  visit('/sign-up');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up');

    const $signUpContainer = find('.sign-up');
    const $emailField = $signUpContainer.find('.gru-input.email');
    const $usernameField = $signUpContainer.find('.gru-input.username');

    assert.ok(
      !find('.validation.error.email-error').length,
      'Email error message not visible'
    );
    assert.ok(
      !find('.validation.error.username-error').length,
      'Username error message not visible'
    );

    // Fill inputs to go through validations
    $signUpContainer.find('.gru-input input').val('testtest');
    $emailField.find('input').val('test@gooru.org');
    $usernameField.find('input').val('testtest');
    $signUpContainer
      .find('.selectpicker.months')
      .val('01')
      .change();
    $signUpContainer
      .find('.selectpicker.days')
      .val('01')
      .change();
    $signUpContainer
      .find('.selectpicker.years')
      .val('2000')
      .change();
    $signUpContainer.find('div.sign-up-button button').click();

    return wait().then(function() {
      assert.ok(
        find('.validation.error.email-error').length,
        'Email error message should be visible'
      );
      assert.ok(
        find('.validation.error.username-error').length,
        'Username error message should be visible'
      );
    });
  });
});
