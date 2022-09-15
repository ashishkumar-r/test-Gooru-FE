import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | profile network followers', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'followers-network-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/id-for-pochita/network/followers');

  andThen(function() {
    assert.equal(currentURL(), '/id-for-pochita/network/followers');

    const $contentCourseContainer = find('.controller.network-followers');
    T.exists(
      assert,
      $contentCourseContainer,
      'Missing network followers container'
    );

    const cards = $contentCourseContainer.find('.followers .card');
    assert.equal(cards.length, 6, 'Missing cards');
  });
});
