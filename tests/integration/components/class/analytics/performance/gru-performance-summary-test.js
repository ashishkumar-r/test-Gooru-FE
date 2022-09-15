import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import AssessmentModel from 'gooru-web/models/content/assessment';
import DS from 'ember-data';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';

const assessmentServiceStub = Ember.Service.extend({
  readAssessment() {
    var promiseResponse;
    var response = [
      AssessmentModel.create({
        id: 'd4521a45-dcd1-4540-bba1-64af8fd2d6ec',
        attempts: 1
      })
    ];

    promiseResponse = new Ember.RSVP.Promise(function(resolve) {
      Ember.run.next(this, function() {
        resolve(response);
      });
    });

    return DS.PromiseArray.create({
      promise: promiseResponse
    });
  }
});

moduleForComponent(
  'class/analytics/performance/gru-performance-summary',
  'Integration | Component | class/analytics/performance/gru-performance-summary',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');

      this.register('service:api-sdk/assessment', assessmentServiceStub);
      this.inject.service('api-sdk/assessment');
    }
  }
);

test('Test for performance summary on valid unit values', function(assert) {
  const performance = Ember.Object.create({
    title: 'Quiz :: Indian History',
    type: 'unit',
    score: 75,
    completionDone: 0,
    completionTotal: 1,
    timeSpent: 4852359,
    isUnitOrLesson: true,
    ratingScore: 0,
    attempts: 2,
    isCompleted: false,
    hasStarted: true,
    displayableTimeSpent: '1h 30m'
  });

  this.set('performance', performance);

  this.render(
    hbs`{{class/analytics/performance/gru-performance-summary performance=performance}}`
  );

  const $component = this.$(); //component dom element

  const $performanceSummary = $component.find('.gru-performance-summary');

  T.exists(assert, $performanceSummary, 'Missing performance summary');

  const $scoreSummary = $component.find('.score .score-box');
  T.exists(assert, $scoreSummary, 'Missing Score summary');

  const $completionSummary = $component.find(
    '.completion .gru-completion-chart'
  );
  T.exists(assert, $completionSummary, 'Missing Completion summary');

  const $timeSpentSummary = $component.find('.timeSpent p');

  assert.equal(T.text($timeSpentSummary), '1h 30m', 'Wrong time spent text ');

  const $attemptSummary = $component.find('.attempts p');
  assert.equal(T.text($attemptSummary), '2', 'Wrong attempts text');
});

test('Test show no score for performance summary on valid unit values', function(assert) {
  const performance = Ember.Object.create({
    title: 'Quiz :: Indian History',
    type: 'unit',
    score: 75,
    completionDone: 0,
    completionTotal: 1,
    timeSpent: 4852359,
    isUnitOrLesson: true,
    ratingScore: 0,
    attempts: 2,
    isCompleted: false,
    hasStarted: true,
    displayableTimeSpent: '1h 30m'
  });

  this.set('performance', performance);

  this.render(
    hbs`{{class/analytics/performance/gru-performance-summary performance=performance showScore=false}}`
  );

  const $component = this.$(); //component dom element

  const $performanceSummary = $component.find('.gru-performance-summary');

  T.exists(assert, $performanceSummary, 'Missing performance summary');

  const $scoreSummary = $component.find('.score .score-box');
  T.notExists(assert, $scoreSummary, 'Score should not be visible');

  const $completionSummary = $component.find(
    '.completion .gru-completion-chart'
  );
  T.exists(assert, $completionSummary, 'Missing Completion summary');
  const $timeSpentSummary = $component.find('.timeSpent p');
  assert.equal(T.text($timeSpentSummary), '1h 30m', 'Wrong time spent text ');
  const $attemptSummary = $component.find('.attempts p');
  assert.equal(T.text($attemptSummary), '2', 'Wrong attempts text');
});

test('Test show collection icon for collection performance summary', function(assert) {
  const performance = Ember.Object.create({
    title: 'Quiz :: Indian History',
    type: 'unit',
    score: 75,
    completionDone: 0,
    completionTotal: 1,
    timeSpent: 4852359,
    isUnitOrLesson: true,
    ratingScore: 0,
    attempts: 2,
    isCompleted: false,
    hasStarted: true,
    displayableTimeSpent: '1h 30m',
    isCollection: true
  });

  this.set('performance', performance);

  this.render(
    hbs`{{class/analytics/performance/gru-performance-summary performance=performance showScore=false}}`
  );

  const $component = this.$(); //component dom element

  const $performanceSummary = $component.find('.gru-performance-summary');

  T.exists(assert, $performanceSummary, 'Missing performance summary');

  const $scoreSummary = $component.find('.score .score-box');
  T.notExists(assert, $scoreSummary, 'Score should not be visible');

  const $collectionIcon = $component.find('.gru-icon.apps');
  T.exists(assert, $collectionIcon, 'Missing collection icon');

  const $completionSummary = $component.find(
    '.completion .gru-completion-chart'
  );
  T.exists(assert, $completionSummary, 'Missing Completion summary');
  const $timeSpentSummary = $component.find('.timeSpent p');
  assert.equal(T.text($timeSpentSummary), '1h 30m', 'Wrong time spent text ');
  const $attemptSummary = $component.find('.attempts p');
  assert.equal(T.text($attemptSummary), '2', 'Wrong attempts text');
});

