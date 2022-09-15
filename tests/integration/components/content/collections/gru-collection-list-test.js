import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import Collection from 'gooru-web/models/content/collection';
import Question from 'gooru-web/models/content/question';
import Resource from 'gooru-web/models/content/resource';

moduleForComponent(
  'content/collections/gru-collection-list',
  'Integration | Component | content/collections/gru collection list',
  {
    integration: true,

    beforeEach: function() {
      this.inject.service('i18n');
    }
  }
);

test('it renders correctly when there are no questions or resources', function(
  assert
) {
  var model = Collection.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Sample Collection Title'
  });

  this.set('model', model);
  this.render(
    hbs`{{content/collections/gru-collection-list model=model isSorting=false}}`
  );

  const $component = this.$('.content.collections.gru-collection-list');
  assert.ok($component.length, 'Component');

  const $header = $component.find('> .header');
  assert.ok($header.length, 'Header section');
  assert.ok($header.find('> h2').length, 'List title');
  assert.ok($header.find('> .detail').length, 'Header details');
  assert.equal(
    $header.find('> .detail span').text(),
    this.get('i18n').t('common.add-collection-item').string,
    'Resources or questions text'
  );

  // Add dropdown menu
  const $addDropdown = $header.find('.actions > .dropdown');
  assert.ok($addDropdown.length, 'Add dropdown');
  assert.ok(
    !$addDropdown.hasClass('open'),
    'Add dropdown is closed by default'
  );

  // Click on the add button to open the dropdown menu
  $header.find('.actions .add-item').click();
  assert.ok($addDropdown.hasClass('open'), 'Add dropdown is open');
  assert.equal(
    $addDropdown.find('.dropdown-menu li').length,
    4,
    'Dropdown options'
  );

  $header.find('.actions .add-item').click();
  assert.ok(!$addDropdown.hasClass('open'), 'Add dropdown is closed');

  assert.ok(
    $addDropdown.find('.dropdown-menu li:eq(0)').text(),
    this.get('i18n').t('common.from-my-resources').string,
    'Add dropdown, first button'
  );
  assert.ok(
    $addDropdown.find('.dropdown-menu li:eq(1)').text(),
    this.get('i18n').t('common.from-my-questions').string,
    'Add dropdown, second button'
  );
  assert.ok(
    $addDropdown.find('.dropdown-menu li:eq(2)').text(),
    this.get('i18n').t('common.new-resource').string,
    'Add dropdown, third button'
  );
  assert.ok(
    $addDropdown.find('.dropdown-menu li:eq(3)').text(),
    this.get('i18n').t('common.new-question').string,
    'Add dropdown, fourth button'
  );

  assert.equal(
    $header.find('.actions > button').length,
    0,
    'Buttons visible besides the add button'
  );

  const $itemsList = $component.find('> .collection-list');
  assert.ok($itemsList.length, 'Items list section');
  assert.equal(
    $itemsList.find('.gru-collection-list-item').length,
    0,
    'No items listed'
  );

  const $addActions = $component.find('.add-resource-question');
  assert.ok($addActions.length, 'Actions for adding content');

  //assert.ok($addActions.find('button:eq(0)').text(), this.get('i18n').t('common.from-my-resources').string, 'First "add" button');
  //assert.ok($addActions.find('button:eq(1)').text(), this.get('i18n').t('common.from-my-questions').string, 'Second "add" button');
  assert.ok(
    $addActions.find('button:eq(2)').text(),
    this.get('i18n').t('common.new-resource').string,
    'Third "add" button'
  );
  assert.ok(
    $addActions.find('button:eq(3)').text(),
    this.get('i18n').t('common.new-question').string,
    'Fourth "add" button'
  );
});

test('it renders correctly when there are questions and resources', function(
  assert
) {
  var model = Collection.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Sample Collection Title',
    children: Ember.A([
      Resource.create(Ember.getOwner(this).ownerInjection(), {
        format: 'text',
        title: 'Resource Title'
      }),
      Question.create(Ember.getOwner(this).ownerInjection(), {
        format: 'question',
        type: 'MC',
        title: 'Question Title A'
      }),
      Question.create(Ember.getOwner(this).ownerInjection(), {
        format: 'question',
        type: 'MA',
        title: 'Question Title B'
      })
    ])
  });

  this.set('model', model);
  this.set('items', model.get('children'));

  this.render(
    hbs`{{content/collections/gru-collection-list model=model items=items isSorting=true}}`
  );

  const $component = this.$('.content.collections.gru-collection-list');
  assert.ok($component.length, 'Component');
  assert.ok(
    $component
      .find('> .header > .detail span')
      .text()
      .indexOf(
        `1 ${this.get('i18n').t('common.resource-pl', { count: 1 }).string}`
      ) > -1,
    'Resource detail text'
  );
  assert.ok(
    $component
      .find('> .header > .detail span')
      .text()
      .indexOf(
        `2 ${this.get('i18n').t('common.question-pl', { count: 2 }).string}`
      ) > -1,
    'Question detail text'
  );

  const $itemsList = $component.find('> .collection-list');
  assert.equal(
    $itemsList.find('.gru-collection-list-item').length,
    3,
    'Items listed'
  );
});

test('Check reorder options', function(assert) {
  var model = Collection.create(Ember.getOwner(this).ownerInjection(), {
    title: 'Sample Collection Title',
    children: Ember.A([
      Resource.create(Ember.getOwner(this).ownerInjection(), {
        format: 'text',
        title: 'Resource Title'
      }),
      Question.create(Ember.getOwner(this).ownerInjection(), {
        format: 'question',
        type: 'MC',
        title: 'Question Title A'
      }),
      Question.create(Ember.getOwner(this).ownerInjection(), {
        format: 'question',
        type: 'MA',
        title: 'Question Title B'
      })
    ]),
    isSorting: true
  });

  this.set('model', model);
  this.set('items', model.get('children'));
  this.render(
    hbs`{{content/collections/gru-collection-list model=model items=items editingContent=null}}`
  );

  const $component = this.$('.content.collections.gru-collection-list');
  assert.notOk(
    $component.find('button.sort-items').length,
    'Sort button should be hidden'
  );
  assert.ok(
    $component.find('.drag-options .cancel').length,
    'Cancel sort should be appear'
  );
  assert.ok(
    $component.find('.drag-options .save').length,
    'Save sort should be appear'
  );
});
