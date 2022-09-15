import Ember from 'ember';
import AnswerObject from 'gooru-web/utils/question/answer-object';
import HotTextHighlightUtil from 'gooru-web/utils/question/hot-text-highlight';
import { module, test } from 'qunit';

module('Unit | Utility | hot text highlight');

// --------------- Hot Text Highlight tests
test('Hot Text Highlight - getCorrectAnswer empty array', function(assert) {
  let question = Ember.Object.create({
    answers: [],
    hasAnswers: false
  });
  let questionUtil = HotTextHighlightUtil.create({ question: question });
  let correctAnswer = questionUtil.getCorrectAnswer();
  assert.ok(
    !correctAnswer.get('length'),
    'Correct answer should be an empty array'
  );
});

test('Hot Text Highlight - getCorrectAnswer', function(assert) {
  //with no correct items
  let question = Ember.Object.create({
    answers: Ember.A([
      Ember.Object.create({ text: '<p>No correct answers in text</p>' })
    ]),
    hasAnswers: true
  });
  let questionUtil = HotTextHighlightUtil.create({ question: question });
  let correctAnswer = questionUtil.getCorrectAnswer();
  assert.ok(!correctAnswer.get('length'), 'It should have not correct items');

  //with 1 correct item
  question = Ember.Object.create({
    answers: Ember.A([
      Ember.Object.create({ text: 'One correct answer in text [this]' })
    ]),
    hasAnswers: true,
    isHotTextHighlightWord: true
  });
  questionUtil = HotTextHighlightUtil.create({ question: question });
  correctAnswer = questionUtil.getCorrectAnswer().toArray();
  assert.equal(correctAnswer.length, 1, 'Wrong number of items');
  assert.equal(correctAnswer[0].text, 'this', 'Wrong correct item text');
  assert.equal(correctAnswer[0].index, 5, 'Wrong correct item index');

  //with many correct items
  question = Ember.Object.create({
    answers: Ember.A([
      Ember.Object.create({
        text: 'Many [correct] items in this sentence [another]'
      })
    ]),
    hasAnswers: true,
    isHotTextHighlightWord: true
  });
  questionUtil = HotTextHighlightUtil.create({ question: question });
  correctAnswer = questionUtil.getCorrectAnswer().toArray();
  assert.equal(correctAnswer.length, 2, 'Wrong number of items');
  assert.equal(correctAnswer[0].text, 'correct', 'Wrong correct item text');
  assert.equal(correctAnswer[0].index, 1, 'Wrong correct item index');
  assert.equal(correctAnswer[1].text, 'another', 'Wrong correct item text');
  assert.equal(correctAnswer[1].index, 6, 'Wrong correct item index');
});

test('Hot Text Highlight - isAnswerChoiceCorrect', function(assert) {
  let question = Ember.Object.create({
    answers: Ember.A([
      Ember.Object.create({
        text: 'Many [correct] items in this sentence [another.]'
      })
    ]),
    hasAnswers: true,
    isHotTextHighlightWord: true
  });
  let questionUtil = HotTextHighlightUtil.create({ question: question });

  assert.ok(
    questionUtil.isAnswerChoiceCorrect({ index: 1, text: 'correct' }),
    'Answer should be correct'
  );
  assert.ok(
    !questionUtil.isAnswerChoiceCorrect({ index: 0, text: 'Many' }),
    'Answer should not be correct'
  );
});

test('Hot Text Highlight - isCorrect', function(assert) {
  let question = Ember.Object.create({
    answers: Ember.A([
      Ember.Object.create({
        text: 'Many [correct] items in this sentence [another.]'
      })
    ]),
    hasAnswers: true,
    isHotTextHighlightWord: true
  });
  let questionUtil = HotTextHighlightUtil.create({ question: question });

  let correctAnswer = [
    { index: 1, text: 'correct' },
    { index: 6, text: 'another.' }
  ];
  assert.ok(questionUtil.isCorrect(correctAnswer), 'Answer should be correct');

  let correctDifferentOrder = [
    { index: 6, text: 'another.' },
    { index: 1, text: 'correct' }
  ];
  assert.ok(
    questionUtil.isCorrect(correctDifferentOrder),
    'Answer should be correct, even it is not in the same order'
  );

  let incorrectAnswer = [
    { index: 6, text: 'another.' },
    { index: 2, text: 'items' }
  ];
  assert.ok(
    !questionUtil.isCorrect(incorrectAnswer),
    'Answer should not be correct'
  );

  let incorrectLessOptions = [{ index: 6, text: 'another.' }];
  assert.ok(
    !questionUtil.isCorrect(incorrectLessOptions),
    'Answer should not be correct, it has less options'
  );
});

