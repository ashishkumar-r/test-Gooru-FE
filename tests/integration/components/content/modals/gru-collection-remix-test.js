import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';
import Ember from 'ember';
import DS from 'ember-data';
import CollectionModel from 'gooru-web/models/content/collection';

const collectionServiceStub = Ember.Service.extend({
  updateCollection(collectionId, collection) {
    var promiseResponse;

    if (collection.get('title') === 'COLLECTION FAIL') {
      promiseResponse = new Ember.RSVP.reject();
    } else {
      collection.set('id', 12345);
      promiseResponse = new Ember.RSVP.resolve(collection);
    }

    return DS.PromiseObject.create({
      promise: promiseResponse
    });
  },
  updateCollectionTitle(collectionId, title) {
    var promiseResponse;

    if (title === 'COLLECTION FAIL') {
      promiseResponse = new Ember.RSVP.reject();
    } else {
      promiseResponse = new Ember.RSVP.resolve(12345);
    }

    return promiseResponse;
  },
  copyCollection() {
    return DS.PromiseObject.create({
      promise: new Ember.RSVP.resolve(12345)
    });
  }
});

moduleForComponent(
  'content/modals/collection-remix',
  'Integration | Component | content/modals/gru collection remix',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/collection', collectionServiceStub);
      this.inject.service('api-sdk/collection', { as: 'collectionService' });
    }
  }
);

test('it renders', function(assert) {
  this.set('collection', {
    content: CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id',
      title: 'collection-title'
    })
  });

  this.render(hbs`{{content/modals/gru-collection-remix model=collection}}`);

  const $component = this.$('.content.modals.gru-collection-remix');
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
    'Collection title field'
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

test('it shows an error message if the collection title field is left blank', function(
  assert
) {
  assert.expect(3);

  this.set('collection', {
    content: CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id',
      title: 'collection-title'
    })
  });

  this.render(hbs`{{content/modals/gru-collection-remix model=collection}}`);

  const $component = this.$('.content.modals.gru-collection-remix');
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
      $titleField.find('input').val('Collection Name');
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

test('it shows toast and transitions after copying a collection', function(
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
            context.get('i18n').t('common.remix-collection-success', {
              collectionTitle: 'Collection Name'
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
    generate(route, collectionId) {
      generatedRoute = {
        route: route,
        collection: collectionId
      };
    }
  });

  this.set('collection', {
    content: CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id',
      title: 'collection-title'
    })
  });

  this.render(
    hbs`{{content/modals/gru-collection-remix router=router model=collection}}`
  );

  const $component = this.$('.content.modals.gru-collection-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('Collection Name');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.equal(
        generatedRoute.route,
        'content.collections.edit',
        'Generated correct route'
      );
      assert.equal(
        generatedRoute.collection,
        12345,
        'Correct generated route collection ID'
      );
    });
  });
});

test('it displays a notification if the collection cannot be created', function(
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
          context.get('i18n').t('common.errors.collection-not-copied').string,
          'Notification displayed'
        );
      }
    })
  );
  this.inject.service('notifications');

  this.set('collection', {
    content: CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id',
      title: 'collection-title'
    })
  });

  this.render(hbs`{{content/modals/gru-collection-remix model=collection}}`);

  const $component = this.$('.content.modals.gru-collection-remix');
  const $titleField = $component.find('.gru-input.title');

  $titleField.find('input').val('COLLECTION FAIL');
  $titleField.find('input').blur();

  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();
  });
});

test('Validate if the collection Title field has only whitespaces', function(
  assert
) {
  assert.expect(3);

  this.set('collection', {
    content: CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id',
      title: 'collection-title'
    })
  });

  this.render(hbs`{{content/modals/gru-collection-remix model=collection}}`);

  const $component = this.$('.gru-collection-remix');
  const $titleField = $component.find('.gru-input.title');

  assert.ok(
    !$titleField.find('.error-messages .error').length,
    'Collection Title error message not visible'
  );

  // Try submitting without filling in data
  $titleField.find('input').val('');
  $titleField.find('input').blur();
  return wait().then(function() {
    $component.find('.actions button[type=\'submit\']').click();

    return wait().then(function() {
      assert.ok(
        $titleField.find('.error-messages .error').length,
        'Collection Title error should be visible'
      );
      // Fill in the input field
      $titleField.find('input').val(' ');
      $component.find('.actions button[type=\'submit\']').click();

      return wait().then(function() {
        assert.ok(
          $titleField.find('.error-messages .error').length,
          'Collection Title error message should be visible'
        );
      });
    });
  });
});

test('Validate the character limit in the collection title field', function(
  assert
) {
  this.set('collection', {
    content: CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id',
      title: 'collection-title'
    })
  });
  this.render(hbs`{{content/modals/gru-collection-remix model=collection}}`);

  const maxLenValue = this.$(
    '.gru-collection-remix .gru-input.title input'
  ).prop('maxlength');
  assert.equal(maxLenValue, 50, 'Input max length');
});
