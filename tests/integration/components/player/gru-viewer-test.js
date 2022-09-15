import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';
import QuestionResult from 'gooru-web/models/result/question';

moduleForComponent(
  'player/gru-viewer',
  'Integration | Component | player/gru viewer',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('On question submit', function(assert) {
  assert.expect(4);

  const resource = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy resource text',
    media: 'test.jpg',
    isQuestion: true,
    questionType: 'OE'
  });

  const collection = Ember.Object.create({
    collectionType: 'assessment',
    isAssessment: true,
    resources: Ember.A([resource]),
    isLastResource: function() {
      return true;
    }
  });

  const resourceResult = QuestionResult.create();

  this.set('resourceResult', resourceResult);
  this.set('resource', resource);
  this.set('collection', collection);

  this.on('mySubmitQuestion', function(question) {
    assert.equal(question.get('id'), 10, 'Wrong id');
  });
  this
    .render(hbs`{{player/gru-viewer resource=resource resourceResult=resourceResult
    collection=collection onSubmitQuestion="mySubmitQuestion"}}`);

  var $component = this.$(); //component dom element

  var $answerPanel = $component.find('.answers-panel');
  assert.ok(
    $answerPanel.find('.actions button.save').attr('disabled'),
    'Button should be disabled'
  );

  var $openEndedComponent = $answerPanel.find('.gru-open-ended');
  $openEndedComponent.find('textarea').val('test');
  $openEndedComponent.find('textarea').change();

  var $buttonSave = $answerPanel.find('.actions button.save');

  assert.ok(!$buttonSave.attr('disabled'), 'Button should not be disabled');
  assert.equal(
    $buttonSave.text().trim(),
    'Save and Submit All',
    'Button text is correct'
  );

  $buttonSave.click();
});

test('Not submit all', function(assert) {
  assert.expect(3);

  const resource = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy resource text',
    media: 'test.jpg',
    isQuestion: true,
    questionType: 'OE'
  });

  const collection = Ember.Object.create({
    collectionType: 'assessment',
    isAssessment: true,
    resources: Ember.A([resource]),
    isLastResource: function() {
      return true;
    }
  });

  const resourceResult = QuestionResult.create();

  this.set('resourceResult', resourceResult);
  this.set('resource', resource);
  this.set('collection', collection);

  this
    .render(hbs`{{player/gru-viewer resource=resource resourceResult=resourceResult
    collection=collection showReportLink=false}}`);

  var $component = this.$(); //component dom element

  var $answerPanel = $component.find('.answers-panel');
  assert.ok(
    $answerPanel.find('.actions button.save').attr('disabled'),
    'Button should be disabled'
  );

  var $openEndedComponent = $answerPanel.find('.gru-open-ended');
  $openEndedComponent.find('textarea').val('test');
  $openEndedComponent.find('textarea').change();

  var $buttonSave = $answerPanel.find('.actions button.save');

  assert.ok(!$buttonSave.attr('disabled'), 'Button should not be disabled');
  assert.equal(
    $buttonSave.text().trim(),
    'Save and Finish',
    'Button text is correct'
  );
});

test('Narration', function(assert) {
  assert.expect(3);

  const resourceMockA = Ember.Object.create({
    id: 1,
    name: 'Resource #3',
    type: 'question',
    narration: 'Some narration message here',
    hasNarration: true,
    hasOwner: true
  });
  const collection = Ember.Object.create({
    collectionType: 'assessment',
    hasAuthor: false,
    resources: Ember.A([resourceMockA]),
    isLastResource: function() {
      return true;
    }
  });

  const resourceResult = QuestionResult.create();

  this.set('resourceResult', resourceResult);
  this.set('resource', resourceMockA);
  this.set('collection', collection);

  this.render(
    hbs`{{player/gru-viewer resource=resource resourceResult=resourceResult collection=collection}}`
  );

  var $component = this.$(); //component dom element
  const $gruViewer = $component.find('.gru-viewer');
  T.exists(assert, $gruViewer, 'Missing narration section');
  assert.ok(
    !$gruViewer.find('.narration .avatar img').length,
    'There is an avatar when there shouldnt'
  );
  T.exists(assert, $gruViewer.find('.narration .message'), 'Missing narration');
});

test('Narrations author image', function(assert) {
  assert.expect(3);

  const resourceMockA = Ember.Object.create({
    id: 1,
    name: 'Resource #3',
    type: 'question',
    narration: 'Some narration message here',
    owner: {
      avatarUrl: '76514d68-5f4b-48e2-b4bc-879b745f3d70.png'
    },
    hasNarration: true,
    hasOwner: true
  });
  const collection = Ember.Object.create({
    collectionType: 'assessment',
    author: {
      avatarUrl: '76514d68-5f4b-48e2-b4bc-879b745f3d70.png'
    },
    resources: Ember.A([resourceMockA]),
    isLastResource: function() {
      return true;
    }
  });

  const resourceResult = QuestionResult.create();

  this.set('resourceResult', resourceResult);
  this.set('resource', resourceMockA);
  this.set('collection', collection);

  this.render(
    hbs`{{player/gru-viewer resource=resource resourceResult=resourceResult collection=collection}}`
  );

  var $component = this.$(); //component dom element
  const $gruViewer = $component.find('.gru-viewer');
  T.exists(assert, $gruViewer, 'Missing narration section');
  T.exists(
    assert,
    $gruViewer.find('.narration .avatar img'),
    'Missing autor image'
  );
  T.exists(assert, $gruViewer.find('.narration .message'), 'Missing narration');
});

test('Layout when a resource url cannot be showed in an iframe', function(
  assert
) {
  const resourceMockA = Ember.Object.create({
    id: '1',
    resourceType: 'resource/url',
    displayGuide: {
      is_broken: 1,
      is_frame_breaker: 1
    }
  });

  this.set('resource', resourceMockA);

  this.render(hbs`{{player/gru-viewer resource=resource isNotIframeUrl=true}}`);

  var $component = this.$(); //component dom element

  const $panel = $component.find('.not-iframe');
  assert.ok($panel.length, 'Missing not-iframe panel');

  assert.ok(
    $panel.find('.panel-header').length,
    'panel-header of not-iframe panel'
  );
  assert.ok(
    $panel.find('.panel-body').length,
    'panel-body of not-iframe panel'
  );
  assert.ok(
    $panel.find('.panel-body .gru-resource-card').length,
    'Missing resource card'
  );
  assert.ok(
    $panel.find('.panel-body .gru-resource-card a.play-btn').length,
    'Missing play button'
  );
  assert.ok(
    $panel.find('.panel-footer').length,
    'panel-footer of not-iframe panel'
  );
});

test('Not see collection author info', function(assert) {
  assert.expect(1);

  const collection = Ember.Object.create({
    isCollection: true
  });

  this.set('collection', collection);

  this.render(
    hbs`{{player/gru-viewer collection=collection showCollectionAuthor=false}}`
  );
  var $component = this.$(); //component dom element

  const $avatar = $component.find('.gru-viewer .avatar');
  T.notExists(assert, $avatar, 'Collection author should not be visible');
});
