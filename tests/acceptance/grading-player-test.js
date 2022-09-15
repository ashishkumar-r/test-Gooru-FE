import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | grading-player', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'class-token',
      user: {
        gooruUId: 'class-token-user-id'
      }
    });
  }
});

skip('Layout', function(assert) {
  visit(
    '/grading?classId=class-id&courseId=course-id&collectionId=collection-id&questionId=question-id'
  );
  andThen(function() {
    assert.equal(
      currentURL(),
      '/grading?classId=class-id&courseId=course-id&collectionId=collection-id&questionId=question-id'
    );

    const $gradingContainer = find('.teacher.grading');
    const $rosterHeader = $gradingContainer.find('.header .gru-roster-header');

    const $taskHeader = $gradingContainer.find('.header .gru-task-header');
    const $response = $gradingContainer.find('.question-response');
    T.exists(assert, $gradingContainer, 'Missing grading container');
    T.exists(
      assert,
      $gradingContainer.find('.response-panel'),
      'Missing response panel'
    );
    T.exists(
      assert,
      $gradingContainer.find('.go-back-container'),
      'Missing go back link'
    );
    T.exists(assert, $rosterHeader, 'Missing roster header');

    assert.ok(
      T.text($rosterHeader.find('.current-response')).includes(
        'Profile Number 1'
      ),
      'Wrong text in current response'
    );
    assert.ok(
      T.text($rosterHeader.find('.time-spent')).includes('5s'),
      'Wrong text in time spent'
    );
    T.exists(assert, $taskHeader, 'Missing task header');
    assert.ok(
      T.text($taskHeader.find('.prompt-text')).includes(
        'Enter question text here'
      ),
      'Wrong text prompt text'
    );
    T.exists(assert, $response, 'Missing question response');
    assert.ok(
      T.text($response).includes('TBD - How will it be obtained and displayed'),
      'Wrong question response'
    );
    T.exists(
      assert,
      $gradingContainer.find('.gru-rubric-panel'),
      'Missing rubric panel'
    );
  });
});

skip('Student prompt', function(assert) {
  visit(
    '/grading?classId=class-id&courseId=course-id&collectionId=collection-id&questionId=question-id'
  );
  andThen(function() {
    assert.equal(
      currentURL(),
      '/grading?classId=class-id&courseId=course-id&collectionId=collection-id&questionId=question-id'
    );
    const $rosterHeader = find('.header .gru-roster-header');
    const $rosterButton = $rosterHeader.find('.btn-roster');
    click($rosterButton);
    andThen(function() {
      const $studentRoster = find('.grading.gru-student-roster');
      T.exists(assert, $studentRoster, 'Missing student roster');
      assert.ok(
        T.text($rosterHeader.find('.current-response')).includes(
          'Profile Number 1'
        ),
        'Wrong text in current response'
      );
    });
  });
});
