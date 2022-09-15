import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | Content Classes Create Class', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'profile-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/content/classes/create');

  andThen(function() {
    assert.equal(currentURL(), '/content/classes/create');

    let $container = find('.controller.create-class');
    assert.ok($container.length, 'Container');
    assert.ok($container.find('.modal-header').length, 'Header is missing');
    assert.ok($container.find('.modal-body').length, 'Body is missing');
    assert.ok($container.find('.modal-footer').length, 'Footer is missing');

    const $classNameInput = $container.find('.class-name-input-container');
    assert.ok($classNameInput.length, 'Class name input container missing');
    assert.ok(
      $classNameInput.find('.gru-input.title').length,
      'Missing class name input'
    );

    const $conditionPrompt = $container.find('.condition-prompt');
    assert.ok($conditionPrompt.length, 'Missing condition prompt container');
    assert.equal(
      $container.find('.conditions label').length,
      2,
      'Number of edit sections'
    );

    assert.ok(
      $container.find('a.cancel-button').length,
      'Cancel button is missing'
    );
    assert.ok(
      $container.find('button.get-started-btn').length,
      'Get started button is missing'
    );
  });
});

skip('it shows an error message if the title field is left blank and you blur it out', function(assert) {
  visit('/content/classes/create');

  andThen(function() {
    assert.equal(currentURL(), '/content/classes/create');

    const $createClassContainer = find('.create-class');
    const $titleField = $createClassContainer.find('.gru-input.title');

    assert.ok(
      !$titleField.find('.error-messages .error').length,
      'Username error message should not be visible'
    );
    // Try submitting without filling in data
    $createClassContainer.find('button.get-started-btn').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Username error message should be visible'
      );
      // Fill in the input field
      $titleField.find('input').val('Username');
      $titleField.find('input').blur();

      return wait().then(function() {
        assert.ok(
          !$titleField.find('.error-messages .error').length,
          'Username error message was hidden'
        );
      });
    });
  });
});

skip('Create Class', function(assert) {
  visit('/content/classes/create');

  andThen(function() {
    assert.equal(currentURL(), '/content/classes/create');

    const $createClassContainer = find('.create-class');
    const $titleField = $createClassContainer.find('.gru-input.title');

    $titleField.find('input').val('Username');
    $titleField.find('input').blur();

    // Try submitting without filling in data
    $createClassContainer.find('button.get-started-btn').click();

    return wait().then(function() {
      assert.equal(
        currentURL(),
        '/teacher/class/2d84ab6c-10ee-4578-b89a-6b41c87dc9fc/course-map'
      );
    });
  });
});
