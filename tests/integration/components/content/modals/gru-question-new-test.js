import { moduleForComponent, test } from 'ember-qunit';
import Ember from 'ember';
import hbs from 'htmlbars-inline-precompile';
import Collection from 'gooru-web/models/content/collection';
import wait from 'ember-test-helpers/wait';

const collectionServiceMock = Ember.Service.extend({
  addQuestion: function(collectionId, questionId) {
    if (collectionId && questionId) {
      return Ember.RSVP.resolve('');
    } else {
      return Ember.RSVP.reject('Adding question to collection failed');
    }
  }
});

const questionServiceMock = Ember.Service.extend({
  createQuestion: function(questionData) {
    if (questionData) {
      return Ember.RSVP.resolve(
        Ember.Object.create({
          id: 'question-id'
        })
      );
    } else {
      return Ember.RSVP.reject('Question copy failed');
    }
  }
});

moduleForComponent(
  'content/modals/gru-question-new',
  'Integration | Component | content/modals/gru question new',
  {
    integration: true,
    beforeEach: function() {
      this.inject.service('i18n');

      this.register('service:api-sdk/collection', collectionServiceMock);
      this.register('service:api-sdk/question', questionServiceMock);

      this.inject.service('api-sdk/collection');
      this.inject.service('api-sdk/question');
    }
  }
);

test('Question New Layout', function(assert) {
  this.render(hbs`{{content/modals/gru-question-new}}`);

  const $component = this.$('.gru-question-new');
  assert.ok($component, 'Missing Component');
  assert.ok($component.find('h4.modal-title'), 'Missing Title');
  assert.equal(
    $component.find('h4.modal-title').text(),
    this.get('i18n').t('common.add-new-question').string,
    'Incorrect Title'
  );
  assert.equal(
    $component.find('label.type span.required').text(),
    this.get('i18n').t('common.add-type-question').string,
    'Incorrect Question Type Label'
  );
  assert.equal(
    $component.find('.question-types .panel').length,
    9,
    'Incorrect Number of Question Types'
  );
  assert.ok(
    $component.find('.question-type-MC'),
    'Missing Multiple Choice Type'
  );
  assert.ok(
    $component.find('.question-type-MA'),
    'Missing Multiple Answer Type'
  );
  assert.ok($component.find('.question-type-OE'), 'Missing Open Ended Type');
  assert.ok($component.find('.question-type-HT_TO'), 'Missing Order List Type');
  assert.ok($component.find('.question-type-T_F'), 'Missing True/False Type');
  assert.ok(
    $component.find('.question-type-HT_HL'),
    'Missing Hot Text Highlight Type'
  );
  assert.ok(
    $component.find('.question-type-FIB'),
    'Missing Fill in the blanks Type'
  );
  assert.ok(
    $component.find('.question-type-HS_IMG'),
    'Missing Hot Spot Image Type'
  );
  assert.ok(
    $component.find('.question-type-HS_TXT'),
    'Missing Hot Spot Text Type'
  );
  assert.ok($component.find('.question-type-OE'), 'Missing Open Ended Type');
  assert.ok($component.find('actions .cancel'), 'Missing Cancel Button');
  assert.ok($component.find('actions .add'), 'Missing Add Button');
});

test('Select question type', function(assert) {
  this.render(hbs`{{content/modals/gru-question-new}}`);

  const $component = this.$('.gru-question-new');
  assert.ok($component, 'Missing Component');
  assert.equal(
    $component.find('.panel.question-type-MC.active').length,
    1,
    'Multiple choice should be active'
  );
  const $multipleAnswer = $component.find('.panel.question-type-MA');
  $multipleAnswer.click();
  assert.equal(
    $component.find('.panel.question-type-MA.active').length,
    1,
    'Multiple answer should be active'
  );
  assert.equal(
    $component.find('.panel.active').length,
    1,
    'Only one type should be active'
  );
});

test('show spinner button component while the server response, after clicking on the add to button', function(assert) {
  this.set('router', {
    transitionTo(route, resourceId, queryParams) {
      return {
        route: route,
        resource: resourceId,
        queryParams: queryParams
      };
    }
  });

  this.set('isLoading', false);

  this.set(
    'collection',
    Collection.create(Ember.getOwner(this).ownerInjection(), {
      id: 'collection-id'
    })
  );

  this.on('closeModal', function() {
    assert.ok(true, 'closeModal action triggered');
  });

  this.render(
    hbs`{{content/modals/gru-question-new model=collection router=router isLoading=isLoading}}`
  );

  const $component = this.$('.gru-question-new');

  $component.find('.add').click();
  this.set('isLoading', true);

  return wait().then(function() {
    assert.ok(
      $component.find('.actions .gru-spinner-button .has-spinner').length,
      'Missing gru-spinner-button component'
    );
    assert.ok(
      !$component.find('.actions .gru-spinner-button .add').length,
      'Create button should not be visible'
    );
  });
});
