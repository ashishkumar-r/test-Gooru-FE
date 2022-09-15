import Ember from 'ember';
import AnswerObject from 'gooru-web/utils/question/answer-object';
import FillInTheBlankUtil from 'gooru-web/utils/question/fill-in-the-blank';
import { module, test } from 'qunit';

module('Unit | Utility | fill in the blank');

// --------------- FIB tests
test('FIB - getCorrectAnswer empty array', function(assert) {
  let question = Ember.Object.create({ answers: Ember.A([]) });
  let questionUtil = FillInTheBlankUtil.create({ question: question });
  let correctAnswer = questionUtil.getCorrectAnswer();
  assert.ok(
    !correctAnswer.get('length'),
    'Correct answer should be an empty array'
  );
});

test('FIB - getCorrectAnswer', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: 'optionA' }),
    Ember.Object.create({ id: 2, text: 'optionB' }),
    Ember.Object.create({ id: 3, text: 'optionC' })
  ]);

  let question = Ember.Object.create({
    text: '[optionA] and [optionB] and [optionC]',
    answers: answers
  });
  let questionUtil = FillInTheBlankUtil.create({ question: question });

  let correctAnswer = questionUtil.getCorrectAnswer().toArray();
  assert.equal(correctAnswer.get('length'), 3, 'Missing items');
  assert.equal(correctAnswer[0], 'optionA', 'Incorrect answer at 0');
  assert.equal(correctAnswer[1], 'optionB', 'Incorrect answer at 1');
  assert.equal(correctAnswer[2], 'optionC', 'Incorrect answer at 2');
});

test('FIB - isAnswerChoiceCorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: 'optionA' }),
    Ember.Object.create({ id: 2, text: 'optionB' }),
    Ember.Object.create({ id: 3, text: 'optionC' })
  ]);

  let question = Ember.Object.create({
    text: '[optionA] and [optionB] and [optionC]',
    answers: answers
  });
  let questionUtil = FillInTheBlankUtil.create({ question: question });

  assert.ok(
    questionUtil.isAnswerChoiceCorrect('optionA', 0),
    'Answer should be correct'
  );
  assert.ok(
    questionUtil.isAnswerChoiceCorrect('Optiona', 0),
    'Answer should be correct'
  );
  assert.ok(
    !questionUtil.isAnswerChoiceCorrect('optionC', 1),
    'Answer should not be correct, optionC is at index 2'
  );
  assert.ok(
    !questionUtil.isAnswerChoiceCorrect('optionD', 1),
    'Answer should not be correct, optionD is not valid'
  );
});

test('FIB - isAnswerChoiceCorrect with special character', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: '/' }),
    Ember.Object.create({ id: 2, text: '*' }),
    Ember.Object.create({ id: 3, text: '+' })
  ]);

  let question = Ember.Object.create({
    text: '[/] and [*] and [+]',
    answers: answers
  });
  let questionUtil = FillInTheBlankUtil.create({ question: question });

  assert.ok(
    questionUtil.isAnswerChoiceCorrect('/', 0),
    'Answer should be correct'
  );
  assert.ok(
    !questionUtil.isAnswerChoiceCorrect('+', 1),
    'Answer should not be correct, + is at index 2'
  );
  assert.ok(
    !questionUtil.isAnswerChoiceCorrect('%', 1),
    'Answer should not be correct, % is not valid'
  );
});

test('FIB - isCorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: 'optionA' }),
    Ember.Object.create({ id: 2, text: 'optionB' }),
    Ember.Object.create({ id: 3, text: 'optionC' })
  ]);

  let question = Ember.Object.create({
    text: '[optionA] and [optionB] and [optionC]',
    answers: answers
  });
  let questionUtil = FillInTheBlankUtil.create({ question: question });

  let correctAnswer = Ember.A(['optionA', 'optionB', 'optionC']);
  assert.ok(questionUtil.isCorrect(correctAnswer), 'Answer should be correct');

  let correctDifferentOrder = Ember.A(['optionA', 'optionC', 'optionB']);
  assert.ok(
    !questionUtil.isCorrect(correctDifferentOrder),
    'Answer should not be correct, it has different order'
  );

  let incorrectAnswer = Ember.A(['optionD', 'optionC', 'optionB']);
  assert.ok(
    !questionUtil.isCorrect(incorrectAnswer),
    'Answer should not be correct, optionD is not valid'
  );

  let incorrectLessOptions = Ember.A(['optionA', 'optionB']);
  assert.ok(
    !questionUtil.isCorrect(incorrectLessOptions),
    'Answer should not be correct, it has less options'
  );
});

