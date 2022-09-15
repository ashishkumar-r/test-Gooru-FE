import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import RubricModel from 'gooru-web/models/rubric/rubric';
import RubricGradeModel from 'gooru-web/models/rubric/rubric-grade';

moduleForService(
  'service:api-sdk/rubric',
  'Unit | Service | api-sdk/rubric',
  {}
);

test('createRubric', function(assert) {
  const service = this.subject();
  let rubric = RubricModel.create({
    title: 'any rubric'
  });

  assert.expect(3);

  service.set(
    'serializer',
    Ember.Object.create({
      serializeCreateRubric: function(rubricParam) {
        assert.deepEqual(rubricParam, rubric, 'Wrong rubric parameter');
        return { id: 'fake-id' };
      }
    })
  );

  service.set(
    'adapter',
    Ember.Object.create({
      createRubric: function(data) {
        assert.deepEqual(data, { id: 'fake-id' }, 'Wrong data');
        return Ember.RSVP.resolve(1);
      }
    })
  );

  var done = assert.async();
  service.createRubric(rubric).then(function(rubricId) {
    assert.equal(rubric.get('id'), rubricId, 'Wrong rubric id');
    done();
  });
});

test('updateRubric', function(assert) {
  const service = this.subject();
  let rubric = RubricModel.create({
    id: 123,
    title: 'any rubric'
  });

  assert.expect(4);

  service.set(
    'serializer',
    Ember.Object.create({
      serializeUpdateRubric: function(rubricParam) {
        assert.deepEqual(rubricParam, rubric, 'Wrong rubric parameter');
        return { id: 'fake-id' };
      }
    })
  );

  service.set(
    'adapter',
    Ember.Object.create({
      updateRubric: function(data, rubricId) {
        assert.equal(rubricId, 123, 'Wrong rubric id');
        assert.deepEqual(data, { id: 'fake-id' }, 'Wrong data');
        return Ember.RSVP.resolve(true);
      }
    })
  );

  var done = assert.async();
  service.updateRubric(rubric).then(function(updated) {
    assert.ok(updated, 'Wrong updated');
    done();
  });
});

test('updateScore', function(assert) {
  const service = this.subject();
  let rubricScore = RubricModel.create({
    scoring: true,
    maxScore: 25,
    increment: 1
  });

  assert.expect(4);

  service.set(
    'serializer',
    Ember.Object.create({
      serializeUpdateScore: function(rubricParam) {
        assert.deepEqual(rubricParam, rubricScore, 'Wrong rubric parameter');
        return { id: 'fake-id' };
      }
    })
  );

  service.set(
    'adapter',
    Ember.Object.create({
      updateScore: function(data, questionId) {
        assert.equal(questionId, 123, 'Wrong question id');
        assert.deepEqual(data, { id: 'fake-id' }, 'Wrong data');
        return Ember.RSVP.resolve(true);
      }
    })
  );

  var done = assert.async();
  service.updateScore(rubricScore, 123).then(function(updated) {
    assert.ok(updated, 'Wrong score updated');
    done();
  });
});

test('deleteRubric', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'adapter',
    Ember.Object.create({
      deleteRubric: function(rubricId) {
        assert.deepEqual(rubricId, 123, 'Wrong id');
        return Ember.RSVP.resolve(true);
      }
    })
  );

  var done = assert.async();
  service.deleteRubric(123).then(function(deleted) {
    assert.ok(deleted, 'Wrong response');
    done();
  });
});

