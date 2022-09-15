import Ember from 'ember';

import { roundFloat } from './math';
import { formatTime } from './utils';

/**
 * Create a performanceObject from the performance data
 * @param performance the base performance data
 * @param model model information
 * @param level indicates the object level, course|unit|lesson
 */
export function createPerformanceObject(performance, model, level = false) {
  const score = performance.get('score');
  const timeSpent = performance.get('timeSpent');
  return Ember.Object.create({
    id: performance.get('realId'),
    collectionType: performance.get('collectionType'),
    headerTitle: model.get('title'),
    model: model,
    score: roundFloat(score),
    timeSpent: formatTime(timeSpent),
    hasStarted: score > 0 || timeSpent > 0,
    hasScore: score >= 0,
    completionDone: performance.get('completionDone'),
    completionTotal: performance.get('completionTotal'),
    level: level,
    hideScore:
      level === 'lesson' && model && !model.get('hasNonOpenEndedQuestions')
  });
}

/**
 * Create a User average object from the classPerformanceData
 * @param classPerformanceData the base performance data
 */
export function createUserAverageObject(studentPerformance) {
  const score = studentPerformance.get('averageScore');
  const timeSpent = studentPerformance.get('averageTimeSpent');
  return Ember.Object.create({
    isAverage: true, //indicates it is an average object
    score: roundFloat(score),
    studyTime: timeSpent,
    timeSpent: formatTime(roundFloat(timeSpent)),
    hasStarted: score > 0 || timeSpent > 0,
    hasScore: score >= 0,
    completionDone: studentPerformance.get('sumCompletionDone'),
    completionTotal: studentPerformance.get('sumCompletionTotal')
  });
}

/**
 * Create an Item average object from the classPerformanceData with an itemId as well
 * @param classPerformanceData the base performance data
 * @param model item we are getting the item average object of
 */
export function createItemAverageObject(
  classPerformanceData,
  model,
  level = false
) {
  const itemId = model.get('id');
  const score = classPerformanceData.calculateAverageScoreByItem(itemId);
  const timeSpent = classPerformanceData.calculateAverageTimeSpentByItem(
    itemId
  );

  return Ember.Object.create({
    score: roundFloat(score),
    timeSpent: formatTime(roundFloat(timeSpent)),
    hasStarted: score > 0 || timeSpent > 0,
    hasScore: score >= 0,
    completionDone: classPerformanceData.calculateSumCompletionDoneByItem(
      itemId
    ),
    completionTotal: classPerformanceData.calculateSumCompletionTotalByItem(
      itemId
    ),
    hideScore:
      level === 'lesson' && model && !model.get('hasNonOpenEndedQuestions')
  });
}

/**
 * Create a class average object from the classPerformanceData
 * @param classPerformanceData the base performance data
 */
export function createClassAverageObject(classPerformanceData) {
  const score = classPerformanceData.get('classAverageScore');
  const timeSpent = classPerformanceData.get('classAverageTimeSpent');

  return Ember.Object.create({
    score: roundFloat(score),
    timeSpent: formatTime(roundFloat(timeSpent)),
    hasStarted: score > 0 || timeSpent > 0,
    hasScore: score >= 0,
    completionDone: classPerformanceData.get('classSumCompletionDone'),
    completionTotal: classPerformanceData.get('classSumCompletionTotal')
  });
}

/**
 * Create a matrix with random data to be used to fill the teacher analytics data by student.
 * @param headers the table header
 * @param classPerformanceData the base performance data
 */
export function createDataMatrix(headers, classPerformanceData, level = false) {
  const studentPerformanceData = classPerformanceData.get(
    'studentPerformanceData'
  );
  let excludedIds = [];
  if (level === 'lesson') {
    excludedIds = headers
      .filter(function(header) {
        return !header.get('hasNonOpenEndedQuestions');
      })
      .map(function(header) {
        return header.get('id');
      });
  }
  const dataMatrix = Ember.A([]);
  studentPerformanceData.forEach(function(studentPerformance) {
    studentPerformance.set('excludedIds', excludedIds);
    const user = studentPerformance.get('user');
    const performanceData = studentPerformance.get('performanceData');

    var userData = Ember.Object.create({
      user: user.get('fullName'),
      userId: user.get('id'),
      performanceData: Ember.A([])
    });
    headers.forEach(function(headerItem) {
      const performance = performanceData.findBy(
        'id',
        `${user.get('id')}@${headerItem.get('id')}`
      );

      if (performance) {
        userData
          .get('performanceData')
          .push(createPerformanceObject(performance, headerItem, level));
      } else {
        userData.get('performanceData').push(undefined);
      }
    });
    // Inserts User averages at position 0 of the current row of performance elements.
    userData
      .get('performanceData')
      .insertAt(0, createUserAverageObject(studentPerformance));
    // Pushes User data in the matrix.

    dataMatrix.push(userData);
  });

  // Inserts the Header average for each item (unit|lesson|collection)
  var itemPerformanceAverageData = Ember.Object.create({
    performanceData: Ember.A([])
  });
  headers.forEach(function(headerItem) {
    const itemPerformanceAverage = createItemAverageObject(
      classPerformanceData,
      headerItem,
      level
    );
    itemPerformanceAverageData
      .get('performanceData')
      .push(itemPerformanceAverage);
  });
  itemPerformanceAverageData
    .get('performanceData')
    .insertAt(0, createClassAverageObject(classPerformanceData));
  dataMatrix.insertAt(0, itemPerformanceAverageData);
  return dataMatrix;
}

/**
 * @function aggregateMilestonePerformanceScore
 * Method to aggregate given list of performance objects
 */
export function aggregateMilestonePerformanceScore(items) {
  let aggregatedScoreValue = null;
  if (items && items.length) {
    aggregatedScoreValue = 0;
    items.map(item => {
      let itemPerformanceScore = item.get('performance.scoreInPercentage');
      aggregatedScoreValue += itemPerformanceScore ? itemPerformanceScore : 0;
    });
    aggregatedScoreValue = aggregatedScoreValue / items.length;
  }
  return roundFloat(aggregatedScoreValue);
}

/**
 * @function aggregateMilestonePerformanceTimeSpent
 * Method to aggregate given list of performance objects
 */
export function aggregateMilestonePerformanceTimeSpent(items) {
  let aggregatedTimeSpentValue = null;
  if (items && items.length) {
    aggregatedTimeSpentValue = 0;
    items.map(item => {
      let itemPerformanceTimeSpent = item.get('performance.timeSpent');
      aggregatedTimeSpentValue += itemPerformanceTimeSpent
        ? itemPerformanceTimeSpent
        : 0;
    });
  }
  return roundFloat(aggregatedTimeSpentValue);
}
