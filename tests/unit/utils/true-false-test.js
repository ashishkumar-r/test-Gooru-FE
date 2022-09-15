import Ember from 'ember';
import AnswerObject from 'gooru-web/utils/question/answer-object';
import TrueFalseUtil from 'gooru-web/utils/question/true-false';
import { module, test } from 'qunit';

module('Unit | Utility | true false');

// --------------- True False tests
test('True/False - getCorrectAnswer when correct answer is provided', function(
  assert
) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = TrueFalseUtil.create({ question: question });
  assert.equal(questionUtil.getCorrectAnswer(), 2, 'Incorrect answer id');
});

test('True/False - isCorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false }),
    Ember.Object.create({ id: 2, isCorrect: true })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = TrueFalseUtil.create({ question: question });

  assert.ok(!questionUtil.isCorrect(1), 'Option one is not correct');
  assert.ok(questionUtil.isCorrect(2), 'Option two should be correct');
});

test('True/False - distribution', function(assert) {
  let questionUtil = TrueFalseUtil.create({ question: null });

  let distribution = questionUtil.distribution([1, 1, 2, 2, 1, 2, 2, 2]);

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

  assert.deepEqual(answers, [1, 2], 'Wrong answers');
  assert.deepEqual(counts, [3, 5], 'Wrong counts');
});

test('True/False - answerKey', function(assert) {
  let questionUtil = TrueFalseUtil.create({ question: null });

  let key = questionUtil.answerKey(1);
  assert.equal(key, 1, 'Wrong key');
});

test('True/False - sameAnswer', function(assert) {
  let questionUtil = TrueFalseUtil.create({ question: null });
  assert.ok(questionUtil.sameAnswer(1, 1), 'Answers should be the same');
  assert.ok(!questionUtil.sameAnswer(1, 2), 'Answers should not be the same');
});

test('True/False - toAnswerObjects with answer id', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false, text: 'True' }),
    Ember.Object.create({ id: 2, isCorrect: true, text: 'False' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = TrueFalseUtil.create({ question: question });

  let answerObjects = questionUtil.toAnswerObjects(2);
  assert.equal(answerObjects.length, 1, 'Only 1 answer object should be found');

  let answerObject = answerObjects.get('firstObject');
  assert.equal(answerObject.get('answerId'), 2, 'Wrong answerId');
  assert.equal(answerObject.get('skip'), false, 'Wrong skipped');
  assert.equal(answerObject.get('order'), 1, 'Wrong order');
  assert.equal(answerObject.get('status'), 'correct', 'Wrong status');
  assert.equal(answerObject.get('text'), 'False', 'Wrong text');
});

test('True/False - toAnswerObjects with no answer id', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: true, text: 'True' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = TrueFalseUtil.create({ question: question });

  let answerObjects = questionUtil.toAnswerObjects(false); //false would be the user answer when no answer choice is available
  assert.equal(answerObjects.length, 1, 'Only 1 answer object should be found');

  let answerObject = answerObjects.get('firstObject');
  assert.equal(answerObject.get('answerId'), 0, 'Wrong answerId');
  assert.equal(answerObject.get('skip'), false, 'Wrong skipped');
  assert.equal(answerObject.get('order'), 1, 'Wrong order');
  assert.equal(answerObject.get('status'), 'incorrect', 'Wrong status');
  assert.equal(answerObject.get('text'), 'False', 'Wrong text');
});

test('True/False - toUserAnswer with answer id', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false, text: 'True' }),
    Ember.Object.create({ id: 2, isCorrect: true, text: 'False' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = TrueFalseUtil.create({ question: question });

  let answerObject = AnswerObject.create({ answerId: 1 });
  let userAnswer = questionUtil.toUserAnswer(Ember.A([answerObject]));
  assert.equal(userAnswer, 1, 'Wrong userAnswer');
});

test('True/False - toUserAnswer with no answer id', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, isCorrect: false, text: 'True' }),
    Ember.Object.create({ id: 2, isCorrect: true, text: 'False' })
  ]);

  let question = Ember.Object.create({ answers: answers });
  let questionUtil = TrueFalseUtil.create({ question: question });

  let answerObject = AnswerObject.create({ answerId: 0, text: 'True' });
  let userAnswer = questionUtil.toUserAnswer(Ember.A([answerObject]));
  assert.equal(userAnswer, true, 'Wrong userAnswer');
});
