import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import QuestionResult from 'gooru-web/models/result/question';
import UserResourcesResult from 'gooru-web/models/result/user-resources';
import ReportData from 'gooru-web/models/result/report-data';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'reports/class-assessment/gru-question-performance',
  'Integration | Component | reports/class assessment/gru question performance',
  {
    integration: true
  }
);

test('When students has no answers yet', function(assert) {
  const selectedQuestion = Ember.Object.create({
    //Multiple Choice
    id: '569906aa20b7dfae1bcd5262',
    questionType: 'MC',
    text: 'Sample Question MC',
    answers: Ember.A([
      Ember.Object.create({ id: 1, isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: 2, isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: 3, isCorrect: true, text: 'Answer 3' })
    ]),
    order: 1,
    resourceFormat: 'question',
    narration:
      'Id eu mollit sunt Lorem voluptate ut officia ut. Non non nulla exercitation eu duis laboris Lorem id deserunt ullamco laborum aliqua nostrud. Dolor consequat dolor consequat labore officia cillum ad nulla proident. Veniam consequat sint Lorem nulla reprehenderit occaecat dolore excepteur eiusmod.',
    hints: [
      {
        hintId: '98cdadb3-5ef4-4fad-92c5-3c09403ce5e6',
        hintText:
          '<p>Deserunt voluptate labore est sit nostrud ex et quis aliqua veniam deserunt ullamco.</p>',
        sequence: 1
      },
      {
        hintId: '21e07610-a788-4549-a57c-b79ab32b8909',
        hintText: '<p>Pariatur est excepteur est cupidatat.</p>',
        sequence: 2
      }
    ],
    explanation:
      '<p>Culpa laborum deserunt cillum sunt laboris voluptate ut ea elit ex adipisicing officia. Ad laboris tempor officia non ut sit consequat quis esse et cupidatat officia.</p>',
    hasAnswers: true,
    hasNarration: true
  });

  var assessment = Ember.Object.create({
    resources: [selectedQuestion]
  });

  var students = Ember.A([
    Ember.Object.create({ id: '56983a9060a68052c1ed934c' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388' }),
    Ember.Object.create({ id: '56983a906596902edadedc7c' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: assessment.get('resources')
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '56983a9060a68052c1ed934c',
      resourceResults: Ember.A([
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' })
      ])
    })
  ]);

  this.set('selectedQuestion', selectedQuestion);
  this.set('students', students);
  this.set('reportData', reportData);

  this.render(hbs`{{reports/class-assessment/gru-question-performance
          reportData=reportData
          students=students
          question=selectedQuestion }}`);

  const $component = this.$();
  const $chart = $component.find('.chart');
  T.exists(assert, $chart, 'Missing chart');
  T.exists(assert, $chart.find('.gru-x-bar-chart'), 'Missing gru-x-bar-chart');

  T.exists(
    assert,
    $component.find('.overall-completion'),
    'Missing overal-performance'
  );
  assert.equal(
    T.text($component.find('.overall-completion')),
    '0/3',
    'Wrong completion text'
  );

  T.notExists(assert, $component.find('.panel'), 'No panel should be found');
});

test('Non anonymous, layout', function(assert) {
  const selectedQuestion = Ember.Object.create({
    //Multiple Choice
    id: '56a120483b6e7b090501d3e7',
    questionType: 'MC',
    text: 'Sample Question MC',
    answers: Ember.A([
      Ember.Object.create({ id: 1, isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: 2, isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: 3, isCorrect: true, text: 'Answer 3' })
    ]),
    order: 1,
    resourceFormat: 'question',
    narration:
      'Id eu mollit sunt Lorem voluptate ut officia ut. Non non nulla exercitation eu duis laboris Lorem id deserunt ullamco laborum aliqua nostrud. Dolor consequat dolor consequat labore officia cillum ad nulla proident. Veniam consequat sint Lorem nulla reprehenderit occaecat dolore excepteur eiusmod.',
    hints: [
      {
        hintId: '98cdadb3-5ef4-4fad-92c5-3c09403ce5e6',
        hintText:
          '<p>Deserunt voluptate labore est sit nostrud ex et quis aliqua veniam deserunt ullamco.</p>',
        sequence: 1
      },
      {
        hintId: '21e07610-a788-4549-a57c-b79ab32b8909',
        hintText: '<p>Pariatur est excepteur est cupidatat.</p>',
        sequence: 2
      }
    ],
    explanation:
      '<p>Culpa laborum deserunt cillum sunt laboris voluptate ut ea elit ex adipisicing officia. Ad laboris tempor officia non ut sit consequat quis esse et cupidatat officia.</p>',
    hasAnswers: true,
    hasNarration: true
  });

  var assessment = Ember.Object.create({
    resources: [selectedQuestion]
  });

  var students = Ember.A([
    Ember.Object.create({ id: '56983a9060a68052c1ed934c', fullName: 'Test' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388', fullName: 'Test' }),
    Ember.Object.create({ id: '56983a906596902edadedc7c', fullName: 'Test' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: assessment.get('resources')
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '56983a9060a68052c1ed934c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 1
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 5,
          timeSpent: 1216,
          userAnswer: 2
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        })
      ])
    })
  ]);

  this.set('selectedQuestion', selectedQuestion);
  this.set('students', students);
  this.set('reportData', reportData);

  this.render(hbs`{{reports/class-assessment/gru-question-performance
          reportData=reportData
          students=students
          question=selectedQuestion }}`);

  const $component = this.$();
  const $chart = $component.find('.chart');
  T.exists(assert, $chart, 'Missing chart');
  T.exists(assert, $chart.find('.gru-x-bar-chart'), 'Missing gru-x-bar-chart');

  T.exists(
    assert,
    $component.find('.overall-completion'),
    'Missing overal-performance'
  );
  assert.equal(
    T.text($component.find('.overall-completion')),
    '3/3',
    'Wrong completion text'
  );

  T.exists(
    assert,
    $component.find('.panel'),
    'Missing panels, answers were given'
  );
  T.exists(
    assert,
    $component.find('.panel .panel-heading'),
    'Missing panel headers, answers were given'
  );
  T.exists(
    assert,
    $component.find('.panel .panel-heading .percentage'),
    'Missing percentage'
  );

  T.exists(
    assert,
    $component.find('.panel .answers-wrapper .answer'),
    'Missing answers, answers were given'
  );
  T.exists(
    assert,
    $component.find('.panel .answers-wrapper .students'),
    'Missing students, answers were given'
  );
  T.exists(
    assert,
    $component.find('.panel .answers-wrapper .students .label'),
    'Missing students names'
  );
});

