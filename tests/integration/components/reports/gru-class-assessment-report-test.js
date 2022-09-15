import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';
import UserResourcesResult from 'gooru-web/models/result/user-resources';
import QuestionResult from 'gooru-web/models/result/question';
import ReportData from 'gooru-web/models/result/report-data';

moduleForComponent(
  'reports/gru-class-assessment-report',
  'Integration | Component | reports/gru class assessment report',
  {
    integration: true,

    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Default Layout', function(assert) {
  const collection = Ember.Object.create({
    collectionType: 'assessment',
    title: 'Sample Assessment Name',

    resourceCount: 2,
    questionCount: 2,
    visibility: true,
    resources: [
      Ember.Object.create({
        id: '569906aa20b7dfae1bcd5262',
        order: 1,
        text: 'Resource 1'
      }),
      Ember.Object.create({
        id: '569906aa3ec3bb39969acbe6',
        order: 2,
        text: 'Resource 2'
      })
    ],
    hasResources: true,
    isAssessment: true
  });

  const students = Ember.A([
    Ember.Object.create({
      id: '56983a9060a68052c1ed934c',
      fullName: 'Rocha, Perez'
    }),
    Ember.Object.create({
      id: '56983a90fb01fecc328e2388',
      fullName: 'Snyder, Mason'
    })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: collection.get('resources')
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '56983a9060a68052c1ed934c',
      resourceResults: [
        QuestionResult.create({
          correct: true,
          resourceId: '569906aa20b7dfae1bcd5262',
          reaction: 2,
          timeSpent: 701
        }),
        QuestionResult.create({
          correct: true,
          resourceId: '569906aa3ec3bb39969acbe6',
          reaction: 4,
          timeSpent: 1333
        })
      ]
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: [
        QuestionResult.create({
          correct: true,
          resourceId: '569906aa20b7dfae1bcd5262',
          reaction: 2,
          timeSpent: 701
        }),
        QuestionResult.create({
          correct: true,
          resourceId: '569906aa3ec3bb39969acbe6',
          reaction: 4,
          timeSpent: 1333
        })
      ]
    })
  ]);

  this.set('collection', collection);
  this.set('students', students);
  this.set('reportData', reportData);

  this.render(hbs`{{reports/gru-class-assessment-report
    assessment=collection
    students=students
    reportData=reportData
  }}`);

  const $component = this.$();

  const $summary = $component.find('.gru-summary');
  T.exists(assert, $summary, 'Missing question summary');

  const $viewContainer = $component.find('.view-container');
  T.exists(assert, $viewContainer, 'Missing view container');
  assert.ok(
    !$viewContainer.hasClass('table-view'),
    'Table view should not be selected by default'
  );
  assert.ok(
    $viewContainer.hasClass('student-view'),
    'Student view should be selected by default'
  );

  T.exists(
    assert,
    $viewContainer.find('.gru-view-layout-picker'),
    'Missing gru view layout picker'
  );
  T.exists(
    assert,
    $viewContainer.find('.gru-table-view'),
    'Missing table view'
  );
  T.exists(
    assert,
    $viewContainer.find('.gru-student-view'),
    'Missing student view'
  );

  //click at the view layout picker - thumbnails view
  $viewContainer
    .find('.gru-view-layout-picker .view-option.thumbnails a')
    .click();
  assert.ok(
    !$viewContainer.hasClass('table-view'),
    'Table view should not be selected'
  );
  assert.ok(
    $viewContainer.hasClass('student-view'),
    'Student view should be selected'
  );

  //click at the view layout picker - list view
  $viewContainer.find('.gru-view-layout-picker .view-option.list a').click();
  assert.ok(
    $viewContainer.hasClass('table-view'),
    'Table view should be selected'
  );
  assert.ok(
    !$viewContainer.hasClass('student-view'),
    'Student view should not be selected'
  );
});
