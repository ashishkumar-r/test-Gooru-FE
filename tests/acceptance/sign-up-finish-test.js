import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | sign-up-finish', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'sign-up-token',
      user: {
        gooruUId: 'id-for-pochita',
        isNew: true
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/sign-up-finish');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up-finish');

    const $signUpContainer = find('.sign-up');
    var $modal = $signUpContainer.find('.modal');
    T.exists(assert, $modal, 'Missing sign-up modal');
    T.exists(assert, $modal.find('.modal-content'), 'Missing modal-content');
    const $signUpHeader = $modal.find('.modal-header');
    T.exists(assert, $signUpHeader, 'Missing sign-up-header');
    T.exists(
      assert,
      $signUpHeader.find('.progress-dots'),
      'Missing progress-dots'
    );
    T.exists(assert, $signUpHeader.find('h3'), 'Missing sign-up-finish title');
    assert.equal(
      T.text($signUpHeader.find('h3')),
      'Basic Info',
      'Incorrect sign-up-finish title text'
    );
    T.exists(
      assert,
      $signUpHeader.find('.description'),
      'Missing sign-up-finish description'
    );
    assert.equal(
      T.text($signUpHeader.find('.description')),
      'You’re not basic, but this info is.',
      'Incorrect sign-up-finish description text'
    );

    const $signUpBody = $modal.find('.modal-body');
    var $signUpForm = $signUpBody.find('.sign-up-finish-form form');
    T.exists(assert, $signUpForm, 'Missing sign up form');
    T.exists(assert, $signUpForm.find('.roles'), 'Missing roles radios');
    assert.equal(
      find('.roles .gru-radio').length,
      3,
      'Missing roles gru-radio components'
    );
    T.exists(
      assert,
      $signUpForm.find('.gru-select'),
      'Missing gru-select component of countries'
    );
  });
});

skip('it shows error messages if the all fields are left blank', function(assert) {
  visit('/sign-up-finish');

  andThen(function() {
    assert.equal(currentURL(), '/sign-up-finish');

    const $signUpContainer = find('.sign-up');
    const $rolesField = $signUpContainer.find('.role');
    const $countrySelect = $signUpContainer.find('.gru-select');

    assert.ok(
      !$rolesField.find('.error-messages .error').length,
      'Roles error message not visible'
    );
    assert.ok(
      !$countrySelect.find('.error-messages .error').length,
      'Country error message not visible'
    );

    // Try submitting without filling in data
    $signUpContainer.find('button.submit-sign-up').click();

    return wait().then(function() {
      assert.ok(
        $rolesField.find('.error-messages .error').length,
        'Roles error message visible'
      );
      assert.ok(
        $countrySelect.find('.error-messages .error').length,
        'Country error message visible'
      );
    });
  });
});
