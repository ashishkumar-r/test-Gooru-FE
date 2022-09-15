import Ember from 'ember';
import AnswerObject from 'gooru-web/utils/question/answer-object';
import ReorderUtil from 'gooru-web/utils/question/reorder';
import { module, test } from 'qunit';

module('Unit | Utility | reorder');

// --------------- Reorder tests
test('Reorder - getCorrectAnswer empty array', function(assert) {
  let question = Ember.Object.create({ answers: Ember.A([]) });
  let questionUtil = ReorderUtil.create({ question: question });
  let correctAnswer = questionUtil.getCorrectAnswer();
  assert.ok(
    !correctAnswer.get('length'),
    'Correct answer should be an empty array'
  );
});

test('Reorder - getCorrectAnswer', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 'choice-1' }),
    Ember.Object.create({ id: 'choice-2' }),
    Ember.Object.create({ id: 'choice-3' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = ReorderUtil.create({ question: question });

  let correctAnswer = questionUtil.getCorrectAnswer().toArray();
  assert.equal(correctAnswer.get('length'), 3, 'Missing items');
  assert.equal(correctAnswer[0], 'choice-1', 'Incorrect answer at 0');
  assert.equal(correctAnswer[1], 'choice-2', 'Incorrect answer at 1');
  assert.equal(correctAnswer[2], 'choice-3', 'Incorrect answer at 2');
});

