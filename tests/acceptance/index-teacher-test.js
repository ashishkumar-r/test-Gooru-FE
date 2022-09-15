import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | index-teacher', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      'token-api3': 'user-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('logged in as a teacher', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(
      currentURL(),
      '/teacher-home',
      'As a teacher, the landing page should be "/teacher-home"'
    );
  });
});

skip('logged in as a teacher and home-link button navigation', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(
      currentURL(),
      '/teacher-home',
      'As a teacher, the landing page should be "/teacher-home"'
    );
    const $navMenu = find('.gru-header .menu-navbar');
    click($navMenu.find('.profile-link a.profile'));

    andThen(function() {
      assert.equal(
        currentURL(),
        '/id-for-pochita/about',
        'Navigating to profile should display "/id-for-pochita/about"'
      );
      const $navHeader = find('.gru-header .navbar-header');
      click($navHeader.find('.home-link'));

      andThen(function() {
        assert.equal(
          currentURL(),
          '/teacher-home',
          'Home link should redirect to "/teacher" if the user is a teacher'
        );
      });
    });
  });
});
