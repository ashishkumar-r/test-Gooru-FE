import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import QuestionResult from 'gooru-web/models/result/question';
import Assessment from 'gooru-web/models/content/assessment';
import T from 'gooru-web/tests/helpers/assert';
import { ASSESSMENT_SHOW_VALUES } from 'gooru-web/config/config';
import wait from 'ember-test-helpers/wait';

moduleForComponent(
  'player/gru-question-viewer',
  'Integration | Component | player/gru question viewer',
  {
    integration: true,
    beforeEach: function() {
      this.i18n = this.container.lookup('service:i18n');
      this.i18n.set('locale', 'en');
    }
  }
);

test('Layout', function(assert) {
  assert.expect(11);

  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    mediaUrl: 'test.jpg',
    questionType: 'OE',
    hasMedia: true,
    hints: []
  });

  const questionResult = QuestionResult.create();

  this.set('questionResult', questionResult);
  this.set('question', question);

  this.render(
    hbs`{{player/gru-question-viewer question=question questionResult=questionResult}}`
  );

  var $component = this.$(); //component dom element

  var $questionPanel = $component.find('.question-panel');
  T.exists(assert, $questionPanel, 'Missing question panel');
  T.exists(assert, $questionPanel.find('h2'), 'Missing question header');
  T.exists(
    assert,
    $questionPanel.find('.question span'),
    'Missing question text'
  );
  T.exists(
    assert,
    $questionPanel.find('.question img'),
    'Missing question media'
  );

  var $answerPanel = $component.find('.answers-panel');
  T.exists(assert, $answerPanel, 'Missing answer panel');
  T.exists(assert, $answerPanel.find('h2'), 'Missing answer header');
  T.exists(
    assert,
    $answerPanel.find('.gru-open-ended'),
    'Missing open ended question component'
  );
  T.exists(
    assert,
    $answerPanel.find('.actions button.save'),
    'Missing submit button'
  );

  const $saveButton = $answerPanel.find('.actions button.save');
  assert.ok($saveButton.attr('disabled'), 'Button should be disabled');

  // There will be two question information sections in the page; however, only one will be
  // visible depending on a screen width breakpoint
  var $infoPanel = $component.find('.question-information').eq(0);
  assert.ok($infoPanel.find('button.hint'), 'Missing hint button');
  assert.ok(
    $infoPanel.find('button.explanation'),
    'Missing explanation button'
  );
});

test('Submit button should become enabled and call action on submit', function(assert) {
  assert.expect(5);

  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    mediaUrl: 'test.jpg',
    questionType: 'OE',
    hasMedia: true
  });

  const questionResult = QuestionResult.create();

  this.set('questionResult', questionResult);
  this.set('question', question);

  this.on('mySubmitQuestion', function(question, questionResult) {
    assert.equal(question.get('id'), 10, 'Wrong id');
    assert.equal(
      questionResult.get('correct'),
      true,
      'Answer should be correct'
    );
    assert.equal(questionResult.get('userAnswer'), 'test', 'Wrong id');
  });
  this
    .render(hbs`{{player/gru-question-viewer question=question questionResult=questionResult
      onSubmitQuestion="mySubmitQuestion"}}`);

  var $component = this.$(); //component dom element

  var $answerPanel = $component.find('.answers-panel');
  assert.ok(
    $answerPanel.find('.actions button.save').attr('disabled'),
    'Button should be disabled'
  );
  var $openEndedComponent = $answerPanel.find('.gru-open-ended');
  $openEndedComponent.find('textarea').val('test');
  $openEndedComponent.find('textarea').change();

  assert.ok(
    !$answerPanel.find('.actions button.save').attr('disabled'),
    'Button should not be disabled'
  );

  $answerPanel.find('.actions button.save').click();
});