test('getRubric', function(assert) {
  const service = this.subject();
  assert.expect(3);

  service.set(
    'serializer',
    Ember.Object.create({
      normalizeRubric: function(data) {
        assert.equal(data, 'fake-data', 'Wrong data');
        return 'fake-response';
      }
    })
  );

  service.set(
    'adapter',
    Ember.Object.create({
      getRubric: function(rubricId) {
        assert.deepEqual(rubricId, 123, 'Wrong id');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  var done = assert.async();
  service.getRubric(123).then(function(response) {
    assert.equal(response, 'fake-response', 'Wrong response');
    done();
  });
});

test('getUserRubrics', function(assert) {
  const service = this.subject();
  assert.expect(3);

  service.set(
    'serializer',
    Ember.Object.create({
      normalizeGetRubrics: function(data) {
        assert.equal(data, 'fake-data', 'Wrong data');
        return 'fake-response';
      }
    })
  );

  service.set(
    'adapter',
    Ember.Object.create({
      getUserRubrics: function(userId) {
        assert.deepEqual(userId, 123, 'Wrong id');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  var done = assert.async();
  service.getUserRubrics(123).then(function(response) {
    assert.equal(response, 'fake-response', 'Wrong response');
    done();
  });
});

test('copyRubric', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'adapter',
    Ember.Object.create({
      copyRubric: function(rubricId) {
        assert.equal(rubricId, 123, 'Wrong id');
        return Ember.RSVP.resolve(12345);
      }
    })
  );

  var done = assert.async();
  service.copyRubric(123).then(function(copiedId) {
    assert.equal(copiedId, 12345, 'Wrong response');
    done();
  });
});

test('associateRubricToQuestion', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'adapter',
    Ember.Object.create({
      associateRubricToQuestion: function(rubricId, questionId) {
        assert.equal(rubricId, 123, 'Wrong id');
        assert.equal(questionId, 312, 'Wrong question id');
        return Ember.RSVP.resolve(true);
      }
    })
  );

  var done = assert.async();
  service.associateRubricToQuestion(123, 312).then(done);
});

test('getQuestionsToGrade', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'adapter',
    Ember.Object.create({
      getQuestionsToGrade: function(classId, courseId) {
        assert.equal(classId, '345', 'Wrong class id');
        assert.equal(courseId, '678', 'Wrong course id');
        return Ember.RSVP.resolve(true);
      }
    })
  );

  var done = assert.async();
  service.getQuestionsToGrade('345', '678').then(done);
});

test('getStudentsForQuestion', function(assert) {
  const service = this.subject();
  assert.expect(4);

  service.set(
    'adapter',
    Ember.Object.create({
      getStudentsForQuestion: function(
        questionId,
        classId,
        courseId,
        collectionId
      ) {
        assert.equal(questionId, '123', 'Wrong question id');
        assert.equal(classId, '456', 'Wrong class id');
        assert.equal(courseId, '789', 'Wrong course id');
        assert.equal(collectionId, '193', 'Wrong collection id');
        return Ember.RSVP.resolve(true);
      }
    })
  );

  var done = assert.async();
  service.getStudentsForQuestion('123', '456', '789', '193').then(done);
});

test('getAnswerToGrade', function(assert) {
  const service = this.subject();
  assert.expect(8);

  service.set(
    'adapter',
    Ember.Object.create({
      getAnswerToGrade: function(
        studentId,
        classId,
        courseId,
        collectionId,
        questionId,
        unitId = null,
        lessonId = null
      ) {
        assert.equal(studentId, 'student-id', 'Wrong student id');
        assert.equal(classId, 'class-id', 'Wrong class id');
        assert.equal(courseId, 'course-id', 'Wrong course id');
        assert.equal(collectionId, 'collection-id', 'Wrong collection id');
        assert.equal(questionId, 'question-id', 'Wrong question id');
        assert.equal(unitId, 'unit-id', 'Wrong unit id');
        assert.equal(lessonId, null, 'Wrong default lesson id');
        return Ember.RSVP.resolve('answer-object');
      }
    })
  );

  service.set(
    'serializer',
    Ember.Object.create({
      normalizeAnswerToGrade: function(param) {
        assert.deepEqual(param, 'answer-object', 'Wrong normalizer parameter');
        return true;
      }
    })
  );

  var done = assert.async();
  service
    .getAnswerToGrade(
      'student-id',
      'class-id',
      'course-id',
      'collection-id',
      'question-id',
      'unit-id'
    )
    .then(done);
});

test('setStudentRubricGrades', function(assert) {
  const service = this.subject();
  let rubricGrade = RubricGradeModel.create({
    id: 'rubric-grade-id',
    title: 'any rubric'
  });

  assert.expect(3);

  service.set(
    'serializer',
    Ember.Object.create({
      serializeStudentRubricGrades: function(rubricParam) {
        assert.deepEqual(
          rubricParam,
          rubricGrade,
          'Wrong rubric grade parameter'
        );
        return { id: 'grade-id' };
      }
    })
  );

  service.set(
    'adapter',
    Ember.Object.create({
      setStudentRubricGrades: function(data) {
        assert.deepEqual(data, { id: 'grade-id' }, 'Wrong data id');
        return Ember.RSVP.resolve(true);
      }
    })
  );

  var done = assert.async();
  service.setStudentRubricGrades(rubricGrade).then(function() {
    assert.equal(
      rubricGrade.get('id'),
      'rubric-grade-id',
      'Wrong rubric grade id'
    );
    done();
  });
});

test('getRubricQuestionSummary', function(assert) {
  const service = this.subject();
  assert.expect(7);

  service.set(
    'adapter',
    Ember.Object.create({
      getRubricQuestionSummary: function(
        studentId,
        classId,
        courseId,
        collectionId,
        questionId,
        sessionId
      ) {
        assert.equal(studentId, 'student-id', 'Wrong student id');
        assert.equal(classId, 'class-id', 'Wrong class id');
        assert.equal(courseId, 'course-id', 'Wrong course id');
        assert.equal(collectionId, 'collection-id', 'Wrong collection id');
        assert.equal(questionId, 'question-id', 'Wrong question id');
        assert.equal(sessionId, 'session-id', 'Wrong session id');
        return Ember.RSVP.resolve('fake-data');
      }
    })
  );

  service.set(
    'serializer',
    Ember.Object.create({
      normalizeRubricQuestionSummary: function(data) {
        assert.equal(data, 'fake-data', 'Wrong data');
        return 'fake-response';
      }
    })
  );

  var done = assert.async();
  service
    .getRubricQuestionSummary(
      'student-id',
      'class-id',
      'course-id',
      'collection-id',
      'question-id',
      'session-id'
    )
    .then(done);
});
