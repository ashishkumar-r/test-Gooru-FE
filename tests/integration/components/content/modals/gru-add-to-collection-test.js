import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import CollectionModel from 'gooru-web/models/content/collection';
import ResourceModel from 'gooru-web/models/content/resource';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';
import { DEFAULT_PAGE_SIZE } from 'gooru-web/config/config';

const profileServiceStub = Ember.Service.extend({
  readCollections(userId) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!userId) {
        reject({ status: 500 });
      } else {
        resolve(
          Ember.A([
            Ember.Object.create({
              id: 'some-id',
              title: 'some-title',
              format: 'collection'
            }),
            Ember.Object.create({
              id: 'some-id-2',
              title: 'some-title-2',
              format: 'collection'
            })
          ])
        );
      }
    });
  }
});
const sessionServiceStub = Ember.Service.extend({
  userId: '12345'
});

moduleForComponent(
  'content/modals/gru-add-to-collection',
  'Integration | Component | content/modals/gru add to collection',
  {
    integration: true,
    beforeEach: function() {
      this.register('service:api-sdk/profile', profileServiceStub);
      this.inject.service('api-sdk/profile');
      this.register('service:session', sessionServiceStub);
      this.inject.service('session');
    }
  }
);

test('Layout', function(assert) {
  // Set any properties with this.set('myProperty', 'value');
  // Handle any actions with this.on('myAction', function(val) { ... });
  this.set('model', {
    collections: Ember.A([
      CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
        id: 'some-id',
        title: 'some-title',
        format: 'collection'
      }),
      CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
        id: 'some-id-2',
        title: 'some-title-2',
        format: 'collection'
      })
    ]),
    content: ResourceModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'resource-id',
      title: 'resource-title'
    })
  });

  this.render(hbs`{{content/modals/gru-add-to-collection model=model}}`);

  const $component = this.$('.content.modals.gru-add-to');
  assert.ok($component.length, 'Component classes');

  const $header = $component.find('.modal-header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('.modal-title').length, 'Header title');

  const $body = $component.find('.modal-body');
  assert.ok($body.length, 'Body');
  assert.equal($body.find('>div').length, 2, 'Number of cards');

  const $footer = $component.find('.modal-footer');

  assert.equal(
    $footer.find('.btn-group button').length,
    2,
    'Number of action buttons'
  );
  assert.ok($footer.find('.btn-group .cancel').length, 'Cancel button');
  assert.ok($footer.find('.btn-group .add-to').length, 'Join class button');
});

test('Show more result', function(assert) {
  var collections = Ember.A([]);
  var assessments = Ember.A([]);

  for (var i = 0; i <= DEFAULT_PAGE_SIZE - 1; i++) {
    collections.pushObject(
      CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
        id: 'some-id',
        title: 'some-title',
        format: 'collection'
      })
    );
  }

  var content = { content: null, collections, assessments };
  this.set('model', content);

  this.render(hbs`{{content/modals/gru-add-to-collection model=model}}`);

  const $component = this.$('.content.modals.gru-add-to');
  assert.ok($component.length, 'Component');

  const $body = $component.find('.modal-body');
  assert.ok($body.length, 'Body');

  const $showMoreResultButton = $component.find('.show-more-results');
  assert.ok($showMoreResultButton);

  assert.equal(
    $body.find('.collection').length,
    DEFAULT_PAGE_SIZE,
    'Number of cards'
  );

  $showMoreResultButton.click();
  return wait().then(function() {
    assert.equal(
      $body.find('.collection').length,
      DEFAULT_PAGE_SIZE + 2,
      'Number of cards'
    );
  });
});
