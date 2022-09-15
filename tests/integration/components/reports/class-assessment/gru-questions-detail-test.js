import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import QuestionResult from 'gooru-web/models/result/question';
import UserResourcesResult from 'gooru-web/models/result/user-resources';
import ReportData from 'gooru-web/models/result/report-data';
import hbs from 'htmlbars-inline-precompile';
import T from 'gooru-web/tests/helpers/assert';

moduleForComponent(
  'reports/class-assessment/gru-questions-detail',
  'Integration | Component | reports/class assessment/gru questions detail',
  {
    integration: true
  }
);

test('Layout', function(assert) {
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
    resources: [
      selectedQuestion,
      Ember.Object.create({
        //Multiple Choice
        id: '56a1204886b2e565e1b2c230',
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
      }),
      Ember.Object.create({
        //true false
        id: '56a12048ddee2022a741356a',
        questionType: 'T/F',
        text: 'True False Question',
        hints: [],
        explanation: 'Sample explanation text',
        answers: Ember.A([
          Ember.Object.create({ id: '1', isCorrect: true, text: 'True' }),
          Ember.Object.create({ id: '2', isCorrect: false, text: 'False' })
        ]),
        resourceType: 'assessment-question',
        resourceFormat: 'question',
        order: 3, //not consecutive
        hasAnswers: true
      })
    ]
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
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    })
  ]);

  var model = Ember.Object.create({
    selectedQuestion: selectedQuestion,
    assessment: assessment,
    students: students,
    reportData: reportData
  });

  this.set('model', model);

  this.render(
    hbs`{{reports/class-assessment/gru-questions-detail model=model }}`
  );

  const $component = this.$();
  const $navigation = $component.find('.navigation');
  T.exists(assert, $navigation, 'Missing navigation');
  T.exists(
    assert,
    $navigation.find('.gru-bubbles'),
    'Missing navigation bubbles'
  );
  assert.equal(
    $navigation.find('.gru-bubbles .bubble').length,
    3,
    'Wrong number of questions'
  );
  assert.equal(
    $navigation.find('.gru-bubbles .bubble:eq(1)').text(),
    '2',
    'Wrong question number for second question'
  );

  assert.ok(
    $navigation.find('.gru-bubbles .bubble:eq(0)').hasClass('selected'),
    'First question should be selected'
  );

  T.exists(
    assert,
    $component.find('.body .question-info'),
    'Missing question information panel'
  );
  T.exists(
    assert,
    $component.find('.body .question-info .gru-question-information'),
    'Missing question information component'
  );
  T.exists(
    assert,
    $component.find('.body .question-metrics'),
    'Missing question metrics panel'
  );
  T.exists(
    assert,
    $component.find('.body .question-metrics .gru-question-performance'),
    'Missing question performance component'
  );
});

test('Layout Anonymous', function(assert) {
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
    resources: [
      selectedQuestion,
      Ember.Object.create({
        //Multiple Choice
        id: '56a1204886b2e565e1b2c230',
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
      }),
      Ember.Object.create({
        //true false
        id: '56a12048ddee2022a741356a',
        questionType: 'T/F',
        text: 'True False Question',
        hints: [],
        explanation: 'Sample explanation text',
        answers: Ember.A([
          Ember.Object.create({ id: '1', isCorrect: true, text: 'True' }),
          Ember.Object.create({ id: '2', isCorrect: false, text: 'False' })
        ]),
        resourceType: 'assessment-question',
        resourceFormat: 'question',
        order: 2,
        hasAnswers: true
      })
    ]
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
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    })
  ]);

  var model = Ember.Object.create({
    selectedQuestion: selectedQuestion,
    assessment: assessment,
    students: students,
    reportData: reportData,
    anonymous: true
  });

  this.set('model', model);

  this.render(
    hbs`{{reports/class-assessment/gru-questions-detail model=model}}`
  );

  const $component = this.$();
  const $navigation = $component.find('.navigation');
  T.exists(
    assert,
    $navigation.find('.btn-results'),
    'Missing Show Results Button'
  );
});
test('Layout Anonymous and Show Results', function(assert) {
  const selectedQuestion = Ember.Object.create({
    //Multiple Choice
    id: '56a120483b6e7b090501d3e7',
    questionType: 'MC',
    text: 'Sample Question MC',
    answers: Ember.A([
      Ember.Object.create({ id: 1, isCorrect: false, text: 'Answer 1' })
    ]),
    order: 1,
    resourceFormat: 'question',
    narration:
      'Id eu mollit sunt Lorem voluptate ut officia ut. Non non nulla exercitation eu duis laboris Lorem id deserunt ullamco laborum aliqua nostrud. Dolor consequat dolor consequat labore officia cillum ad nulla proident. Veniam consequat sint Lorem nulla reprehenderit occaecat dolore excepteur eiusmod.',
    hasAnswers: true,
    hasNarration: true
  });

  var assessment = Ember.Object.create({
    resources: [
      selectedQuestion,
      Ember.Object.create({
        //Multiple Choice
        id: '56a1204886b2e565e1b2c230',
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
        hasAnswers: true,
        hasNarration: true
      }),
      Ember.Object.create({
        //true false
        id: '56a12048ddee2022a741356a',
        questionType: 'T/F',
        text: 'True False Question',
        hints: [],
        explanation: 'Sample explanation text',
        answers: Ember.A([
          Ember.Object.create({ id: '1', isCorrect: true, text: 'True' }),
          Ember.Object.create({ id: '2', isCorrect: false, text: 'False' })
        ]),
        resourceType: 'assessment-question',
        resourceFormat: 'question',
        order: 2,
        hasAnswers: true
      })
    ]
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
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a906596902edadedc7c',
      resourceResults: Ember.A([
        QuestionResult.create({ resourceId: '56a120483b6e7b090501d3e7' }),
        QuestionResult.create({ resourceId: '56a1204886b2e565e1b2c230' }),
        QuestionResult.create({ resourceId: '56a12048ddee2022a741356a' })
      ])
    })
  ]);

  var model = Ember.Object.create({
    selectedQuestion: selectedQuestion,
    assessment: assessment,
    students: students,
    reportData: reportData,
    anonymous: true
  });

  var showResult = true;

  this.set('model', model);
  this.set('showResult', showResult);

  this.render(
    hbs`{{reports/class-assessment/gru-questions-detail model=model showResult=showResult}}`
  );

  const $component = this.$();
  const $navigation = $component.find('.navigation');
  assert.equal(
    T.text($navigation.find('.btn-results')),
    'Hide Results',
    'Incorrect button'
  );
});
