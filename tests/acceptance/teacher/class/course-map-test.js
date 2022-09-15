import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | teacher/class/course-map', {
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

skip('Layout as a teacher', function(assert) {
  visit('/teacher/class/class-for-pochita-as-teacher/course-map');
  andThen(function() {
    assert.equal(
      currentURL(),
      '/teacher/class/class-for-pochita-as-teacher/course-map'
    );

    const $container = find('.controller.teacher.class.course-map');
    assert.ok($container.length, 'Missing content map container');

    const $expandedUnits = find('.gru-accordion-unit.expanded', $container);
    assert.equal(
      $expandedUnits.length,
      0,
      'Wrong number of unit accordions expanded'
    );

    const $welcomePanel = $container.find('.panel.welcome');
    assert.ok($welcomePanel.length, 'Missing welcome panel');
  });
});

skip('Layout as a teacher with location', function(assert) {
  visit(
    '/teacher/class/class-for-pochita-as-teacher/course-map?location=first-unit-id%2Bfirst-lesson-id'
  );
  andThen(function() {
    assert.equal(
      currentURL(),
      '/teacher/class/class-for-pochita-as-teacher/course-map?location=first-unit-id%2Bfirst-lesson-id'
    );

    const $container = find('.controller.teacher.class.course-map');
    assert.ok($container.length, 'Missing content map container');

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
    var $resourceTitle = $resource.find('.panel-title .title');
    assert.ok(
      !$resourceTitle.hasClass('disabled'),
      'Second resource should be enabled'
    );
  });
});
