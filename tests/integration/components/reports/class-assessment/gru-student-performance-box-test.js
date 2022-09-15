import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import QuestionResult from 'gooru-web/models/result/question';
import T from 'gooru-web/tests/helpers/assert';
import Ember from 'ember';

moduleForComponent(
  'reports/class-assessment/gru-student-performance-box',
  'Integration | Component | reports/class assessment/gru student performance box',
  {
    integration: true
  }
);

test('Layout when all completed', function(assert) {
  assert.expect(11);

  const student = Ember.Object.create({
    id: '56983a9060a68052c1ed934c',
    fullName: 'Rocha, Perez',
    lastFirstName: 'Perez, Rocha'
  });

  const reportData = Ember.A([
    QuestionResult.create({
      correct: true,
      questionId: '569906aa20b7dfae1bcd5262',
      reaction: 2,
      timeSpent: 701,
      userAnswer: 1
    }),
    QuestionResult.create({
      correct: true,
      questionId: '569906aa3ec3bb39969acbe6',
      reaction: 4,
      timeSpent: 1333,
      userAnswer: 1
    }),
    QuestionResult.create({
      correct: false,
      questionId: '569906aadfa0072204f7c7c7',
      reaction: 5,
      timeSpent: 1305,
      userAnswer: null //skipped
    }),
    QuestionResult.create({
      correct: false,
      questionId: '569906aacea8416665209d53',
      reaction: 1,
      timeSpent: 1013,
      userAnswer: 1
    })
  ]);

  this.set('student', student);
  this.set('reportData', reportData);

  this.on('selectStudent', function() {
    assert.ok(true, 'This should be called once');
  });

  this.render(hbs`{{reports/class-assessment/gru-student-performance-box
    student=student
    reportData=reportData
    onSelectStudent=(action 'selectStudent')}}`);

  const $component = this.$();
  T.exists(assert, $component.find('.panel'), 'Missing student box panel');

  const $header = $component.find('.panel .panel-heading');
  T.exists(assert, $header, 'Missing student box title');
  const $headerName = $header.find('.name');
  T.exists(assert, $headerName, 'Missing student box name');
  assert.equal(T.text($headerName), 'Perez, Rocha', 'Wrong name');
  const $headerScore = $header.find('.score');
  T.exists(assert, $headerScore, 'Missing student box score');
  assert.equal(T.text($headerScore), '50%', 'Wrong score');

  const $questions = $component.find('.panel .questions');
  T.exists(assert, $questions, 'Missing questions area');

  assert.equal(
    $questions.find('span.correct').length,
    2,
    'It should displayed 2 correct questions'
  );
  assert.equal(
    $questions.find('span.incorrect').length,
    1,
    'It should displayed 1 incorrect question'
  );
  assert.equal(
    $questions.find('span.not-started').length,
    0,
    'It should displayed 0 not started questions'
  );
  assert.equal(
    $questions.find('span.skipped').length,
    1,
    'It should displayed 1 skipped question'
  );

  $component.find('.panel').click();
});

test('Layout having not started questions', function(assert) {
  assert.expect(9);

  const student = Ember.Object.create({
    id: '56983a9060a68052c1ed934c',
    fullName: 'Rocha, Perez'
  });

  const reportData = Ember.A([
    QuestionResult.create({
      correct: true,
      questionId: '569906aa20b7dfae1bcd5262',
      reaction: 2,
      timeSpent: 701,
      userAnswer: 1
    }),
    QuestionResult.create({
      correct: true,
      questionId: '569906aa3ec3bb39969acbe6',
      reaction: 4,
      timeSpent: 1333,
      userAnswer: 1
    }),
    QuestionResult.create(),
    QuestionResult.create({
      correct: false,
      questionId: '569906aacea8416665209d53',
      reaction: 1,
      timeSpent: 1013,
      userAnswer: 1
    })
  ]);

  this.set('student', student);
  this.set('reportData', reportData);

  this.on('selectStudent', function() {
    assert.ok(true, 'This should be called once');
  });

  this.render(hbs`{{reports/class-assessment/gru-student-performance-box
    student=student
    reportData=reportData
    onSelectStudent=(action 'selectStudent')}}`);

  const $component = this.$();
  T.exists(assert, $component.find('.panel'), 'Missing student box panel');

  const $header = $component.find('.panel .panel-heading');
  T.exists(assert, $header, 'Missing student box title');
  T.exists(assert, $header.find('.score'), 'Missing student box score');
  T.exists(
    assert,
    $header.find('.question-in-progress'),
    'Missing in progress icon'
  );

  const $questions = $component.find('.panel .questions');
  T.exists(assert, $questions, 'Missing questions area');

  assert.equal(
    $questions.find('span.correct').length,
    2,
    'It should displayed 2 correct questions'
  );
  assert.equal(
    $questions.find('span.incorrect').length,
    1,
    'It should displayed 1 incorrect questions'
  );
  assert.equal(
    $questions.find('span.not-started').length,
    1,
    'It should displayed 1 not started question'
  );
  assert.equal(
    $questions.find('span.skipped').length,
    0,
    'It should displayed 0 skipped questions, they are treated as incorrect'
  );

  $component.find('.panel').click();
});

test('Showing student code in anonymous mode', function(assert) {
  assert.expect(5);

  const student = Ember.Object.create({
    id: '56983a9060a68052c1ed934c',
    fullName: 'Rocha, Perez',
    code: 'abcde'
  });

  const reportData = Ember.A([
    QuestionResult.create({
      correct: true,
      questionId: '569906aa20b7dfae1bcd5262',
      reaction: 2,
      timeSpent: 701,
      userAnswer: 1
    })
  ]);

  this.set('student', student);
  this.set('reportData', reportData);

  this.render(hbs`{{reports/class-assessment/gru-student-performance-box
    student=student
    reportData=reportData
    anonymous=true }}`);

  const $component = this.$();
  T.exists(assert, $component.find('.panel'), 'Missing student box panel');

  const $header = $component.find('.panel .panel-heading');
  const $headerName = $header.find('.name');
  T.exists(assert, $headerName, 'Missing student box name');
  assert.equal(T.text($headerName), 'abcde', 'Wrong name');
  const $headerScore = $header.find('.score');
  T.notExists(assert, $headerScore, 'student box score should not be visible');
  const $inProgressIcon = $header.find('.question-in-progress');
  T.notExists(assert, $inProgressIcon, 'inProgressIcon should not be visible');
});
