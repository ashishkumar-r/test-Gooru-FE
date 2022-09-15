import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | profile about', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      'token-api3': 'about-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/id-for-pochita/about');

  andThen(function() {
    assert.equal(currentURL(), '/id-for-pochita/about');

    const $aboutContainer = find('.controller.about');
    T.exists(assert, $aboutContainer, 'Missing about container');
    T.exists(
      assert,
      $aboutContainer.find('.first-name'),
      'Missing user first name'
    );
    T.exists(
      assert,
      $aboutContainer.find('.last-name'),
      'Missing user last name'
    );
    T.exists(assert, $aboutContainer.find('.username'), 'Missing username');
    T.exists(assert, $aboutContainer.find('.bio'), 'Missing user biography');
    T.exists(assert, $aboutContainer.find('.role'), 'Missing user role');
    T.exists(assert, $aboutContainer.find('.school'), 'Missing user school');
    T.exists(
      assert,
      $aboutContainer.find('.district'),
      'Missing user district'
    );
    T.exists(assert, $aboutContainer.find('.country'), 'Missing user country');
    T.notExists(
      assert,
      $aboutContainer.find('.studentId'),
      'Student ID should not appear'
    );
  });
});
