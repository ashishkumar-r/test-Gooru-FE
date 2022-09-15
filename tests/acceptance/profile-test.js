import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | profile', {
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

skip('menu option \'about\' is selected when navigating directly to profile.about', function(assert) {
  visit('/id-for-pochita/about');

  andThen(function() {
    var $menu = find(
      '.controller.profile > .content > .gru-navigation-tabs > .profile-navigation > .category-menu '
    );
    assert.equal(currentURL(), '/id-for-pochita/about');
    assert.ok(
      $menu.find('.about').hasClass('selected'),
      'Menu option \'about\' should be selected'
    );
  });
});

skip('menu option \'network\' is selected when navigating directly to profile.network', function(assert) {
  visit('/id-for-pochita/network');

  andThen(function() {
    assert.equal(currentURL(), '/id-for-pochita/network');
  });
});

skip('menu option selection updates when navigating between sections', function(assert) {
  visit('/id-for-pochita/about');

  andThen(function() {
    assert.equal(currentURL(), '/id-for-pochita/about');

    andThen(function() {
      var $menu = find(
        '.controller.profile > .content > .gru-navigation-tabs > .profile-navigation > .category-menu '
      );

      assert.equal(currentURL(), '/id-for-pochita/about');
      assert.ok(
        $menu.find('.about').hasClass('selected'),
        'Menu option \'about\' should be selected'
      );

      click($menu.find('.followings'));
      andThen(function() {
        assert.equal(currentURL(), '/id-for-pochita/network/following');
        assert.ok(
          !$menu.find('.about').hasClass('selected'),
          'Menu option \'about\' should no longer be selected'
        );
      });
    });
  });
});

skip('follow button appears by default', function(assert) {
  visit('/param-123/about');
  andThen(function() {
    assert.equal(currentURL(), '/param-123/about');
  });
});

skip('click follow button', function(assert) {
  visit('/param-123/about');
  andThen(function() {
    assert.equal(currentURL(), '/param-123/about');
    andThen(function() {
      var $actions = find('.controller.profile .profile-info .actions');
      var $button = $actions.find('.follow');
      $button.on('click', function() {
        assert.ok(true, 'follow button was clicked!');
      });
    });
  });
});

skip('click unfollow button', function(assert) {
  visit('/param-123/about');
  andThen(function() {
    assert.equal(currentURL(), '/param-123/about');
    andThen(function() {
      var $actions = find('.controller.profile .profile-info .actions');
      var $button = $actions.find('.unfollow');
      $button.on('click', function() {
        assert.ok(true, 'unfollow button was clicked!');
      });
    });
  });
});
