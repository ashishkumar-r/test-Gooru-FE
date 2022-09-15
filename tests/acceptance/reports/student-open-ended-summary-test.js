import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | student-open-ended-summary', {
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
    '/reports/student-open-ended-summary?classId=class-id&collectionId=first-assessment-id&courseId=course-id&unitId=first-unit-id&lessonId=first-lesson-id&questionId=question-id&collectionType=assessment&studentId=profile-id-1&sessionId=90ee529d-c47a-42f0-915a-c7f0a144b7af'
  );
  andThen(function() {
    assert.equal(
      currentURL(),
      '/reports/student-open-ended-summary?classId=class-id&collectionId=first-assessment-id&courseId=course-id&unitId=first-unit-id&lessonId=first-lesson-id&questionId=question-id&collectionType=assessment&studentId=profile-id-1&sessionId=90ee529d-c47a-42f0-915a-c7f0a144b7af'
    );
    const $openEndedSummaryContainer = find('.student-open-ended-summary');

    const $navigationContainer = $openEndedSummaryContainer.find('.navigation');
    T.exists(assert, $navigationContainer, 'Missing navigation container');
    T.exists(
      assert,
      $navigationContainer.find('button.back'),
      'Missing back button'
    );

    const $overallScoreHeader = $openEndedSummaryContainer.find(
      '.header .overall-score'
    );
    const $taskHeader = $openEndedSummaryContainer.find(
      '.header .gru-task-header'
    );
    const $rubricCategoriesHeader = $openEndedSummaryContainer.find(
      '.header .rubric-categories'
    );
    const $rubricCategoriesDesc = $openEndedSummaryContainer.find(
      '.panel.rubric-categories-desc'
    );

    T.exists(
      assert,
      $openEndedSummaryContainer,
      'Missing open ended summary container'
    );
    T.exists(
      assert,
      $openEndedSummaryContainer.find('.response-panel'),
      'Missing response panel'
    );
    T.exists(assert, $overallScoreHeader, 'Missing overall score header');
    assert.ok(
      T.text($overallScoreHeader.find('.title')).includes('Overall score'),
      'Wrong text in overall score header'
    );
    assert.ok(
      T.text($overallScoreHeader.find('.scores')).includes('20/24'),
      'Wrong text in overall score content'
    );
    T.exists(assert, $rubricCategoriesHeader, 'Missing overall score header');
    assert.equal(
      $rubricCategoriesHeader.find('.category').length,
      3,
      'Should have 3 rubric categories'
    );

    var $firstCategory = $rubricCategoriesHeader.find('.category:eq(0)');

    assert.ok(
      T.text($firstCategory.find('.title')).includes('Thesis and Sub-claims'),
      'Wrong text in first category title'
    );
    assert.ok(
      T.text($firstCategory.find('.score')).includes('4/4'),
      'Wrong text in first category score'
    );

    T.exists(assert, $taskHeader, 'Missing task header');

    T.exists(
      assert,
      $rubricCategoriesDesc,
      'Missing rubric categories description panel'
    );

    assert.equal(
      $rubricCategoriesDesc.find('.category').length,
      4,
      'Should have 4 rubric categories (including the overall comment)'
    );

    var $thirdCategory = $rubricCategoriesDesc.find('.category:eq(2)');

    assert.ok(
      T.text($thirdCategory.find('.title')).includes('Commentary'),
      'Wrong text in third category title'
    );

    assert.ok(
      T.text($thirdCategory.find('.score')).includes('(4/4)'),
      'Wrong text in third category score'
    );

    var $overallComment = $rubricCategoriesDesc.find('.category:eq(3)');

    assert.ok(
      T.text($overallComment.find('.title')).includes('Overall Comment'),
      'Wrong text in overall comment title'
    );
    assert.ok(
      T.text($overallComment.find('.comment')).includes('Good Job!'),
      'Wrong text in overall comment'
    );

    T.exists(
      assert,
      $openEndedSummaryContainer.find('.gru-rubric-panel'),
      'Missing rubric panel'
    );
  });
});
