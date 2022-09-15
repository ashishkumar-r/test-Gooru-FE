import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | Student Independent Learning', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      'token-api3': 'user-token',
      user: {
        gooruUId: 'param-123'
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/student-independent-learning/studying');

  andThen(function() {
    assert.equal(
      currentURL(),
      '/student-independent-learning/studying',
      'Should load currently studying page'
    );

    T.exists(assert, find('header.gru-header'), 'Header component not found');

    const $container = find('.controller.student-independent');
    T.exists(assert, $container, 'Missing student independent container');

    const $leftUserContainer = $container.find('.student-left-panel');
    T.exists(
      assert,
      $leftUserContainer.find('.greetings'),
      'Missing student greetings'
    );
    T.exists(
      assert,
      $leftUserContainer.find('.greetings .title'),
      'Missing student name'
    );
    assert.equal(
      $leftUserContainer.find('.greetings .title span').text(),
      'Hello, Student!',
      'Incorrect student name text'
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
    T.exists(
      assert,
      $navigatorContainer.find('.active-classes'),
      'Missing active-classes tab'
    );
    T.exists(
      assert,
      $navigatorContainer.find('.independent-learning'),
      'Missing independent-learning tab'
    );

    assert.ok(
      $('.independent-learning').hasClass('active'),
      'Active independent-learning tab should be visible'
    );

    const independentLearningNavigator = $container.find(
      '.gru-independent-learning-navigation'
    );
    T.exists(
      assert,
      independentLearningNavigator,
      'Missing gru-independent-learning-navigation component'
    );
    T.exists(
      assert,
      $container.find('.independent-content'),
      'Missing independent content'
    );
  });
});

skip('Will disappear next login', function(assert) {
  window.localStorage.setItem('param-123_logins', 5);
  visit('/student-independent-learning');

  andThen(function() {
    const $userContainer = find('.controller.student-independent');
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
  visit('/student-independent-learning');

  andThen(function() {
    const $userContainer = find('.controller.student-independent');
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
  window.localStorage.setItem('param-123_logins', 2);
  visit('/student-independent-learning');

  andThen(function() {
    assert.equal(currentURL(), '/student-independent-learning/studying');
    const $featuredCourses = find('.featured-courses');

    const $featuredCoursesLink = $featuredCourses.find('a');

    click($featuredCoursesLink);
    andThen(function() {
      assert.equal(currentURL(), '/library', 'Wrong route');
    });
  });
});
