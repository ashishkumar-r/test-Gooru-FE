import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import QuestionResult from 'gooru-web/models/result/question';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'player/gru-navigator',
  'Integration | Component | player/gru navigator',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Player Navigator', function(assert) {
  assert.expect(10);

  const resourceMockA = Ember.Object.create({
    id: '1',
    title: '<p>Resource #1</p>',
    resourceFormat: 'question',
    isQuestion: true
  });

  const resourceMockB = Ember.Object.create({
    id: '2',
    title: 'Resource #2',
    resourceFormat: 'webpage',
    isQuestion: false
  });

  const collectionMock = Ember.Object.create({
    id: '490ffa82-aa15-4101-81e7-e148002f90af',
    title: 'Test collection',
    resources: Ember.A([resourceMockA, resourceMockB]),
    lastVisitedResource: resourceMockB,
    getResourceById: function(id) {
      if (id === '1') {
        return resourceMockA;
      } else if (id === '2') {
        return resourceMockB;
      }
    }
  });

  const resourceResults = Ember.A([
    QuestionResult.create({ resource: resourceMockA }),
    QuestionResult.create({ resource: resourceMockB })
  ]);

  this.set('collection', collectionMock);
  this.set('resourceResults', resourceResults);

  this.on('itemSelected', function(/*resource*/) {
    assert.ok(false, 'This should not be called');
  });

  this.render(hbs`{{player/gru-navigator collection=collection
      resourceResults=resourceResults lessonTitle='E-Lesson1'
      selectedResourceId='1' onItemSelected='itemSelected' showBackLink=true}}`);

  var $component = this.$(); //component dom element
  const $navigator = $component.find('.gru-navigator');
  T.exists(assert, $navigator, 'Missing navigator section');

  //$navigatorHeader
  const $navigatorHeader = $component.find('.gru-navigator .navigator-header');
  T.exists(
    assert,
    $navigatorHeader.find('.lesson-title'),
    'Missing lesson title'
  );

  //$navigatorSubheader
  const $navigatorSubheader = $component.find(
    '.gru-navigator .navigator-subheader'
  );
  T.exists(
    assert,
    $navigatorSubheader.find('.collection-type'),
    'Missing collection type'
  );
  T.exists(
    assert,
    $navigatorSubheader.find('.collection-title'),
    'Missing collection title'
  );

  //$collectionResources list
  const $collectionResources = $navigator.find('.resources');
  T.exists(assert, $collectionResources, 'Missing collection resources');
  const $resourceItems = $collectionResources.find('li.list-group-item');
  assert.equal(
    $resourceItems.length,
    2,
    'Missing resources with list-group-item class'
  );
  const $firstResourceItem = $collectionResources.find(
    'li.list-group-item:eq(0)'
  );
  T.exists(
    assert,
    $firstResourceItem.find('.resources-info'),
    'Missing resources info'
  );
  T.exists(
    assert,
    $firstResourceItem.find('.resources-info .bubble-type.question'),
    'Missing question class type'
  );
  assert.equal(
    T.text($firstResourceItem.find('.resources-info .title.visible-sm')),
    'Resource #1',
    'Wrong item text'
  );

  //$resourceItem Selected
  let $selected = $navigator.find('.list-group-item:eq(0).selected');
  T.exists(assert, $selected, 'Incorrect selected resource 1');
});

