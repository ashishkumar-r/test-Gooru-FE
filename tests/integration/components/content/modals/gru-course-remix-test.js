import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import DS from 'ember-data';
import CourseModel from 'gooru-web/models/content/course';

const courseServiceStub = Ember.Service.extend({
  updateCourse(course) {
    var promiseResponse;

    if (course.get('title') === 'COURSE FAIL') {
      promiseResponse = new Ember.RSVP.reject();
    } else {
      promiseResponse = new Ember.RSVP.reject();
    }

    return DS.PromiseObject.create({
      promise: promiseResponse
    });
  },

  updateCourseTitle: function(id, title) {
    if (title === 'COURSE FAIL') {
      return new Ember.RSVP.reject();
    } else {
      return Ember.RSVP.resolve({
        id: id,
        title: title
      });
    }
  },

  copyCourse() {
    return DS.PromiseObject.create({
      promise: new Ember.RSVP.resolve(12345)
    });
  }
});

moduleForComponent(
  'content/modals/course-remix',
  'Integration | Component | content/modals/gru course remix',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/course', courseServiceStub);
      this.inject.service('api-sdk/course', { as: 'courseService' });
    }
  }
);

test('it renders', function(assert) {
  this.set('course', {
    content: CourseModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'course-id',
      title: 'course-title'
    })
  });

  this.render(hbs`{{content/modals/gru-course-remix model=course}}`);

  const $component = this.$('.content.modals.gru-course-remix');
  assert.ok($component.length, 'Component classes');

  const $header = $component.find('.modal-header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('h4.modal-title').length, 'Header title');

  const $body = $component.find('.modal-body');
  assert.ok($body.find('p.lead').length, 'Lead message');
  assert.ok(
    $body.find('.warning .warning-icon').length,
    'Missing warning icon'
  );
  assert.ok($body.find('.warning p').length, 'Missing warning message');
  assert.ok($body.length, 'Form');
  assert.equal(
    $body.find('form span.required').length,
    1,
    'Number of required fields'
  );
  assert.ok($body.find('form .gru-input.title').length, 'Course title field');

  assert.equal(
    $body.find('.actions button').length,
    2,
    'Number of action buttons'
  );
  assert.ok($body.find('.actions button.cancel').length, 'Cancel button');
  assert.ok(
    $body.find('.actions button[type="submit"]').length,
    'Submit button'
  );
});

test('it shows an error message if the course title field is left blank', function(
  assert
) {
  assert.expect(3);

  this.set('course', {
    content: CourseModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'course-id',
      title: 'course-title'
    })
  });

  this.render(hbs`{{content/modals/gru-course-remix model=course}}`);

  const $component = this.$('.content.modals.gru-course-remix');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Title error message not visible'
  );

  // Try submitting without filling in data
  $titleField.find('input').val('');
  $titleField.find('input').blur();
  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Title error message visible'
      );
      // Fill in the input field
      $titleField.find('input').val('Course Name');
      $titleField.find('input').blur();

      return wait().then(function() {
        assert.ok(
          !$titleField.find('.error-messages .error').length,
          'Title error message was hidden'
        );
      });
    });
  });
});

test('it shows toast and transitions after copying a course', function(assert) {
  assert.expect(6);

  var generatedRoute;
  var context = this;

  this.register(
    'service:notifications',
    Ember.Service.extend({
      success(message) {
        assert.notEqual(
          message.indexOf(
            context
              .get('i18n')
              .t('common.remix-course-success', { courseTitle: 'Course Name' })
              .string
          ),
          -1,
          'Notification displayed'
        );
      },
      setOptions(options) {
        assert.equal(
          options.positionClass,
          'toast-top-full-width',
          'Toast value for positionClass.'
        );
        assert.equal(
          options.toastClass,
          'gooru-toast',
          'Toast value for toastClass.'
        );
      }
    })
  );
  this.inject.service('notifications');

  this.on('closeModal', function() {
    assert.ok(true, 'closeModal action triggered');
  });

  // Mock the transitionTo method in the router
  this.set('router', {
    generate(route, courseId) {
      generatedRoute = {
        route: route,
        course: courseId
      };
    }
  });

  this.set('course', {
    content: CourseModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'course-id',
      title: 'course-title'
    })
  });

  this.render(
    hbs`{{content/modals/gru-course-remix router=router model=course}}`
  );

  const $component = this.$('.content.modals.gru-course-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('Course Name');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.equal(
        generatedRoute.route,
        'content.courses.edit',
        'Generated correct route'
      );
      assert.equal(
        generatedRoute.course,
        12345,
        'Correct generated route course ID'
      );
    });
  });
});

test('it displays a notification if the course cannot be created', function(
  assert
) {
  assert.expect(2);

  const context = this;

  // Mock notifications service
  this.register(
    'service:notifications',
    Ember.Service.extend({
      error(message) {
        assert.equal(
          message,
          context.get('i18n').t('common.errors.course-not-copied').string,
          'Notification displayed'
        );
      }
    })
  );
  this.inject.service('notifications');

  this.set('course', {
    content: CourseModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'course-id',
      title: 'course-title'
    })
  });

  this.on('myCloseModal', function() {
    assert.ok(true, 'this should be called once');
  });

  this.render(
    hbs`{{content/modals/gru-course-remix model=course onCloseModal='myCloseModal'}}`
  );

  const $component = this.$('.content.modals.gru-course-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('COURSE FAIL');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();
  });
});

test('Validate if the Course Title field has only whitespaces', function(
  assert
) {
  assert.expect(3);

  this.set('course', {
    content: CourseModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'course-id',
      title: 'course-title'
    })
  });

  this.render(hbs`{{content/modals/gru-course-remix model=course}}`);

  const $component = this.$('.gru-course-remix');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Course Title error message not visible'
  );

  // Try submitting without filling in data
  $titleField.find('input').val('');
  $titleField.find('input').blur();
  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Course Title error should be visible'
      );
      // Fill in the input field
      $titleField.find('input').val(' ');
      $component.find('.actions button[type=\'submit\']').click();

      return wait().then(function() {
        assert.ok(
          $titleField.find('.error-messages .error').length,
          'Course Title error message should be visible'
        );
      });
    });
  });
});

test('Validate the character limit in the Course title field', function(
  assert
) {
  this.set('course', {
    content: CourseModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'course-id',
      title: 'course-title'
    })
  });
  this.render(hbs`{{content/modals/gru-course-remix model=course}}`);

  const maxLenValue = this.$('.gru-course-remix .gru-input.title input').prop(
    'maxlength'
  );
  assert.equal(maxLenValue, 50, 'Input max length');
});
