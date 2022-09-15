import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | student/class/class-activities', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'student-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/student/class/class-for-pochita-as-student/class-activities');
  andThen(function() {
    assert.equal(
      currentURL(),
      '/student/class/class-for-pochita-as-student/class-activities'
    );

    const $container = find(
      '.student.class .controller.student.class.class-activities'
    );
    assert.ok($container.length, 'Missing class activities tab container');

    T.exists(
      assert,
      $container.find('.dca-content-list-container'),
      'Missing activities collections'
    );
  });
});
