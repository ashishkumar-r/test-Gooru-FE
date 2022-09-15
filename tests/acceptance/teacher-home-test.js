import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | Teacher Home Landing page', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      'token-api3': 'user-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
    window.localStorage.setItem('id-for-pochita_logins', 1);
  }
});

skip('Layout', function(assert) {
  window.localStorage.setItem('id-for-pochita_logins', 3);
  visit('/teacher-home');

  andThen(function() {
    assert.equal(currentURL(), '/teacher-home');

    T.exists(assert, find('header.gru-header'), 'Header component not found');

    const $teacherContainer = find('.controller.teacher-landing');
    T.exists(assert, $teacherContainer, 'Missing teacher container');

    const $navigatorContainer = $teacherContainer.find('.teacher-navigator');
    T.exists(assert, $navigatorContainer, 'Missing teacher navigator');
  });
});
