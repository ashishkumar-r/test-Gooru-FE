import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import T from 'gooru-web/tests/helpers/assert';
import hbs from 'htmlbars-inline-precompile';
import Assessment from 'gooru-web/models/content/assessment';
import Collection from 'gooru-web/models/content/collection';
import ClassActivity from 'gooru-web/models/content/class-activity';
import ActivityPerformanceSummary from 'gooru-web/models/performance/activity-performance-summary';
import tHelper from 'ember-i18n/helper';

moduleForComponent(
  'class/gru-student-class-activity-panel',
  'Integration | Component | class/gru student class activity panel',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
      this.registry.register('helper:t', tHelper);
    }
  }
);

test('Layout', function(assert) {
  const collectionMock = Assessment.create(
    Ember.getOwner(this).ownerInjection(),
    {
      id: '3-1',
      format: 'assessment',
      openEndedQuestionCount: 0,
      questionCount: 4,
      resourceCount: 0,
      title: 'The Early Earth',
      members: [],
      visible: true,
      isOnAir: true
    }
  );

  const performance = Ember.Object.create({
    score: 100,
    timeSpent: 5400000,
    isCompleted: true
  });

  const classActivity = ClassActivity.create({
    activationDate: null, //inactive
    collection: collectionMock,
    isCompleted: false,
    activityPerformanceSummary: ActivityPerformanceSummary.create({
      collectionPerformanceSummary: performance
    })
  });

  this.set('classActivity', classActivity);

  this.render(
    hbs`{{class/gru-student-class-activity-panel isToday=true isOfflineActivity=false classActivity=classActivity}}`
  );

  var $component = this.$(); //component dom element
  const $collectionPanel = $component.find('.gru-student-class-activity-panel');
  T.exists(assert, $collectionPanel, 'Missing class collection panel');

  const $collectionPanelHeading = $collectionPanel.find('.dca-panel-info');
  assert.ok($collectionPanelHeading.length, 'Panel info  element is missing');

  const $collectionCount = $collectionPanel.find('.dca-content-counts');
  assert.ok($collectionCount.length, 'Content count element is missing');

  const $collectionTitle = $collectionPanelHeading.find('.title-info span');
  assert.ok($collectionTitle.length, 'Title  element is missing');
  assert.equal(T.text($collectionTitle), 'The Early Earth', 'Wrong title text');

  assert.ok(
    $collectionPanel.find('.dca-panel-actions-performance').length,
    'Performance container is missing'
  );
});

test('Layout - collection', function(assert) {
  const collectionMock = Collection.create(
    Ember.getOwner(this).ownerInjection(),
    {
      id: '3-1',
      format: 'collection',
      openEndedQuestionCount: 0,
      questionCount: 2,
      resourceCount: 4,
      title: 'The Early Earth',
      members: [],
      visible: true,
      isOnAir: true
    }
  );

  const performance = Ember.Object.create({
    score: 100,
    completionDone: 44,
    completionTotal: 50,
    timeSpent: 5400000,
    isCompleted: true
  });
  const classActivity = ClassActivity.create({
    activationDate: null, //inactive
    collection: collectionMock,
    activityPerformanceSummary: ActivityPerformanceSummary.create({
      collectionPerformanceSummary: performance
    })
  });

  this.set('classActivity', classActivity);

  this.render(
    hbs`{{class/gru-student-class-activity-panel classActivity=classActivity}}`
  );

  var $component = this.$(); //component dom element
  const $collectionPanel = $component.find('.gru-student-class-activity-panel');

  const $collectionInfo = $collectionPanel.find('.dca-panel-info');
  assert.ok($collectionInfo.length, 'Collection Info element is missing');

  const $collectionContentCount = $collectionPanel.find('.dca-content-counts');
  assert.ok($collectionContentCount.length, 'Content count panel is missing');
});
