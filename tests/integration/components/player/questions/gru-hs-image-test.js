import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';

moduleForComponent(
  'player/questions/gru-hs-image',
  'Integration | Component | player/questions/gru hs image',
  {
    integration: true,
    beforeEach: function() {
      this.container.lookup('service:i18n').set('locale', 'en');
    }
  }
);

test('Layout', function(assert) {
  let question = Ember.Object.create({
    id: '569906aa04f742731bd4e896',
    isHotSpotImage: true,
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      // ["1", "3"]
      Ember.Object.create({ id: 1, text: 'test-1.png', isCorrect: true }),
      Ember.Object.create({ id: 2, text: 'test-2.png', isCorrect: false }),
      Ember.Object.create({ id: 3, text: 'test-3.png', isCorrect: true })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    narration:
      'Deserunt occaecat ullamco cillum in incididunt anim sit consequat consequat sit. Ipsum duis irure do quis amet cupidatat tempor qui nulla commodo nisi veniam. Culpa Lorem consequat ad officia. Consectetur minim pariatur id laborum tempor voluptate dolor quis laboris et quis commodo.',
    order: 7,
    hasAnswers: true
  });

  this.set('question', question);

  this.render(hbs`{{player/questions/gru-hs-image question=question}}`);

  const $component = this.$(); //component dom element
  const $answersContainer = $component.find('.answer-choices');

  assert.ok($component.find('.instructions'), 'Missing instructions');
  assert.equal(
    $answersContainer.find('li.answer').length,
    3,
    'Incorrect number of answer choices'
  );

  assert.equal(
    $answersContainer.find('li.answer:first-child').data('id'),
    1,
    'First answer choice, data-id value is incorrect'
  );
  const $firstImage = $answersContainer.find('li.answer:first-child img');
  assert.ok(
    $firstImage.prop('src').indexOf('test-1.png') >= 0,
    'First image path is not set correctly'
  );
  assert.equal(
    $answersContainer.find('li.answer:last-child').data('id'),
    3,
    'Last answer choice, data-id value is incorrect'
  );
  const $image = $answersContainer.find('li.answer:last-child img');
  assert.ok(
    $image.prop('src').indexOf('test-3.png') >= 0,
    'Last image path is not set correctly'
  );
});

test('Selecting answers', function(assert) {
  let question = Ember.Object.create({
    id: '569906aa04f742731bd4e896',
    isHotSpotImage: true,
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      // ["1", "3"]
      Ember.Object.create({ id: 1, text: 'test-1.png', isCorrect: true }),
      Ember.Object.create({ id: 2, text: 'test-2.png', isCorrect: false })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    narration:
      'Deserunt occaecat ullamco cillum in incididunt anim sit consequat consequat sit. Ipsum duis irure do quis amet cupidatat tempor qui nulla commodo nisi veniam. Culpa Lorem consequat ad officia. Consectetur minim pariatur id laborum tempor voluptate dolor quis laboris et quis commodo.',
    order: 7,
    hasAnswers: true
  });

  this.set('question', question);

  this.render(hbs`{{player/questions/gru-hs-image question=question}}`);

  const $answers = this.$('li.answer');
  const $firstAnswer = $answers.eq(0);
  const $secondAnswer = $answers.eq(1);

  assert.equal(
    this.$('li.selected').length,
    0,
    'Initial number of answers selected is incorrect'
  );

  $firstAnswer.click();
  assert.ok(
    $firstAnswer.hasClass('selected'),
    'First answer should have been selected'
  );

  $secondAnswer.click();
  assert.ok(
    $secondAnswer.hasClass('selected'),
    'Second answer should have been selected'
  );
  assert.equal(
    this.$('li.selected').length,
    2,
    'Incorrect number of answers selected'
  );

  $firstAnswer.click();
  assert.ok(
    !$firstAnswer.hasClass('selected'),
    'First answer should have been deselected'
  );
  assert.equal(
    this.$('li.selected').length,
    1,
    'Incorrect number of answers selected'
  );

  $secondAnswer.click();
  assert.ok(
    !$secondAnswer.hasClass('selected'),
    'Second answer should have been deselected'
  );
  assert.equal(
    this.$('li.selected').length,
    0,
    'Incorrect number of answers selected'
  );
});

