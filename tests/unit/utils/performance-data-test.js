import Ember from 'ember';

import {
  createPerformanceObject,
  createUserAverageObject,
  createItemAverageObject,
  createClassAverageObject
} from 'gooru-web/utils/performance-data';

import { module, test } from 'qunit';

module('Unit | Utility | performance-data');

test('createPerformanceObject', function(assert) {
  const performance = Ember.Object.create({
    score: 10,
    timeSpent: 1000,
    realId: '1',
    collectionType: 'assessment',
    completionDone: 11,
    completionTotal: 12
  });
  const model = Ember.Object.create({
    id: 1,
    title: 'title'
  });

  const performanceObject = createPerformanceObject(performance, model, 'unit');

  assert.equal(performanceObject.get('id'), '1', 'wrong id');
  assert.equal(
    performanceObject.get('collectionType'),
    'assessment',
    'wrong collection type'
  );
  assert.equal(performanceObject.get('headerTitle'), 'title', 'wrong title');
  assert.equal(performanceObject.get('model.id'), 1, 'wrong model');
  assert.equal(performanceObject.get('score'), 10, 'wrong score');
  assert.equal(performanceObject.get('timeSpent'), '1s', 'wrong time spent');
  assert.equal(performanceObject.get('hasStarted'), true, 'wrong has started');
  assert.equal(
    performanceObject.get('completionDone'),
    11,
    'wrong completion done'
  );
  assert.equal(
    performanceObject.get('completionTotal'),
    12,
    'wrong completion total'
  );
  assert.equal(performanceObject.get('hideScore'), false, 'wrong hide score');
});

test('createPerformanceObject at lesson level', function(assert) {
  const performance = Ember.Object.create({
    score: -1,
    timeSpent: 1000,
    realId: '1',
    collectionType: 'assessment',
    completionDone: 11,
    completionTotal: 12
  });
  const model = Ember.Object.create({
    id: 1,
    title: 'title',
    hasNonOpenEndedQuestions: false
  });

  const performanceObject = createPerformanceObject(
    performance,
    model,
    'lesson'
  );

  assert.equal(performanceObject.get('id'), '1', 'wrong id');
  assert.equal(
    performanceObject.get('collectionType'),
    'assessment',
    'wrong collection type'
  );
  assert.equal(performanceObject.get('headerTitle'), 'title', 'wrong title');
  assert.equal(performanceObject.get('model.id'), 1, 'wrong model');
  assert.equal(performanceObject.get('score'), -1, 'wrong score');
  assert.equal(performanceObject.get('timeSpent'), '1s', 'wrong time spent');
  assert.equal(performanceObject.get('hasStarted'), true, 'wrong has started');
  assert.equal(performanceObject.get('hasScore'), false, 'wrong has score');
  assert.equal(
    performanceObject.get('completionDone'),
    11,
    'wrong completion done'
  );
  assert.equal(
    performanceObject.get('completionTotal'),
    12,
    'wrong completion total'
  );
  assert.equal(performanceObject.get('hideScore'), true, 'wrong hide score');
});

test('createUserAverageObject', function(assert) {
  const studentPerformance = Ember.Object.create({
    averageScore: 10.65,
    averageTimeSpent: 1000,
    sumCompletionDone: 11,
    sumCompletionTotal: 12
  });

  const userAverageObject = createUserAverageObject(studentPerformance);

  assert.equal(userAverageObject.get('isAverage'), true, 'wrong average flag');
  assert.equal(userAverageObject.get('score'), 11, 'wrong score');
  assert.equal(userAverageObject.get('studyTime'), 1000, 'wrong studyTime');
  assert.equal(userAverageObject.get('timeSpent'), '1s', 'wrong timeSpent');
  assert.equal(userAverageObject.get('hasStarted'), true, 'wrong has started');
  assert.equal(userAverageObject.get('hasScore'), true, 'wrong has score');
  assert.equal(
    userAverageObject.get('completionDone'),
    11,
    'wrong completion done'
  );
  assert.equal(
    userAverageObject.get('completionTotal'),
    12,
    'wrong completion total'
  );
});

