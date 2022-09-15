import Ember from 'ember';
import AssessmentResult from 'gooru-web/models/result/assessment';
import QuestionResult from 'gooru-web/models/result/question';
import ResourceResult from 'gooru-web/models/result/resource';
import { module, test } from 'qunit';

module('Unit | Model | result/assessment');

test('questionResults', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create(),
      ResourceResult.create(),
      QuestionResult.create()
    ])
  });

  assert.equal(
    assessmentResult.get('questionResults').get('length'),
    1,
    'Wrong question results'
  );
});

test('nonOpenEndedQuestionResults', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create(),
      QuestionResult.create({
        question: {
          isOpenEnded: true
        }
      }),
      QuestionResult.create({
        question: {
          isOpenEnded: false
        }
      }),
      QuestionResult.create({
        question: {
          isOpenEnded: false
        }
      })
    ])
  });

  assert.equal(
    assessmentResult.get('nonOpenEndedQuestionResults').get('length'),
    2,
    'Wrong non open ended question results'
  );
});

test('openEndedQuestionResults', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create(),
      QuestionResult.create({
        question: {
          isOpenEnded: true
        }
      }),
      QuestionResult.create({
        question: {
          isOpenEnded: true
        }
      }),
      QuestionResult.create({
        question: {
          isOpenEnded: false
        }
      })
    ])
  });

  assert.equal(
    assessmentResult.get('openEndedQuestionResults').get('length'),
    2,
    'Wrong open ended question results'
  );
});

test('totalResources', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([1, 2])
  });

  assert.equal(
    assessmentResult.get('totalResources'),
    2,
    'Wrong total resources'
  );
});

test('totalNonOpenEndedQuestions', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create({ reaction: 5 }),
      QuestionResult.create({
        question: Ember.Object.create({ isOpenEnded: false })
      }),
      QuestionResult.create({
        question: Ember.Object.create({ isOpenEnded: true })
      }),
      QuestionResult.create({
        question: Ember.Object.create({ isOpenEnded: true })
      })
    ])
  });

  assert.equal(
    assessmentResult.get('totalNonOpenEndedQuestions'),
    1,
    'Should have 1 non open ended question'
  );
});

test('hasNonOpenEndedQuestions, true', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create({ reaction: 5 }),
      QuestionResult.create({
        question: Ember.Object.create({ isOpenEnded: false })
      }),
      QuestionResult.create({
        question: Ember.Object.create({ isOpenEnded: true })
      }),
      QuestionResult.create({
        question: Ember.Object.create({ isOpenEnded: true })
      })
    ])
  });

  assert.ok(
    assessmentResult.get('hasNonOpenEndedQuestions'),
    'Should have non open ended questions'
  );
});

test('hasNonOpenEndedQuestions, false', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create({ reaction: 5 }),
      QuestionResult.create({
        question: Ember.Object.create({ isOpenEnded: true })
      }),
      QuestionResult.create({
        question: Ember.Object.create({ isOpenEnded: true })
      })
    ])
  });

  assert.ok(
    !assessmentResult.get('hasNonOpenEndedQuestions'),
    'Should not have other than open ended questions'
  );
});

test('averageReaction', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create({ reaction: 5 }),
      ResourceResult.create({ reaction: 2 }),
      QuestionResult.create({ reaction: 2 })
    ])
  });

  assert.equal(
    assessmentResult.get('averageReaction'),
    3,
    'Wrong average reaction'
  );
});

test('correctPercentage', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create(),
      QuestionResult.create({ correct: false }),
      QuestionResult.create({ correct: true })
    ])
  });

  assert.equal(
    assessmentResult.get('correctPercentage'),
    50,
    'Wrong correctPercentage'
  );
});

test('correctPercentage for real time', function(assert) {
  let assessmentResult = AssessmentResult.create({
    isRealTime: true,
    resourceResults: Ember.A([
      QuestionResult.create({ correct: false }),
      QuestionResult.create({ correct: false }),
      QuestionResult.create({ correct: true }),
      QuestionResult.create({}) //pending
    ])
  });

  assert.equal(
    assessmentResult.get('correctPercentage'),
    33,
    'Wrong correctPercentage'
  );
});

test('correctPercentage with score property', function(assert) {
  let assessmentResult = AssessmentResult.create({
    score: 51,
    resourceResults: Ember.A([
      ResourceResult.create(),
      QuestionResult.create({ correct: false }),
      QuestionResult.create({ correct: true })
    ])
  });

  assert.equal(
    assessmentResult.get('correctPercentage'),
    51,
    'Wrong correctPercentage'
  );
});

test('correctPercentage with open ended', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create(),
      QuestionResult.create({ correct: false }),
      QuestionResult.create({ correct: false }),
      QuestionResult.create({ correct: false }),
      QuestionResult.create({ correct: true }),
      QuestionResult.create({ correct: true, question: { isOpenEnded: true } })
    ])
  });

  assert.equal(
    assessmentResult.get('correctPercentage'),
    25,
    'Wrong correctPercentage'
  );
});

