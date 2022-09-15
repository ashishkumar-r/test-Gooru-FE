import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | student/class/course-map', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'class-course-map-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Layout as a student', function(assert) {
  visit('/student/class/class-for-pochita-as-student/course-map');
  andThen(function() {
    assert.equal(
      currentURL(),
      '/student/class/class-for-pochita-as-student/course-map?location=first-unit-id%2Bfirst-lesson-id%2Bfirst-assessment-id'
    );

    const $container = find('.student.class .controller.course-map');
    assert.ok($container.length, 'Missing course map container');

    const $expandedUnits = find('.gru-accordion-unit.expanded', $container);
    assert.equal(
      $expandedUnits.length,
      1,
      'Wrong number of unit accordions expanded'
    );

    const $expandedLessons = find('.gru-accordion-lesson.expanded', $container);
    assert.equal(
      $expandedLessons.length,
      1,
      'Wrong number of lesson accordions expanded'
    );

    var $accordion = find('.gru-accordion-unit:eq(0)', $container);
    assert.ok($accordion.hasClass('expanded'), 'First unit should be expanded');

    $accordion = find('.gru-accordion-lesson:eq(2)', $accordion);
    assert.ok(
      $accordion.hasClass('expanded'),
      '3rd lesson in the second unit should be expanded'
    );

    var $resource = find('.collections .panel:eq(0)', $accordion);
    assert.ok(
      $resource.hasClass('selected'),
      'First collection should be marked as selected'
    );

    var $resourceTitle = $resource.find('.panel-title .title');
    assert.notOk(
      $resourceTitle.hasClass('disabled'),
      'Second resource should not be disabled'
    );
  });
});
