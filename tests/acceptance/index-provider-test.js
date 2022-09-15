import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | index-provider', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      'token-api3': 'user-token',
      user: {
        gooruUId: 'other-123'
      }
    });
  }
});

skip('logged in as a provider and home-link button navigation', function(assert) {
  visit('/');

  andThen(function() {
    assert.equal(currentURL(), '/other-123/content/courses');
    const $contentNav = find('.content-navigation');
    click($contentNav.find('.collections a'));

    andThen(function() {
      assert.equal(currentURL(), '/other-123/content/collections');
      const $navHeader = find('.gru-header .navbar-header');
      click($navHeader.find('.home-link'));

      andThen(function() {
        assert.equal(currentURL(), '/other-123/content/courses');
      });
    });
  });
});