test('Multiple Answer - Submit button should become enabled by clicking 1 radio button when user answer if provided', function(assert) {
  assert.expect(6);

  let question = Ember.Object.create({
    id: '569906aa77bebed003fa6eb1',
    questionType: 'MA',
    text: 'Sample Question MA',
    hints: [],
    explanation: 'Sample explanation text',
    answers: Ember.A([
      Ember.Object.create({
        id: '1',
        text: '<p>An aquifer</p>',
        answerType: 'text',
        isCorrect: true,
        sequence: 1
      }),
      Ember.Object.create({
        id: '2',
        text: '<p>A well</p>',
        answerType: 'text',
        isCorrect: false,
        sequence: 2
      }),
      Ember.Object.create({
        id: '3',
        text: '<p>A pump</p>',
        answerType: 'text',
        isCorrect: false,
        sequence: 3
      })
    ]),
    resourceType: 'assessment-question',
    resourceFormat: 'question',
    order: 5,
    hasAnswers: true
  });

  // const userAnswer = [
  //   { id: '1', selection: true },
  //   { id: '2', selection: false },
  //   { id: '3', selection: false }
  // ];
  // Instead of supplying user answer click thru user answers and assert
  this.set('question', question);

  const questionResult = QuestionResult.create({
    userAnswer: null,
    question: question
  });

  this.set('questionResult', questionResult);

  this.render(
    hbs`{{player/gru-question-viewer question=question questionResult=questionResult }}`
  );

  var $component = this.$(); //component dom element

  var $answerPanel = $component.find('.answers-panel');
  assert.ok(
    $answerPanel.find('.actions button.save').attr('disabled'),
    'Button should be disabled'
  );

  assert.equal(
    $component.find('.answer-choices tbody tr input').length,
    6,
    'Missing answer choices radio inputs'
  );
  $answerPanel.find('.answer-choices tbody tr:eq(0) input:eq(0)').click(); //clicking answer choice

  assert.equal(
    $component.find('.answer-choices tbody tr:eq(0) input:checked').val(),
    'yes|1',
    'Wrong selection for answer 1'
  );

  $answerPanel.find('.answer-choices tbody tr:eq(1) input:eq(1)').click(); //clicking answer choice
  assert.equal(
    $component.find('.answer-choices tbody tr:eq(1) input:checked').val(),
    'no|2',
    'Wrong selection for answer 1'
  );

  $answerPanel.find('.answer-choices tbody tr:eq(2) input:eq(1)').click(); //clicking answer choice
  assert.equal(
    $component.find('.answer-choices tbody tr:eq(2) input:checked').val(),
    'no|3',
    'Wrong selection for answer 1'
  );

  $answerPanel.find('.answer-choices tbody tr:eq(2) input:eq(0)').click(); //clicking yes at last answer choice

  return wait().then(function() {
    assert.ok(
      !$answerPanel.find('.actions button.save').attr('disabled'),
      'Button should not be disabled'
    );
  });
});

test('Clicking on the "Hints" button should display a certain number of hints and then become disabled', function(assert) {
  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    questionType: 'OE',
    hasMedia: false,
    hints: [
      {
        hintId: 790,
        hintText: 'Hints text 1',
        sequence: 1
      },
      {
        hintId: 791,
        hintText: 'Hints text 2',
        sequence: 2
      }
    ]
  });
  const questionResult = QuestionResult.create();

  this.set('questionResult', questionResult);
  this.set('question', question);

  this.render(
    hbs`{{player/gru-question-viewer question=question questionResult=questionResult}}`
  );

  var $infoSection = this.$('.question-panel').eq(0);
  assert.ok($infoSection.find('.hints'), 'Missing hints section');
  assert.equal(
    $infoSection.find('.hints li').length,
    0,
    'No hints should be visible'
  );

  $infoSection.find('.btn-group .hint').click();
  assert.equal(
    $infoSection.find('.hints li').length,
    1,
    'Hint should be displayed'
  );
  assert.equal(
    $infoSection
      .find('.hints li:first-child')
      .text()
      .trim(),
    'Hints text 1',
    'Hint\'s content is incorrect'
  );
  assert.ok(
    !$infoSection.find('.btn-group .hint').attr('disabled'),
    'Hint button should not be disabled'
  );

  $infoSection.find('.btn-group .hint').click();
  assert.equal(
    $infoSection.find('.hints li').length,
    2,
    'Hints should be displayed'
  );
  assert.equal(
    $infoSection
      .find('.hints li:last-child')
      .text()
      .trim(),
    'Hints text 2',
    'Hint\'s content is incorrect'
  );
  assert.ok(
    $infoSection.find('.btn-group .hint').attr('disabled'),
    'Hint button should be disabled'
  );
});

