import Ember from 'ember';
import AnswerObject from 'gooru-web/utils/question/answer-object';
import MultipleAnswerUtil from 'gooru-web/utils/question/multiple-answer';
import { module, test } from 'qunit';

module('Unit | Utility | multiple answer');

// --------------- Multiple Answer tests
test('Multiple Answer - getCorrectAnswer empty array', function(assert) {
  let question = Ember.Object.create({ answers: Ember.A([]) });
  let questionUtil = MultipleAnswerUtil.create({ question: question });
  let correctAnswer = questionUtil.getCorrectAnswer();
  assert.ok(
    !correctAnswer.get('length'),
    'Correct answer should be an empty array'
  );
});

test('Multiple Answer - getCorrectAnswer', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true }),
    Ember.Object.create({ id: 3, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleAnswerUtil.create({ question: question });

  let correctAnswer = questionUtil.getCorrectAnswer().toArray();
  assert.equal(correctAnswer.get('length'), 3, 'Missing items');
  assert.deepEqual(
    correctAnswer[0],
    { id: 1, selection: false },
    'Incorrect answer at 0'
  );
  assert.deepEqual(
    correctAnswer[1],
    { id: 2, selection: true },
    'Incorrect answer at 1'
  );
  assert.deepEqual(
    correctAnswer[2],
    { id: 3, selection: true },
    'Incorrect answer at 2'
  );
});

