import Ember from 'ember';
import config from './config/environment';
import googlePageview from './mixins/google-pageview';

var Router = Ember.Router.extend(googlePageview, {
  location: config.locationType,
  rootURL: config.rootURL
});

Router.map(function() {
  this.route('index', {
    path: '/'
  });

  this.route('login');
  this.route('login-tenant-url');
  this.route('sign-in');
  this.route('forgot-password');
  this.route('reset-password');
  this.route('sign-up');
  this.route('signup');
  this.route('tenant-signup');
  this.route('sign-up-finish');
  this.route('sign-up-register');
  this.route('confirm-profile-merge');
  this.route('logout');
  this.route('guest');
  this.route('guest-user', { path: '/guest/:userType' });
  this.route('content', function() {
    this.route('assessments', function() {
      this.route('edit', {
        path: '/edit/:assessmentId'
      });
    });

    this.route('activity', function() {
      this.route('edit', { path: '/edit/:lessonId' });
    });

    this.route('collections', function() {
      this.route('edit', {
        path: '/edit/:collectionId'
      });
    });

    this.route('external-collections', function() {
      this.route('edit', {
        path: '/edit/:collectionId'
      });
    });

    this.route('external-assessments', function() {
      this.route('edit', {
        path: '/edit/:collectionId'
      });
    });

    this.route('courses', function() {
      this.route('edit', {
        path: '/edit/:courseId'
      });
      this.route('play', {
        path: '/play/:courseId'
      });
    });

    this.route('classes', function() {
      this.route('create');
      this.route('join');
    });

    this.route('resources', function() {
      this.route('edit', {
        path: '/edit/:resourceId'
      });
      this.route('play', {
        path: '/play/:resourceId'
      });
    });

    this.route('questions', function() {
      this.route('edit', {
        path: '/edit/:questionId'
      });
      this.route('create', {
        path: '/create'
      });
      this.route('play', {
        path: '/play/:questionId'
      });
    });

    this.route('rubric', function() {
      this.route('edit', {
        path: 'edit/:rubricId'
      });
      this.route('preview', {
        path: 'preview/:rubricId'
      });
    });
  });

  this.route('grading-player', {
    path: '/grading'
  });

  this.route('player', {
    path: '/player/:collectionId'
  });

  this.route('study-player-external');

  this.route('study-player', {
    path: '/study-player/course/:courseId'
  });

  this.route('student-locate');

  this.route('resource-player', {
    path: '/study-player/course/:courseId/resource/:resourceId'
  });

  this.route('context-player', {
    path:
      '/player/course/:courseId/unit/:unitId/lesson/:lessonId/collection/:collectionId'
  });

  this.route('student-learner-proficiency', {
    path: '/student-learner-proficiency/:userId'
  });

  this.route('reports', function() {
    this.route('collection', {
      path: '/class/:classId/collection/:collectionId'
    });
    this.route('student-collection');
    this.route('study-student-collection');
    this.route('student-collection-analytics');
    this.route('student-open-ended-summary');
    this.route('student-external-collection');
    this.route('study-student-external-collection');
  });

  this.route('player-external-collection', {
    path: 'player-external-collection/:collectionId/:collectionType'
  });

  this.route('student-home');

  this.route('student-independent-learning', function() {
    this.route('learning-base', {
      path: '/studying'
    });
    this.route('student-bookmarks', {
      path: '/bookmarks'
    });
  });

  this.route('student', function() {
    this.route(
      'class',
      {
        path: '/class/:classId'
      },
      function() {
        this.route('analytics');
        this.route('course-map');
        this.route('milestone', {
          path: '/course-map-milestone'
        });
        this.route('class-activities');
        this.route('setup-in-complete');
        this.route('proficiency');
        this.route('diagnosis-of-knowledge');
        this.route('student-learner-proficiency');
        this.route('dashboard');
      }
    );
    this.route(
      'independent',
      {
        path: '/course/:courseId'
      },
      function() {
        this.route('course-map');
      }
    );
  });

  this.route('teacher-home');

  this.route('teacher', function() {
    this.route(
      'class',
      {
        path: '/class/:classId'
      },
      function() {
        this.route('class-activities');
        this.route('class-management');
        this.route('course-map');
        this.route('students-proficiency');
        this.route('student-learner-proficiency');
        this.route('add-course');
        this.route('atc');
        this.route('data-dashboard');
        this.route('sel-dashboard');
      }
    );
  });

  this.route('player-external');
  this.route('not-found', {
    path: '/not-found/:entity'
  });

  this.route(
    'profile',
    {
      path: '/:userId'
    },
    function() {
      this.route('about');
      this.route('edit');
      this.route('preference');
      this.route('network', function() {
        this.route('following');
        this.route('followers');
      });
      this.route('proficiency');
      this.route('portfolio');
      this.route('guardian');
      this.route('universal-learner');
    }
  );
  /**
   * IMPORTANT! the profile route should be the last one at this file, so we can handle the app urls
   * and the vanity urls for profiles like www.gooru.org/javier-perez
   */
  this.route('library');
  this.route('library-search');
  this.route('player-offline-activity', {
    path: 'player-offline-activity/:offlineActivityId'
  });
  this.route('email-verification');
  this.route('guardian-invitees-approval', {
    path: 'invitees/approval'
  });
  this.route('student-independent-study');
  this.route('force-change-password');
});

export default Router;