test('Clicking on the "Explanation" button should display an explanation and then it should become disabled', function(assert) {
  const question = Ember.Object.create({
    id: 11,
    order: 2,
    text: 'Dummy question text',
    questionType: 'OE',
    hasMedia: false,
    hints: [],
    explanation: '<p>This is a test explanation</p>'
  });

  const questionResult = QuestionResult.create();

  this.set('questionResult', questionResult);
  this.set('question', question);
  this.render(
    hbs`{{player/gru-question-viewer question=question questionResult=questionResult}}`
  );

  var $infoSection = this.$('.question-panel').eq(0);
  assert.ok(
    !$infoSection.find('.btn-group .explanation').attr('disabled'),
    'Explanation button should be enabled'
  );
  assert.ok(
    !$infoSection.find(' > .explanation').length,
    'Explanation section should not be visible'
  );

  $infoSection.find('.btn-group .explanation').click();
  assert.ok(
    $infoSection.find('> .explanation').length,
    1,
    'Explanation should be displayed'
  );
  assert.equal(
    $infoSection
      .find('.panel.explanation .panel-body .explanation p')
      .text()
      .trim(),
    'This is a test explanation',
    'Explanation does not display the right content'
  );
  assert.ok(
    $infoSection.find('.btn-group .explanation').attr('disabled'),
    'Explanation button should be disabled'
  );
});

test('Save Button Text key', function(assert) {
  assert.expect(1);

  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    mediaUrl: 'test.jpg',
    questionType: 'OE',
    hasMedia: true,
    hints: []
  });

  const questionResult = QuestionResult.create();

  this.set('questionResult', questionResult);
  this.set('question', question);

  this.render(
    hbs`{{player/gru-question-viewer question=question questionResult=questionResult buttonTextKey='common.save-next'}}`
  );

  var $component = this.$(); //component dom element
  var $answerPanel = $component.find('.answers-panel');
  const $saveButton = $answerPanel.find('.actions button.save');
  assert.equal(
    T.text($saveButton),
    this.i18n.t('common.save-next').toString(),
    'Wrong button text'
  );
});

test('Submit button disabled when submitted', function(assert) {
  assert.expect(1);

  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    mediaUrl: 'test.jpg',
    questionType: 'OE',
    hasMedia: true
  });

  const questionResult = QuestionResult.create();

  this.set('questionResult', questionResult);
  this.set('question', question);

  this
    .render(hbs`{{player/gru-question-viewer question=question questionResult=questionResult
      submitted=true}}`);

  var $component = this.$(); //component dom element

  var $answerPanel = $component.find('.answers-panel');
  assert.ok(
    $answerPanel.find('.actions button.save').attr('disabled'),
    'Button should be disabled'
  );
});

test('Show feedback layout, using collection setting', function(assert) {
  assert.expect(4);

  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    mediaUrl: 'test.jpg',
    questionType: 'OE',
    hasMedia: true
  });

  const assessment = Assessment.create({
    showFeedback: ASSESSMENT_SHOW_VALUES.IMMEDIATE
  });

  const questionResult = QuestionResult.create();

  this.on('mySubmitQuestion', function(question, questionResult) {
    assert.equal(question.get('id'), 10, 'Wrong id');
    assert.equal(
      questionResult.get('correct'),
      true,
      'Answer should be correct'
    );
    assert.equal(questionResult.get('userAnswer'), 'test', 'Wrong id');
  });

  this.set('assessment', assessment);
  this.set('questionResult', questionResult);
  this.set('question', question);
  this.set('role', 'student');

  this
    .render(hbs`{{player/gru-question-viewer question=question questionResult=questionResult
      collection=assessment onSubmitQuestion="mySubmitQuestion" role=role}}`);

  var $component = this.$(); //component dom element
  var $answerPanel = $component.find('.answers-panel');
  const $saveButton = $answerPanel.find('.actions button.save');
  assert.equal(
    T.text($saveButton),
    this.i18n.t('common.save').toString(),
    'Wrong button text'
  );

  var $openEndedComponent = $answerPanel.find('.gru-open-ended');
  $openEndedComponent.find('textarea').val('test');
  $openEndedComponent.find('textarea').change();
  $answerPanel.find('.actions button.save').click();
});

test('Show feedback layout, using showQuestionFeedback', function(assert) {
  assert.expect(4);

  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    mediaUrl: 'test.jpg',
    questionType: 'OE',
    hasMedia: true
  });

  const assessment = Assessment.create({
    showFeedback: ASSESSMENT_SHOW_VALUES.NEVER //setting hides feedback, property should override it
  });

  const questionResult = QuestionResult.create();

  this.on('mySubmitQuestion', function(question, questionResult) {
    assert.equal(question.get('id'), 10, 'Wrong id');
    assert.equal(
      questionResult.get('correct'),
      true,
      'Answer should be correct'
    );
    assert.equal(questionResult.get('userAnswer'), 'test', 'Wrong id');
  });

  this.set('assessment', assessment);
  this.set('questionResult', questionResult);
  this.set('question', question);
  this.set('role', 'student');

  this
    .render(hbs`{{player/gru-question-viewer question=question questionResult=questionResult
      collection=assessment onSubmitQuestion="mySubmitQuestion" showQuestionFeedback=true role=role}}`);

  var $component = this.$(); //component dom element
  var $answerPanel = $component.find('.answers-panel');
  const $saveButton = $answerPanel.find('.actions button.save');
  assert.equal(
    T.text($saveButton),
    this.i18n.t('common.save').toString(),
    'Wrong button text'
  );

  var $openEndedComponent = $answerPanel.find('.gru-open-ended');
  $openEndedComponent.find('textarea').val('test');
  $openEndedComponent.find('textarea').change();
  $answerPanel.find('.actions button.save').click();
});

