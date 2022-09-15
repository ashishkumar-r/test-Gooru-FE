import Ember from 'ember';
import QuestionResult from 'gooru-web/models/result/question';
import UserResourcesResult from 'gooru-web/models/result/user-resources';
import ReportData from 'gooru-web/models/result/report-data';
import { module, test } from 'qunit';

module('Unit | Model | result/report data');

test('merge', function(assert) {
  var resources = Ember.A([
    Ember.Object.create({ id: 'A' }),
    Ember.Object.create({ id: 'B' })
  ]);

  var students = Ember.A([
    Ember.Object.create({ id: '1' }),
    Ember.Object.create({ id: '2' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: resources
  });

  var QR1 = QuestionResult.create({
    resourceId: 'A',
    correct: false,
    timeSpent: 10
  });
  var QR2 = QuestionResult.create({
    resourceId: 'B',
    correct: false,
    timeSpent: 10
  });
  var QR3 = QuestionResult.create({
    resourceId: 'A',
    correct: true,
    timeSpent: 20
  });
  var QR4 = QuestionResult.create({
    resourceId: 'B',
    correct: true,
    timeSpent: 20
  });
  var QR5 = QuestionResult.create({
    resourceId: 'A',
    correct: true,
    timeSpent: 10
  });
  var QR6 = QuestionResult.create({
    resourceId: 'C',
    correct: true,
    timeSpent: 10
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '1',
      resourceResults: Ember.A([QR1, QR2])
    }),
    UserResourcesResult.create({
      user: '5',
      resourceResults: Ember.A([QR1, QR2])
    })
  ]);

  assert.equal(
    reportData.data['1'].A,
    QR1,
    'row 1 | column 1: -override default object'
  );
  assert.equal(
    reportData.data['1'].B,
    QR2,
    'row 1 | column 2: -override default object'
  );
  assert.deepEqual(
    reportData.data['2'].A.get('resourceId'),
    'A',
    'row 2 | column 1: - wrong id for default object'
  );
  assert.deepEqual(
    reportData.data['2'].B.get('resourceId'),
    'B',
    'row 2 | column 2: - wrong id for default object'
  );
  assert.notOk(reportData.data['5'], 'row 5 should not exist');

  //checking time spent
  assert.equal(
    reportData.data['1'].A.get('timeSpent'),
    10,
    'row 1 | column 1: - wrong time spent'
  );
  assert.equal(
    reportData.data['1'].B.get('timeSpent'),
    10,
    'row 1 | column 2: - wrong time spent'
  );

  reportData.merge([
    UserResourcesResult.create({
      user: '1',
      resourceResults: Ember.A([QR3, QR4])
    }),
    UserResourcesResult.create({
      user: '2',
      resourceResults: Ember.A([QR5, QR6])
    })
  ]);

  assert.equal(
    reportData.data['1'].A,
    QR3,
    'row 1 | column 1: -override with new object'
  );
  assert.equal(
    reportData.data['1'].B,
    QR4,
    'row 1 | column 2: -override with new object'
  );
  assert.equal(
    reportData.data['2'].A,
    QR5,
    'row 2 | column 1: -override default object'
  );
  assert.notOk(reportData.data['2'].C, 'row 2 | column 3 should not exist');

  //checking time spent
  assert.equal(
    reportData.data['1'].A.get('timeSpent'),
    30,
    'row 1 | column 1: - wrong time spent'
  );
  assert.equal(
    reportData.data['1'].B.get('timeSpent'),
    30,
    'row 1 | column 2: - wrong time spent'
  );
});

