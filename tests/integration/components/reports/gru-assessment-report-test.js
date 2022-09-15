import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import Ember from 'ember';
import AssessmentResult from 'gooru-web/models/result/assessment';
import LearningTargetResult from 'gooru-web/models/result/learning-target';
import QuestionResult from 'gooru-web/models/result/question';

moduleForComponent(
  'reports/gru-assessment-report',
  'Integration | Component | reports/gru assessment report',
  {
    integration: true
  }
);

test('Layout when answer results are shown', function(assert) {
  var resourceResults = [
    QuestionResult.create({
      id: 'question-1',
      order: 1,
      text: 'Question 1'
    })
  ];

  this.set(
    'assessmentResult',
    AssessmentResult.create({
      sortedResourceResults: Ember.A(),
      totalAttempts: 0,
      collection: Ember.Object.create({
        collectionType: 'assessment',
        title: 'Sample Assessment Name',
        resourceCount: 1,
        questionCount: 1,
        visibility: true,
        resources: resourceResults,
        hasResources: true,
        isAssessment: true
      }),
      mastery: Ember.A([
        LearningTargetResult.create({
          id: 'LA-1',
          relatedQuestions: ['question-1'],
          standard: 'Sample Standard Name'
        })
      ]),
      resourceResults: resourceResults
    })
  );

  this.render(hbs`
  {{reports/gru-assessment-report
    assessmentResult=assessmentResult
  }}`);

  const $component = this.$(
    '.reports.gru-assessment-report .gru-assessment-summary'
  );
  assert.ok($component.length, 'Component');
  assert.ok($component.find('> .gru-summary').length, 'Top Summary');
  assert.ok($component.find('> .gru-questions').length, 'Questions Summary');
});

test('Layout when answer results are not shown', function(assert) {
  var resourceResults = [
    QuestionResult.create({
      id: 'question-1',
      order: 1,
      text: 'Question 1'
    })
  ];

  this.set(
    'assessmentResult',
    AssessmentResult.create({
      sortedResourceResults: Ember.A(),
      totalAttempts: 0,
      collection: Ember.Object.create({
        collectionType: 'assessment',
        title: 'Sample Assessment Name',
        resourceCount: 1,
        questionCount: 1,
        visibility: true,
        resources: resourceResults,
        hasResources: true,
        isAssessment: true
      }),
      resourceResults: resourceResults
    })
  );

  this.render(hbs`
  {{reports/gru-assessment-report
    areAnswersHidden=true
    assessmentResult=assessmentResult
  }}`);

  const $component = this.$(
    '.reports.gru-assessment-report .gru-assessment-summary'
  );
  assert.ok($component.length, 'Component');
  assert.ok($component.find('> .gru-summary').length, 'Top Summary');
  assert.ok($component.find('> .hidden-report').length, 'Top Summary');
  assert.notOk(
    $component.find('> .gru-questions').length,
    'Questions Summary -hidden'
  );
});
