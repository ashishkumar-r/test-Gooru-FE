import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import { GRADING_SCALE } from 'gooru-web/config/config';
import QuestionResult from 'gooru-web/models/result/question';
import UserResourcesResult from 'gooru-web/models/result/user-resources';
import ReportData from 'gooru-web/models/result/report-data';

moduleForComponent(
  'reports/class-assessment/gru-summary',
  'Integration | Component | reports/class assessment/gru summary',
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
    Ember.Object.create({ id: '56983a9060a68052c1ed934c' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388' }),
    Ember.Object.create({ id: '56983a906596902edadedc7c' }),
    Ember.Object.create({ id: '56983a9082f705e65f2fe607' })
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
          timeSpent: 1216,
          userAnswer: 1
        }),
        QuestionResult.create({
          resourceId: '56a1204886b2e565e1b2c230',
          correct: true,
          reaction: 2,
          timeSpent: 2458,
          userAnswer: 1
        }),
        QuestionResult.create({
          resourceId: '56a12048ddee2022a741356a',
          correct: true,
          reaction: 3,
          timeSpent: 1433,
          userAnswer: 1
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
          timeSpent: 1216,
          userAnswer: 1
        }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({
          resourceId: '56a12048ddee2022a741356a',
          correct: true,
          reaction: 3,
          timeSpent: 1433,
          userAnswer: 1
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 1
        }),
        QuestionResult.create({
          resourceId: '56a1204886b2e565e1b2c230',
          correct: true,
          reaction: 5,
          timeSpent: 2458,
          userAnswer: 1
        }),
        QuestionResult.create({
          resourceId: '56a12048ddee2022a741356a',
          correct: true,
          reaction: 5,
          timeSpent: 1433,
          userAnswer: 1
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a9082f705e65f2fe607',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: true,
          reaction: 4,
          timeSpent: 1216,
          userAnswer: 1
        }),
        QuestionResult.create({
          resourceId: '56a1204886b2e565e1b2c230',
          correct: true,
          reaction: 4,
          timeSpent: 2458,
          userAnswer: 1
        }),
        QuestionResult.create({
          resourceId: '56a12048ddee2022a741356a',
          correct: true,
          reaction: 3,
          timeSpent: 1433,
          userAnswer: 1
        })
      ])
    })
  ]);

  this.setProperties({
    assessment: assessment,
    students: students,
    reportData: reportData,
    showAllQuestions: true
  });

  this.render(hbs`{{ reports/class-assessment/gru-summary
    assessment=assessment
    students=students
    reportData=reportData
    isQuestionView=showAllQuestions }}`);

  const $component = this.$('.reports.class-assessment.gru-summary');
  assert.ok($component.length, 'Component has component classes');

  // Overview -Circular charts
  var $overview = $component.find('.overview');

  assert.equal(
    $overview.length,
    2,
    'The charts are rendered in 2 containers -one is for the collapsed view of the questions; the other one is for the expanded view'
  );

  $overview = $component.find('.overview:first');

  assert.ok(
    $overview.find('.scores .gru-pie-chart').length,
    'Overview section has a pie chart with the class scores'
  );
  assert.equal(
    $overview.find('.scores > span').text(),
    this.get('i18n').t('common.classScores').string,
    'The class scores pie chart has the correct caption'
  );

  assert.ok(
    $overview.find('.average-score .gru-bubble-chart').length,
    'Overview section has a colored circle with the average class score'
  );
  assert.equal(
    $overview
      .find('.average-score .gru-bubble-chart')
      .text()
      .trim(),
    '71%',
    'Average class score is computed correctly'
  );
  assert.equal(
    $overview.find('.average-score > span').text(),
    this.get('i18n').t('common.averageScore').string,
    'The circle with the average class score has the correct caption'
  );

  assert.ok(
    $overview.find('.completion .gru-radial-chart').length,
    'Overview section has a radial chart with the proportion of students that have completed the assessment'
  );
  assert.ok(
    $overview
      .find('.completion .gru-radial-chart')
      .text()
      .trim(),
    '3/4',
    'Radial chart label shows the correct proportion of students that have completed the assessment'
  );
  assert.equal(
    $overview.find('.completion > span').text(),
    this.get('i18n').t('common.completed').string,
    'The radial chart has the correct caption'
  );

  $overview = $component.find('.overview:last');

  assert.ok(
    $overview.hasClass('small'),
    'The chart container for the expanded view of the questions can be identified by a class'
  );
  assert.ok(
    $overview.find('.scores .gru-pie-chart').length,
    'Overview section has a pie chart with the class scores'
  );

  assert.ok(
    $overview.find('.average-score .gru-bubble-chart').length,
    'Overview section has a colored circle with the average class score'
  );
  assert.equal(
    $overview
      .find('.average-score .gru-bubble-chart')
      .text()
      .trim(),
    '71%',
    'Average class score is computed correctly'
  );

  assert.ok(
    $overview.find('.completion .gru-radial-chart').length,
    'Overview section has a radial chart with the proportion of students that have completed the assessment'
  );
  assert.ok(
    $overview
      .find('.completion .gru-radial-chart')
      .text()
      .trim(),
    '3/4',
    'Radial chart label shows the correct proportion of students that have completed the assessment'
  );

  // Question summary
  const $questions = $component.find('.gru-questions-summary ol li');
  assert.equal(
    $questions.length,
    3,
    'The question summary shows the information for all the questions'
  );

  // Layout of the first question
  const $firstQuestion = $questions.first();

  var $incorrectBar = $firstQuestion.find('.gru-x-bar-chart .segment:first');
  assert.ok(
    $incorrectBar
      .attr('style')
      .split(';')[0]
      .indexOf(GRADING_SCALE[0].COLOR) > 0,
    'First question -first segment, correct color'
  );
  assert.ok(
    $incorrectBar
      .attr('style')
      .split(';')[1]
      .indexOf('75%') > 0,
    'First question -first segment, correct percentage'
  );

  /* var $correctBar = $firstQuestion.find(
    '.gru-x-bar-chart .segment:nth-child(2)'
  ); */
  /* assert.ok(
    $correctBar
      .attr('style')
      .split(';')[0]
      .indexOf(GRADING_SCALE[GRADING_SCALE.length - 1].COLOR) > 0,
    'First question -second segment, correct color'
  ); */
  /*  assert.ok(
    $correctBar.attr('style').split(';')[1].indexOf('25%') > 0,
    'First question -second segment, correct percentage'
  ); */

  var $ratio = $firstQuestion.find('.ratio');
  assert.equal(
    $ratio.find('span:first').text(),
    '4',
    'First question -correct number of students that have completed'
  );
  assert.equal(
    $ratio.find('span:last').text(),
    '4',
    'First question -correct number of total students'
  );

  // Layout of the last question
  const $lastQuestion = $questions.last();

  $incorrectBar = $lastQuestion.find('.gru-x-bar-chart .segment:first');
  assert.ok(
    $incorrectBar
      .attr('style')
      .split(';')[1]
      .indexOf('0%') > 0,
    'Second question -first segment, correct percentage'
  );

  //$correctBar = $lastQuestion.find('.gru-x-bar-chart .segment:nth-child(2)');
  /* assert.ok(
    $correctBar
      .attr('style')
      .split(';')[1]
      .indexOf('75%') > 0,
    'Second question -second segment, correct percentage'
  );
 */
  $ratio = $lastQuestion.find('.ratio');
  assert.equal(
    $ratio.find('span:first').text(),
    '3',
    'Second question -correct number of students that have completed'
  );
  assert.equal(
    $ratio.find('span:last').text(),
    '4',
    'Second question -correct number of total students'
  );

  assert.ok(
    $component.find('.grading-scale-legend').length,
    'Component has a grading scale legend'
  );
});