test('Anonymous, layout', function(assert) {
  const selectedQuestion = Ember.Object.create({
    //Multiple Choice
    id: '56a120483b6e7b090501d3e7',
    questionType: 'MC',
    text: 'Sample Question MC',
    answers: Ember.A([
      Ember.Object.create({ id: 1, isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: 2, isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: 3, isCorrect: true, text: 'Answer 3' })
    ]),
    order: 1,
    resourceFormat: 'question',
    narration:
      'Id eu mollit sunt Lorem voluptate ut officia ut. Non non nulla exercitation eu duis laboris Lorem id deserunt ullamco laborum aliqua nostrud. Dolor consequat dolor consequat labore officia cillum ad nulla proident. Veniam consequat sint Lorem nulla reprehenderit occaecat dolore excepteur eiusmod.',
    hints: [
      {
        hintId: '98cdadb3-5ef4-4fad-92c5-3c09403ce5e6',
        hintText:
          '<p>Deserunt voluptate labore est sit nostrud ex et quis aliqua veniam deserunt ullamco.</p>',
        sequence: 1
      },
      {
        hintId: '21e07610-a788-4549-a57c-b79ab32b8909',
        hintText: '<p>Pariatur est excepteur est cupidatat.</p>',
        sequence: 2
      }
    ],
    explanation:
      '<p>Culpa laborum deserunt cillum sunt laboris voluptate ut ea elit ex adipisicing officia. Ad laboris tempor officia non ut sit consequat quis esse et cupidatat officia.</p>',
    hasAnswers: true,
    hasNarration: true
  });

  var assessment = Ember.Object.create({
    resources: [selectedQuestion]
  });

  var students = Ember.A([
    Ember.Object.create({ id: '56983a9060a68052c1ed934c', fullName: 'Test' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388', fullName: 'Test' }),
    Ember.Object.create({ id: '56983a906596902edadedc7c', fullName: 'Test' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: assessment.get('resources')
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '56983a9060a68052c1ed934c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 1
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 5,
          timeSpent: 1216,
          userAnswer: 2
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        })
      ])
    })
  ]);

  this.set('selectedQuestion', selectedQuestion);
  this.set('students', students);
  this.set('reportData', reportData);

  this.render(hbs`{{reports/class-assessment/gru-question-performance
          reportData=reportData
          students=students
          anonymous=true
          showResult=false
          question=selectedQuestion }}`);

  const $component = this.$();
  const $chart = $component.find('.chart');
  T.exists(
    assert,
    $chart,
    'Chart information should visible on anonymous but blue'
  );

  T.exists(
    assert,
    $component.find('.panel'),
    'Missing panels, answers were given'
  );
  T.exists(
    assert,
    $component.find('.panel .panel-heading-anonymous'),
    'Missing anonymous panel headers, answers were given'
  );
  T.notExists(
    assert,
    $component.find('.panel .panel-heading .percentage'),
    'Percentage should be hidden in anonymous'
  );

  T.exists(
    assert,
    $component.find('.panel .answers-wrapper .answer'),
    'Missing answers, answers were given'
  );
  T.notExists(
    assert,
    $component.find('.panel .answers-wrapper .students'),
    'Students should be hidden in anonymous'
  );
});

