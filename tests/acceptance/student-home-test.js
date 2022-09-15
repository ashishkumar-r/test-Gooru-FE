import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | Student Home Landing page', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      'token-api3': 'user-token',
      user: {
        gooruUId: 'param-123'
      }
    });
    window.localStorage.setItem('param-123_logins', 1);
  }
});

skip('Layout', function(assert) {
  window.localStorage.setItem('param-123_logins', 3);
  visit('/student-home');

  andThen(function() {
    assert.equal(currentURL(), '/student-home');

    T.exists(assert, find('header.gru-header'), 'Header component not found');

    const $userContainer = find('.controller.student-landing');
    T.exists(assert, $userContainer, 'Missing student container');

    const $leftUserContainer = $userContainer.find('.student-left-panel');
    T.exists(
      assert,
      $leftUserContainer.find('.greetings'),
      'Missing student greetings'
    );

    T.exists(
      assert,
      $leftUserContainer.find('.greetings .featured-courses'),
      'Missing student name'
    );

    const $featuredCourses = $leftUserContainer.find(
      '.student-featured-courses'
    );
    T.exists(assert, $featuredCourses, 'Missing featured courses component');

    const $navigatorContainer = $leftUserContainer.find('.student-navigator');
    T.exists(assert, $navigatorContainer, 'Missing student navigator');

    assert.ok(
      $('.active-classes').hasClass('active'),
      'Active classes should be visible'
    );

    const $tabContent = $leftUserContainer.find('.content');
    assert.equal(
      $tabContent.find('.gru-student-class-card').length,
      7,
      'Wrong number of class cards'
    );
  });
});

skip('Will disappear next login', function(assert) {
  window.localStorage.setItem('param-123_logins', 5);
  visit('/student-home');

  andThen(function() {
    const $userContainer = find('.controller.student-landing');
    const $leftUserContainer = $userContainer.find('.student-left-panel');
    T.exists(
      assert,
      $leftUserContainer.find('.greetings .featured-courses'),
      'Missing student name'
    );
    const $featuredCourses = $leftUserContainer.find(
      '.student-featured-courses'
    );
    T.exists(assert, $featuredCourses, 'Missing featured courses component');
  });
});

skip('Layout without feature courses', function(assert) {
  window.localStorage.setItem('param-123_logins', 6);
  visit('/student-home');

  andThen(function() {
    const $userContainer = find('.controller.student-landing');
    const $leftUserContainer = $userContainer.find('.student-left-panel');
    T.notExists(
      assert,
      $leftUserContainer.find('.greetings .featured-courses'),
      'Missing student name'
    );
    const $featuredCourses = $leftUserContainer.find(
      '.student-featured-courses'
    );
    T.notExists(assert, $featuredCourses, 'Missing featured courses component');
  });
});

skip('Go to library from featured-courses panel', function(assert) {
  visit('/student-home');

  andThen(function() {
    assert.equal(currentURL(), '/student-home');
    const $featuredCourses = find('.featured-courses');

    const $featuredCoursesLink = $featuredCourses.find('a');

    click($featuredCoursesLink);
    andThen(function() {
      assert.equal(currentURL(), '/library', 'Wrong route');
    });
  });
});

skip('Go to course map from class card', function(assert) {
  visit('/student-home');

  andThen(function() {
    assert.equal(currentURL(), '/student-home');
    const $card = find(
      '.gru-student-class-card:eq(0) .panel-heading >.title a'
    );
    click($card);
    andThen(function() {
      assert.equal(
        currentURL(),
        '/student/class/class-for-pochita-as-student/course-map?location=first-unit-id%2Bfirst-lesson-id%2Bfirst-assessment-id',
        'Wrong route'
      );
    });
  });
});

skip('Class order', function(assert) {
  visit('/student-home');

  andThen(function() {
    assert.equal(currentURL(), '/student-home');
    let $title = find('.gru-student-class-card:eq(0) .panel-heading >.title');
    assert.ok(
      $title.text().includes('First Class Pochita'),
      'Incorrect first class title'
    );
  });
});
