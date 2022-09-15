import { moduleForComponent } from 'ember-qunit';
import { skip } from 'qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';
import wait from 'ember-test-helpers/wait';
import AssessmentModel from 'gooru-web/models/content/assessment';
import CollectionPerformanceSummary from 'gooru-web/models/performance/collection-performance-summary';

moduleForComponent(
  'student/class/analytics/gru-performance-table',
  'Integration | Component | student/class/analytics/gru-performance-table',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

skip('Performance Table Layout', function(assert) {
  const assessmentsMock = [
    AssessmentModel.create({ id: '1', title: 'What is a Fish?' }),
    AssessmentModel.create({ id: '2', title: 'Global Warming Quiz' }),
    AssessmentModel.create({
      id: '3',
      title: 'Pre Assessment Human Impact on Earth'
    }),
    AssessmentModel.create({
      id: '4',
      title: 'Assessment having no performance'
    }) //assessment without performance
  ];

  var collectionPerformanceSummaryItems = Ember.A([
    CollectionPerformanceSummary.create({
      id: '1',
      score: 100,
      timeSpent: 5000000
    }),
    CollectionPerformanceSummary.create({
      id: '2',
      score: 90,
      timeSpent: 5100000
    }),
    CollectionPerformanceSummary.create({
      id: '3',
      score: 80,
      timeSpent: 5300000
    })
  ]);

  this.set('contentTitle', 'Any content title');
  this.set(
    'collectionPerformanceSummaryItems',
    collectionPerformanceSummaryItems
  );
  this.set('assessmentsMock', assessmentsMock);

  this.render(hbs`{{student/class/analytics/gru-performance-table
    contentTitle=contentTitle
    assessments=assessmentsMock
    collectionPerformanceSummaryItems=collectionPerformanceSummaryItems}}`);

  const $component = this.$(); //component dom element
  const $performanceTable = $component.find('.gru-performance-table');

  T.exists(assert, $performanceTable, 'Missing student performance table');

  const $tableWrapper = $performanceTable.find('.performance-table-wrapper');
  T.exists(assert, $tableWrapper, 'Missing table wrapper');

  const $table = $performanceTable.find('.table');
  T.exists(assert, $table, 'Missing table');

  const $thead = $table.find('thead');
  T.exists(assert, $thead, 'Missing thead of the table');

  const $tbody = $table.find('tbody');
  T.exists(assert, $tbody, 'Missing tbody of the table');

  const $assessment = $thead.find('.assessment');
  T.exists(assert, $assessment, 'Missing assessment header');

  const $score = $thead.find('.score');
  T.exists(assert, $score, 'Missing score header');

  const $report = $thead.find('.report');
  T.notExists(assert, $report, 'Report header should not appear');

  const $completion = $thead.find('.completion');
  T.exists(assert, $completion, 'Missing completion header');

  const $studyTime = $thead.find('.study-time');
  T.exists(assert, $studyTime, 'Missing completion header');

  //1 for the summary, 3 assessments, the assessment with no performance should not be included
  assert.equal(
    $tbody.find('th.assessment-title').length,
    4,
    'The tbody should have only 4 assessment headers, 1 for the summary, 3 for the assessments'
  );

  const $performanceScore = $tbody.find('.performance-score');
  assert.equal(
    $performanceScore.length,
    4,
    'The tbody should have only 4 assessment performance scores'
  );

  const $performanceCompletion = $tbody.find('.performance-completion');
  assert.equal(
    $performanceCompletion.length,
    4,
    'The tbody should have only 4 assessment performance completions'
  );

  const $performanceStudyTime = $tbody.find('.performance-time');
  assert.equal(
    $performanceStudyTime.length,
    4,
    'The tbody should have only 4 assessment performance study times'
  );

  //Summary row
  const $summaryRow = $table.find('.summary');
  assert.equal(
    T.text($summaryRow.find('.assessment-title')),
    'Any content title',
    'Wrong summary title'
  );
  assert.equal(
    T.text($summaryRow.find('.performance-score')),
    '90%',
    'Wrong summary score'
  );
  assert.equal(
    T.text($summaryRow.find('.performance-time')),
    '1h 25m 33s',
    'Wrong summary time spent'
  );
  assert.notOk(
    $summaryRow.find('.performance-report').length,
    'Report column should not appear'
  );
  assert.notOk(
    $summaryRow.find('.performance-report .report-icon').length,
    'Report icon should not appear'
  );

  const $columns = $table.find('tbody');
  assert.notOk(
    $columns.find('.performance-report').length,
    'Report column should not appear'
  );
  assert.notOk(
    $columns.find('.performance-report a span.report-icon').length,
    'Report icon should not appear'
  );
});
skip('Performance Table Layout with Report Column', function(assert) {
  const assessmentsMock = [
    AssessmentModel.create({ id: '1', title: 'What is a Fish?' }),
    AssessmentModel.create({ id: '2', title: 'Global Warming Quiz' }),
    AssessmentModel.create({
      id: '3',
      title: 'Pre Assessment Human Impact on Earth'
    }),
    AssessmentModel.create({
      id: '4',
      title: 'Assessment having no performance'
    }) //assessment without performance
  ];

  var collectionPerformanceSummaryItems = Ember.A([
    CollectionPerformanceSummary.create({
      id: '1',
      score: 100,
      timeSpent: 5000000
    }),
    CollectionPerformanceSummary.create({
      id: '2',
      score: 90,
      timeSpent: 5100000
    }),
    CollectionPerformanceSummary.create({
      id: '3',
      score: 80,
      timeSpent: 5300000
    })
  ]);

  let metrics = Ember.A([
    Ember.Object.create({
      value: 'assessment',
      sorted: false,
      isAsc: false,
      hasSorting: true,
      visible: true,
      index: -1
    }),
    Ember.Object.create({
      value: 'score',
      sorted: false,
      isAsc: false,
      hasSorting: true,
      visible: false,
      index: 0
    }),
    Ember.Object.create({
      value: 'report',
      sorted: false,
      isAsc: false,
      hasSorting: false,
      visible: false,
      index: 1
    }),
    Ember.Object.create({
      value: 'completion',
      sorted: false,
      isAsc: false,
      hasSorting: true,
      visible: false,
      index: 2
    }),
    Ember.Object.create({
      value: 'study-time',
      sorted: false,
      isAsc: false,
      hasSorting: true,
      visible: false,
      index: 3
    })
  ]);

  this.set('contentTitle', 'Any content title');
  this.set('showReportColumn', true);
  this.set('metrics', metrics);
  this.set(
    'collectionPerformanceSummaryItems',
    collectionPerformanceSummaryItems
  );
  this.set('assessmentsMock', assessmentsMock);

  this.render(hbs`{{student/class/analytics/gru-performance-table
    contentTitle=contentTitle
    assessments=assessmentsMock
    collectionPerformanceSummaryItems=collectionPerformanceSummaryItems
    showReportColumn=showReportColumn
    metrics=metrics}}`);

  const $component = this.$(); //component dom element
  const $performanceTable = $component.find('.gru-performance-table');

  T.exists(assert, $performanceTable, 'Missing student performance table');
});

skip('Sort by assessment sequence', function(assert) {
  const assessmentsMock = [
    AssessmentModel.create({ id: '1', sequence: 1, title: 'What is a Fish?' }),
    AssessmentModel.create({
      id: '2',
      sequence: 2,
      title: 'Global Warming Quiz'
    }),
    AssessmentModel.create({
      id: '3',
      sequence: 3,
      title: 'Assessment Human Impact on Earth'
    })
  ];

  var collectionPerformanceSummaryItems = Ember.A([
    CollectionPerformanceSummary.create({
      id: '1',
      score: 1,
      completionDone: 1,
      completionTotal: 50,
      timeSpent: 5000000
    }),
    CollectionPerformanceSummary.create({
      id: '2',
      score: 2,
      completionDone: 14,
      completionTotal: 50,
      timeSpent: 5100000
    }),
    CollectionPerformanceSummary.create({
      id: '3',
      score: 3,
      completionDone: 23,
      completionTotal: 50,
      timeSpent: 5300000
    })
  ]);

  this.set(
    'collectionPerformanceSummaryItems',
    collectionPerformanceSummaryItems
  );
  this.set('assessmentsMock', assessmentsMock);

  this.render(
    hbs`{{student/class/analytics/gru-performance-table assessments=assessmentsMock collectionPerformanceSummaryItems=collectionPerformanceSummaryItems}}`
  );

  const $component = this.$(); //component dom element
  const $performanceTable = $component.find('.gru-performance-table .table');
  const $tbody = $performanceTable.find('tbody');

  assert.equal(
    T.text($tbody.find('tr:eq(1) th.header span')),
    'What is a Fish?',
    'First assessment should be What is a Fish?'
  );
});

skip('Sort by assessment title', function(assert) {
  const assessmentsMock = [
    AssessmentModel.create({ id: '1', title: 'What is a Fish?' }),
    AssessmentModel.create({ id: '2', title: 'Global Warming Quiz' }),
    AssessmentModel.create({
      id: '3',
      title: 'Assessment Human Impact on Earth'
    })
  ];

  var collectionPerformanceSummaryItems = Ember.A([
    CollectionPerformanceSummary.create({
      id: '1',
      score: 1,
      completionDone: 1,
      completionTotal: 50,
      timeSpent: 5000000
    }),
    CollectionPerformanceSummary.create({
      id: '2',
      score: 2,
      completionDone: 14,
      completionTotal: 50,
      timeSpent: 5100000
    }),
    CollectionPerformanceSummary.create({
      id: '3',
      score: 3,
      completionDone: 23,
      completionTotal: 50,
      timeSpent: 5300000
    })
  ]);

  this.set(
    'collectionPerformanceSummaryItems',
    collectionPerformanceSummaryItems
  );
  this.set('assessmentsMock', assessmentsMock);

  this.render(
    hbs`{{student/class/analytics/gru-performance-table assessments=assessmentsMock collectionPerformanceSummaryItems=collectionPerformanceSummaryItems}}`
  );

  const $component = this.$(); //component dom element
  const $performanceTable = $component.find('.gru-performance-table .table');
  const $thead = $performanceTable.find('thead');
  const $assessmentHeader = $thead.find('th.assessment'); //assessments column
  const $tbody = $performanceTable.find('tbody');

  $assessmentHeader.find('a').click(); //ascending assessment sort, because it is  sorted by sequence by default

  return wait().then(function() {
    assert.equal(
      T.text($tbody.find('tr:eq(1) th.header span')),
      'Assessment Human Impact on Earth',
      'First assessment should be Assessment Human Impact on Earth'
    );
    $assessmentHeader.find('a').click(); //descending assessment sort

    return wait().then(function() {
      assert.equal(
        T.text($tbody.find('tr:eq(1) th.header span')),
        'What is a Fish?',
        'First assessment should be What is a Fish?'
      );
    });
  });
});

skip('Sort by score Metric', function(assert) {
  const assessmentsMock = [
    AssessmentModel.create({ id: '1', title: 'What is a Fish?' }),
    AssessmentModel.create({ id: '2', title: 'Global Warming Quiz' }),
    AssessmentModel.create({
      id: '3',
      title: 'Assessment Human Impact on Earth'
    })
  ];

  var collectionPerformanceSummaryItems = Ember.A([
    CollectionPerformanceSummary.create({
      id: '1',
      score: 100,
      completionDone: 1,
      completionTotal: 50,
      timeSpent: 5000000
    }),
    CollectionPerformanceSummary.create({
      id: '2',
      score: 22,
      completionDone: 14,
      completionTotal: 50,
      timeSpent: 5100000
    }),
    CollectionPerformanceSummary.create({
      id: '3',
      score: 35,
      completionDone: 23,
      completionTotal: 50,
      timeSpent: 5300000
    })
  ]);

  this.set(
    'collectionPerformanceSummaryItems',
    collectionPerformanceSummaryItems
  );
  this.set('assessmentsMock', assessmentsMock);

  this.render(
    hbs`{{student/class/analytics/gru-performance-table assessments=assessmentsMock collectionPerformanceSummaryItems=collectionPerformanceSummaryItems}}`
  );

  const $component = this.$(); //component dom element
  const $performanceTable = $component.find('.gru-performance-table .table');
  const $thead = $performanceTable.find('thead');
  const $scoreHeader = $thead.find('th.score'); //score column
  const $tbody = $performanceTable.find('tbody');

  $scoreHeader.find('a').click(); //descending score sort, because is sort ascending by default

  return wait().then(function() {
    assert.equal(
      T.text($tbody.find('tr:eq(1) th.header span')),
      'Global Warming Quiz',
      'First assessment should be Global Warming Quiz'
    );
    $scoreHeader.find('a').click(); //ascending score sort

    return wait().then(function() {
      assert.equal(
        T.text($tbody.find('tr:eq(1) th.header span')),
        'What is a Fish?',
        'First assessment should be What is a Fish?'
      );
    });
  });
});

skip('Sort by Completion Metric', function(assert) {
  const assessmentsMock = [
    AssessmentModel.create({ id: '1', title: 'What is a Fish?' }),
    AssessmentModel.create({ id: '2', title: 'Global Warming Quiz' }),
    AssessmentModel.create({
      id: '3',
      title: 'Assessment Human Impact on Earth'
    })
  ];

  var collectionPerformanceSummaryItems = Ember.A([
    CollectionPerformanceSummary.create({
      id: '1',
      score: 1,
      completionDone: 1,
      completionTotal: 50,
      timeSpent: 5000000
    }),
    CollectionPerformanceSummary.create({
      id: '2',
      score: 2,
      completionDone: 14,
      completionTotal: 50,
      timeSpent: 5100000
    }),
    CollectionPerformanceSummary.create({
      id: '3',
      score: 3,
      completionDone: 23,
      completionTotal: 50,
      timeSpent: 5300000
    })
  ]);

  this.set(
    'collectionPerformanceSummaryItems',
    collectionPerformanceSummaryItems
  );
  this.set('assessmentsMock', assessmentsMock);

  this.render(
    hbs`{{student/class/analytics/gru-performance-table assessments=assessmentsMock collectionPerformanceSummaryItems=collectionPerformanceSummaryItems}}`
  );

  const $component = this.$(); //component dom element
  const $performanceTable = $component.find('.gru-performance-table .table');
  const $thead = $performanceTable.find('thead');
  const $completionHeader = $thead.find('th.completion'); //completion column
  const $tbody = $performanceTable.find('tbody');

  $completionHeader.find('a').click(); //descending completion sort, because is sort ascending by default

  return wait().then(function() {
    assert.equal(
      T.text($tbody.find('tr:eq(1) th.header span')),
      'What is a Fish?',
      'First assessment should be What is a Fish?'
    );
    $completionHeader.find('a').click(); //ascending completion sort

    return wait().then(function() {
      assert.equal(
        T.text($tbody.find('tr:eq(1) th.header span')),
        'Assessment Human Impact on Earth',
        'First assessment should be Assessment Human Impact on Earth'
      );
    });
  });
});
