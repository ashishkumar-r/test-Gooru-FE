import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import QuestionResult from 'gooru-web/models/result/question';
import UserResourcesResult from 'gooru-web/models/result/user-resources';
import ReportData from 'gooru-web/models/result/report-data';

moduleForComponent(
  'reports/class-assessment/gru-table-view',
  'Integration | Component | reports/class assessment/gru table view',
  {
    integration: true,
    beforeEach: function() {
      this.inject.service('i18n');
    }
  }
);

test('it renders', function(assert) {
  var assessment = Ember.Object.create({
    resources: [
      Ember.Object.create({
        id: '56a120483b6e7b090501d3e7',
        order: 1
      }),
      Ember.Object.create({
        id: '56a1204886b2e565e1b2c230',
        order: 3
      }),
      Ember.Object.create({
        id: '56a12048ddee2022a741356a',
        order: 2
      })
    ]
  });

  var students = Ember.A([
    Ember.Object.create({
      id: '56983a9060a68052c1ed934c',
      fullName: 'Rocha, Perez'
    }),
    Ember.Object.create({
      id: '56983a90fb01fecc328e2388',
      fullName: 'Snyder, Mason'
    }),
    Ember.Object.create({
      id: '56983a906596902edadedc7c',
      fullName: 'Hutchinson, Blake'
    })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: assessment.get('resources')
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '56983a9060a68052c1ed934c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216
        }),
        QuestionResult.create({
          resourceId: '56a1204886b2e565e1b2c230',
          correct: true,
          reaction: 2,
          timeSpent: 2458
        }),
        QuestionResult.create({
          resourceId: '56a12048ddee2022a741356a',
          correct: true,
          reaction: 3,
          timeSpent: 1433
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 5,
          timeSpent: 1216
        }),
        QuestionResult.create({
          resourceId: '56a1204886b2e565e1b2c230',
          correct: true,
          reaction: 3,
          timeSpent: 1433
        }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216
        }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    })
  ]);

  this.set('assessment', assessment);
  this.set('students', students);
  this.set('reportData', reportData);

  this.render(hbs`{{reports/class-assessment/gru-table-view
    assessment=assessment
    students=students
    reportData=reportData}}`);

  const $component = this.$('.reports.class-assessment.gru-table-view');
  assert.ok($component.length, 'Component classes');
  assert.equal(
    $component.find('.filters .checkbox').length,
    3,
    'Number of filter boxes'
  );
  assert.equal(
    $component.find('.filters .checkbox input[disabled]').length,
    1,
    'Filter boxes disabled'
  );
  assert.equal(
    $component.find('.filters .checkbox .correct').attr('disabled'),
    'disabled',
    'Score filter checkbox is disabled'
  );
  assert.ok(
    $component.find('.filters .checkbox .correct').prop('checked'),
    'Score filter checkbox is checked by default'
  );

  const $table = $component.find('.gru-two-tier-header-table');
  const $firstTierHeader = $table.find('tr.first-tier');

  assert.equal(
    $firstTierHeader.find('th').length,
    4,
    'First tier: Number of header columns'
  );
  assert.equal(
    $firstTierHeader.find('th:eq(0)').text().trim(),
    this.get('i18n').t('reports.gru-table-view.totals').string,
    'First tier: First header is for aggregate values'
  );

  const $secondTierHeader = $table.find('tr.second-tier');
  assert.equal(
    $secondTierHeader.find('th').length,
    13,
    'Second tier: Total column headers'
  );
  assert.equal(
    $secondTierHeader.find('th.hidden').length,
    8,
    'Second tier: Hidden column headers'
  );
  assert.ok(
    $secondTierHeader.find('th:eq(0)').hasClass('row-header'),
    'Second tier: Row header present'
  );
  assert.ok(
    $secondTierHeader.find('th:eq(1)').hasClass('correct'),
    'Second tier: Question first column'
  );
  assert.ok(
    $secondTierHeader.find('th:eq(2)').hasClass('timeSpent'),
    'Second tier: Question second column'
  );
  assert.ok(
    $secondTierHeader.find('th:eq(3)').hasClass('reaction'),
    'Second tier: Question third column'
  );

  const $dataRows = $table.find('tr.data');
  assert.equal($dataRows.length, 3, 'Number of data rows');
});

test('it triggers event when clicking on questions', function(assert) {
  var assessment = Ember.Object.create({
    resources: [
      Ember.Object.create({
        id: '56a120483b6e7b090501d3e7',
        order: 1
      }),
      Ember.Object.create({
        id: '56a1204886b2e565e1b2c230',
        order: 3
      }),
      Ember.Object.create({
        id: '56a12048ddee2022a741356a',
        order: 2
      })
    ]
  });

  var students = Ember.A([
    Ember.Object.create({
      id: '56983a9060a68052c1ed934c',
      fullName: 'Rocha, Perez'
    }),
    Ember.Object.create({
      id: '56983a90fb01fecc328e2388',
      fullName: 'Snyder, Mason'
    }),
    Ember.Object.create({
      id: '56983a906596902edadedc7c',
      fullName: 'Hutchinson, Blake'
    })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: assessment.get('resources')
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '56983a9060a68052c1ed934c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216
        }),
        QuestionResult.create({
          resourceId: '56a1204886b2e565e1b2c230',
          correct: true,
          reaction: 2,
          timeSpent: 2458
        }),
        QuestionResult.create({
          resourceId: '56a12048ddee2022a741356a',
          correct: true,
          reaction: 3,
          timeSpent: 1433
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 5,
          timeSpent: 1216
        }),
        QuestionResult.create({
          resourceId: '56a1204886b2e565e1b2c230',
          correct: true,
          reaction: 3,
          timeSpent: 1433
        }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216
        }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    })
  ]);

  assert.expect(3);

  var numClicks = 1;

  this.on('externalAction', function(itemId) {
    if (numClicks === 1) {
      assert.equal(itemId, '-1', 'First click: aggregate column selected');
    } else if (numClicks === 2) {
      assert.equal(
        itemId,
        '56a120483b6e7b090501d3e7',
        'Second click: first question selected'
      );
    } else {
      assert.equal(
        itemId,
        '56a1204886b2e565e1b2c230',
        'Second click: last question selected'
      );
    }
    numClicks += 1;
  });

  this.set('assessment', assessment);
  this.set('students', students);
  this.set('reportData', reportData);

  this.render(hbs`{{reports/class-assessment/gru-table-view
    assessment=assessment
    students=students
    reportData=reportData
    onSelectQuestion=(action 'externalAction')}}`);

  const $component = this.$('.gru-table-view');
  $component.find('.first-tier th:eq(0)').click();
  $component.find('.first-tier th:eq(1)').click();
  $component.find('.first-tier th:eq(3)').click();
});