test('Notifications work after selecting questions', function(assert) {
  assert.expect(12);
  let answers = [];
  let question = Ember.Object.create({
    id: '569906aa04f742731bd4e896',
    isHotSpotImage: true,
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      // ["1", "3"]
      Ember.Object.create({ id: 1, text: 'test-1.png', isCorrect: true }),
      Ember.Object.create({ id: 2, text: 'test-2.png', isCorrect: false }),
      Ember.Object.create({ id: 3, text: 'test-3.png', isCorrect: true }),
      Ember.Object.create({ id: 4, text: 'test-4.png', isCorrect: true })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    narration:
      'Deserunt occaecat ullamco cillum in incididunt anim sit consequat consequat sit. Ipsum duis irure do quis amet cupidatat tempor qui nulla commodo nisi veniam. Culpa Lorem consequat ad officia. Consectetur minim pariatur id laborum tempor voluptate dolor quis laboris et quis commodo.',
    order: 7,
    hasAnswers: true
  });

  this.set('question', question);

  this.on('changeAnswer', function(question, stats) {
    assert.deepEqual(
      stats,
      answers,
      'Answer changed, but the answers are not correct'
    );
  });

  this.on('completeAnswer', function(question, stats) {
    assert.deepEqual(
      stats,
      answers,
      'Answer completed, but the answers are not correct'
    );
  });

  this.on('clearAnswer', function(question, stats) {
    assert.deepEqual(
      stats,
      answers,
      'Answer cleared, but the answers are not correct'
    );
  });

  this.render(hbs`{{player/questions/gru-hs-image question=question
                    onAnswerChanged="changeAnswer"
                    onAnswerCompleted="completeAnswer"
                    onAnswerCleared="clearAnswer" }}`);

  const $answers = this.$('li.answer');

  // Select first answer
  answers = { answer: [1], correct: false };
  $answers.eq(0).click();

  answers = { answer: [1, 3], correct: false };
  $answers.eq(2).click();

  // Three answers selected
  answers = { answer: [1, 3, 4], correct: true };
  $answers.eq(3).click();

  // Now, test deselecting all answers
  answers = { answer: [1, 4], correct: false };
  $answers.eq(2).click();

  answers = { answer: [4], correct: false };
  $answers.eq(0).click();

  // Send onAnswerCleared notification
  answers = { answer: [], correct: false };
  $answers.eq(3).click();
});

test('Layout - read only', function(assert) {
  let question = Ember.Object.create({
    id: '569906aa04f742731bd4e896',
    isHotSpotImage: true,
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      // ["1", "3"]
      Ember.Object.create({ id: 1, text: 'test-1.png', isCorrect: true }),
      Ember.Object.create({ id: 2, text: 'test-2.png', isCorrect: false }),
      Ember.Object.create({ id: 3, text: 'test-3.png', isCorrect: true })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    narration:
      'Deserunt occaecat ullamco cillum in incididunt anim sit consequat consequat sit. Ipsum duis irure do quis amet cupidatat tempor qui nulla commodo nisi veniam. Culpa Lorem consequat ad officia. Consectetur minim pariatur id laborum tempor voluptate dolor quis laboris et quis commodo.',
    order: 7,
    hasAnswers: true
  });

  this.set('question', question);

  this.render(
    hbs`{{player/questions/gru-hs-image question=question readOnly=true}}`
  );

  const $component = this.$(); //component dom element
  const $answersContainer = $component.find('.answer-choices');

  assert.equal(
    $answersContainer.find('li.answer.disabled').length,
    3,
    'Incorrect number of answer choices'
  );
});