test('totalTimeSpent', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create({ timeSpent: 5 }),
      QuestionResult.create({ timeSpent: 10 }),
      QuestionResult.create({ timeSpent: 20 })
    ])
  });

  assert.equal(
    assessmentResult.get('totalTimeSpent'),
    35,
    'Wrong total time spent'
  );
});

test('totalTimeSpent with time spent property', function(assert) {
  let assessmentResult = AssessmentResult.create({
    timeSpent: 40,
    resourceResults: Ember.A([
      ResourceResult.create({ timeSpent: 5 }),
      QuestionResult.create({ timeSpent: 10 }),
      QuestionResult.create({ timeSpent: 20 })
    ])
  });

  assert.equal(
    assessmentResult.get('totalTimeSpent'),
    40,
    'Wrong total time spent'
  );
});

test('correctAnswers', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create(),
      QuestionResult.create({ correct: false }),
      QuestionResult.create({ correct: true })
    ])
  });

  assert.equal(
    assessmentResult.get('correctAnswers'),
    1,
    'Wrong correctAnswers'
  );
});

test('correctAnswers including open ended', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create(),
      QuestionResult.create({ correct: false }),
      QuestionResult.create({ correct: true }),
      QuestionResult.create({ correct: true, question: { isOpenEnded: true } })
    ])
  });

  assert.equal(
    assessmentResult.get('correctAnswers'),
    1,
    'Wrong correctAnswers'
  );
});

test('started', function(assert) {
  let assessmentResult = AssessmentResult.create({
    startedAt: new Date()
  });

  assert.ok(
    assessmentResult.get('started'),
    'Assessment result should be started'
  );

  //when started at is not available
  assessmentResult.set('startedAt', null);
  assert.ok(
    !assessmentResult.get('started'),
    'Assessment result should not be started'
  );
});

/*
test('submitted', function(assert) {
  let assessmentResult = AssessmentResult.create({
    "submittedAt": new Date()
  });

  assert.ok(assessmentResult.get("submitted"), "Assessment result should be submitted");

  //when submitted at is not available
  assessmentResult.set("submittedAt", null);
  assert.ok(!assessmentResult.get("submitted"), "Assessment result should not be submitted");
});
*/

test('getResultByResourceId', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      ResourceResult.create({ resourceId: 1 }),
      QuestionResult.create({ resourceId: 2 }),
      QuestionResult.create({ resourceId: 3 })
    ])
  });

  assert.equal(
    assessmentResult.getResultByResourceId(1).get('resourceId'),
    1,
    'Wrong result'
  );
});

test('pendingQuestionResults', function(assert) {
  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      QuestionResult.create(), //not pending
      QuestionResult.create({
        //not pending
        startedAt: new Date(),
        submittedAt: new Date()
      }),
      QuestionResult.create({
        //pending
        startedAt: new Date()
      }),
      ResourceResult.create({
        //pending but ignored since these method returns only question results
        startedAt: new Date()
      })
    ])
  });

  assert.equal(
    assessmentResult.get('pendingQuestionResults').get('length'),
    1,
    'Wrong pending results'
  );
});

test('merge with no results', function(assert) {
  let collection = Ember.Object.create({
    resources: Ember.A([
      Ember.Object.create({
        id: '1',
        isQuestion: false
      }),
      Ember.Object.create({
        id: '2',
        isQuestion: true
      })
    ])
  });

  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([]) //no results
  });

  assessmentResult.merge(collection);
  let resourceResults = assessmentResult.get('resourceResults');

  assert.ok(resourceResults.findBy('resource.id', '1'), 'Resource 1 not found');
  assert.ok(resourceResults.findBy('resource.id', '2'), 'Resource 2 not found');
});

test('merge with results', function(assert) {
  let collection = Ember.Object.create({
    resources: Ember.A([
      Ember.Object.create({
        id: '1',
        isQuestion: false
      }),
      Ember.Object.create({
        id: '2',
        isQuestion: true
      })
    ])
  });

  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      Ember.Object.create({
        resourceId: '1'
      })
    ])
  });

  assessmentResult.merge(collection);
  let resourceResults = assessmentResult.get('resourceResults');

  assert.ok(resourceResults.findBy('resource.id', '1'), 'Resource 1 not found');
  assert.ok(resourceResults.findBy('resource.id', '2'), 'Resource 2 not found');
});

test('merge with an extra assessmentResult', function(assert) {
  let collection = Ember.Object.create({
    resources: Ember.A([
      Ember.Object.create({
        id: '1',
        isQuestion: false
      }),
      Ember.Object.create({
        id: '2',
        isQuestion: true
      })
    ])
  });

  let assessmentResult = AssessmentResult.create({
    resourceResults: Ember.A([
      Ember.Object.create({
        resourceId: '1'
      }),
      Ember.Object.create({
        resourceId: '2'
      }),
      Ember.Object.create({
        resourceId: '3'
      })
    ])
  });

  assessmentResult.merge(collection);
  let resourceResults = assessmentResult.get('resourceResults');

  assert.ok(resourceResults.findBy('resource.id', '1'), 'Resource 1 not found');
  assert.ok(resourceResults.findBy('resource.id', '2'), 'Resource 2 not found');
  assert.ok(
    !resourceResults.findBy('resource.id', '3'),
    'Resource 3 should not be found'
  );
});
