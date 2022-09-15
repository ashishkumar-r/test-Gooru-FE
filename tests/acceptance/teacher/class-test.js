import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | teacher class', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'teacher-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/teacher/class/class-for-pochita-as-teacher');

  andThen(function() {
    assert.equal(currentURL(), '/teacher/class/class-for-pochita-as-teacher');

    const $classContainer = find('.teacher.class');
    T.exists(assert, $classContainer, 'Missing class container');
    T.exists(
      assert,
      $classContainer.find('> .gru-class-navbar'),
      'Missing class navigation component'
    );
    T.exists(
      assert,
      $classContainer.find('> .content'),
      'Missing class content'
    );

    const $classHeader = $classContainer.find('.header');
    T.exists(assert, $classHeader, 'Missing class header');
    T.exists(
      assert,
      $classHeader.find('.go-back-container .back-to'),
      'Missing back link'
    );
    T.exists(assert, $classHeader.find('h1'), 'Missing class title');
    assert.equal(
      T.text($classHeader.find('h1')),
      'Pochita As Teacher - With Course',
      'Incorrect class title text'
    );
  });
});

skip('Click on back link', function(assert) {
  visit('/teacher/class/class-for-pochita-as-teacher');
  andThen(function() {
    assert.equal(currentURL(), '/teacher/class/class-for-pochita-as-teacher');

    const $classContainer = find('.teacher.class');
    const $classHeader = $classContainer.find('.header');

    click($classHeader.find('.go-back-container .back-to'));
    andThen(function() {
      assert.equal(currentURL(), '/teacher-home');
    });
  });
});
