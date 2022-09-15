import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';

moduleForAcceptance('Acceptance | gru-tour', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'class-overview-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Course Map Layout', function(assert) {
  visit('/class/class-for-pochita-as-teacher/overview?location=');
  andThen(function() {
    const $component = find('.gru-tour button');
    assert.ok(
      $component.length,
      'Component does not have the component classes'
    );
    click($component);
    andThen(function() {
      const $tooltip = $('.introjs-tooltip');
      assert.ok($tooltip.length, 'Tooltip was not opened');
      assert.ok(
        $tooltip.find('.tour-header.overview').hasClass('step-1'),
        'Does not have correct step class'
      );
      assert.equal(
        $tooltip.find('.tour-header.overview.step-1 h2').text(),
        'Course Map',
        'Incorrect title for step 1'
      );
      assert.equal(
        $tooltip.find('.tour-description-overview.step-1 p').text(),
        'The course map provides your students access to all assessments and collections you assign to them.',
        'Incorrect description for step 1'
      );
      assert.ok(
        $tooltip.find('.introjs-prevbutton').hasClass('introjs-disabled'),
        'disabled class missing'
      );
    });
  });
});
