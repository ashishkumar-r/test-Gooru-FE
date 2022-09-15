import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | reports/student-collection-analytics', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'player-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Layout', function(assert) {
  assert.expect(5);
  visit(
    '/reports/student-collection-analytics?courseId=course-123&unitId=first-unit-id&lessonId=first-lesson-id&classId=class-for-pochita-as-teacher&collectionId=all-question-types-assessment-id&role=student&type=assessment'
  );

  let done = assert.async();
  andThen(function() {
    assert.equal(
      currentURL(),
      '/reports/student-collection-analytics?courseId=course-123&unitId=first-unit-id&lessonId=first-lesson-id&classId=class-for-pochita-as-teacher&collectionId=all-question-types-assessment-id&role=student&type=assessment'
    );
    const $reportContainer = find('.analytics.collection.student');
    T.exists(assert, $reportContainer, 'Missing student collection analytics');

    const $navigationContainer = $reportContainer.find('.navigation');
    T.exists(assert, $navigationContainer, 'Missing navigation container');
    T.exists(
      assert,
      $navigationContainer.find('button.back'),
      'Missing back button'
    );

    const $assessmentReport = $reportContainer.find('.gru-assessment-report');
    T.exists(
      assert,
      $assessmentReport,
      'Missing gru-assessment-report component'
    );
    done();
  });
});

skip('Layout-from IL', function(assert) {
  assert.expect(5);
  visit(
    '/reports/student-collection-analytics?courseId=course-123&unitId=first-unit-id&lessonId=first-lesson-id&collectionId=all-question-types-assessment-id&role=student&type=assessment'
  );

  let done = assert.async();
  andThen(function() {
    assert.equal(
      currentURL(),
      '/reports/student-collection-analytics?courseId=course-123&unitId=first-unit-id&lessonId=first-lesson-id&collectionId=all-question-types-assessment-id&role=student&type=assessment'
    );
    const $reportContainer = find('.analytics.collection.student');
    T.exists(assert, $reportContainer, 'Missing student collection analytics');

    const $navigationContainer = $reportContainer.find('.navigation');
    T.exists(assert, $navigationContainer, 'Missing navigation container');
    T.exists(
      assert,
      $navigationContainer.find('button.back'),
      'Missing back button'
    );

    const $assessmentReport = $reportContainer.find('.gru-assessment-report');
    T.exists(
      assert,
      $assessmentReport,
      'Missing gru-assessment-report component'
    );
    done();
  });
});
