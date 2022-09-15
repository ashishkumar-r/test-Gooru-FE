import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | player', {
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

skip('Layout - default to collection since parameter is not sent', function(assert) {
  assert.expect(2);
  visit('/player/all-resource-types-collection-id');

  andThen(function() {
    assert.equal(
      currentURL(),
      '/player/all-resource-types-collection-id?resourceId=image-resource-id&role=student'
    );

    const $playerContainer = find('.qz-player');
    T.exists(assert, $playerContainer, 'Missing quizzes player component');
  });
});