test('Show feedback when submitted layout, using collection setting', function(assert) {
  assert.expect(2);

  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    mediaUrl: 'test.jpg',
    questionType: 'OE',
    hasMedia: true
  });

  const assessment = Assessment.create({
    showFeedback: ASSESSMENT_SHOW_VALUES.IMMEDIATE
  });

  const questionResult = QuestionResult.create({
    submittedAnswer: true
  });

  this.set('assessment', assessment);
  this.set('questionResult', questionResult);
  this.set('question', question);
  this.set('role', 'student');

  this
    .render(hbs`{{player/gru-question-viewer question=question questionResult=questionResult
      collection=assessment onSubmitQuestion="mySubmitQuestion" role=role}}`);

  var $component = this.$(); //component dom element
  var $answerPanel = $component.find('.answers-panel');
  assert.notOk(
    $answerPanel.find('.actions button.save').attr('disabled'),
    'Button should be enabled'
  );

  assert.ok($answerPanel.find('.feedback').length, 'Feedback should be shown');
});

test('Show feedback when submitted layout, using showQuestionFeedback setting', function(assert) {
  assert.expect(2);

  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    mediaUrl: 'test.jpg',
    questionType: 'OE',
    hasMedia: true
  });

  const assessment = Assessment.create({
    showFeedback: ASSESSMENT_SHOW_VALUES.NEVER //setting hides feedback, property should override it
  });

  const questionResult = QuestionResult.create({
    submittedAnswer: true
  });

  this.set('assessment', assessment);
  this.set('questionResult', questionResult);
  this.set('question', question);
  this.set('role', 'student');

  this
    .render(hbs`{{player/gru-question-viewer question=question questionResult=questionResult
      collection=assessment onSubmitQuestion="mySubmitQuestion" showQuestionFeedback=true role=role}}`);

  var $component = this.$(); //component dom element
  var $answerPanel = $component.find('.answers-panel');
  assert.notOk(
    $answerPanel.find('.actions button.save').attr('disabled'),
    'Button should be enabled'
  );

  assert.ok($answerPanel.find('.feedback').length, 'Feedback should be shown');
});

test('Question Viewer Submit by Enter', function(assert) {
  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    mediaUrl: 'test.jpg',
    questionType: 'MC',
    hasMedia: true
  });

  const questionResult = QuestionResult.create();

  this.set('questionResult', questionResult);
  this.set('question', question);

  this.on('mySubmitQuestion', function(question) {
    assert.equal(question.get('id'), 10, 'Wrong id');
  });
  this
    .render(hbs`{{player/gru-question-viewer question=question questionResult=questionResult
      onSubmitQuestion="mySubmitQuestion" isSubmitDisabled=false}}`);

  var $component = this.$(); //component dom element

  var e = $.Event('keyup');
  e.which = 13; //ENTER
  $component.find('.gru-question-viewer').trigger(e);
});

test('Open ended question try submit by enter', function(assert) {
  const question = Ember.Object.create({
    id: 10,
    order: 2,
    text: 'Dummy question text',
    mediaUrl: 'test.jpg',
    questionType: 'OE',
    isOpenEnded: true,
    hasMedia: true
  });

  const questionResult = QuestionResult.create();

  this.set('questionResult', questionResult);
  this.set('question', question);

  this.on('mySubmitQuestion', function() {
    assert.ok(false, '');
  });
  this
    .render(hbs`{{player/gru-question-viewer question=question questionResult=questionResult
      onSubmitQuestion="mySubmitQuestion" isSubmitDisabled=false}}`);

  var $component = this.$(); //component dom element

  var e = $.Event('keyup');
  e.which = 13; //ENTER
  $component.find('.gru-question-viewer').trigger(e);

  assert.ok(true);
});
