import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import DS from 'ember-data';
import AssessmentModel from 'gooru-web/models/content/assessment';

const assessmentServiceStub = Ember.Service.extend({
  updateAssessment(assessmentId, assessment) {
    var promiseResponse;

    if (assessment.get('title') === 'ASSESSMENT FAIL') {
      promiseResponse = new Ember.RSVP.reject();
    } else {
      assessment.set('id', 12345);
      promiseResponse = new Ember.RSVP.resolve(assessment);
    }

    return DS.PromiseObject.create({
      promise: promiseResponse
    });
  },
  updateAssessmentTitle(assessmentId, title) {
    var promiseResponse;

    if (title === 'ASSESSMENT FAIL') {
      promiseResponse = new Ember.RSVP.reject();
    } else {
      promiseResponse = new Ember.RSVP.resolve(12345);
    }

    return DS.PromiseObject.create({
      promise: promiseResponse
    });
  },
  copyAssessment() {
    return DS.PromiseObject.create({
      promise: new Ember.RSVP.resolve(12345)
    });
  }
});

moduleForComponent(
  'content/modals/assessment-remix',
  'Integration | Component | content/modals/gru assessment remix',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/assessment', assessmentServiceStub);
      this.inject.service('api-sdk/assessment', { as: 'assessmentService' });
    }
  }
);

test('it renders', function(assert) {
  this.set('assessment', {
    content: AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'assessment-id',
      title: 'assessment-title'
    })
  });

  this.render(hbs`{{content/modals/gru-assessment-remix model=assessment}}`);

  const $component = this.$('.content.modals.gru-assessment-remix');
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
  assert.ok(
    $body.find('form .gru-input.title').length,
    'Assessment title field'
  );

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

test('it shows an error message if the assessment title field is left blank', function(
  assert
) {
  assert.expect(3);

  this.set('assessment', {
    content: AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'assessment-id',
      title: 'assessment-title'
    })
  });

  this.render(hbs`{{content/modals/gru-assessment-remix model=assessment}}`);

  const $component = this.$('.content.modals.gru-assessment-remix');
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
      $titleField.find('input').val('Assessment Name');
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

test('it shows toast and transitions after copying a assessment', function(
  assert
) {
  assert.expect(6);

  var generatedRoute;
  var context = this;

  this.register(
    'service:notifications',
    Ember.Service.extend({
      success(message) {
        assert.notEqual(
          message.indexOf(
            context.get('i18n').t('common.remix-assessment-success', {
              assessmentTitle: 'Assessment Name'
            }).string
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
    generate(route, assessmentId) {
      generatedRoute = {
        route: route,
        assessment: assessmentId
      };
    }
  });

  this.set('assessment', {
    content: AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'assessment-id',
      title: 'assessment-title'
    })
  });

  this.render(
    hbs`{{content/modals/gru-assessment-remix router=router model=assessment}}`
  );

  const $component = this.$('.content.modals.gru-assessment-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('Assessment Name');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.equal(
        generatedRoute.route,
        'content.assessments.edit',
        'Generated correct route'
      );
      assert.equal(
        generatedRoute.assessment,
        12345,
        'Correct generated route assessment ID'
      );
    });
  });
});

test('it displays a notification if the assessment cannot be created', function(
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
          context.get('i18n').t('common.errors.assessment-not-copied').string,
          'Notification displayed'
        );
      }
    })
  );
  this.inject.service('notifications');

  this.set('assessment', {
    content: AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'assessment-id',
      title: 'assessment-title'
    })
  });

  this.render(hbs`{{content/modals/gru-assessment-remix model=assessment}}`);

  const $component = this.$('.content.modals.gru-assessment-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('ASSESSMENT FAIL');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();
  });
});

test('Validate if the assessment Title field has only whitespaces', function(
  assert
) {
  assert.expect(3);

  this.set('assessment', {
    content: AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'assessment-id',
      title: 'assessment-title'
    })
  });

  this.render(hbs`{{content/modals/gru-assessment-remix model=assessment}}`);

  const $component = this.$('.gru-assessment-remix');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Assessment Title error message not visible'
  );

  // Try submitting without filling in data
  $titleField.find('input').val('');
  $titleField.find('input').blur();
  return wait().then(function() {
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
});

test('Validate the character limit in the Assessment title field', function(
  assert
) {
  this.set('assessment', {
    content: AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'assessment-id',
      title: 'assessment-title'
    })
  });
  this.render(hbs`{{content/modals/gru-assessment-remix model=assessment}}`);

  const maxLenValue = this.$(
    '.gru-assessment-remix .gru-input.title input'
  ).prop('maxlength');
  assert.equal(maxLenValue, 50, 'Input max length');
});