test('Multiple Answer - isAnswerChoiceCorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true }),
    Ember.Object.create({ id: 3, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleAnswerUtil.create({ question: question });

  assert.ok(
    questionUtil.isAnswerChoiceCorrect({ id: 1, selection: false }),
    'Answer should be correct'
  );
  assert.ok(
    !questionUtil.isAnswerChoiceCorrect({ id: 3, selection: false }),
    'Answer should not be correct'
  );
});

test('Multiple Answer - isCorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true }),
    Ember.Object.create({ id: 3, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleAnswerUtil.create({ question: question });

  let correctAnswer = Ember.A([
    { id: 1, selection: false },
    { id: 2, selection: true },
    { id: 3, selection: true }
  ]);
  assert.ok(questionUtil.isCorrect(correctAnswer), 'Answer should be correct');

  let correctDifferentOrder = Ember.A([
    { id: 3, selection: true },
    { id: 1, selection: false },
    { id: 2, selection: true }
  ]);
  assert.ok(
    questionUtil.isCorrect(correctDifferentOrder),
    'Answer should be correct, even it is not in the same order'
  );

  let incorrectAnswer = Ember.A([
    { id: 3, selection: false },
    { id: 1, selection: false },
    { id: 2, selection: true }
  ]);
  assert.ok(
    !questionUtil.isCorrect(incorrectAnswer),
    'Answer should not be correct'
  );

  let incorrectLessOptions = Ember.A([
    { id: 1, selection: false },
    { id: 2, selection: true }
  ]);
  assert.ok(
    !questionUtil.isCorrect(incorrectLessOptions),
    'Answer should not be correct, it has less options'
  );
});

test('Multiple Answer - answerKey', function(assert) {
  let questionUtil = MultipleAnswerUtil.create({ question: null });

  let key = questionUtil.answerKey([
    { id: 1, selection: false },
    { id: 2, selection: true },
    { id: 3, selection: true }
  ]);
  assert.equal(key, '1_false,2_true,3_true', 'Wrong key for answerA');

  //trying different order
  key = questionUtil.answerKey([
    { id: 1, selection: false },
    { id: 3, selection: true },
    { id: 2, selection: true }
  ]);
  assert.equal(key, '1_false,2_true,3_true', 'Wrong key for answerB');
});

test('Multiple Answer - sameAnswer', function(assert) {
  let questionUtil = MultipleAnswerUtil.create({ question: null });

  let answerA = [
    { id: 1, selection: false },
    { id: 2, selection: true },
    { id: 3, selection: true }
  ];
  let answerB = [
    { id: 1, selection: false },
    { id: 3, selection: true },
    { id: 2, selection: true }
  ]; //same as 1, different order
  let answerC = [
    { id: 1, selection: false },
    { id: 3, selection: false },
    { id: 2, selection: false }
  ];

  assert.ok(
    questionUtil.sameAnswer(answerA, answerB),
    'They should be the same even the order is different'
  );
  assert.ok(
    !questionUtil.sameAnswer(answerB, answerC),
    'They should not be the same'
  );
});

test('Multiple Answer - distribution', function(assert) {
  let questionUtil = MultipleAnswerUtil.create({ question: null });

  let distribution = questionUtil.distribution([
    [
      { id: 1, selection: false },
      { id: 2, selection: false },
      { id: 3, selection: false }
    ],
    [
      { id: 1, selection: false },
      { id: 2, selection: false },
      { id: 3, selection: false }
    ], //same as #1
    [
      { id: 1, selection: false },
      { id: 2, selection: true },
      { id: 3, selection: true }
    ],
    [
      { id: 1, selection: false },
      { id: 2, selection: false },
      { id: 3, selection: true }
    ],
    [
      { id: 2, selection: true },
      { id: 1, selection: false },
      { id: 3, selection: true }
    ] //sames as #3 different order
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
    '1_false,2_false,3_false',
    '1_false,2_true,3_true',
    '1_false,2_false,3_true'
  ];
  assert.deepEqual(answerKeys, expectedKeys, 'Wrong answer keys');
  assert.deepEqual(counts, [2, 2, 1], 'Wrong counts');
});

test('Multiple Answer - toAnswerObjects', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true }),
    Ember.Object.create({ id: 3, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleAnswerUtil.create({ question: question });

  let answerObjects = questionUtil
    .toAnswerObjects([
      { id: 2, selection: false },
      { id: 1, selection: false },
      { id: 3, selection: true }
    ])
    .toArray();
  assert.equal(answerObjects.length, 3, 'Only 1 answer object should be found');

  //first
  assert.equal(answerObjects[0].get('answerId'), 2, 'Wrong answerId');
  assert.equal(answerObjects[0].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[0].get('order'), 1, 'Wrong order');
  assert.equal(answerObjects[0].get('status'), 'incorrect', 'Wrong status');
  assert.equal(answerObjects[0].get('text'), 'No', 'Wrong text');
  //second
  assert.equal(answerObjects[1].get('answerId'), 1, 'Wrong answerId');
  assert.equal(answerObjects[1].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[1].get('order'), 2, 'Wrong order');
  assert.equal(answerObjects[1].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[1].get('text'), 'No', 'Wrong text');
  //third
  assert.equal(answerObjects[2].get('answerId'), 3, 'Wrong answerId');
  assert.equal(answerObjects[2].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[2].get('order'), 3, 'Wrong order');
  assert.equal(answerObjects[2].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[2].get('text'), 'Yes', 'Wrong text');
});

test('Multiple Answer - toUserAnswer', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true }),
    Ember.Object.create({ id: 3, isCorrect: true })
  ]);
  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleAnswerUtil.create({ question: question });

  let answerObjects = Ember.A([
    AnswerObject.create({ text: 'No', answerId: 2 }),
    AnswerObject.create({ text: 'No', answerId: 1 }),
    AnswerObject.create({ text: 'Yes', answerId: 3 })
  ]);

  let userAnswer = questionUtil.toUserAnswer(answerObjects);
  assert.deepEqual(
    userAnswer,
    [
      { id: 2, selection: false },
      { id: 1, selection: false },
      { id: 3, selection: true }
    ],
    'Wrong user answer'
  );
});

test('Multiple Answer - toUserAnswer when the user didn\'t respond', function(
  assert
) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true }),
    Ember.Object.create({ id: 3, isCorrect: true })
  ]);
  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleAnswerUtil.create({ question: question });

  let answerObjects = Ember.A([]);

  let userAnswer = questionUtil.toUserAnswer(answerObjects);
  assert.equal(userAnswer, null, 'Wrong user answer');
});
