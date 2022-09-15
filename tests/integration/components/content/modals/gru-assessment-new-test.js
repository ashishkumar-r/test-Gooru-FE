import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import ClassModel from 'gooru-web/models/content/class';

const classServiceMock = Ember.Service.extend({
  associateCourseToClass: function(courseId, classId) {
    if (courseId && classId) {
      return Ember.RSVP.resolve('');
    } else {
      return Ember.RSVP.reject('Course association to class failed');
    }
  }
});

const courseServiceMock = Ember.Service.extend({
  createCourse: function(courseModel) {
    if (courseModel) {
      return Ember.RSVP.resolve(
        Ember.Object.create({
          id: 'course-id'
        })
      );
    } else {
      return Ember.RSVP.reject('Course creation failed');
    }
  }
});

const unitServiceMock = Ember.Service.extend({
  createUnit: function(courseId, unitModel) {
    if (unitModel && courseId) {
      return Ember.RSVP.resolve(
        Ember.Object.create({
          id: 'unit-id'
        })
      );
    } else {
      return Ember.RSVP.reject('Unit creation failed');
    }
  }
});

const lessonServiceMock = Ember.Service.extend({
  createLesson: function(courseId, unitId, lessonModel) {
    if (courseId && unitId && lessonModel) {
      return Ember.RSVP.resolve(
        Ember.Object.create({
          id: 'lesson-id'
        })
      );
    } else {
      return Ember.RSVP.reject('Lesson creation failed');
    }
  },
  associateAssessmentOrCollectionToLesson: function(
    courseId,
    unitId,
    lessonId,
    collectionId
  ) {
    if (courseId && unitId && lessonId && collectionId) {
      return Ember.RSVP.resolve('');
    }
    return Ember.RSVP.reject(
      'Collection/assessment association to lesson failed'
    );
  }
});

const assessmentServiceMock = Ember.Service.extend({
  createAssessment: function(assessmentModel) {
    if (assessmentModel) {
      return Ember.RSVP.resolve(
        Ember.Object.create({
          id: 'assessment-id'
        })
      );
    } else {
      return Ember.RSVP.reject('Assessment creation failed');
    }
  }
});

moduleForComponent(
  'gru-assessment-new',
  'Integration | Component | gru assessment new',
  {
    integration: true,
    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/class', classServiceMock);
      this.register('service:api-sdk/course', courseServiceMock);
      this.register('service:api-sdk/unit', unitServiceMock);
      this.register('service:api-sdk/lesson', lessonServiceMock);
      this.register('service:api-sdk/assessment', assessmentServiceMock);

      this.inject.service('api-sdk/class');
      this.inject.service('api-sdk/course');
      this.inject.service('api-sdk/unit');
      this.inject.service('api-sdk/lesson');
      this.inject.service('api-sdk/assessment');
    }
  }
);

