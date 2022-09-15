import Ember from 'ember';
import { average, roundFloat } from 'gooru-web/utils/math';

/**
 * Utility methods to handle stats for QuestionResult instances
 */

/**
 * Returns stats for a set of question results
 * @param {QuestionResult[]} questionResults
 * @returns {{ total: number, correct: number, incorrect: number, skipped: number, notStarted: number}}
 */
export function stats(questionResults) {
  let total = questionResults.length;
  let correct = 0;
  let incorrect = 0;
  let skipped = 0;
  let started = 0;
  let timeSpent = 0;
  let reactions = [];

  questionResults.forEach(function(item) {
    let isOE = Ember.get(item, 'questionType') === 'OE';

    if (!isOE) {
      correct += Ember.get(item, 'correct') ? 1 : 0;
      incorrect += Ember.get(item, 'incorrect') ? 1 : 0;
    } else {
      total -= 1;
    }

    skipped += Ember.get(item, 'skipped') ? 1 : 0;
    started += Ember.get(item, 'started') ? 1 : 0;
    timeSpent += Ember.get(item, 'timeSpent');

    if (Ember.get(item, 'reaction')) {
      reactions.push(Ember.get(item, 'reaction'));
    }
  });

  let notStarted = total - started;
  let completed = correct + incorrect; //incorrect should include skipped ones

  return Ember.Object.create({
    total: total,
    totalCorrect: correct,
    correctPercentage: completed ? roundFloat(correct / completed * 100) : null,
    correctPercentageFromTotal: roundFloat(correct / total * 100, 1), //percentage including not started
    totalIncorrect: incorrect,
    incorrectPercentage: completed
      ? roundFloat(incorrect / completed * 100)
      : null,
    incorrectPercentageFromTotal: roundFloat(incorrect / total * 100, 1), //percentage including not started
    totalSkipped: skipped,
    skippedPercentage: roundFloat(skipped / total * 100),
    totalNotStarted: notStarted,
    notStartedPercentage: roundFloat(notStarted / total * 100),
    totalCompleted: completed,
    completedPercentage: roundFloat(completed / total * 100),
    averageReaction: reactions.length ? roundFloat(average(reactions)) : null,
    totalTimeSpent: timeSpent
  });
}

/**
 * Average user reaction to the questions in the assessment
 * @param {QuestionResult[]} questionsResults
 * @prop {Number} averageReaction
 */
export function averageReaction(questionsResults) {
  let totals = stats(questionsResults);
  return totals.get('averageReaction');
}

/**
 * Number of questions answered correctly in this attempt
 * @param {QuestionResult[]} questionsResults
 * @prop {Number}
 */
export function correctAnswers(questionsResults) {
  let totals = stats(questionsResults);
  return totals.get('totalCorrect');
}

/**
 * Percentage of correct answers vs. the total number of questions
 * @param {QuestionResult[]} questionsResults
 * @param {boolean} includeAll, when true it calculates the percentage based on all questions, not only the answered
 * @prop {Number}
 */
export function correctPercentage(questionsResults, includeAll = false) {
  let totals = stats(questionsResults);
  return includeAll
    ? totals.get('correctPercentageFromTotal')
    : totals.get('correctPercentage');
}
/**
 * Total number of seconds spent completing the current attempt
 * @param {QuestionResult[]} questionsResults
 * @prop {Number}
 */
export function totalTimeSpent(questionsResults) {
  let totals = stats(questionsResults);
  return totals.get('totalTimeSpent');
}

/**
 * Total number of results completed
 * @param {QuestionResult[]} questionsResults
 * @prop {number}
 */
export function totalCompleted(questionsResults) {
  let totals = stats(questionsResults);
  return totals.get('totalCompleted');
}

/**
 * Total number of results completed
 * @param {QuestionResult[]} questionsResults
 * @prop {number}
 */
export function totalNotStarted(questionsResults) {
  let totals = stats(questionsResults);
  return totals.get('totalNotStarted');
}

/**
 * Returns only completed results
 * @param {QuestionResult[]} questionsResults
 * @prop {QuestionResult[]}
 */
export function completedResults(questionsResults) {
  return questionsResults.filter(function(questionResult) {
    return questionResult.get('completed');
  });
}

/**
 * Returns only answered results
 * @param {QuestionResult[]} questionsResults
 * @prop {QuestionResult[]}
 */
export function answeredResults(questionsResults) {
  return questionsResults.filter(function(questionResult) {
    return questionResult.get('answered');
  });
}

/**
 * Sort results by submittedAt field, ascending
 * @param {QuestionResult[]} questionsResults
 * @prop {QuestionResult[]}
 */
export function sortResults(questionsResults) {
  return questionsResults.sortBy('submittedAt');
}

/**
 * Returns valid user answers
 * @param {QuestionResult[]} questionResults
 * @return {*} user answers
 */
export function userAnswers(questionResults) {
  let answered = answeredResults(questionResults);
  let sorted = sortResults(answered); //sort results by submitted at
  return sorted.map(function(questionResult) {
    return questionResult.get('userAnswer');
  });
}
