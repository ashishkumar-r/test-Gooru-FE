import { skip } from 'qunit';
import moduleForAcceptance from 'gooru-web/tests/helpers/module-for-acceptance';
import { authenticateSession } from 'gooru-web/tests/helpers/ember-simple-auth';
import T from 'gooru-web/tests/helpers/assert';

moduleForAcceptance('Acceptance | student class', {
  beforeEach: function() {
    authenticateSession(this.application, {
      isAnonymous: false,
      token: 'student-token',
      user: {
        gooruUId: 'id-for-pochita'
      }
    });
  }
});

skip('Layout', function(assert) {
  visit('/student/class/class-for-pochita-as-student');

  andThen(function() {
    assert.equal(currentURL(), '/student/class/class-for-pochita-as-student');

    const $classContainer = find('.student.class');
    T.exists(assert, $classContainer, 'Missing class container');
    T.exists(
      assert,
      $classContainer.find('> .gru-study-navbar'),
      'Missing class navigation component'
    );
    T.exists(
      assert,
      $classContainer.find('> .content'),
      'Missing class content'
    );

    const $classHeader = $classContainer.find('.header');
    T.exists(assert, $classHeader, 'Missing class header');
    T.exists(
      assert,
      $classHeader.find('.go-back-container .back-to'),
      'Missing back link'
    );
    T.exists(assert, $classHeader.find('h1'), 'Missing class title');
    assert.equal(
      T.text($classHeader.find('h1')),
      'Pochita As Student - With Course',
      'Incorrect class title text'
    );

    const $classroomInformation = $classHeader.find('.classroom-information');
    T.exists(
      assert,
      $classroomInformation,
      'Missing classroom information panel'
    );
    T.exists(
      assert,
      $classroomInformation.find('.panel-body'),
      'Missing class info panel-body'
    );

    const $courseImage = $classroomInformation.find('.course-image');
    T.exists(assert, $courseImage, 'Missing course image container');

    const $courseName = $classroomInformation.find('.course-name');
    T.exists(assert, $courseName, 'Missing course name');

    const $countsContainer = $classroomInformation.find('.counts-container');
    T.exists(assert, $countsContainer, 'Missing counts container');
    assert.equal(
      $countsContainer.find('.count').length,
      2,
      'Wrong number of counts'
    );

    const $teacherProfile = $classroomInformation.find('.teacher-profile');
    T.exists(assert, $teacherProfile, 'Missing teacher profile info');
    T.exists(assert, $teacherProfile.find('img'), 'Missing owner avatar');
    T.exists(assert, $teacherProfile.find('.owner-name'), 'Missing owner name');

    const $taxonomyStandards = $classroomInformation.find(
      '.taxonomy-standards'
    );
    T.exists(
      assert,
      $taxonomyStandards,
      'Missing taxonomy standards container'
    );

    const $classCode = $classroomInformation.find('.class-code');
    T.exists(assert, $classCode, 'Missing class code container');

    const $performanceContainer = $classroomInformation.find(
      '.performance-container'
    );
    T.exists(assert, $performanceContainer, 'Missing performance container');
    T.exists(
      assert,
      $performanceContainer.find('.gru-performance-chart'),
      'Missing performance chart component'
    );
  });
});

skip('Click on back link', function(assert) {
  visit('/student/class/class-for-pochita-as-student');
  andThen(function() {
    assert.equal(currentURL(), '/student/class/class-for-pochita-as-student');

    const $classContainer = find('.student.class');
    const $classHeader = $classContainer.find('.header');

    click($classHeader.find('.go-back-container .back-to'));
    andThen(function() {
      assert.equal(currentURL(), '/student-home');
    });
  });
});