test('Test for performance summary on invalid unit values', function(assert) {
  const performance = Ember.Object.create({
    title: 'Quiz :: Indian History',
    type: 'unit',
    completionTotal: 2,
    completionDone: 1,
    ratingScore: 0,
    isCompleted: false,
    hasStarted: true,
    isUnitOrLesson: true,
    isCollectionOrAssessment: false,
    score: 5
  });

  this.set('performance', performance);

  this.render(
    hbs`{{class/analytics/performance/gru-performance-summary performance=performance selectedOption='scores'}}`
  );

  const $component = this.$(); //component dom element

  const $scoreSummary = $component.find('.score .score-box');
  assert.equal(T.text($scoreSummary), '5%', 'Wrong score text');

  const $completionSummary = $component.find(
    '.completion .gru-completion-chart'
  );
  T.exists(assert, $completionSummary, 'Missing Completion summary');

  const $reactionSummary = $component.find('.reaction p');
  assert.equal(T.text($reactionSummary), '', 'Wrong reaction summary text');

  const $timeSpentSummary = $component.find('.timeSpent p');
  assert.equal(T.text($timeSpentSummary), '', 'Wrong time spent text');

  const $attemptSummary = $component.find('.attempts p');
  assert.equal(T.text($attemptSummary), '–', 'Wrong attempt summary text');
});

test('Test for performance summary on selected reaction', function(assert) {
  const performance = Ember.Object.create({
    title: 'Quiz :: Indian History',
    type: 'unit',
    completionTotal: 1,
    ratingScore: 0,
    isCompleted: false,
    hasStarted: true,
    isUnitOrLesson: true,
    isCollectionOrAssessment: false
  });

  this.set('performance', performance);

  this.render(
    hbs`{{class/analytics/performance/gru-performance-summary performance=performance selectedOption='reaction'}}`
  );

  const $component = this.$(); //component dom element

  const $reactionSummary = $component.find('.reaction.selected');
  T.exists(assert, $reactionSummary, 'Missing Reaction summary ');
});

test('Test for no more attempts on assessment', function(assert) {
  const collection = Ember.Object.create({
    title: 'Assessment',
    id: 'd4521a45-dcd1-4540-bba1-64af8fd2d6ec',
    attempts: 2,
    isAssessment: true,
    isCollectionOrAssessment: true,
    isCompleted: true
  });

  this.set('collection', collection);

  this.render(
    hbs`{{class/analytics/performance/gru-performance-summary performance=collection noMoreAttempts=true}}`
  );

  const $component = this.$(); //component dom element

  const $performanceSummary = $component.find('.gru-performance-summary');

  T.exists(assert, $performanceSummary, 'Missing performance summary');

  return wait().then(function() {
    const $disableTitle = $performanceSummary.find(
      '.title .section-title.disabled'
    );
    T.exists(assert, $disableTitle, 'Missing disable section-title');

    const $redoButton = $performanceSummary.find(
      '.title .collection-redo-button'
    );
    assert.ok($redoButton.hasClass('disabled'), 'Missing disable redo btn');
  });
});

test('Test non visible completed assessment when content visibility is not provided', function(assert) {
  const collection = Ember.Object.create({
    title: 'Assessment',
    id: 'd4521a45-dcd1-4540-bba1-64af8fd2d6ec',
    attempts: 2,
    isAssessment: true,
    isCollectionOrAssessment: true,
    isCompleted: true
  });

  this.set('collection', collection);

  this.render(
    hbs`{{class/analytics/performance/gru-performance-summary performance=collection noMoreAttempts=false}}`
  );

  const $component = this.$(); //component dom element

  const $performanceSummary = $component.find('.gru-performance-summary');

  T.exists(assert, $performanceSummary, 'Missing performance summary');

  return wait().then(function() {
    const $reportButton = $performanceSummary.find(
      '.collection-view-report-button'
    );
    assert.ok(
      !$reportButton.hasClass('disabled'),
      'Report btn should not be disabled'
    );

    const $redoButton = $performanceSummary.find('.collection-redo-button');
    assert.ok($redoButton.hasClass('disabled'), 'Redo btn should be disabled');
  });
});

test('Test non visible not-started assessment when content visibility is not provided', function(assert) {
  const collection = Ember.Object.create({
    title: 'Assessment',
    id: 'd4521a45-dcd1-4540-bba1-64af8fd2d6ec',
    attempts: 2,
    isAssessment: true,
    isCollectionOrAssessment: true,
    isCompleted: false
  });

  this.set('collection', collection);

  this.render(
    hbs`{{class/analytics/performance/gru-performance-summary performance=collection noMoreAttempts=false}}`
  );

  const $component = this.$(); //component dom element

  const $performanceSummary = $component.find('.gru-performance-summary');

  T.exists(assert, $performanceSummary, 'Missing performance summary');

  return wait().then(function() {
    const $studyButton = $performanceSummary.find('.collection-study-button');
    assert.ok(
      $studyButton.hasClass('disabled'),
      'Study btn should be disabled'
    );
  });
});

