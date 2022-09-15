import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | reports/student-collection', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'player-token',
      user: {
        gooruUId: 'player-token-user-id'
      }
    });
  }
});

skip('Layout', function(assert) {
  assert.expect(2);
  visit(
    '/reports/student-collection?classId=just-a-class&collectionId=all-question-types-assessment-id&role=student&type=assessment'
  );

  let done = assert.async();
  andThen(function() {
    assert.equal(
      currentURL(),
      '/reports/student-collection?classId=just-a-class&collectionId=all-question-types-assessment-id&role=student&type=assessment'
    );
    const $reportContainer = find('.reports.qz-student-report');
    T.exists(assert, $reportContainer, 'Missing quizzes reports component');
    done();
  });
});