test('Anonymous and Show Results', function(assert) {
  const selectedQuestion = Ember.Object.create({
    //Multiple Choice
    id: '56a120483b6e7b090501d3e7',
    questionType: 'MC',
    text: 'Sample Question MC',
    answers: Ember.A([
      Ember.Object.create({ id: 1, isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: 2, isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: 3, isCorrect: true, text: 'Answer 3' })
    ]),
    order: 1,
    resourceFormat: 'question',
    narration:
      'Id eu mollit sunt Lorem voluptate ut officia ut. Non non nulla exercitation eu duis laboris Lorem id deserunt ullamco laborum aliqua nostrud. Dolor consequat dolor consequat labore officia cillum ad nulla proident. Veniam consequat sint Lorem nulla reprehenderit occaecat dolore excepteur eiusmod.',
    hints: [
      {
        hintId: '98cdadb3-5ef4-4fad-92c5-3c09403ce5e6',
        hintText:
          '<p>Deserunt voluptate labore est sit nostrud ex et quis aliqua veniam deserunt ullamco.</p>',
        sequence: 1
      },
      {
        hintId: '21e07610-a788-4549-a57c-b79ab32b8909',
        hintText: '<p>Pariatur est excepteur est cupidatat.</p>',
        sequence: 2
      }
    ],
    explanation:
      '<p>Culpa laborum deserunt cillum sunt laboris voluptate ut ea elit ex adipisicing officia. Ad laboris tempor officia non ut sit consequat quis esse et cupidatat officia.</p>',
    hasAnswers: true,
    hasNarration: true
  });

  var assessment = Ember.Object.create({
    resources: [selectedQuestion]
  });

  var students = Ember.A([
    Ember.Object.create({ id: '56983a9060a68052c1ed934c', fullName: 'Test' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388', fullName: 'Test' }),
    Ember.Object.create({ id: '56983a906596902edadedc7c', fullName: 'Test' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: assessment.get('resources')
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '56983a9060a68052c1ed934c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 1
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 5,
          timeSpent: 1216,
          userAnswer: 2
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        })
      ])
    })
  ]);

  var showResult = true;
  this.set('showResult', showResult);
  this.set('selectedQuestion', selectedQuestion);
  this.set('students', students);
  this.set('reportData', reportData);

  this.render(hbs`{{reports/class-assessment/gru-question-performance
          reportData=reportData
          students=students
          anonymous=true
          showResult=showResult
          question=selectedQuestion }}`);

  const $component = this.$();
  const $chart = $component.find('.chart');
  T.exists(
    assert,
    $chart,
    'Chart information should be visible on anonymous and show result'
  );

  T.exists(
    assert,
    $component.find('.panel'),
    'Missing panels, answers were given'
  );
  T.exists(
    assert,
    $component.find('.panel .panel-heading'),
    'Missing panel headers, answers were given'
  );
  T.notExists(
    assert,
    $component.find('.panel .panel-heading .percentage'),
    'Percentage should be hidden in anonymous'
  );

  T.exists(
    assert,
    $component.find('.panel .answers-wrapper .answer'),
    'Missing answers, answers were given'
  );
  T.exists(
    assert,
    $component.find('.panel .answers-wrapper .answer-percentage'),
    'Missing percentage section'
  );
  T.exists(
    assert,
    $component.find('.panel .answers-wrapper .answer-chart'),
    'Missing percentage chart'
  );
  T.notExists(
    assert,
    $component.find('.panel .answers-wrapper .students'),
    'Students should be hidden in anonymous'
  );
});