test('Layout - with user answer', function(assert) {
  assert.expect(4);
  let question = Ember.Object.create({
    id: '569906aa04f742731bd4e896',
    isHotSpotImage: true,
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      // ["1", "3"]
      Ember.Object.create({ id: 1, text: 'test-1.png', isCorrect: true }),
      Ember.Object.create({ id: 2, text: 'test-2.png', isCorrect: false }),
      Ember.Object.create({ id: 3, text: 'test-3.png', isCorrect: true })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    narration:
      'Deserunt occaecat ullamco cillum in incididunt anim sit consequat consequat sit. Ipsum duis irure do quis amet cupidatat tempor qui nulla commodo nisi veniam. Culpa Lorem consequat ad officia. Consectetur minim pariatur id laborum tempor voluptate dolor quis laboris et quis commodo.',
    order: 7,
    hasAnswers: true
  });

  const answers = { answer: [2], correct: false };
  this.on('changeAnswer', function(question, stats) {
    assert.deepEqual(
      stats,
      answers,
      'Answer changed, but the answers are not correct'
    );
  });
  this.on('loadAnswer', function(question, stats) {
    assert.deepEqual(
      stats,
      answers,
      'Answer loaded, but the answers are not correct'
    );
  });
  this.set('question', question);
  this.set('userAnswer', [2]);

  this.render(hbs`{{player/questions/gru-hs-image question=question 
                    userAnswer=userAnswer
                    onAnswerChanged="changeAnswer"
                    onAnswerLoaded="loadAnswer"}}`);

  const $component = this.$(); //component dom element
  const $answersContainer = $component.find('.answer-choices');

  assert.equal(
    $answersContainer.find('li.answer').length,
    3,
    'Incorrect number of answer choices'
  );
  assert.equal(
    $answersContainer.find('li.answer.selected').length,
    1,
    'One should be selected'
  );
});
test('Set two questions', function(assert) {
  let question = Ember.Object.create({
    id: '569906aa04f742731bd4e896',
    isHotSpotImage: true,
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      // ["1", "3"]
      Ember.Object.create({ id: 1, text: 'test-1.png', isCorrect: true }),
      Ember.Object.create({ id: 2, text: 'test-2.png', isCorrect: false }),
      Ember.Object.create({ id: 3, text: 'test-3.png', isCorrect: true })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    narration:
      'Deserunt occaecat ullamco cillum in incididunt anim sit consequat consequat sit. Ipsum duis irure do quis amet cupidatat tempor qui nulla commodo nisi veniam. Culpa Lorem consequat ad officia. Consectetur minim pariatur id laborum tempor voluptate dolor quis laboris et quis commodo.',
    order: 7,
    hasAnswers: true
  });
  let question1 = Ember.Object.create({
    id: '569906aa04f742731bd4e896',
    isHotSpotImage: true,
    questionType: 'HS_IMG',
    text: 'Sample Question HS_IMG 2',
    hints: [],
    explanation: 'Sample explanation text2',
    answers: Ember.A([
      // ["1", "3"]
      Ember.Object.create({ id: 1, text: 'test-4.png', isCorrect: true }),
      Ember.Object.create({ id: 2, text: 'test-5.png', isCorrect: false }),
      Ember.Object.create({ id: 3, text: 'test-6.png', isCorrect: true })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    narration:
      'Deserunt occaecat ullamco cillum in incididunt anim sit consequat consequat sit. Ipsum duis irure do quis amet cupidatat tempor qui nulla commodo nisi veniam. Culpa Lorem consequat ad officia. Consectetur minim pariatur id laborum tempor voluptate dolor quis laboris et quis commodo.',
    order: 7,
    hasAnswers: true
  });

  this.set('question', question);

  this.render(hbs`{{player/questions/gru-hs-image question=question}}`);

  const $component = this.$(); //component dom element
  const $answersContainer = $component.find('.answer-choices');

  assert.ok($component.find('.instructions'), 'Missing instructions');

  let $image = $answersContainer.find('li.answer:first-child img');
  assert.ok($image.prop('src').indexOf('test-1.png') >= 0, 'Incorrect Answer');
  this.set('question', question1);

  $image = $answersContainer.find('li.answer:first-child img');
  assert.ok($image.prop('src').indexOf('test-4.png') >= 0, 'Incorrect Answer');
});
