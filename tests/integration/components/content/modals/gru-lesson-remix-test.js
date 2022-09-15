import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import DS from 'ember-data';
import LessonModel from 'gooru-web/models/content/lesson';

const lessonServiceStub = Ember.Service.extend({
  updateLesson(courseId, unitId, lesson) {
    var promiseResponse;

    if (lesson.get('title') === 'LESSON FAIL') {
      promiseResponse = new Ember.RSVP.reject();
    } else {
      lesson.set('id', 12345);
      promiseResponse = new Ember.RSVP.resolve(lesson);
    }

    return DS.PromiseObject.create({
      promise: promiseResponse
    });
  },
  copyLesson() {
    return DS.PromiseObject.create({
      promise: new Ember.RSVP.resolve(12345)
    });
  }
});

moduleForComponent(
  'content/modals/lesson-remix',
  'Integration | Component | content/modals/gru lesson remix',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/lesson', lessonServiceStub);
      this.inject.service('api-sdk/lesson', { as: 'lessonService' });
    }
  }
);

test('it renders', function(assert) {
  this.set('contentModel', {
    content: LessonModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'lesson-id',
      title: 'lesson-title'
    }),
    courseId: 'course-id',
    unitId: 'unit-id'
  });

  this.render(hbs`{{content/modals/gru-lesson-remix model=contentModel}}`);

  const $component = this.$('.content.modals.gru-lesson-remix');
  assert.ok($component.length, 'Component classes');

  const $header = $component.find('.modal-header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('h4.modal-title').length, 'Header title');

  const $body = $component.find('.modal-body');
  assert.ok($body.find('p.lead').length, 'Lead message');
  assert.ok($body.length, 'Form');
  assert.equal(
    $body.find('form span.required').length,
    1,
    'Number of required fields'
  );
  assert.ok($body.find('form .gru-input.title').length, 'Unit title field');

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

test('it shows an error message if the lesson title field is left blank', function(
  assert
) {
  assert.expect(3);

  this.set('contentModel', {
    content: LessonModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'lesson-id',
      title: 'lesson-title'
    }),
    courseId: 'course-id',
    unitId: 'unit-id'
  });

  this.render(hbs`{{content/modals/gru-lesson-remix model=contentModel}}`);

  const $component = this.$('.content.modals.gru-lesson-remix');
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
      $titleField.find('input').val('Lesson Name');
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

test('it shows toast and perform event after copying a lesson', function(
  assert
) {
  assert.expect(6);
  var context = this;

  this.register(
    'service:notifications',
    Ember.Service.extend({
      success(message) {
        assert.notEqual(
          message.indexOf(
            context
              .get('i18n')
              .t('common.remix-lesson-success', { lessonTitle: 'Lesson Name' })
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

  this.set('contentModel', {
    content: LessonModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'lesson-id',
      title: 'lesson-title'
    }),
    courseId: 'course-id',
    unitId: 'unit-id',
    onRemixSuccess: function(lesson) {
      assert.equal(lesson.get('id'), '12345');
      assert.equal(lesson.get('title'), 'Lesson Name');
    }
  });

  this.render(hbs`{{content/modals/gru-lesson-remix model=contentModel}}`);

  const $component = this.$('.content.modals.gru-lesson-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('Lesson Name');
  $titleField.find('input').blur();

  var done = assert.async();
  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();
    return wait().then(function() {
      done();
    });
  });
});

test('it displays a notification if the lesson cannot be created', function(
  assert
) {
  assert.expect(1);

  const context = this;

  // Mock notifications service
  this.register(
    'service:notifications',
    Ember.Service.extend({
      error(message) {
        assert.equal(
          message,
          context.get('i18n').t('common.errors.lesson-not-copied').string,
          'Notification displayed'
        );
      }
    })
  );
  this.inject.service('notifications');

  this.set('contentModel', {
    content: LessonModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'lesson-id',
      title: 'lesson-title'
    }),
    courseId: 'course-id',
    unitId: 'unit-id'
  });

  this.render(hbs`{{content/modals/gru-lesson-remix model=contentModel}}`);

  const $component = this.$('.content.modals.gru-lesson-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('LESSON FAIL');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();
  });
});

test('Validate if the lesson Title field has only whitespaces', function(
  assert
) {
  assert.expect(3);

  this.set('contentModel', {
    content: LessonModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'lesson-id',
      title: 'lesson-title'
    }),
    courseId: 'course-id',
    unitId: 'unit-id'
  });

  this.render(hbs`{{content/modals/gru-lesson-remix model=contentModel}}`);

  const $component = this.$('.gru-lesson-remix');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Lesson Title error message not visible'
  );

  // Try submitting without filling in data
  $titleField.find('input').val('');
  $titleField.find('input').blur();
  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Lesson Title error should be visible'
      );
      // Fill in the input field
      $titleField.find('input').val(' ');
      $component.find('.actions button[type=\'submit\']').click();

      return wait().then(function() {
        assert.ok(
          $titleField.find('.error-messages .error').length,
          'Lesson Title error message should be visible'
        );
      });
    });
  });
});

test('Validate the character limit in the lesson title field', function(
  assert
) {
  this.set('contentModel', {
    content: LessonModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'lesson-id',
      title: 'lesson-title'
    }),
    courseId: 'course-id',
    unitId: 'unit-id'
  });
  this.render(hbs`{{content/modals/gru-lesson-remix model=contentModel}}`);

  const maxLenValue = this.$('.gru-lesson-remix .gru-input.title input').prop(
    'maxlength'
  );
  assert.equal(maxLenValue, 50, 'Input max length');
});
