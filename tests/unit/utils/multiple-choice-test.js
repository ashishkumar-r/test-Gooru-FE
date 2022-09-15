import Ember from 'ember';
import AnswerObject from 'gooru-web/utils/question/answer-object';
import MultipleChoiceUtil from 'gooru-web/utils/question/multiple-choice';
import { module, test } from 'qunit';

module('Unit | Utility | multiple choice');

// --------------- Multiple Choice tests
test('Multiple Choice - getCorrectAnswer empty array', function(assert) {
  let question = Ember.Object.create({ answers: Ember.A([]) });
  let questionUtil = MultipleChoiceUtil.create({ question: question });
  assert.ok(
    !questionUtil.getCorrectAnswer(),
    'Correct answer should not be found'
  );
});

test('Multiple Choice - getCorrectAnswer no correct answer provided', function(
  assert
) {
  let answers = Ember.A([Ember.Object.create({ id: 1, isCorrect: false })]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleChoiceUtil.create({ question: question });
  assert.ok(
    !questionUtil.getCorrectAnswer(),
    'Correct answer should not be found'
  );
});

test('Multiple Choice - getCorrectAnswer when correct answer is provided', function(
  assert
) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleChoiceUtil.create({ question: question });
  assert.equal(questionUtil.getCorrectAnswer(), 2, 'Incorrect answer id');
});

test('Multiple Choice - isCorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleChoiceUtil.create({ question: question });

  assert.ok(!questionUtil.isCorrect(1), 'Option one is not correct');
  assert.ok(questionUtil.isCorrect(2), 'Option two should be correct');
});

test('Multiple Choice - distribution', function(assert) {
  let questionUtil = MultipleChoiceUtil.create({ question: null });

  let distribution = questionUtil.distribution([1, 1, 2, 3, 4, 3, 2, 3]);

  let answers = distribution
    .map(function(item) {
      return item.get('answer');
    })
    .toArray();
  let counts = distribution
    .map(function(item) {
      return item.get('count');
    })
    .toArray();

  assert.deepEqual(answers, [1, 2, 3, 4], 'Wrong answers');
  assert.deepEqual(counts, [2, 2, 3, 1], 'Wrong counts');
});

test('Multiple Choice - answerKey', function(assert) {
  let questionUtil = MultipleChoiceUtil.create({ question: null });

  let key = questionUtil.answerKey(1);
  assert.equal(key, 1, 'Wrong key');
});

test('Multiple Choice - sameAnswer', function(assert) {
  let questionUtil = MultipleChoiceUtil.create({ question: null });
  assert.ok(questionUtil.sameAnswer(1, 1), 'Answer should be the same');
  assert.ok(!questionUtil.sameAnswer(1, 2), 'Answer should not be the same');
});

test('Multiple Choice - toAnswerObjects', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false, text: 'Option A' }),
    Ember.Object.create({ id: 2, isCorrect: true, text: 'Option B' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleChoiceUtil.create({ question: question });

  let answerObjects = questionUtil.toAnswerObjects(2);
  assert.equal(answerObjects.length, 1, 'Only 1 answer object should be found');

  let answerObject = answerObjects.get('firstObject');
  assert.equal(answerObject.get('answerId'), 2, 'Wrong answerId');
  assert.equal(answerObject.get('skip'), false, 'Wrong skipped');
  assert.equal(answerObject.get('order'), 1, 'Wrong order');
  assert.equal(answerObject.get('status'), 'correct', 'Wrong status');
  assert.equal(answerObject.get('text'), 'Option B', 'Wrong status');
});

test('Multiple Choice - toUserAnswer', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false, text: 'Option A' }),
    Ember.Object.create({ id: 2, isCorrect: true, text: 'Option B' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = MultipleChoiceUtil.create({ question: question });

  let answerObject = AnswerObject.create({ answerId: 1 });
  let userAnswer = questionUtil.toUserAnswer(Ember.A([answerObject]));
  assert.equal(userAnswer, 1, 'Wrong userAnswer');
});
