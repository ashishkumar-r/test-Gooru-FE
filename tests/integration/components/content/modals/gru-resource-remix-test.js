import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import DS from 'ember-data';
import ResourceModel from 'gooru-web/models/content/resource';
import createResourceValidations from 'gooru-web/validations/create-resource';
const resourceServiceStub = Ember.Service.extend({
  updateResource(resourceId, resource) {
    var promiseResponse;

    if (resource.get('title') === 'RESOURCE FAIL') {
      promiseResponse = new Ember.RSVP.reject();
    } else {
      resource.set('id', 12345);
      promiseResponse = new Ember.RSVP.resolve(resource);
    }

    return DS.PromiseObject.create({
      promise: promiseResponse
    });
  },
  copyResource(resourceId, title) {
    if (title === 'RESOURCE FAIL') {
      return new Ember.RSVP.reject();
    } else {
      return DS.PromiseObject.create({
        promise: new Ember.RSVP.resolve(12345)
      });
    }
  }
});

moduleForComponent(
  'content/modals/resource-remix',
  'Integration | Component | content/modals/gru resource remix',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/resource', resourceServiceStub);
      this.inject.service('api-sdk/resource', { as: 'resourceService' });
    }
  }
);

test('it renders', function(assert) {
  var newResource = ResourceModel.extend(createResourceValidations);
  this.set('resource', {
    content: newResource.create(Ember.getOwner(this).ownerInjection(), {
      id: 'resource-id',
      title: 'resource-title',
      standards: [],
      format: 'resource',
      url: 'http://gooruweb.org/test.html'
    })
  });

  this.render(hbs`{{content/modals/gru-resource-remix model=resource}}`);

  const $component = this.$('.content.modals.gru-resource-remix');
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
  assert.ok($body.find('form .gru-input.title').length, 'Resource title field');

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

test('it shows an error message if the resource title field is left blank', function(
  assert
) {
  assert.expect(3);
  var newResource = ResourceModel.extend(createResourceValidations);
  this.set('resource', {
    content: newResource.create(Ember.getOwner(this).ownerInjection(), {
      id: 'resource-id',
      title: 'resource-title',
      standards: [],
      format: 'resource',
      url: 'http://gooruweb.org/test.html'
    })
  });

  this.render(hbs`{{content/modals/gru-resource-remix model=resource}}`);

  const $component = this.$('.content.modals.gru-resource-remix');
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
      $titleField.find('input').val('Resource Name');
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

test('it shows toast and transitions after copying a resource', function(
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
            context.get('i18n').t('common.remix-resource-success', {
              resourceTitle: 'Resource Name'
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
    generate(route, resourceId) {
      generatedRoute = {
        route: route,
        resource: resourceId
      };
    }
  });
  var newResource = ResourceModel.extend(createResourceValidations);
  this.set('resource', {
    content: newResource.create(Ember.getOwner(this).ownerInjection(), {
      id: 'resource-id',
      title: 'resource-title',
      standards: [],
      format: 'resource',
      url: 'http://gooruweb.org/test.html'
    })
  });

  this.render(
    hbs`{{content/modals/gru-resource-remix router=router model=resource}}`
  );

  const $component = this.$('.content.modals.gru-resource-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('Resource Name');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.equal(
        generatedRoute.route,
        'content.resources.edit',
        'Generated correct route'
      );
      assert.equal(
        generatedRoute.resource,
        12345,
        'Correct generated route resource ID'
      );
    });
  });
});

test('it shows toast and transitions after copying a resource with parent collection', function(
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
            context.get('i18n').t('common.remix-resource-success', {
              resourceTitle: 'Resource Name'
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
    generate(route, resourceId) {
      generatedRoute = {
        route: route,
        resource: resourceId
      };
    }
  });

  this.set('parentService', {
    addResource: function(parentId, resourceid) {
      assert.equal(
        parentId,
        'collection-id',
        'Parent collection id when adding resource'
      );
      assert.equal(resourceid, 12345, 'Resource id in add resource');
    }
  });
  var newResource = ResourceModel.extend(createResourceValidations);
  this.set('resource', {
    content: newResource.create(Ember.getOwner(this).ownerInjection(), {
      id: 'resource-id',
      title: 'resource-title',
      standards: [],
      format: 'resource',
      url: 'http://gooruweb.org/test.html'
    }),
    collectionId: 'collection-id',
    isCollection: true
  });

  this.render(
    hbs`{{content/modals/gru-resource-remix router=router model=resource collectionService=parentService}}`
  );

  const $component = this.$('.content.modals.gru-resource-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('Resource Name');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.equal(
        generatedRoute.route,
        'content.resources.edit',
        'Generated correct route'
      );
      assert.equal(
        generatedRoute.resource,
        12345,
        'Correct generated route resource ID'
      );
    });
  });
});

test('it displays a notification if the resource cannot be created', function(
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
          context.get('i18n').t('common.errors.resource-not-copied').string,
          'Notification displayed'
        );
      }
    })
  );
  this.inject.service('notifications');
  var newResource = ResourceModel.extend(createResourceValidations);
  this.set('resource', {
    content: newResource.create(Ember.getOwner(this).ownerInjection(), {
      id: 'resource-id',
      title: 'resource-title',
      standards: [],
      format: 'resource',
      url: 'http://gooruweb.org/test.html'
    })
  });

  this.render(hbs`{{content/modals/gru-resource-remix model=resource}}`);

  const $component = this.$('.content.modals.gru-resource-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('RESOURCE FAIL');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();
  });
});

test('Validate if the resource Title field has only whitespaces', function(
  assert
) {
  assert.expect(3);
  var newResource = ResourceModel.extend(createResourceValidations);
  this.set('resource', {
    content: newResource.create(Ember.getOwner(this).ownerInjection(), {
      id: 'resource-id',
      title: 'resource-title',
      standards: [],
      format: 'resource',
      url: 'http://gooruweb.org/test.html'
    })
  });

  this.render(hbs`{{content/modals/gru-resource-remix model=resource}}`);

  const $component = this.$('.gru-resource-remix');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Resource Title error message not visible'
  );

  // Try submitting without filling in data
  $titleField.find('input').val('');
  $titleField.find('input').blur();
  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Resource Title error should be visible'
      );
      // Fill in the input field
      $titleField.find('input').val(' ');
      $component.find('.actions button[type=\'submit\']').click();

      return wait().then(function() {
        assert.ok(
          $titleField.find('.error-messages .error').length,
          'Resource Title error message should be visible'
        );
      });
    });
  });
});

test('Validate the character limit in the resource title field', function(
  assert
) {
  var newResource = ResourceModel.extend(createResourceValidations);
  this.set('resource', {
    content: newResource.create(Ember.getOwner(this).ownerInjection(), {
      id: 'resource-id',
      title: 'resource-title',
      standards: [],
      format: 'resource',
      url: 'http://gooruweb.org/test.html'
    })
  });
  this.render(hbs`{{content/modals/gru-resource-remix model=resource}}`);

  const maxLenValue = this.$('.gru-resource-remix .gru-input.title input').prop(
    'maxlength'
  );
  assert.equal(maxLenValue, 50, 'Input max length');
});