test('Layout when navigator is closed', function(assert) {
  assert.expect(2);

  this.on('parentAction', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.render(
    hbs`{{player/gru-navigator onCloseNavigator='parentAction' lessonTitle='E-Lesson1'}}`
  );
  var $component = this.$(); //component dom element
  var $menuButton = $component.find('.hamburger-icon');

  assert.ok($menuButton, 'Missing menu button');
  $menuButton.click();
});

/* TODO: Remove due to conflicts when there's an input in a question?
test('Player Navigator keyup on left', function(assert) {

  assert.expect(2);

  const resourceMockA = Ember.Object.create({
    id: '1',
    title: '<p>Resource #1</p>',
    resourceFormat: 'question',
    "isQuestion": true
  });

  const resourceMockB = Ember.Object.create({
    id: '2',
    title: 'Resource #2',
    resourceFormat: 'webpage',
    "isQuestion": false
  });

  const collectionMock = Ember.Object.create({
    id: '490ffa82-aa15-4101-81e7-e148002f90af',
    title: 'Test collection',
    resources: Ember.A([
      resourceMockA,
      resourceMockB
    ]),
    lastVisitedResource: resourceMockB,
    getResourceById: function(id){
      if(id === '1'){
        return resourceMockA;
      }else if (id ==='2'){ return resourceMockB;}
    },
    nextResource(resource){
      if(resource.id==='1'){
        return resourceMockB;
      }
    },
    prevResource(resource){
      if(resource.id==='2'){
        return resourceMockA;
      }
    }
  });

  this.on('itemSelected', function(resource) {
    assert.equal(resource.get("id"), '1', "Incorrect selected resource item id");
  });

  const resourceResults = Ember.A([
    QuestionResult.create({ resource: resourceMockA }),
    QuestionResult.create({ resource: resourceMockB })
  ]);

  this.set('resourceResults', resourceResults);
  this.set('collection', collectionMock);


  this.render(hbs`{{player/gru-navigator resourceResults=resourceResults
        onItemSelected='itemSelected' lessonTitle='E-Lesson1'
        collection=collection selectedResourceId='2'}}`);

  let $component = this.$(); //component dom element

  const $navigator = $component.find(".gru-navigator");
  let $selected = $navigator.find(".list-group-item:eq(1).selected");
  T.exists(assert, $selected, "Incorrect selected resource 2");
  let e = $.Event('keyup');

  e.which = 37; //Right arrow Character
  $navigator.trigger(e);

});
*/

test('it allows navigation between resource links -by default', function(assert) {
  assert.expect(3);
  var selectCtr = 0;

  const resourceMockA = Ember.Object.create({
    id: '1',
    title: 'Resource #1'
  });

  const resourceMockB = Ember.Object.create({
    id: '2',
    title: 'Resource #2'
  });

  const collectionMock = Ember.Object.create({
    id: 'collection-id',
    resources: Ember.A([resourceMockA, resourceMockB]),
    getResourceById: function(id) {
      if (id === '1') {
        return resourceMockA;
      } else {
        return resourceMockB;
      }
    }
  });

  this.on('externalAction', function(item) {
    if (selectCtr === 0) {
      assert.equal(item.get('id'), '2', 'Resource item selected');
    } else {
      assert.equal(item.get('id'), '1', 'Resource item selected');
    }
    selectCtr += 1;
  });

  const resourceResults = Ember.A([
    QuestionResult.create({ resource: resourceMockA }),
    QuestionResult.create({ resource: resourceMockB })
  ]);

  this.set('resourceResults', resourceResults);
  this.set('collection', collectionMock);

  this.render(hbs`
    {{player/gru-navigator
      resourceResults=resourceResults
      onItemSelected='externalAction'
      collection=collection
      selectedResourceId='1'}}`);

  const $component = this.$('.gru-navigator');
  assert.ok(
    $component.find('.list-group-item:eq(0).selected').length,
    'First item selected'
  );

  // Click on the second resource
  $component.find('.list-group-item:eq(1)').click();

  // Click on the first resource
  $component.find('.list-group-item:eq(0)').click();
});

test('resource link navigation is disabled', function(assert) {
  assert.expect(0);

  const resourceMockA = Ember.Object.create({
    id: '1',
    title: 'Resource #1'
  });

  const resourceMockB = Ember.Object.create({
    id: '2',
    title: 'Resource #2'
  });

  const collectionMock = Ember.Object.create({
    id: 'collection-id',
    resources: Ember.A([resourceMockA, resourceMockB]),
    getResourceById: function(id) {
      if (id === '1') {
        return resourceMockA;
      } else {
        return resourceMockB;
      }
    }
  });

  this.on('externalAction', function() {
    assert.notOk(true, 'Resource item selected');
  });

  const resourceResults = Ember.A([
    QuestionResult.create({ resource: resourceMockA }),
    QuestionResult.create({ resource: resourceMockB })
  ]);

  this.set('resourceResults', resourceResults);
  this.set('collection', collectionMock);

  this.render(hbs`
    {{player/gru-navigator
      isNavigationDisabled=true
      resourceResults=resourceResults
      onItemSelected='externalAction'
      collection=collection
      selectedResourceId='1'}}`);

  const $component = this.$('.gru-navigator');

  // Click on the second resource
  $component.find('.list-group-item:eq(1)').click();

  // Click on the first resource
  $component.find('.list-group-item:eq(0)').click();
});

/* TODO: Remove due to conflicts when there's an input in a question?
test('Player Navigator keyup on right', function(assert) {

  assert.expect(2);

  const resourceMockA = Ember.Object.create({
    id: '1',
    title: '<p>Resource #1</p>',
    resourceFormat: 'question',
    "isQuestion": true
  });

  const resourceMockB = Ember.Object.create({
    id: '2',
    title: 'Resource #2',
    resourceFormat: 'webpage',
    "isQuestion": false
  });

  const collectionMock = Ember.Object.create({
    id: '490ffa82-aa15-4101-81e7-e148002f90af',
    title: 'Test collection',
    resources: Ember.A([
      resourceMockA,
      resourceMockB
    ]),
    lastVisitedResource: resourceMockB,
    getResourceById: function(id){
      if(id === '1'){
        return resourceMockA;
      }else if (id ==='2'){ return resourceMockB;}
    },
    nextResource(resource){
      if(resource.id==='1'){
        return resourceMockB;
      }
    },
    prevResource(resource){
      if(resource.id==='2'){
        return resourceMockA;
      }
    }
  });

  this.on('itemSelected', function(item) {
    assert.equal(item.get("id"), '2', "Incorrect selected resource item id");
  });

  const resourceResults = Ember.A([
    QuestionResult.create({ resource: resourceMockA }),
    QuestionResult.create({ resource: resourceMockB })
  ]);

  this.set('resourceResults', resourceResults);

  this.set('collection', collectionMock);

  this.render(hbs`{{player/gru-navigator resourceResults=resourceResults
        onItemSelected='itemSelected' lessonTitle='E-Lesson1'
        collection=collection selectedResourceId='1'}}`);

  let $component = this.$(); //component dom element

  const $navigator = $component.find(".gru-navigator");
  let $selected = $navigator.find(".list-group-item:eq(0).selected");
  T.exists(assert, $selected, "Incorrect selected resource 1");
  let e = $.Event('keyup');

  e.which = 39; //Right arrow Character
  $navigator.trigger(e);

});
*/

test('Close player', function(assert) {
  assert.expect(1);

  this.on('parentAction', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.render(
    hbs`{{player/gru-navigator onClosePlayer='parentAction' lessonTitle='E-Lesson1' showBackLink=true}}`
  );
  var $component = this.$(); //component dom element
  var $closeButton = $component.find(
    '.gru-navigator .navigator-header div:first-child'
  );
  $closeButton.click();
});

test('See usage report', function(assert) {
  assert.expect(2);

  const collection = Ember.Object.create({
    isCollection: true
  });

  this.set('collection', collection);
  this.on('parentAction', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.render(
    hbs`{{player/gru-navigator collection=collection onFinishCollection='parentAction' lessonTitle='E-Lesson1'}}`
  );
  var $component = this.$(); //component dom element
  var $seeReportButton = $component.find('.gru-navigator .see-usage-report');
  assert.ok($seeReportButton.length, 'Missing button');
  $seeReportButton.click();
});

test('Not see usage report', function(assert) {
  assert.expect(1);

  const collection = Ember.Object.create({
    isCollection: true
  });

  this.set('collection', collection);

  this.render(
    hbs`{{player/gru-navigator collection=collection showReportLink=false}}`
  );
  var $component = this.$(); //component dom element
  var $seeReportButton = $component.find('.gru-navigator .see-usage-report');
  assert.notOk($seeReportButton.length, 'report button should be hidden');
});

test('Not see collection name', function(assert) {
  assert.expect(2);

  const collection = Ember.Object.create({
    isCollection: true
  });

  this.set('collection', collection);

  this.render(
    hbs`{{player/gru-navigator collection=collection showCollectionName=false}}`
  );
  var $component = this.$(); //component dom element

  const $navigatorSubheader = $component.find(
    '.gru-navigator .navigator-subheader'
  );
  T.notExists(
    assert,
    $navigatorSubheader.find('.collection-type'),
    'Collection type should not be visible'
  );
  T.notExists(
    assert,
    $navigatorSubheader.find('.collection-title'),
    'Collection title should not be visible'
  );
});

test('Not see resource number', function(assert) {
  assert.expect(1);

  const collection = Ember.Object.create({
    isCollection: true
  });

  this.set('collection', collection);

  this.render(
    hbs`{{player/gru-navigator collection=collection showResourceNumber=false}}`
  );
  var $component = this.$(); //component dom element
  const $navigator = $component.find('.gru-navigator');
  const $collectionResources = $navigator.find('.resources');

  const $firstResourceItem = $collectionResources.find(
    'li.list-group-item:eq(0)'
  );
  T.notExists(
    assert,
    $firstResourceItem.find('.resources-info number'),
    'Missing resources number'
  );
});

test('Remix collection/assessment', function(assert) {
  assert.expect(2);

  this.on('parentAction', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.render(
    hbs`{{player/gru-navigator onRemixCollection='parentAction' showRemixButton=true showRemix=true}}`
  );
  var $component = this.$(); //component dom element
  var $remixButton = $component.find(
    '.gru-navigator .navigator-header button.remix-btn'
  );
  assert.ok($remixButton.length, 'Missing remix button');

  $remixButton.click();
});

test('Finish collection', function(assert) {
  assert.expect(2);

  const collection = Ember.Object.create({
    isAssessment: true
  });

  this.set('collection', collection);

  this.on('onFinishCollection', function() {
    assert.ok(true, 'external Action was called!');
  });

  this.render(
    hbs`{{player/gru-navigator onFinishCollection='onFinishCollection' submitted=false collection=collection}}`
  );
  var $component = this.$(); //component dom element
  var $finishButton = $component.find('button.finish-collection');

  assert.ok($finishButton, 'Missing finish button');
  $finishButton.click();
});

test('Not finish collection', function(assert) {
  assert.expect(1);

  const collection = Ember.Object.create({
    isAssessment: true
  });

  this.set('collection', collection);

  this.render(
    hbs`{{player/gru-navigator collection=collection showReportLink=false}}`
  );
  var $component = this.$(); //component dom element
  var $finishButton = $component.find('button.finish-collection');

  assert.notOk($finishButton.length, 'Finish button should be hidden');
});

test('Not see back navigation', function(assert) {
  assert.expect(1);

  const collection = Ember.Object.create({
    isCollection: true
  });

  this.set('collection', collection);

  this.render(
    hbs`{{player/gru-navigator collection=collection showBackLink=false}}`
  );
  var $component = this.$(); //component dom element
  var $seeBackLink = $component.find(
    '.gru-navigator .navigator-header .lesson-title'
  );
  assert.notOk($seeBackLink.length, 'back link should be hidden');
});

test('Not see remix button', function(assert) {
  assert.expect(1);

  const collection = Ember.Object.create({
    isCollection: true
  });

  this.set('collection', collection);

  this.render(
    hbs`{{player/gru-navigator collection=collection showRemix=false}}`
  );
  var $component = this.$(); //component dom element
  var $seeRemix = $component.find(
    '.gru-navigator .navigator-header .remix-btn'
  );
  assert.notOk($seeRemix.length, 'remix button should be hidden');
});

test('Layout from course-player', function(assert) {
  assert.expect(2);

  this.render(
    hbs`{{player/gru-navigator collapsedMenu=true showRemixButton=false}}`
  );
  var $component = this.$(); //component dom element
  var $menuButton = $component.find('.hamburger-icon');
  assert.ok($menuButton, 'Missing menu button');

  var $remixButton = $component.find('.navigator-header button.remix-btn');
  assert.notOk($remixButton.length, 'Remix button should not be visible');
});

test('Not see navigator header', function(assert) {
  assert.expect(1);

  const collection = Ember.Object.create({
    isCollection: true
  });

  this.set('collection', collection);

  this.render(
    hbs`{{player/gru-navigator collection=collection showRemix=false showBackLink=false}}`
  );
  var $component = this.$(); //component dom element
  var $navigatorHeader = $component.find('.gru-navigator .navigator-header');
  assert.ok($navigatorHeader.hasClass('hidden'), 'hidden class');
});