test('Hot Text Highlight - distribution', function(assert) {
  let questionUtil = HotTextHighlightUtil.create({ question: null });

  let distribution = questionUtil.distribution([
    [
      { index: 6, text: 'another .' },
      { index: 1, text: 'correct' },
      { index: 3, text: 'item' }
    ],
    [
      { index: 6, text: 'another .' },
      { index: 1, text: 'correct' },
      { index: 3, text: 'item' }
    ], //same as 1
    [
      { index: 6, text: 'another .' },
      { index: 2, text: 'here' },
      { index: 3, text: 'item' }
    ],
    [
      { index: 6, text: 'another .' },
      { index: 1, text: 'correct' },
      { index: 4, text: 'then' }
    ],
    [
      { index: 2, text: 'here' },
      { index: 3, text: 'item' },
      { index: 6, text: 'another .' }
    ], //same as 3, different order
    [
      { index: 1, text: 'correct' },
      { index: 3, text: 'item' },
      { index: 6, text: 'another .' }
    ] //same as 1, different order
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

  let expectedKeys = ['1,3,6', '2,3,6', '1,4,6'];
  assert.deepEqual(answerKeys, expectedKeys, 'Wrong answer keys');
  assert.deepEqual(counts, [3, 2, 1], 'Wrong counts');
});

test('Hot Text Highlight - answerKey', function(assert) {
  let questionUtil = HotTextHighlightUtil.create({ question: null });

  let answer = [
    { index: 6, text: 'another.' },
    { index: 1, text: 'correct' },
    { index: 3, text: 'item' }
  ];
  let key = questionUtil.answerKey(answer);
  assert.equal(key, '1,3,6');
});

test('Hot Text Highlight - sameAnswer', function(assert) {
  let questionUtil = HotTextHighlightUtil.create({ question: null });

  let answerA = [
    { index: 6, text: 'another .' },
    { index: 1, text: 'correct' },
    { index: 3, text: 'item' }
  ];

  let answerB = [
    { index: 1, text: 'correct' },
    { index: 3, text: 'item' },
    { index: 6, text: 'another .' }
  ]; //same as A

  let answerC = [{ index: 3, text: 'item' }, { index: 6, text: 'another .' }]; //less options

  let answerD = [
    { index: 1, text: 'correct' },
    { index: 3, text: 'item' },
    { index: 5, text: 'see you' }
  ]; //different option, see you

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

test('Hot Text Highlight - getWordItems', function(assert) {
  assert.expect(5);

  var questionUtil = HotTextHighlightUtil.create({ question: 'FakeQuestion' });

  //with no words
  var wordItems = questionUtil.getWordItems('').toArray();
  assert.equal(wordItems.length, 0, 'Wrong number of items');

  //with one word
  wordItems = questionUtil.getWordItems('text').toArray();
  assert.equal(wordItems.length, 1, 'Wrong number of items');
  assert.equal(wordItems[0].get('index'), 0, 'Wrong id for first object');
  assert.equal(wordItems[0].get('text'), 'text', 'Wrong text for first object');

  //with many words
  wordItems = questionUtil
    .getWordItems('  A  phrase with  many words and extra spaces   ')
    .toArray();
  assert.equal(wordItems.length, 8, 'Wrong number of items');
});

test('Hot Text Highlight - getSentenceItems', function(assert) {
  assert.expect(34);

  var questionUtil = HotTextHighlightUtil.create({ question: 'FakeQuestion' });

  //with no text
  var sentenceItems = questionUtil.getSentenceItems('').toArray();
  assert.equal(sentenceItems.length, 0, 'Wrong number of items');

  //with no correct
  sentenceItems = questionUtil.getSentenceItems('Sentence 1').toArray();
  assert.equal(sentenceItems.length, 1, 'Wrong number of items');
  assert.equal(sentenceItems[0].get('index'), 0, 'Wrong id for first object');
  assert.equal(
    sentenceItems[0].get('text'),
    'Sentence 1',
    'Wrong text for first object'
  );

  //with many sentences, 1 correct
  sentenceItems = questionUtil
    .getSentenceItems('Sentence 1 [Sentence 2.] Sentence 3')
    .toArray();
  assert.equal(sentenceItems.length, 3, 'Wrong number of items');
  assert.equal(sentenceItems[0].get('index'), 0, 'Wrong id for first object');
  assert.equal(
    sentenceItems[0].get('text'),
    'Sentence 1',
    'Wrong text for first object'
  );
  assert.equal(
    sentenceItems[1].get('text'),
    'Sentence 2.',
    'Wrong text for second object'
  );
  assert.equal(
    sentenceItems[2].get('text'),
    'Sentence 3',
    'Wrong text for third object'
  );

  //with many sentences, many correct
  sentenceItems = questionUtil.getSentenceItems(
    'Sentence 1 [Sentence 2.] Sentence 3 [Sentence 4.] Sentence 5'
  );
  assert.equal(sentenceItems.length, 5, 'Wrong number of items');
  assert.equal(sentenceItems[0].get('index'), 0, 'Wrong id for first object');
  assert.equal(
    sentenceItems[0].get('text'),
    'Sentence 1',
    'Wrong text for first object'
  );
  assert.equal(
    sentenceItems[1].get('text'),
    'Sentence 2.',
    'Wrong text for second object'
  );
  assert.equal(
    sentenceItems[2].get('text'),
    'Sentence 3',
    'Wrong text for third object'
  );
  assert.equal(
    sentenceItems[3].get('text'),
    'Sentence 4.',
    'Wrong text for fourth object'
  );
  assert.equal(
    sentenceItems[4].get('text'),
    'Sentence 5',
    'Wrong text for fifth object'
  );

  //with many sentences between correct answer
  sentenceItems = questionUtil.getSentenceItems(
    'Sentence 1 [Sentence 2.] Sentence 3. Sentence 4. Sentence 5 [Sentence 6.] Sentence 7'
  );
  assert.equal(sentenceItems.length, 7, 'Wrong number of items');
  assert.equal(sentenceItems[0].get('index'), 0, 'Wrong id for first object');
  assert.equal(
    sentenceItems[0].get('text'),
    'Sentence 1',
    'Wrong text for first object'
  );
  assert.equal(
    sentenceItems[1].get('text'),
    'Sentence 2.',
    'Wrong text for second object'
  );
  assert.equal(
    sentenceItems[2].get('text'),
    'Sentence 3.',
    'Wrong text for third object'
  );
  assert.equal(
    sentenceItems[3].get('text'),
    'Sentence 4.',
    'Wrong text for fourth object'
  );
  assert.equal(
    sentenceItems[4].get('text'),
    'Sentence 5',
    'Wrong text for fifth object'
  );
  assert.equal(
    sentenceItems[5].get('text'),
    'Sentence 6.',
    'Wrong text for fifth object'
  );
  assert.equal(
    sentenceItems[6].get('text'),
    'Sentence 7',
    'Wrong text for fifth object'
  );

  //with many sentences between correct answer having phrases using dot (.)
  sentenceItems = questionUtil.getSentenceItems(
    'Sentence 1 [Sentence 2.] Sentence 3. 1.6 millions. Sentence 5 [Sentence 6.] Sentence 7'
  );
  assert.equal(sentenceItems.length, 7, 'Wrong number of items');
  assert.equal(sentenceItems[0].get('index'), 0, 'Wrong id for first object');
  assert.equal(
    sentenceItems[0].get('text'),
    'Sentence 1',
    'Wrong text for first object'
  );
  assert.equal(
    sentenceItems[1].get('text'),
    'Sentence 2.',
    'Wrong text for second object'
  );
  assert.equal(
    sentenceItems[2].get('text'),
    'Sentence 3.',
    'Wrong text for third object'
  );
  assert.equal(
    sentenceItems[3].get('text'),
    '1.6 millions.',
    'Wrong text for fourth object'
  );
  assert.equal(
    sentenceItems[4].get('text'),
    'Sentence 5',
    'Wrong text for fifth object'
  );
  assert.equal(
    sentenceItems[5].get('text'),
    'Sentence 6.',
    'Wrong text for fifth object'
  );
  assert.equal(
    sentenceItems[6].get('text'),
    'Sentence 7',
    'Wrong text for fifth object'
  );
});

test('Hot Text Highlight - toItems', function(assert) {
  assert.expect(8);

  var questionUtil = HotTextHighlightUtil.create({ question: 'FakeQuestion' });

  var items = Ember.A(['  ', '', 'Item 1', ' Item 2 ', '[Item 3]']);

  var convertedItems = questionUtil.toItems(items).toArray();
  assert.equal(
    convertedItems.length,
    3,
    'Should have 3 items, empty items are excluded'
  );
  assert.equal(
    convertedItems[0].get('index'),
    0,
    'Invalid id, Item 1 should have index = 0, because other are empty'
  );
  assert.equal(convertedItems[0].get('text'), 'Item 1', 'Wrong item text');
  assert.equal(
    convertedItems[0].get('selected'),
    false,
    'Wrong item selected value'
  );
  assert.equal(
    convertedItems[1].get('text'),
    'Item 2',
    'Wrong item text, text should be trimmed'
  );
  assert.equal(convertedItems[2].get('index'), 2, 'Wrong item index at 2');
  assert.equal(
    convertedItems[2].get('text'),
    'Item 3',
    'Wrong item text, [] should be suppressed'
  );
  assert.equal(
    convertedItems[2].get('correct'),
    true,
    'Item3 should be correct'
  );
});

test('Hot Text Highlight - getItems isHotTextHighlightWord', function(assert) {
  assert.expect(6);
  var answers = Ember.A([
      Ember.Object.create({
        text: 'Many [correct] items in this sentence [another]'
      })
    ]),
    question = Ember.Object.create({
      answers: answers,
      hasAnswers: true,
      isHotTextHighlightWord: true
    });

  var questionUtil = HotTextHighlightUtil.create({ question: question });
  var items = questionUtil.getItems().toArray();

  assert.equal(items.length, 7, 'Missing items');
  assert.equal(items[0].get('index'), 0, 'Invalid id');
  assert.equal(items[0].get('text'), 'Many', 'Wrong item text');
  assert.equal(items[0].get('selected'), false, 'Wrong item selected value');
  assert.equal(items[1].get('text'), 'correct', 'Wrong item text at 1');
  assert.equal(items[1].get('index'), 1, 'Wrong item text at 1');
});

test('Hot Text Highlight - getItems isHotTextHighlightSentence', function(
  assert
) {
  assert.expect(6);
  var answers = Ember.A([
      Ember.Object.create({
        text: 'Sentence 1 [Sentence 2.] Sentence 3 [Sentence 4.] Sentence 5'
      })
    ]),
    question = Ember.Object.create({
      answers: answers,
      hasAnswers: true,
      isHotTextHighlightWord: false
    });

  var questionUtil = HotTextHighlightUtil.create({ question: question });
  var items = questionUtil.getItems().toArray();

  assert.equal(items.length, 5, 'Missing items');
  assert.equal(items[0].get('index'), 0, 'Invalid id');
  assert.equal(items[0].get('text'), 'Sentence 1', 'Wrong item text');
  assert.equal(items[0].get('selected'), false, 'Wrong item selected value');
  assert.equal(items[1].get('index'), 1, 'Sentence 2. Wrong item index ');
  assert.equal(items[1].get('text'), 'Sentence 2.', 'Wrong item text');
});

test('Hot Text Highlight - transformText', function(assert) {
  assert.expect(4);
  var questionUtil = HotTextHighlightUtil.create({ question: 'FakeQuestion' });

  //removing wrapping <p> tag for a normal text
  var text = questionUtil.transformText(
    '<p> This is a test [for] the transform text </p>'
  );
  assert.equal(text, 'This is a test [for] the transform text', 'Wrong text');

  //removing wrapping <p> tag for a text having more html tag inside
  text = questionUtil.transformText(
    '<p> This is a test [<p>for</p>] <b>the</b> transform text </p>'
  );
  assert.equal(text, 'This is a test [<p>for</p>] <b>the</b> transform text');

  //ignoring a text not having a wrapping <p> tag, but <p> tags inside
  text = questionUtil.transformText(
    'This is a test [<p>for</p>] <b>the</b> transform text'
  );
  assert.equal(text, 'This is a test [<p>for</p>] <b>the</b> transform text');

  //ignoring a text a starting <p> tag which, but not wrapping the whole text
  text = questionUtil.transformText(
    '<p>This is a test</p> [<p>for</p>] <b>the</b> transform text'
  );
  assert.equal(
    text,
    '<p>This is a test</p> [<p>for</p>] <b>the</b> transform text'
  );
});

test('Hot Text Highlight - toAnswerObjects', function(assert) {
  let question = Ember.Object.create({
    answers: Ember.A([
      Ember.Object.create({
        text: 'Many [correct] items in this sentence [another.]'
      })
    ]),
    hasAnswers: true,
    isHotTextHighlightWord: true
  });
  let questionUtil = HotTextHighlightUtil.create({ question: question });

  let answer = [
    { index: 6, text: 'another.' },
    { index: 1, text: 'correct' },
    { index: 3, text: 'item' }
  ];
  let answerObjects = questionUtil.toAnswerObjects(answer).toArray();
  assert.equal(answerObjects.length, 3, 'Only 1 answer object should be found');

  //first
  assert.equal(answerObjects[0].get('answerId'), 0, 'Wrong answerId');
  assert.equal(answerObjects[0].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[0].get('order'), 7, 'Wrong order');
  assert.equal(answerObjects[0].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[0].get('text'), 'another.', 'Wrong text');
  //second
  assert.equal(answerObjects[1].get('answerId'), 0, 'Wrong answerId');
  assert.equal(answerObjects[1].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[1].get('order'), 2, 'Wrong order');
  assert.equal(answerObjects[1].get('status'), 'correct', 'Wrong status');
  assert.equal(answerObjects[1].get('text'), 'correct', 'Wrong text');
  //third
  assert.equal(answerObjects[2].get('answerId'), 0, 'Wrong answerId');
  assert.equal(answerObjects[2].get('skip'), false, 'Wrong skipped');
  assert.equal(answerObjects[2].get('order'), 4, 'Wrong order');
  assert.equal(answerObjects[2].get('status'), 'incorrect', 'Wrong status');
  assert.equal(answerObjects[2].get('text'), 'item', 'Wrong text');
});

test('Hot Text Highlight - toUserAnswer', function(assert) {
  let question = Ember.Object.create({
    answers: Ember.A([
      Ember.Object.create({
        text: 'Many [correct] items in this sentence [another.]'
      })
    ]),
    hasAnswers: true,
    isHotTextHighlightWord: true
  });
  let questionUtil = HotTextHighlightUtil.create({ question: question });

  let answerObjects = Ember.A([
    AnswerObject.create({ text: 'another.', order: 7, answerId: 0 }),
    AnswerObject.create({ text: 'correct', order: 2, answerId: 0 }),
    AnswerObject.create({ text: 'item', order: 4, answerId: 0 })
  ]);

  let userAnswer = questionUtil.toUserAnswer(answerObjects);

  let answer = [
    { index: 6, text: 'another.' },
    { index: 1, text: 'correct' },
    { index: 3, text: 'item' }
  ];

  assert.deepEqual(userAnswer, answer, 'Wrong user answer');
});

test('Hot Text Highlight - toUserAnswer when no respond is provided', function(
  assert
) {
  let question = Ember.Object.create({
    answers: Ember.A([
      Ember.Object.create({
        text: 'Many [correct] items in this sentence [another.]'
      })
    ]),
    hasAnswers: true,
    isHotTextHighlightWord: true
  });
  let questionUtil = HotTextHighlightUtil.create({ question: question });

  let answerObjects = Ember.A([]);

  let userAnswer = questionUtil.toUserAnswer(answerObjects);

  assert.equal(userAnswer, null, 'Wrong user answer');
});
