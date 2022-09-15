import Ember from 'ember';
import AnswerObject from 'gooru-web/utils/question/answer-object';
import HotSpotTextUtil from 'gooru-web/utils/question/hot-spot-text';
import { module, test } from 'qunit';

module('Unit | Utility | hot spot text');

// --------------- Hot Spot Text tests
test('Hot Spot Text - getCorrectAnswer empty array', function(assert) {
  let question = Ember.Object.create({ answers: Ember.A([]) });
  let questionUtil = HotSpotTextUtil.create({ question: question });
  let correctAnswer = questionUtil.getCorrectAnswer();
  assert.ok(
    !correctAnswer.get('length'),
    'Correct answer should be an empty array'
  );
});

test('Hot Spot Text - getCorrectAnswer', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true }),
    Ember.Object.create({ id: 3, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = HotSpotTextUtil.create({ question: question });

  let correctAnswer = questionUtil.getCorrectAnswer().toArray();
  assert.equal(correctAnswer.get('length'), 2, 'Missing items');
  assert.deepEqual(correctAnswer[0], 2, 'Incorrect answer at 0');
  assert.deepEqual(correctAnswer[1], 3, 'Incorrect answer at 1');
});

test('Hot Spot Text - isAnswerChoiceCorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true }),
    Ember.Object.create({ id: 3, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = HotSpotTextUtil.create({ question: question });

  assert.ok(questionUtil.isAnswerChoiceCorrect(2), 'Answer should be correct');
  assert.ok(
    !questionUtil.isAnswerChoiceCorrect(1),
    'Answer should not be correct'
  );
});

test('Hot Spot Text - isCorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true }),
    Ember.Object.create({ id: 3, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = HotSpotTextUtil.create({ question: question });

  let correctAnswer = [2, 3];
  assert.ok(questionUtil.isCorrect(correctAnswer), 'Answer should be correct');

  let correctDifferentOrder = [3, 2];
  assert.ok(
    questionUtil.isCorrect(correctDifferentOrder),
    'Answer should be correct, even it is not in the same order'
  );

  let incorrectAnswer = [1, 3];
  assert.ok(
    !questionUtil.isCorrect(incorrectAnswer),
    'Answer should not be correct'
  );

  let incorrectLessOptions = [1];
  assert.ok(
    !questionUtil.isCorrect(incorrectLessOptions),
    'Answer should not be correct, it has less options'
  );
});

test('Hot Spot Text - distribution', function(assert) {
  let questionUtil = HotSpotTextUtil.create({ question: null });

  let distribution = questionUtil.distribution([
    [1, 2, 3, 5],
    [3, 1, 5, 2], //same as 1, different order
    [1, 4, 3, 6],
    [6, 2, 1, 3],
    [4, 1, 6, 3], //same as 3, different order
    [1, 2, 3, 5] //same as 1, different order
  ]);

  let answerKeys = distribution
    .map(function(item) {
      return item.get('key');
    })
    .toArray();
  let counts = distribution
    .map(function(item) {
      return item.get('count');
    })
    .toArray();

  let expectedKeys = ['1,2,3,5', '1,3,4,6', '1,2,3,6'];
  assert.deepEqual(answerKeys, expectedKeys, 'Wrong answer keys');
  assert.deepEqual(counts, [3, 2, 1], 'Wrong counts');
});

test('Hot Spot Text - answerKey', function(assert) {
  let questionUtil = HotSpotTextUtil.create({ question: null });

  let key = questionUtil.answerKey([3, 1, 5, 2]);
  assert.equal(key, '1,2,3,5', 'Wrong key');
});

test('Hot Spot Text - sameAnswer', function(assert) {
  let questionUtil = HotSpotTextUtil.create({ question: null });

  let answerA = [3, 1, 5, 2];
  let answerB = [3, 2, 5, 1]; //same as 1, different order
  let answerC = [3, 1, 5]; //less options
  let answerD = [3, 1, 5, 4]; //different option, 4

  assert.ok(
    questionUtil.sameAnswer(answerA, answerB),
    'Answer should be the same even they have different order'
  );
  assert.ok(
    !questionUtil.sameAnswer(answerA, answerC),
    'Answer should not be the same, it has less options'
  );
  assert.ok(
    !questionUtil.sameAnswer(answerA, answerD),
    'Answer should not be the same, it has a different option'
  );
});

test('Hot Spot Text - toAnswerObjects', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false, text: 'text1', order: 1 }),
    Ember.Object.create({ id: 2, isCorrect: true, text: 'text2', order: 2 }),
    Ember.Object.create({ id: 3, isCorrect: true, text: 'text3', order: 3 }),
    Ember.Object.create({ id: 4, isCorrect: true, text: 'text4', order: 4 })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = HotSpotTextUtil.create({ question: question });

  let answerObjects = questionUtil.toAnswerObjects([2, 3, 1]).toArray();
  assert.equal(answerObjects.length, 4, 'Missing answer objects');

  //first
  assert.equal(answerObjects[0].get('answerId'), 1, 'Wrong answerId');
  assert.equal(answerObjects[0].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[0].get('order'), 1, 'Wrong order');
  assert.equal(answerObjects[0].get('status'), 'incorrect', 'Wrong status');
  assert.equal(answerObjects[0].get('text'), 'text1', 'Wrong text');
  //second
  assert.equal(answerObjects[1].get('answerId'), 2, 'Wrong answerId');
  assert.equal(answerObjects[1].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[1].get('order'), 2, 'Wrong order');
  assert.equal(answerObjects[1].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[1].get('text'), 'text2', 'Wrong text');
  //third
  assert.equal(answerObjects[2].get('answerId'), 3, 'Wrong answerId');
  assert.equal(answerObjects[2].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[2].get('order'), 3, 'Wrong order');
  assert.equal(answerObjects[2].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[2].get('text'), 'text3', 'Wrong text');
  //fourth
  assert.equal(answerObjects[3].get('answerId'), 4, 'Wrong answerId');
  assert.equal(answerObjects[3].get('skip'), true, 'Wrong skipped');
  assert.equal(answerObjects[3].get('order'), 4, 'Wrong order');
  assert.equal(answerObjects[3].get('status'), null, 'Wrong status');
  assert.equal(answerObjects[3].get('text'), 'text4', 'Wrong text');
});