test('getEmptyMatrix', function(assert) {
  var resources = Ember.A([
    Ember.Object.create({ id: 'A' }),
    Ember.Object.create({ id: 'B' })
  ]);

  var students = Ember.A([
    Ember.Object.create({ id: '1' }),
    Ember.Object.create({ id: '2' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: resources
  });

  assert.deepEqual(
    reportData.data['1'].A.get('resourceId'),
    'A',
    'row 1 | column 1: - wrong id for default object'
  );
  assert.deepEqual(
    reportData.data['1'].B.get('resourceId'),
    'B',
    'row 1 | column 2: - wrong id for default object'
  );
  assert.deepEqual(
    reportData.data['2'].A.get('resourceId'),
    'A',
    'row 2 | column 1: - wrong id for default object'
  );
  assert.deepEqual(
    reportData.data['2'].B.get('resourceId'),
    'B',
    'row 2 | column 2: - wrong id for default object'
  );
});

test('getEmptyRow', function(assert) {
  var resources = Ember.A([
    Ember.Object.create({ id: 'A' }),
    Ember.Object.create({ id: 'B' })
  ]);

  var students = Ember.A([Ember.Object.create({ id: '1' })]);

  var reportData = ReportData.create({
    students: students,
    resources: resources
  });

  var QR1 = QuestionResult.create({
    resourceId: 'A',
    correct: false,
    timeSpent: 10
  });
  var QR2 = QuestionResult.create({
    resourceId: 'B',
    correct: false,
    timeSpent: 10
  });

  reportData.merge([
    UserResourcesResult.create({
      user: '1',
      resourceResults: Ember.A([QR1, QR2])
    })
  ]);

  assert.equal(
    reportData.data['1'].A,
    QR1,
    'row 1 | column 1: -override default object'
  );
  assert.equal(
    reportData.data['1'].B,
    QR2,
    'row 1 | column 2: -override default object'
  );

  reportData.data['1'] = reportData.getEmptyRow(['A', 'B']);

  assert.deepEqual(
    reportData.data['1'].A.get('resourceId'),
    'A',
    'row 1 | column 1: - wrong id for default object'
  );
  assert.deepEqual(
    reportData.data['1'].B.get('resourceId'),
    'B',
    'row 1 | column 2: - wrong id for default object'
  );
});

test('autoCompleteRow', function(assert) {
  var resources = Ember.A([
    Ember.Object.create({ id: 'A' }),
    Ember.Object.create({ id: 'B' }),
    Ember.Object.create({ id: 'C' })
  ]);

  var students = Ember.A([Ember.Object.create({ id: '1' })]);

  var reportData = ReportData.create({
    students: students,
    resources: resources
  });

  var QR = QuestionResult.create({ resourceId: 'C', correct: true });

  reportData.merge([
    UserResourcesResult.create({
      user: '1',
      resourceResults: Ember.A([QR])
    })
  ]);

  assert.equal(
    reportData.data['1'].A.get('correct'),
    null,
    'row 1 | column 1: -correct not set'
  );
  assert.equal(
    reportData.data['1'].B.get('correct'),
    null,
    'row 1 | column 2: -correct not set'
  );
  assert.equal(
    reportData.data['1'].C.get('correct'),
    true,
    'row 1 | column 3: -correct set'
  );

  reportData.autoCompleteRow(reportData.data['1'], ['A', 'B']);

  assert.equal(
    reportData.data['1'].A.get('correct'),
    false,
    'row 1 | column 1: -correct value auto-completed'
  );
  assert.equal(
    reportData.data['1'].B.get('correct'),
    false,
    'row 1 | column 2: -correct value auto-completed'
  );
  assert.equal(
    reportData.data['1'].C.get('correct'),
    true,
    'row 1 | column 3: -correct value not changed'
  );
});

test('getAllResults', function(assert) {
  var resources = Ember.A([
    Ember.Object.create({ id: '56a120483b6e7b090501d3e7' }),
    Ember.Object.create({ id: '56a120483b6e7b090501d3e8' }),
    Ember.Object.create({ id: '56a120483b6e7b090501d3e9' })
  ]);

  var students = Ember.A([
    Ember.Object.create({ id: '56983a9060a68052c1ed934c' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388' }),
    Ember.Object.create({ id: '56983a906596902edadedc7c' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: resources
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
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e8',
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
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e8',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e9',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        })
      ])
    })
  ]);

  let results = reportData.getAllResults();
  assert.equal(
    results.get('length'),
    9,
    'Should be 9, 3 resources x 3 students'
  );
});

