import QuestionResult from 'gooru-web/models/result/question';
import { module, test } from 'qunit';

module('Unit | Model | result/question');

test('question', function(assert) {
  let questionResult = QuestionResult.create({
    resource: 'fakeResult'
  });

  assert.equal(questionResult.get('question'), 'fakeResult', 'Wrong question');
});

test('questionId', function(assert) {
  let questionResult = QuestionResult.create({
    resourceId: 'fakeResultId'
  });

  assert.equal(
    questionResult.get('questionId'),
    'fakeResultId',
    'Wrong question id'
  );
});

test('skipped', function(assert) {
  let questionResult = QuestionResult.create({
    correct: false,
    userAnswer: null
  });

  //when is not correct and has no user answer
  assert.ok(questionResult.get('skipped'), 'It should be skipped');

  //when correct is false but has userAnswer
  questionResult.set('userAnswer', '1');
  assert.ok(!questionResult.get('skipped'), 'It should not be skipped');

  //when is correct but no userAnswer
  questionResult.set('userAnswer', null);
  questionResult.set('correct', true);
  assert.ok(!questionResult.get('skipped'), 'It should not be skipped');
});

test('incorrect', function(assert) {
  let questionResult = QuestionResult.create({
    correct: false
  });

  //when correct is false
  assert.ok(questionResult.get('incorrect'), 'It should be incorrect');

  //when correct is null
  questionResult.set('correct', null);
  assert.ok(!questionResult.get('incorrect'), 'It should not be incorrect');
});

test('started', function(assert) {
  let questionResult = QuestionResult.create({
    correct: false
  });

  //when correct is false
  assert.ok(questionResult.get('started'), 'It should be started');

  //when correct is true
  questionResult.set('correct', true);
  assert.ok(questionResult.get('started'), 'It should be started');

  //when correct is null
  questionResult.set('correct', null);
  assert.ok(!questionResult.get('started'), 'It should not be started');
});

test('completed', function(assert) {
  let questionResult = QuestionResult.create({
    correct: false
  });

  //when correct is false
  assert.ok(questionResult.get('completed'), 'It should be completed');

  //when correct is true
  questionResult.set('correct', true);
  assert.ok(questionResult.get('completed'), 'It should be completed');

  //when correct is null
  questionResult.set('correct', null);
  assert.ok(!questionResult.get('completed'), 'It should not be completed');
});

test('answered', function(assert) {
  let questionResult = QuestionResult.create({
    userAnswer: 1
  });

  //when userAnswer is set
  assert.ok(questionResult.get('answered'), 'It should be answered');

  //when userAnswer is an empty array
  questionResult.set('userAnswer', []);
  assert.ok(questionResult.get('answered'), 'It should be answered');

  //when userAnswer is false
  questionResult.set('userAnswer', false);
  assert.ok(questionResult.get('answered'), 'It should be answered');

  //when correct is null
  questionResult.set('userAnswer', null);
  assert.ok(!questionResult.get('answered'), 'It should not be answered');

  //when correct is undefined
  questionResult.set('userAnswer', undefined);
  assert.ok(!questionResult.get('answered'), 'It should not be answered');
});

test('attemptStatus, correct', function(assert) {
  let questionResult = QuestionResult.create({
    correct: true,
    skipped: false,
    pending: false
  });
  assert.equal(questionResult.get('attemptStatus'), 'correct', 'wrong status');
});

test('attemptStatus, skipped', function(assert) {
  let questionResult = QuestionResult.create({
    correct: false,
    skipped: true,
    pending: false
  });
  assert.equal(questionResult.get('attemptStatus'), 'skipped', 'wrong status');
});

test('attemptStatus, pending', function(assert) {
  let questionResult = QuestionResult.create({
    correct: false,
    skipped: false,
    pending: true
  });
  assert.equal(questionResult.get('attemptStatus'), 'skipped', 'wrong status');
});

test('attemptStatus, incorrect', function(assert) {
  let questionResult = QuestionResult.create({
    correct: false,
    skipped: false,
    pending: false
  });
  assert.equal(
    questionResult.get('attemptStatus'),
    'incorrect',
    'wrong status'
  );
});

test('attemptStatus, open ended - pending', function(assert) {
  let questionResult = QuestionResult.create({
    correct: false,
    skipped: false,
    pending: true,
    question: {
      isOpenEnded: true
    }
  });
  assert.equal(questionResult.get('attemptStatus'), 'skipped', 'wrong status');
});

test('attemptStatus, open ended - skipped', function(assert) {
  let questionResult = QuestionResult.create({
    correct: false,
    skipped: true,
    pending: false,
    question: {
      isOpenEnded: true
    }
  });
  assert.equal(questionResult.get('attemptStatus'), 'skipped', 'wrong status');
});

test('attemptStatus, open ended - started', function(assert) {
  let questionResult = QuestionResult.create({
    correct: false,
    skipped: false,
    pending: false,
    question: {
      isOpenEnded: true
    }
  });
  assert.equal(questionResult.get('attemptStatus'), 'started', 'wrong status');
});