test('Hot Spot Text - toUserAnswer', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false, text: 'text1', order: 1 }),
    Ember.Object.create({ id: 2, isCorrect: true, text: 'text2', order: 2 }),
    Ember.Object.create({ id: 3, isCorrect: true, text: 'text3', order: 3 }),
    Ember.Object.create({ id: 3, isCorrect: true, text: 'text4', order: 4 })
  ]);
  let question = Ember.Object.create({ answers: answers });
  let questionUtil = HotSpotTextUtil.create({ question: question });

  let answerObjects = Ember.A([
    AnswerObject.create({ text: 'text2', answerId: 2, skip: false }),
    AnswerObject.create({ text: 'text1', answerId: 1, skip: false }),
    AnswerObject.create({ text: 'text3', answerId: 3, skip: false }),
    AnswerObject.create({ text: 'text4', answerId: 4, skip: true })
  ]);

  let userAnswer = questionUtil.toUserAnswer(answerObjects);
  assert.deepEqual(userAnswer, [2, 1, 3], 'Wrong user answer');
});

test('Hot Spot Text - toUserAnswer when no respond is provided', function(
  assert
) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false, text: 'text1', order: 1 }),
    Ember.Object.create({ id: 2, isCorrect: true, text: 'text2', order: 2 }),
    Ember.Object.create({ id: 3, isCorrect: true, text: 'text3', order: 3 }),
    Ember.Object.create({ id: 3, isCorrect: true, text: 'text4', order: 4 })
  ]);
  let question = Ember.Object.create({ answers: answers });
  let questionUtil = HotSpotTextUtil.create({ question: question });

  let answerObjects = Ember.A([]);

  let userAnswer = questionUtil.toUserAnswer(answerObjects);
  assert.equal(userAnswer, null, 'Wrong user answer');
});