test('createClassAverageObject', function(assert) {
  const classPerformanceData = Ember.Object.create({
    classAverageScore: 10.65,
    classAverageTimeSpent: 1000,
    classSumCompletionDone: 11,
    classSumCompletionTotal: 12
  });

  const classAverageObject = createClassAverageObject(classPerformanceData);
  assert.equal(classAverageObject.get('score'), 11, 'wrong score');
  assert.equal(classAverageObject.get('timeSpent'), '1s', 'wrong timeSpent');
  assert.equal(classAverageObject.get('hasStarted'), true, 'wrong has started');
  assert.equal(classAverageObject.get('hasScore'), true, 'wrong has started');
  assert.equal(
    classAverageObject.get('completionDone'),
    11,
    'wrong completion done'
  );
  assert.equal(
    classAverageObject.get('completionTotal'),
    12,
    'wrong completion total'
  );
});

test('createItemAverageObject', function(assert) {
  assert.expect(11);
  const classPerformanceData = Ember.Object.create({
    calculateAverageScoreByItem: function(itemId) {
      assert.equal(itemId, 1, 'Wrong item id at calculateAverageScoreByItem');
      return 10.7;
    },
    calculateAverageTimeSpentByItem: function(itemId) {
      assert.equal(
        itemId,
        1,
        'Wrong item id at calculateAverageTimeSpentByItem'
      );
      return 1000;
    },
    calculateSumCompletionDoneByItem: function(itemId) {
      assert.equal(
        itemId,
        1,
        'Wrong item id at calculateSumCompletionDoneByItem'
      );
      return 5;
    },
    calculateSumCompletionTotalByItem: function(itemId) {
      assert.equal(
        itemId,
        1,
        'Wrong item id at calculateSumCompletionTotalByItem'
      );
      return 6;
    }
  });
  const model = Ember.Object.create({
    id: 1
  });
  const itemAverageObject = createItemAverageObject(
    classPerformanceData,
    model,
    'unit'
  );
  assert.equal(itemAverageObject.get('score'), 11, 'wrong score');
  assert.equal(itemAverageObject.get('timeSpent'), '1s', 'wrong timeSpent');
  assert.equal(itemAverageObject.get('hasStarted'), true, 'wrong has started');
  assert.equal(itemAverageObject.get('hasScore'), true, 'wrong has score');
  assert.equal(
    itemAverageObject.get('completionDone'),
    5,
    'wrong completion done'
  );
  assert.equal(
    itemAverageObject.get('completionTotal'),
    6,
    'wrong completion total'
  );
  assert.equal(itemAverageObject.get('hideScore'), false, 'wrong hide score');
});

test('createItemAverageObject at lesson level', function(assert) {
  assert.expect(11);
  const classPerformanceData = Ember.Object.create({
    calculateAverageScoreByItem: function(itemId) {
      assert.equal(itemId, 1, 'Wrong item id at calculateAverageScoreByItem');
      return 10.7;
    },
    calculateAverageTimeSpentByItem: function(itemId) {
      assert.equal(
        itemId,
        1,
        'Wrong item id at calculateAverageTimeSpentByItem'
      );
      return 1000;
    },
    calculateSumCompletionDoneByItem: function(itemId) {
      assert.equal(
        itemId,
        1,
        'Wrong item id at calculateSumCompletionDoneByItem'
      );
      return 5;
    },
    calculateSumCompletionTotalByItem: function(itemId) {
      assert.equal(
        itemId,
        1,
        'Wrong item id at calculateSumCompletionTotalByItem'
      );
      return 6;
    }
  });
  const model = Ember.Object.create({
    id: 1,
    hasNonOpenEndedQuestions: false
  });
  const itemAverageObject = createItemAverageObject(
    classPerformanceData,
    model,
    'lesson'
  );
  assert.equal(itemAverageObject.get('score'), 11, 'wrong score');
  assert.equal(itemAverageObject.get('timeSpent'), '1s', 'wrong timeSpent');
  assert.equal(itemAverageObject.get('hasStarted'), true, 'wrong has started');
  assert.equal(itemAverageObject.get('hasScore'), true, 'wrong has score');
  assert.equal(
    itemAverageObject.get('completionDone'),
    5,
    'wrong completion done'
  );
  assert.equal(
    itemAverageObject.get('completionTotal'),
    6,
    'wrong completion total'
  );
  assert.equal(itemAverageObject.get('hideScore'), true, 'wrong hide score');
});
