import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | study-player-external', {
  beforeEach: function() {
    window.localStorage.setItem(
      'id-for-pochita_next',
      JSON.stringify({
        context: {
          collection_id: 'first-assessment-id',
          class_id: 'class-for-pochita-as-student',
          course_id: 'course-123',
          unit_id: 'first-unit-id',
          lesson_id: 'first-lesson-id',
          current_item_id: 'first-assessment-id',
          itemType: 'assessment-external'
        },
        content: {
          id: 'first-assessment-id',
          description: 'external-id',
          url: 'www.external-assessment.com',
          thumbnail: null
        },
        suggestions: [],
        hasContent: true
      })
    );
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'player-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  },
  afterEach: function() {
    window.localStorage.clear();
  }
});

skip('Layout', function(assert) {
  visit(
    '/study-player-external?classId=class-for-pochita-as-student&collectionId=first-assessment-id&classId=class-for-pochita-as-student&role=student&source=coursemap&type=assessment-external'
  );

  andThen(function() {
    assert.equal(
      currentURL(),
      '/study-player-external?classId=class-for-pochita-as-student&collectionId=first-assessment-id&classId=class-for-pochita-as-student&role=student&source=coursemap&type=assessment-external'
    );

    const $playerHeader = find('.gru-study-header');
    T.exists(assert, $playerHeader, 'Missing study player header');

    const $playerContainer = find('.player-container');
    T.exists(assert, $playerContainer, 'Missing external player component');
  });
});