test('New Assessment Layout', function(assert) {
  this.render(hbs`{{content/modals/gru-assessment-new}}`);

  const $component = this.$('.gru-assessment-new');
  assert.ok($component, 'Missing Component');
  assert.ok($component.find('h4.modal-title'), 'Missing Title');
  assert.equal(
    $component.find('h4.modal-title').text(),
    this.get('i18n').t('common.add-assessment').string,
    'Incorrect Title'
  );
  assert.ok(
    $component.find('label span.required'),
    'Missing Assessment Title label'
  );
  assert.equal(
    $component.find('label span.required').text(),
    this.get('i18n').t('common.assessment-title').string,
    'Incorrect Assessment Title Label'
  );
  assert.ok($component.find('label input'), 'Missing Assessment Title Input');
  assert.ok($component.find('actions .cancel'), 'Missing Cancel Button');
  assert.ok($component.find('actions .add'), 'Missing Add Button');
});
test('Validate if the assessment title field is left blank', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-assessment-new}}`);

  const $component = this.$('.gru-assessment-new');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Title error message not visible'
  );

  // Try submitting without filling in data
  $component.find('.actions button[type=\'submit\']').click();

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'Title error should be visible'
    );
    // Fill in the input field
    $titleField.find('input').val('assessment Name');
    $titleField.find('input').blur();

    return wait().then(function() {
      assert.ok(
        !$titleField.find('.error-messages .error').length,
        'Title error message was hidden'
      );
    });
  });
});
test('Validate if the assessment title field has only whitespaces', function(assert) {
  assert.expect(3);

  this.render(hbs`{{content/modals/gru-assessment-new}}`);

  const $component = this.$('.gru-assessment-new');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Assessment Title error message not visible'
  );

  $component.find('.actions button[type=\'submit\']').click();

  return wait().then(function() {
    assert.ok(
      $titleField.find('.error-messages .error').length,
      'Assessment Title error should be visible'
    );
    // Fill in the input field
    $titleField.find('input').val(' ');
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Assessment Title error message should be visible'
      );
    });
  });
});

test('Validate the character limit in the assessment title field', function(assert) {
  this.render(hbs`{{content/modals/gru-assessment-new}}`);

  const maxLenValue = this.$('.gru-assessment-new .gru-input.title input').prop(
    'maxlength'
  );
  assert.equal(maxLenValue, 50, 'Input max length');
});

test('it creates an assessment and assigns it to a newly created course, unit and lesson', function(assert) {
  assert.expect(3);

  var transition;

  // Mock the transitionTo method in the router
  this.set('router', {
    transitionTo(route, assessmentId) {
      transition = {
        route: route,
        assessment: assessmentId
      };
    }
  });

  this.set('class', {
    isQuickstart: true,
    class: ClassModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'class-id',
      title: 'class-title'
    })
  });

  this.on('closeModal', function() {
    assert.ok(true, 'closeModal action triggered');
  });

  this.render(
    hbs`{{content/modals/gru-assessment-new model=class router=router}}`
  );

  const $component = this.$('.gru-assessment-new');
  const $titleField = $component.find('.gru-input.title');

  // Fill in the input field
  $titleField.find('input').val('assessment-title');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.equal(
        transition.route,
        'content.assessments.edit',
        'Transition to correct route'
      );
      assert.equal(
        transition.assessment,
        'assessment-id',
        'Correct assessment ID'
      );
    });
  });
});

test('it creates an assessment and assigns it to an existing lesson', function(assert) {
  assert.expect(3);

  var transition;

  // Mock the transitionTo method in the router
  this.set('router', {
    transitionTo(route, assessmentId) {
      transition = {
        route: route,
        assessment: assessmentId
      };
    }
  });

  this.set('class', {
    associateLesson: true,
    lessonId: 'lesson-id',
    unitId: 'unit-id',
    courseId: 'course-id'
  });

  this.on('closeModal', function() {
    assert.ok(true, 'closeModal action triggered');
  });

  this.render(
    hbs`{{content/modals/gru-assessment-new model=class router=router}}`
  );

  const $component = this.$('.gru-assessment-new');
  const $titleField = $component.find('.gru-input.title');

  // Fill in the input field
  $titleField.find('input').val('assessment-title');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.equal(
        transition.route,
        'content.assessments.edit',
        'Transition to correct route'
      );
      assert.equal(
        transition.assessment,
        'assessment-id',
        'Correct assessment ID'
      );
    });
  });
});
test('show spinner button component while the server response, after clicking on the create button', function(assert) {
  assert.expect(3);

  // Mock the transitionTo method in the router
  this.set('router', {
    transitionTo(route, courseId) {
      assert.ok(route, 'Has route');
      assert.ok(courseId, 'has course Id');
    }
  });

  this.actions.closeModal = function() {
    assert.ok(true, 'Close modal action triggered');
  };

  this.set('isLoading', false);

  this.render(
    hbs`{{content/modals/gru-assessment-new router=router isLoading=isLoading}}`
  );

  const $component = this.$('.gru-assessment-new');

  const $titleField = $component.find('.gru-input.title');
  // Fill in the input field
  $titleField.find('input').val('assessment-title');
  $titleField.find('input').blur();

  $component.find('.actions .add').click();

  /* return wait().then(function() {
    assert.ok(
      $component.find('.actions .gru-spinner-button .has-spinner').length,
      'Missing gru-spinner-button component'
    );
    assert.ok(
      !$component.find('.actions button.add').length,
      'Create should not be visible'
    );
  }); */
});