test('FIB - distribution', function(assert) {
  let questionUtil = FillInTheBlankUtil.create({ question: null });

  let distribution = questionUtil.distribution([
    ['black', 'white', 'blue'],
    ['black', 'white', 'blue'], //same as 1
    ['blue', 'orange', 'red'],
    ['black', 'white', 'red'],
    ['blue', 'orange', 'red'], //same as 3
    ['black', 'white', 'blue'] //same as 1 and 2
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

  let expectedKeys = ['black,white,blue', 'blue,orange,red', 'black,white,red'];
  assert.deepEqual(answerKeys, expectedKeys, 'Wrong answer keys');
  assert.deepEqual(counts, [3, 2, 1], 'Wrong counts');
});

test('FIB - answerKey', function(assert) {
  let questionUtil = FillInTheBlankUtil.create({ question: null });

  let key = questionUtil.answerKey(['black', 'white', 'blue']);
  assert.equal(key, 'black,white,blue', 'Wrong key');
});

test('FIB - sameAnswer', function(assert) {
  let questionUtil = FillInTheBlankUtil.create({ question: null });

  let answerA = ['black', 'white', 'blue'];
  let answerB = ['black', 'white', 'blue'];
  let answerC = ['white', 'black', 'blue']; //different order

  assert.ok(
    questionUtil.sameAnswer(answerA, answerB),
    'Answer should be the same'
  );
  assert.ok(
    !questionUtil.sameAnswer(answerA, answerC),
    'Answer should not be the same, they have different order'
  );
});

test('FIB - toAnswerObjects when correct', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: 'optionA' }),
    Ember.Object.create({ id: 2, text: 'optionB' }),
    Ember.Object.create({ id: 3, text: 'optionC' })
  ]);

  let question = Ember.Object.create({
    text: '[optionA] and [optionB] and [optionC]',
    answers: answers
  });
  let questionUtil = FillInTheBlankUtil.create({ question: question });

  let answerObjects = questionUtil
    .toAnswerObjects(['optionA', 'optionB', 'optionC'])
    .toArray();
  assert.equal(answerObjects.length, 3, 'Only 1 answer object should be found');

  //first
  assert.equal(answerObjects[0].get('answerId'), 1, 'Wrong answerId');
  assert.equal(answerObjects[0].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[0].get('order'), 1, 'Wrong order');
  assert.equal(answerObjects[0].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[0].get('text'), 'optionA', 'Wrong text');
  //second
  assert.equal(answerObjects[1].get('answerId'), 2, 'Wrong answerId');
  assert.equal(answerObjects[1].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[1].get('order'), 2, 'Wrong order');
  assert.equal(answerObjects[1].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[1].get('text'), 'optionB', 'Wrong text');
  //third
  assert.equal(answerObjects[2].get('answerId'), 3, 'Wrong answerId');
  assert.equal(answerObjects[2].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[2].get('order'), 3, 'Wrong order');
  assert.equal(answerObjects[2].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[2].get('text'), 'optionC', 'Wrong text');
});

test('FIB - toAnswerObjects when incorrect', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: 'optionA' }),
    Ember.Object.create({ id: 2, text: 'optionB' }),
    Ember.Object.create({ id: 3, text: 'optionC' })
  ]);

  let question = Ember.Object.create({
    text: '[optionA] and [optionB] and [optionC]',
    answers: answers
  });
  let questionUtil = FillInTheBlankUtil.create({ question: question });

  let answerObjects = questionUtil
    .toAnswerObjects(['optionD', 'optionB', ''])
    .toArray();
  assert.equal(answerObjects.length, 3, 'Only 1 answer object should be found');

  //first
  assert.equal(answerObjects[0].get('answerId'), 0, 'Wrong answerId');
  assert.equal(answerObjects[0].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[0].get('order'), 1, 'Wrong order');
  assert.equal(answerObjects[0].get('status'), 'incorrect', 'Wrong status');
  assert.equal(answerObjects[0].get('text'), 'optionD', 'Wrong text');
  //second
  assert.equal(answerObjects[1].get('answerId'), 2, 'Wrong answerId');
  assert.equal(answerObjects[1].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[1].get('order'), 2, 'Wrong order');
  assert.equal(answerObjects[1].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[1].get('text'), 'optionB', 'Wrong text');
  //third
  assert.equal(answerObjects[2].get('answerId'), 0, 'Wrong answerId');
  assert.equal(answerObjects[2].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[2].get('order'), 3, 'Wrong order');
  assert.equal(answerObjects[2].get('status'), 'incorrect', 'Wrong status');
  assert.equal(answerObjects[2].get('text'), '', 'Wrong text');
});

test('FIB - toUserAnswer', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: 'optionA' }),
    Ember.Object.create({ id: 2, text: 'optionB' }),
    Ember.Object.create({ id: 3, text: 'optionC' })
  ]);

  let question = Ember.Object.create({
    text: '[optionA] and [optionB] and [optionC]',
    answers: answers
  });
  let questionUtil = FillInTheBlankUtil.create({ question: question });

  let answerObjects = Ember.A([
    AnswerObject.create({ text: 'optionB', order: 2 }),
    AnswerObject.create({ text: 'optionC', order: 3 }),
    AnswerObject.create({ text: 'optionA', order: 1 })
  ]);

  let userAnswer = questionUtil.toUserAnswer(answerObjects);
  assert.deepEqual(
    userAnswer,
    ['optionA', 'optionB', 'optionC'],
    'Wrong user answer'
  );
});

