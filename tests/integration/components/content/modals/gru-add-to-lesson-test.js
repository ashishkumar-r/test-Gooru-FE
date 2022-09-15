import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import CollectionModel from 'gooru-web/models/content/collection';
import AssessmentModel from 'gooru-web/models/content/assessment';
import LessonModel from 'gooru-web/models/content/lesson';
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
            {
              id: 'some-id',
              title: 'some-title'
            },
            {
              id: 'some-id-2',
              title: 'some-title-2'
            }
          ])
        );
      }
    });
  },
  readAssessments(userId, filter) {
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (!userId) {
        reject({ status: 500 });
      } else {
        if (filter.searchText === 'Water') {
          resolve(
            Ember.A([
              {
                id: 'some-id',
                title: 'Water'
              }
            ])
          );
        } else {
          resolve(
            Ember.A([
              {
                id: 'some-id',
                title: 'Water'
              },
              {
                id: 'some-id-2',
                title: 'Wine'
              }
            ])
          );
        }
      }
    });
  }
});
const sessionServiceStub = Ember.Service.extend({
  userId: '12345'
});

moduleForComponent(
  'content/modals/gru-add-to-lesson',
  'Integration | Component | content/modals/gru add to lesson',
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
        title: 'some-title'
      }),
      CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
        id: 'some-id-2',
        title: 'some-title-2'
      })
    ]),
    content: LessonModel.create(Ember.getOwner(this).ownerInjection(), {
      id: 'lesson-id',
      title: 'lesson-title'
    })
  });

  this.render(hbs`{{content/modals/gru-add-to-lesson model=model}}`);

  const $component = this.$('.content.modals.gru-add-to');
  assert.ok($component.length, 'Component classes');

  const $header = $component.find('.modal-header');
  assert.ok($header.length, 'Header');
  assert.ok($header.find('.modal-title').length, 'Header title');

  const $body = $component.find('.modal-body');
  assert.ok($body.length, 'Body');
  assert.equal($body.find('.list >div').length, 2, 'Number of cards');
  assert.equal($body.find('div.search').length, 1, 'Missing search container');
  assert.equal($body.find('div.info').length, 1, 'Missing info container');

  const $footer = $component.find('.modal-footer');

  assert.equal(
    $footer.find('.btn-group button').length,
    2,
    'Number of action buttons'
  );
  assert.ok($footer.find('.btn-group .cancel').length, 'Cancel button');
  assert.ok($footer.find('.btn-group .add-to').length, 'Add to lesson button');
});

test('Show more result Collections', function(assert) {
  var collections = Ember.A([]);

  for (var i = 0; i <= DEFAULT_PAGE_SIZE - 1; i++) {
    collections.pushObject(
      CollectionModel.create(Ember.getOwner(this).ownerInjection(), {
        id: 'some-id',
        title: 'some-title'
      })
    );
  }

  var content = { content: null, collections: collections, isCollection: true };
  this.set('model', content);

  this.render(hbs`{{content/modals/gru-add-to-lesson model=model}}`);

  const $component = this.$('.content.modals.gru-add-to-lesson');
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
test('Show more result Assessments', function(assert) {
  var assessments = Ember.A([]);

  for (var i = 0; i <= DEFAULT_PAGE_SIZE - 1; i++) {
    assessments.pushObject(
      AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
        id: 'some-id',
        title: 'some-title'
      })
    );
  }

  var content = {
    content: null,
    collections: assessments,
    isCollection: false
  };
  this.set('model', content);

  this.render(hbs`{{content/modals/gru-add-to-lesson model=model}}`);

  const $component = this.$('.content.modals.gru-add-to-lesson');
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

test('Show more result Assessments', function(assert) {
  var assessments = Ember.A([]);

  for (var i = 0; i <= DEFAULT_PAGE_SIZE - 1; i++) {
    assessments.pushObject(
      AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
        id: 'some-id',
        title: 'some-title'
      })
    );
  }

  var content = {
    content: null,
    collections: assessments,
    isCollection: false
  };
  this.set('model', content);

  this.render(hbs`{{content/modals/gru-add-to-lesson model=model}}`);

  const $component = this.$('.content.modals.gru-add-to-lesson');
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

//test('Search by term and cancel search', function(assert) {
//
//  var assessments = Ember.A([
//    AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
//      id: 'some-id',
//      title: 'Water'
//    }),
//    AssessmentModel.create(Ember.getOwner(this).ownerInjection(), {
//      id: 'some-id',
//      title: 'Wine'
//    })
//  ]);
//
//  var content = {content:null, collections:assessments,isCollection: false};
//  this.set('model', content);
//
//  this.render(hbs`{{content/modals/gru-add-to-lesson model=model}}`);
//
//  const $component = this.$('.content.modals.gru-add-to-lesson');
//  assert.ok($component.length, 'Component');
//
//  const $body = $component.find('.modal-body');
//  assert.ok($body.length, 'Body');
//
//  const $searchInput = $component.find('.search .gru-input input');
//
//  $searchInput.val('Water');
//  const  e = $.Event("keydown");
//  e.which = 13; //ENTER
//  $searchInput.trigger(e);
//  return wait().then(function () {
//    assert.equal($body.find('.collection').length,1, 'Number of cards');
//    const $clearButton = $component.find('a.clear');
//    $clearButton.click();
//    return wait().then(function () {
//      assert.equal($body.find('.collection').length,2, 'Number of cards');
//    });
//  });
//});
