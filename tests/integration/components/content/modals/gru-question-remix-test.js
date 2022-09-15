import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import DS from 'ember-data';
import QuestionModel from 'gooru-web/models/content/question';
import { registerQuizzesServices } from 'gooru-web/tests/helpers/quizzes';

const questionServiceStub = Ember.Service.extend({
  updateQuestion(questionId, question) {
    var promiseResponse;

    if (question.get('title') === 'QUESTION FAIL') {
      promiseResponse = new Ember.RSVP.reject();
    } else {
      question.set('id', 12345);
      promiseResponse = new Ember.RSVP.resolve(question);
    }

    return DS.PromiseObject.create({
      promise: promiseResponse
    });
  },

  updateQuestionTitle(questionId, title) {
    return title === 'QUESTION FAIL'
      ? new Ember.RSVP.reject()
      : new Ember.RSVP.resolve(title);
  },

  copyQuestion() {
    return DS.PromiseObject.create({
      promise: new Ember.RSVP.resolve(12345)
    });
  }
});

moduleForComponent(
  'content/modals/question-remix',
  'Integration | Component | content/modals/gru question remix',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/question', questionServiceStub);
      this.inject.service('api-sdk/question', { as: 'questionService' });

      registerQuizzesServices(this);
    }
  }
);

test('it renders', function(assert) {
  this.set('question', {
    content: QuestionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'question-id',
      title: 'question-title',
      text: 'question-description'
    })
  });

  this.render(hbs`{{content/modals/gru-question-remix model=question}}`);

  const $component = this.$('.content.modals.gru-question-remix');
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
  assert.ok($body.find('form .gru-input.title').length, 'Question title field');

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

test('it shows an error message if the question title field is left blank', function(
  assert
) {
  assert.expect(3);

  this.set('question', {
    content: QuestionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'question-id',
      title: 'question-title',
      text: 'question-description'
    })
  });

  this.render(hbs`{{content/modals/gru-question-remix model=question}}`);

  const $component = this.$('.content.modals.gru-question-remix');
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
      $titleField.find('input').val('Question Name');
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

test('it shows toast and transitions after copying a question', function(
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
            context.get('i18n').t('common.remix-question-success', {
              questionTitle: 'Question Name'
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
    generate(route, questionId) {
      generatedRoute = {
        route: route,
        question: questionId
      };
    }
  });

  this.set('question', {
    content: QuestionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'question-id',
      title: 'question-title',
      text: 'question-description'
    })
  });

  this.render(
    hbs`{{content/modals/gru-question-remix router=router model=question}}`
  );

  const $component = this.$('.content.modals.gru-question-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('Question Name');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.equal(
        generatedRoute.route,
        'content.questions.edit',
        'Generated correct route'
      );
      assert.equal(
        generatedRoute.question,
        12345,
        'Correct generated route question ID'
      );
    });
  });
});

test('it shows toast and transitions after copying a question with parent collection', function(
  assert
) {
  assert.expect(8);

  var generatedRoute;
  var context = this;

  this.register(
    'service:notifications',
    Ember.Service.extend({
      success(message) {
        assert.notEqual(
          message.indexOf(
            context.get('i18n').t('common.remix-question-success', {
              questionTitle: 'Question Name'
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
    generate(route, questionId) {
      generatedRoute = {
        route: route,
        question: questionId
      };
    }
  });

  this.set('parentService', {
    addQuestion: function(parentId, questionid) {
      assert.equal(
        parentId,
        'collection-id',
        'Parent collection id when adding question'
      );
      assert.equal(questionid, 12345, 'Question id in add question');
    }
  });

  this.set('question', {
    content: QuestionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'question-id',
      title: 'question-title',
      text: 'question-description'
    }),
    collectionId: 'collection-id',
    isCollection: true
  });

  this.render(
    hbs`{{content/modals/gru-question-remix router=router model=question collectionService=parentService}}`
  );

  const $component = this.$('.content.modals.gru-question-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('Question Name');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.equal(
        generatedRoute.route,
        'content.questions.edit',
        'Generated correct route'
      );
      assert.equal(
        generatedRoute.question,
        12345,
        'Correct generated route question ID'
      );
    });
  });
});

test('it displays a notification if the question cannot be created', function(
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
          context.get('i18n').t('common.errors.question-not-copied').string,
          'Notification displayed'
        );
      }
    })
  );
  this.inject.service('notifications');

  this.set('question', {
    content: QuestionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'question-id',
      title: 'question-title',
      text: 'question-description'
    })
  });

  this.render(hbs`{{content/modals/gru-question-remix model=question}}`);

  const $component = this.$('.content.modals.gru-question-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('QUESTION FAIL');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();
  });
});

test('Validate if the question Title field has only whitespaces', function(
  assert
) {
  assert.expect(3);

  this.set('question', {
    content: QuestionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'question-id',
      title: 'question-title',
      text: 'question-description'
    })
  });

  this.render(hbs`{{content/modals/gru-question-remix model=question}}`);

  const $component = this.$('.gru-question-remix');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Question Title error message not visible'
  );

  // Try submitting without filling in data
  $titleField.find('input').val('');
  $titleField.find('input').blur();
  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Question Title error should be visible'
      );
      // Fill in the input field
      $titleField.find('input').val(' ');
      $component.find('.actions button[type=\'submit\']').click();

      return wait().then(function() {
        assert.ok(
          $titleField.find('.error-messages .error').length,
          'Question Title error message should be visible'
        );
      });
    });
  });
});

test('Validate the character limit in the question title field', function(
  assert
) {
  this.set('question', {
    content: QuestionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'question-id',
      title: 'question-title',
      text: 'question-description'
    })
  });
  this.render(hbs`{{content/modals/gru-question-remix model=question}}`);

  const maxLenValue = this.$('.gru-question-remix .gru-input.title input').prop(
    'maxlength'
  );
  assert.equal(maxLenValue, 50, 'Input max length');
});