test('Test non visible completed assessment when content visibility is provided', function(assert) {
  const collection = Ember.Object.create({
    title: 'Assessment',
    id: 'd4521a45-dcd1-4540-bba1-64af8fd2d6ec',
    attempts: 2,
    isAssessment: true,
    isCollectionOrAssessment: true,
    isCompleted: true
  });

  const contentVisibility = Ember.Object.create({
    isVisible: function() {
      return false;
    }
  });

  this.set('collection', collection);
  this.set('contentVisibility', contentVisibility);

  this.render(hbs`{{class/analytics/performance/gru-performance-summary
      performance=collection noMoreAttempts=false contentVisibility=contentVisibility}}`);

  const $component = this.$(); //component dom element

  const $performanceSummary = $component.find('.gru-performance-summary');

  T.exists(assert, $performanceSummary, 'Missing performance summary');

  return wait().then(function() {
    const $reportButton = $performanceSummary.find(
      '.collection-view-report-button'
    );
    assert.ok(
      !$reportButton.hasClass('disabled'),
      'Report btn should not be disabled'
    );

    const $redoButton = $performanceSummary.find('.collection-redo-button');
    assert.ok($redoButton.hasClass('disabled'), 'Redo btn should be disabled');
  });
});

test('Test non visible not-started assessment when content visibility is provided', function(assert) {
  const collection = Ember.Object.create({
    title: 'Assessment',
    id: 'd4521a45-dcd1-4540-bba1-64af8fd2d6ec',
    attempts: 2,
    isAssessment: true,
    isCollectionOrAssessment: true,
    isCompleted: false
  });

  const contentVisibility = Ember.Object.create({
    isVisible: function() {
      return false;
    }
  });

  this.set('collection', collection);
  this.set('contentVisibility', contentVisibility);

  this.render(hbs`{{class/analytics/performance/gru-performance-summary
    performance=collection noMoreAttempts=false contentVisibility=contentVisibility}}`);

  const $component = this.$(); //component dom element

  const $performanceSummary = $component.find('.gru-performance-summary');

  T.exists(assert, $performanceSummary, 'Missing performance summary');

  return wait().then(function() {
    const $studyButton = $performanceSummary.find('.collection-study-button');
    assert.ok(
      $studyButton.hasClass('disabled'),
      'Study btn should be disabled'
    );
  });
});

test('Test visible completed assessment', function(assert) {
  const collection = Ember.Object.create({
    title: 'Assessment',
    id: 'd4521a45-dcd1-4540-bba1-64af8fd2d6ec',
    attempts: 2,
    isAssessment: true,
    isCollectionOrAssessment: true,
    isCompleted: true
  });

  const contentVisibility = Ember.Object.create({
    isVisible: function() {
      return true;
    }
  });

  this.set('collection', collection);
  this.set('contentVisibility', contentVisibility);

  this.render(hbs`{{class/analytics/performance/gru-performance-summary
      performance=collection noMoreAttempts=false contentVisibility=contentVisibility}}`);

  const $component = this.$(); //component dom element

  const $performanceSummary = $component.find('.gru-performance-summary');

  T.exists(assert, $performanceSummary, 'Missing performance summary');

  return wait().then(function() {
    const $reportButton = $performanceSummary.find(
      '.collection-view-report-button'
    );
    assert.ok(
      !$reportButton.hasClass('disabled'),
      'Report btn should not be disabled'
    );

    const $redoButton = $performanceSummary.find('.collection-redo-button');
    assert.ok(
      !$redoButton.hasClass('disabled'),
      'Redo btn should not be disabled'
    );
  });
});

test('Test visible not-started assessment', function(assert) {
  const collection = Ember.Object.create({
    title: 'Assessment',
    id: 'd4521a45-dcd1-4540-bba1-64af8fd2d6ec',
    attempts: 2,
    isAssessment: true,
    isCollectionOrAssessment: true,
    isCompleted: false
  });

  const contentVisibility = Ember.Object.create({
    isVisible: function() {
      return true;
    }
  });

  this.set('collection', collection);
  this.set('contentVisibility', contentVisibility);

  this.render(hbs`{{class/analytics/performance/gru-performance-summary
    performance=collection noMoreAttempts=false contentVisibility=contentVisibility}}`);

  const $component = this.$(); //component dom element

  const $performanceSummary = $component.find('.gru-performance-summary');

  T.exists(assert, $performanceSummary, 'Missing performance summary');

  return wait().then(function() {
    const $studyButton = $performanceSummary.find('.collection-study-button');
    assert.ok(
      !$studyButton.hasClass('disabled'),
      'Study btn should not be disabled'
    );
  });
});