test('Reorder - isAnswerChoiceCorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 'choice-1' }),
    Ember.Object.create({ id: 'choice-2' }),
    Ember.Object.create({ id: 'choice-3' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = ReorderUtil.create({ question: question });

  assert.ok(
    questionUtil.isAnswerChoiceCorrect('choice-1', 0),
    'Answer should be correct'
  );
  assert.ok(
    !questionUtil.isAnswerChoiceCorrect('choice-3', 1),
    'Answer should not be correct, choice-3 is at index 2'
  );
  assert.ok(
    !questionUtil.isAnswerChoiceCorrect('choice-4', 1),
    'Answer should not be correct, choice-4 is not valid'
  );
});

test('Reorder - isCorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 'choice-1' }),
    Ember.Object.create({ id: 'choice-2' }),
    Ember.Object.create({ id: 'choice-3' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = ReorderUtil.create({ question: question });

  let correctAnswer = ['choice-1', 'choice-2', 'choice-3'];
  assert.ok(questionUtil.isCorrect(correctAnswer), 'Answer should be correct');

  let correctDifferentOrder = ['choice-3', 'choice-1', 'choice-2'];
  assert.ok(
    !questionUtil.isCorrect(correctDifferentOrder),
    'Answer should not be correct, it has different order'
  );

  let incorrectAnswer = ['choice-1', 'choice-2', 'choice-4'];
  assert.ok(
    !questionUtil.isCorrect(incorrectAnswer),
    'Answer should not be correct, optionD is not valid'
  );

  let incorrectLessOptions = ['choice-1', 'choice-2'];
  assert.ok(
    !questionUtil.isCorrect(incorrectLessOptions),
    'Answer should not be correct, it has less options'
  );
});

test('Reorder - distribution', function(assert) {
  let questionUtil = ReorderUtil.create({ question: null });

  let distribution = questionUtil.distribution([
    ['choice-1', 'choice-2', 'choice-3', 'choice-4'],
    ['choice-2', 'choice-3', 'choice-1', 'choice-4'],
    ['choice-1', 'choice-2', 'choice-3', 'choice-4'], //same as 1
    ['choice-2', 'choice-3', 'choice-1', 'choice-4'], //same as 2
    ['choice-4', 'choice-2', 'choice-3', 'choice-1'],
    ['choice-3', 'choice-2', 'choice-4', 'choice-1'],
    ['choice-2', 'choice-3', 'choice-1', 'choice-4'] //same as 2
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

  let expectedKeys = [
    'choice-1,choice-2,choice-3,choice-4',
    'choice-2,choice-3,choice-1,choice-4',
    'choice-4,choice-2,choice-3,choice-1',
    'choice-3,choice-2,choice-4,choice-1'
  ];
  assert.deepEqual(answerKeys, expectedKeys, 'Wrong answer keys');
  assert.deepEqual(counts, [2, 3, 1, 1], 'Wrong counts');
});

test('Reorder - answerKey', function(assert) {
  let questionUtil = ReorderUtil.create({ question: null });

  let key = questionUtil.answerKey(['choice-1', 'choice-2', 'choice-3']);
  assert.equal(key, 'choice-1,choice-2,choice-3', 'Wrong key');
});

test('Reorder - sameAnswer', function(assert) {
  let questionUtil = ReorderUtil.create({ question: null });

  let answerA = ['choice-1', 'choice-2', 'choice-3'];
  let answerB = ['choice-1', 'choice-2', 'choice-3'];
  let answerC = ['choice-1', 'choice-3', 'choice-1']; //different order

  assert.ok(
    questionUtil.sameAnswer(answerA, answerB),
    'Answer should be the same'
  );
  assert.ok(
    !questionUtil.sameAnswer(answerA, answerC),
    'Answer should not be the same, they have different order'
  );
});

test('Reorder - toAnswerObjects', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: 'choice-1', order: 2 }),
    Ember.Object.create({ id: 2, text: 'choice-2', order: 3 }),
    Ember.Object.create({ id: 3, text: 'choice-3', order: 1 })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = ReorderUtil.create({ question: question });

  let answerObjects = questionUtil.toAnswerObjects([3, 2, 1]).toArray();
  assert.equal(answerObjects.length, 3, 'Only 1 answer object should be found');

  //first
  assert.equal(answerObjects[0].get('answerId'), 3, 'Wrong answerId');
  assert.equal(answerObjects[0].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[0].get('order'), 1, 'Wrong order');
  assert.equal(answerObjects[0].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[0].get('text'), 'choice-3', 'Wrong text');
  //second
  assert.equal(answerObjects[1].get('answerId'), 2, 'Wrong answerId');
  assert.equal(answerObjects[1].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[1].get('order'), 2, 'Wrong order');
  assert.equal(answerObjects[1].get('status'), 'incorrect', 'Wrong status');
  assert.equal(answerObjects[1].get('text'), 'choice-2', 'Wrong text');
  //third
  assert.equal(answerObjects[2].get('answerId'), 1, 'Wrong answerId');
  assert.equal(answerObjects[2].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[2].get('order'), 3, 'Wrong order');
  assert.equal(answerObjects[2].get('status'), 'incorrect', 'Wrong status');
  assert.equal(answerObjects[2].get('text'), 'choice-1', 'Wrong text');
});

test('Reorder - toUserAnswer', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: 'optionA' }),
    Ember.Object.create({ id: 2, text: 'optionB' }),
    Ember.Object.create({ id: 3, text: 'optionC' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = ReorderUtil.create({ question: question });

  let answerObjects = Ember.A([
    AnswerObject.create({ text: 'optionB', order: 3, answerId: 2 }),
    AnswerObject.create({ text: 'optionC', order: 1, answerId: 3 }),
    AnswerObject.create({ text: 'optionA', order: 2, answerId: 1 })
  ]);

  let userAnswer = questionUtil.toUserAnswer(answerObjects);
  assert.deepEqual(userAnswer, [3, 1, 2], 'Wrong user answer ids');
});

test('Reorder - toUserAnswer when no respond is provided', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: 'optionA' }),
    Ember.Object.create({ id: 2, text: 'optionB' }),
    Ember.Object.create({ id: 3, text: 'optionC' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = ReorderUtil.create({ question: question });

  let answerObjects = Ember.A([]);

  let userAnswer = questionUtil.toUserAnswer(answerObjects);
  assert.equal(userAnswer, null, 'Wrong user answer ids');
});
