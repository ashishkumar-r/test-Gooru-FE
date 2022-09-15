import { moduleForComponent, test, skip } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import DS from 'ember-data';

const courseServiceStub = Ember.Service.extend({
  createCourse(course) {
    var promiseResponse;

    if (course.get('title') === 'COURSE FAIL') {
      promiseResponse = new Ember.RSVP.reject();
    } else {
      course.set('id', 12345);
      promiseResponse = new Ember.RSVP.resolve(course);
    }

    return DS.PromiseObject.create({
      promise: promiseResponse
    });
  }
});

moduleForComponent(
  'content/modals/course-new',
  'Integration | Component | content/modals/gru course new',
  {
    integration: true,

    beforeEach: function() {
      this.register('service:api-sdk/course', courseServiceStub);
      this.inject.service('api-sdk/course', { as: 'courseService' });

      this.inject.service('i18n');
    }
  }
);

skip('it renders', function(assert) {
  this.render(hbs`{{content/modals/gru-course-new}}`);

  const $component = this.$('.content.modals.gru-course-new');
  assert.ok($component.length, 'Component classes');

  const $header = $component.find('.modal-header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('h4.modal-title').length, 'Header title');

  const $body = $component.find('.modal-body');
  assert.ok($body.length, 'Form');
  assert.equal(
    $body.find('form span.required').length,
    2,
    'Number of required fields'
  );
  assert.ok($body.find('form .gru-input.title').length, 'Course title field');
  assert.ok($body.find('form .btn-group').length, 'Category field');

  /*
  // TODO: Fix test per changes in 1149
  assert.equal($body.find('form .btn-group a.selected').length, 1, 'Number of selected options in the category field');
  assert.ok($body.find('form .btn-group a:first-child').hasClass('selected'), 'First option in the category field is selected by default');
  */

  assert.equal(
    $body.find('.actions button').length,
    2,
    'Number of action buttons'
  );
  assert.ok($body.find('.actions button.cancel').length, 'Cancel button');
  assert.ok($body.find('.actions .create').length, 'Submit button');
});

test('it shows an error message if the course title field is left blank', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-course-new}}`);

  const $component = this.$('.content.modals.gru-course-new');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Title error message not visible'
  );

  // Try submitting without filling in data
  $component.find('.actions .create').click();

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

test('it transitions after creating a new course', function(assert) {
  assert.expect(3);

  var transition;

  this.on('closeModal', function() {
    assert.ok(true, 'closeModal action triggered');
  });

  // Mock the transitionTo method in the router
  this.set('router', {
    transitionTo(route, courseId) {
      transition = {
        route: route,
        course: courseId
      };
    }
  });

  this.render(hbs`{{content/modals/gru-course-new router=router}}`);

  const $component = this.$('.content.modals.gru-course-new');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('Course Name');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions .create').click();

    return wait().then(function() {
      assert.equal(
        transition.route,
        'content.courses.edit',
        'Transition to correct route'
      );
      assert.equal(transition.course, 12345, 'Correct course ID');
    });
  });
});

test('it displays a notification if the course cannot be created', function(assert) {
  assert.expect(1);

  const context = this;

  // Mock notifications service
  this.register(
    'service:notifications',
    Ember.Service.extend({
      error(message) {
        assert.equal(
          message,
          context.get('i18n').t('common.errors.course-not-created').string,
          'Notification displayed'
        );
      }
    })
  );
  this.inject.service('notifications');

  this.render(hbs`{{content/modals/gru-course-new}}`);

  const $component = this.$('.content.modals.gru-course-new');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('COURSE FAIL');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions .create').click();
  });
});

test('Validate if the Course Title field has only whitespaces', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-course-new}}`);

  const $component = this.$('.gru-course-new');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Course Title error message not visible'
  );

  // Try submitting without filling in data
  $component.find('.create').click();

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'Course Title error should be visible'
    );
    // Fill in the input field
    $titleField.find('input').val(' ');
    $component.find('.actions .create').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Course Title error message should be visible'
      );
    });
  });
});

skip('Validate the character limit in the Course title field', function(assert) {
  this.render(hbs`{{content/modals/gru-course-new course=course}}`);

  const maxLenValue = this.$('.gru-course-new .gru-input.title input').prop(
    'maxlength'
  );
  assert.equal(maxLenValue, 50, 'Input max length');
});

test('show spinner button component while the server response, after clicking on the create button', function(assert) {
  assert.expect(5);

  this.on('closeModal', function() {
    assert.ok(true, 'closeModal action triggered');
  });

  // Mock the transitionTo method in the router
  this.set('router', {
    transitionTo(route, courseId) {
      assert.ok(route, 'Has route');
      assert.ok(courseId, 'has course Id');
    }
  });

  this.set('isLoading', false);

  this.render(
    hbs`{{content/modals/gru-course-new router=router isLoading=isLoading}}`
  );
  const $component = this.$('.gru-course-new');

  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('Course Name');

  $titleField.find('input').blur();

  $component.find('.actions .create').click();
  this.set('isLoading', true);

  return wait().then(function() {
    assert.ok(
      $component.find('.actions .gru-spinner-button .has-spinner').length,
      'Missing gru-spinner-button component'
    );
    assert.ok(
      !$component.find('.actions button.create').length,
      'Create should not be visible'
    );
  });
});