test('Multiple choice', function(assert) {
  const selectedQuestion = Ember.Object.create({
    //Multiple Choice
    id: '56a120483b6e7b090501d3e7',
    questionType: 'MC',
    text: 'Sample Question MC',
    answers: Ember.A([
      Ember.Object.create({ id: 1, isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: 2, isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: 3, isCorrect: true, text: 'Answer 3' })
    ]),
    order: 1,
    resourceFormat: 'question',
    narration:
      'Id eu mollit sunt Lorem voluptate ut officia ut. Non non nulla exercitation eu duis laboris Lorem id deserunt ullamco laborum aliqua nostrud. Dolor consequat dolor consequat labore officia cillum ad nulla proident. Veniam consequat sint Lorem nulla reprehenderit occaecat dolore excepteur eiusmod.',
    hints: [
      {
        hintId: '98cdadb3-5ef4-4fad-92c5-3c09403ce5e6',
        hintText:
          '<p>Deserunt voluptate labore est sit nostrud ex et quis aliqua veniam deserunt ullamco.</p>',
        sequence: 1
      },
      {
        hintId: '21e07610-a788-4549-a57c-b79ab32b8909',
        hintText: '<p>Pariatur est excepteur est cupidatat.</p>',
        sequence: 2
      }
    ],
    explanation:
      '<p>Culpa laborum deserunt cillum sunt laboris voluptate ut ea elit ex adipisicing officia. Ad laboris tempor officia non ut sit consequat quis esse et cupidatat officia.</p>',
    hasAnswers: true,
    hasNarration: true
  });

  var assessment = Ember.Object.create({
    resources: [selectedQuestion]
  });

  var students = Ember.A([
    Ember.Object.create({ id: '56983a9060a68052c1ed934c', fullName: 'Test' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388', fullName: 'Test' }),
    Ember.Object.create({ id: '56983a906596902edadedc7c', fullName: 'Test' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: assessment.get('resources')
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '56983a9060a68052c1ed934c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 1
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 5,
          timeSpent: 1216,
          userAnswer: 2
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        })
      ])
    })
  ]);

  this.set('selectedQuestion', selectedQuestion);
  this.set('students', students);
  this.set('reportData', reportData);

  this.render(hbs`{{reports/class-assessment/gru-question-performance
          reportData=reportData
          students=students
          question=selectedQuestion }}`);

  const $component = this.$();
  const $chart = $component.find('.chart');
  T.exists(assert, $chart, 'Missing chart');
  T.exists(assert, $chart.find('.gru-x-bar-chart'), 'Missing gru-x-bar-chart');

  T.exists(
    assert,
    $component.find('.overall-completion'),
    'Missing overal-performance'
  );
  assert.equal(
    T.text($component.find('.overall-completion')),
    '3/3',
    'Wrong completion text'
  );

  assert.equal(
    $component.find('.panel').length,
    3,
    'Missing panels, 3 answers were given'
  );
  assert.equal(
    $component.find('.panel .panel-heading').length,
    3,
    'Missing panel headers, 3 answers were given'
  );

  assert.equal(
    $component.find('.panel.panel-success').length,
    1,
    'Missing correct panels, 1 correct answers were given'
  );
  assert.equal(
    $component.find('.panel.panel-danger').length,
    2,
    'Missing incorrect panels, 2 incorrect answers were given'
  );

  assert.equal(
    $component.find('.panel .answers-wrapper .answer').length,
    3,
    'Missing answers, 3 answers were given'
  );
  assert.equal(
    $component.find('.panel .answers-wrapper .students').length,
    3,
    'Missing students, 3 answers were given'
  );

  assert.equal(
    $component.find('.panel .answers-wrapper .answer .gru-multiple-choice')
      .length,
    3,
    'Missing question type components, 3 answers were given'
  );
});
test('Anonymous and Show Results', function(assert) {
  const selectedQuestion = Ember.Object.create({
    //Multiple Choice
    id: '56a120483b6e7b090501d3e7',
    questionType: 'MC',
    text: 'Sample Question MC',
    answers: Ember.A([
      Ember.Object.create({ id: 1, isCorrect: false, text: 'Answer 1' }),
      Ember.Object.create({ id: 2, isCorrect: false, text: 'Answer 2' }),
      Ember.Object.create({ id: 3, isCorrect: true, text: 'Answer 3' })
    ]),
    order: 1,
    resourceFormat: 'question',
    narration:
      'Id eu mollit sunt Lorem voluptate ut officia ut. Non non nulla exercitation eu duis laboris Lorem id deserunt ullamco laborum aliqua nostrud. Dolor consequat dolor consequat labore officia cillum ad nulla proident. Veniam consequat sint Lorem nulla reprehenderit occaecat dolore excepteur eiusmod.',
    hints: [
      {
        hintId: '98cdadb3-5ef4-4fad-92c5-3c09403ce5e6',
        hintText:
          '<p>Deserunt voluptate labore est sit nostrud ex et quis aliqua veniam deserunt ullamco.</p>',
        sequence: 1
      },
      {
        hintId: '21e07610-a788-4549-a57c-b79ab32b8909',
        hintText: '<p>Pariatur est excepteur est cupidatat.</p>',
        sequence: 2
      }
    ],
    explanation:
      '<p>Culpa laborum deserunt cillum sunt laboris voluptate ut ea elit ex adipisicing officia. Ad laboris tempor officia non ut sit consequat quis esse et cupidatat officia.</p>',
    hasAnswers: true,
    hasNarration: true
  });

  var assessment = Ember.Object.create({
    resources: [selectedQuestion]
  });

  var students = Ember.A([
    Ember.Object.create({ id: '56983a9060a68052c1ed934c' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388' }),
    Ember.Object.create({ id: '56983a906596902edadedc7c' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: assessment.get('resources')
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '56983a9060a68052c1ed934c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 1
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 5,
          timeSpent: 1216,
          userAnswer: 2
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        })
      ])
    })
  ]);

  var showResult = true;
  this.set('showResult', showResult);
  this.set('selectedQuestion', selectedQuestion);
  this.set('students', students);
  this.set('reportData', reportData);

  this.render(hbs`{{reports/class-assessment/gru-question-performance
          reportData=reportData
          students=students
          anonymous=true
          showResult=showResult
          question=selectedQuestion }}`);

  const $component = this.$();
  const $chart = $component.find('.chart');
  T.exists(
    assert,
    $chart,
    'Chart information should be visible on anonymous and show result'
  );
  T.exists(
    assert,
    $component.find('.panel'),
    'Missing panels, answers were given'
  );
  T.exists(
    assert,
    $component.find('.panel .panel-heading'),
    'Missing panel headers, answers were given'
  );
  T.notExists(
    assert,
    $component.find('.panel .panel-heading .percentage'),
    'Percentage should be hidden in anonymous'
  );
  T.exists(
    assert,
    $component.find('.panel .answers-wrapper .answer'),
    'Missing answers, answers were given'
  );
  T.exists(
    assert,
    $component.find('.panel .answers-wrapper .answer-percentage'),
    'Missing percentage section'
  );
  T.exists(
    assert,
    $component.find('.panel .answers-wrapper .answer-chart'),
    'Missing percentage chart'
  );
  T.notExists(
    assert,
    $component.find('.panel .answers-wrapper .students'),
    'Students should be hidden in anonymous'
  );
});