test('FIB - toUserAnswer when no respond is provided', function(assert) {
  let answers = Ember.A([
    Ember.Object.create({ id: 1, text: 'optionA' }),
    Ember.Object.create({ id: 2, text: 'optionB' }),
    Ember.Object.create({ id: 3, text: 'optionC' })
  ]);

  let question = Ember.Object.create({
    text: '[optionA] and [optionB] and [optionC]',
    answers: answers
  });
  let questionUtil = FillInTheBlankUtil.create({ question: question });

  let answerObjects = Ember.A([]);

  let userAnswer = questionUtil.toUserAnswer(answerObjects);
  assert.equal(userAnswer, null, 'Wrong user answer');
});

test('FIB - getCorrectAnswers', function(assert) {
  let answers = FillInTheBlankUtil.getCorrectAnswers(
    'The ball is [red] and [white] and sqrt[2]'
  );
  assert.deepEqual(
    answers,
    ['[red]', '[white]'],
    'Wrong answers at the middle of the text'
  );

  answers = FillInTheBlankUtil.getCorrectAnswers(
    '[red] and [white] and sqrt[2] and [blue]'
  );
  assert.deepEqual(
    answers,
    ['[red]', '[white]', '[blue]'],
    'Wrong answers at the start, middle and end of the text'
  );

  answers = FillInTheBlankUtil.getCorrectAnswers('[red][white]sqrt[2][blue]');
  assert.deepEqual(
    answers,
    ['[red]', '[white]', '[blue]'],
    'Wrong answers when all together'
  );

  answers = FillInTheBlankUtil.getCorrectAnswers('With no answers sqrt[2]');
  assert.deepEqual(answers, [], 'Wrong answers when non were provided');

  answers = FillInTheBlankUtil.getCorrectAnswers('With square root sqrt[2]');
  assert.deepEqual(answers, [], 'Square root should be ignored');

  answers = FillInTheBlankUtil.getCorrectAnswers(
    'With square root as answer [sqrt]'
  );
  assert.deepEqual(
    answers,
    ['[sqrt]'],
    'Square root as possible answer should not be ignored'
  );

  answers = FillInTheBlankUtil.getCorrectAnswers(
    'With square root as answer  sqrt[3]{27} = [3]'
  );
  assert.deepEqual(
    answers,
    ['[3]'],
    'Square root as possible answer and matching a correct answer'
  );
});

test('FIB - toFibText', function(assert) {
  let text = FillInTheBlankUtil.toFibText(
    'The ball is [red] and [white] and sqrt[2]'
  );
  assert.equal(
    text,
    'The ball is _______ and _______ and sqrt[2]',
    'Wrong text at the middle of the text'
  );

  text = FillInTheBlankUtil.toFibText(
    '[red] and [white] and sqrt[2] and [blue]'
  );
  assert.equal(
    text,
    '_______ and _______ and sqrt[2] and _______',
    'Wrong text at the start, middle and end of the text'
  );

  text = FillInTheBlankUtil.toFibText('With no answers sqrt[2]');
  assert.equal(
    text,
    'With no answers sqrt[2]',
    'Wrong answers when non were provided'
  );

  text = FillInTheBlankUtil.toFibText('With square root sqrt[2]');
  assert.equal(
    text,
    'With square root sqrt[2]',
    'Square root should be ignored'
  );

  text = FillInTheBlankUtil.toFibText('With square root [sqrt]');
  assert.equal(
    text,
    'With square root _______',
    'Square root as possible answer should no be ignored'
  );

  text = FillInTheBlankUtil.toFibText('With square root sqrt[3]{27} = [3]');
  assert.equal(
    text,
    'With square root sqrt[3]{27} = _______',
    'Square root as possible answer and matching a correct answer'
  );
});

test('getQuestionAnswers from text', function(assert) {
  const text = 'Fill [in] the [blank]... and sqrt[2]'; //sqrt should be ignored
  const fibAnswers = FillInTheBlankUtil.getQuestionAnswers(
    Ember.Object.create({
      text: text
    })
  );

  assert.equal(fibAnswers.length, 2, 'Wrong number of answers');
  const answer1 = fibAnswers[0];
  assert.equal(answer1.get('sequence'), 1, 'Wrong sequence');
  assert.equal(answer1.get('text'), 'in', 'Wrong text');
  assert.equal(answer1.get('isCorrect'), true, 'Wrong isCorrect');
  assert.equal(answer1.get('type'), 'text', 'Wrong type');
  const answer2 = fibAnswers[1];
  assert.equal(answer2.get('sequence'), 2, 'Wrong sequence');
  assert.equal(answer2.get('text'), 'blank', 'Wrong text');
  assert.equal(answer2.get('isCorrect'), true, 'Wrong isCorrect');
  assert.equal(answer2.get('type'), 'text', 'Wrong type');
});