test('getResultsByStudent', function(assert) {
  var resources = Ember.A([
    Ember.Object.create({ id: '56a120483b6e7b090501d3e7' }),
    Ember.Object.create({ id: '56a120483b6e7b090501d3e8' }),
    Ember.Object.create({ id: '56a120483b6e7b090501d3e9' })
  ]);

  var students = Ember.A([
    Ember.Object.create({ id: '56983a9060a68052c1ed934c' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388' }),
    Ember.Object.create({ id: '56983a906596902edadedc7c' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: resources
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
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e8',
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
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e8',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e9',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        })
      ])
    })
  ]);

  let results = reportData.getResultsByStudent('56983a906596902edadedc7c');
  assert.equal(
    results.get('length'),
    3,
    'Should be 3, 3 were resources provided'
  );
});

test('getResultsByQuestion', function(assert) {
  var resources = Ember.A([
    Ember.Object.create({ id: '56a120483b6e7b090501d3e7' }),
    Ember.Object.create({ id: '56a120483b6e7b090501d3e8' }),
    Ember.Object.create({ id: '56a120483b6e7b090501d3e9' })
  ]);

  var students = Ember.A([
    Ember.Object.create({ id: '56983a9060a68052c1ed934c' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: resources
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
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e8',
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
    })
  ]);

  let results = reportData.getResultsByQuestion('56a120483b6e7b090501d3e7');
  assert.equal(
    results.get('length'),
    2,
    'Should be 2, 2 were students provided'
  );
});

test('getStudentsByQuestionAndUserAnswer', function(assert) {
  const questionA = Ember.Object.create({
    id: '56a120483b6e7b090501d3e7',
    questionType: 'MC'
  });
  const questionB = Ember.Object.create({
    id: '56a120483b6e7b090501d3e8',
    questionType: 'MC'
  });
  const questionC = Ember.Object.create({
    id: '56a120483b6e7b090501d3e9',
    questionType: 'MC'
  });

  var resources = Ember.A([questionA, questionB, questionC]);

  var students = Ember.A([
    Ember.Object.create({ id: '56983a9060a68052c1ed934c' }),
    Ember.Object.create({ id: '56983a90fb01fecc328e2388' }),
    Ember.Object.create({ id: '56983a906596902edadedc7c' })
  ]);

  var reportData = ReportData.create({
    students: students,
    resources: resources
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
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e8',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 1
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e9',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        })
      ])
    }),
    UserResourcesResult.create({
      user: '56983a90fb01fecc328e2388',
      resourceResults: Ember.A([
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e7',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 1
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e8',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 2
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e9',
          correct: false,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
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
          userAnswer: 2
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e8',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        }),
        QuestionResult.create({
          resourceId: '56a120483b6e7b090501d3e9',
          correct: true,
          reaction: 1,
          timeSpent: 1216,
          userAnswer: 3
        })
      ])
    })
  ]);

  var results = reportData.getStudentsByQuestionAndUserAnswer(questionA, 1);
  var ids = results
    .map(function(student) {
      return student.get('id');
    })
    .toArray();
  assert.equal(results.get('length'), 2, '2 students answered questionA as 1');
  assert.deepEqual(
    ids,
    ['56983a9060a68052c1ed934c', '56983a90fb01fecc328e2388'],
    'Wrong students for questionA answer 1'
  );

  results = reportData.getStudentsByQuestionAndUserAnswer(questionB, 2);
  ids = results
    .map(function(student) {
      return student.get('id');
    })
    .toArray();
  assert.equal(results.get('length'), 1, '1 student answered questionB as 2');
  assert.deepEqual(
    ids,
    ['56983a90fb01fecc328e2388'],
    'Wrong students for questionA answer 1'
  );

  results = reportData.getStudentsByQuestionAndUserAnswer(questionC, 3);
  ids = results
    .map(function(student) {
      return student.get('id');
    })
    .toArray();
  assert.equal(results.get('length'), 3, '3 students answered questionC as 3');
  assert.deepEqual(
    ids,
    [
      '56983a9060a68052c1ed934c',
      '56983a90fb01fecc328e2388',
      '56983a906596902edadedc7c'
    ],
    'Wrong students for questionC answer 3'
  );
});
