import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import QuestionModel from 'gooru-web/models/content/question';
import Rubric from 'gooru-web/models/rubric/rubric';

moduleForService(
  'service:api-sdk/question',
  'Unit | Service | api-sdk/question',
  {
    needs: [
      'service:api-sdk/assessment',
      'service:api-sdk/rubric',
      'service:api-sdk/collection'
    ]
  }
);

test('createQuestion', function(assert) {
  const service = this.subject();
  let questionModel = Ember.Object.create();

  assert.expect(2);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v2/questions',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'question-id' },
          ''
        ];
      },
      false
    );
  });

  service.set(
    'questionSerializer',
    Ember.Object.create({
      serializeCreateQuestion: function(questionObject) {
        assert.deepEqual(
          questionObject,
          questionModel,
          'Wrong question object'
        );
        return {};
      }
    })
  );

  var done = assert.async();
  service.createQuestion(questionModel).then(function() {
    assert.equal(questionModel.get('id'), 'question-id', 'Wrong question id');
    done();
  });
});

test('readQuestion', function(assert) {
  const service = this.subject();
  assert.expect(2);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      readQuestion: function(questionId) {
        assert.equal(1, questionId, 'readQuestion() function was called');
        return Ember.RSVP.resolve({ id: questionId });
      }
    })
  );

  service.set(
    'questionSerializer',
    Ember.Object.create({
      normalizeReadQuestion: function(questionData) {
        assert.deepEqual({ id: 1 }, questionData, 'Wrong question data');
        return {};
      }
    })
  );

  var done = assert.async();
  service.readQuestion(1).then(function() {
    done();
  });
});

test('updateQuestion', function(assert) {
  const service = this.subject();
  const expectedQuestionId = 'question-id';
  const expectedQuestionModel = QuestionModel.create({
    title: 'Question title'
  });

  assert.expect(2);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      updateQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'questionSerializer',
    Ember.Object.create({
      serializeUpdateQuestion: function(questionObject) {
        assert.deepEqual(
          questionObject,
          expectedQuestionModel,
          'Wrong question object'
        );
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .updateQuestion(expectedQuestionId, expectedQuestionModel)
    .then(function() {
      done();
    });
});

test('updateQuestion with collection', function(assert) {
  const service = this.subject();
  const expectedQuestionId = 'question-id';
  const expectedQuestionModel = QuestionModel.create({
    title: 'Question title'
  });
  const collection = Ember.Object.create({ id: 123 });

  assert.expect(3);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      updateQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'questionSerializer',
    Ember.Object.create({
      serializeUpdateQuestion: function(questionObject) {
        assert.deepEqual(
          questionObject,
          expectedQuestionModel,
          'Wrong question object'
        );
        return {};
      }
    })
  );

  service.set('notifyQuizzesCollectionChange', function(collection) {
    assert.equal(collection.get('id'), 123, 'Wrong collection id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service
    .updateQuestion(expectedQuestionId, expectedQuestionModel, collection)
    .then(function() {
      done();
    });
});

test('updateQuestionTitle', function(assert) {
  const service = this.subject();
  const expectedQuestionId = 'question-id';
  const expectedQuestionTitle = 'Question title';

  assert.expect(2);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      updateQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'questionSerializer',
    Ember.Object.create({
      serializeUpdateQuestionTitle: function(title) {
        assert.deepEqual(title, 'Question title', 'Wrong question title');
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .updateQuestionTitle(expectedQuestionId, expectedQuestionTitle)
    .then(function() {
      done();
    });
});

test('updateQuestionTitle with collection', function(assert) {
  const service = this.subject();
  const expectedQuestionId = 'question-id';
  const expectedQuestionTitle = 'Question title';
  const collection = Ember.Object.create({ id: 123 });

  assert.expect(3);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      updateQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'questionSerializer',
    Ember.Object.create({
      serializeUpdateQuestionTitle: function(title) {
        assert.deepEqual(title, 'Question title', 'Wrong question title');
        return {};
      }
    })
  );

  service.set('notifyQuizzesCollectionChange', function(collection) {
    assert.equal(collection.get('id'), 123, 'Wrong collection id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service
    .updateQuestionTitle(expectedQuestionId, expectedQuestionTitle, collection)
    .then(function() {
      done();
    });
});

test('deleteQuestion', function(assert) {
  const expectedQuestionId = 'question-id';
  const service = this.subject();

  assert.expect(1);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      deleteQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.deleteQuestion('question-id').then(function() {
    done();
  });
});

test('deleteQuestion with collection', function(assert) {
  const expectedQuestionId = 'question-id';
  const service = this.subject();
  const collection = Ember.Object.create({ id: 123 });

  assert.expect(2);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      deleteQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesCollectionChange', function(collection) {
    assert.equal(collection.get('id'), 123, 'Wrong collection id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service.deleteQuestion('question-id', collection).then(function() {
    done();
  });
});

test('copyQuestion', function(assert) {
  const service = this.subject();

  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/copier/questions/question-id',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'copy-question-id' },
          ''
        ];
      },
      false
    );
  });

  var done = assert.async();
  service.copyQuestion('question-id').then(function(response) {
    assert.equal(response, 'copy-question-id', 'Wrong question id');
    done();
  });
});

test('notifyQuizzesCollectionChange with no collection', function(assert) {
  const service = this.subject();
  assert.expect(1);

  service.set(
    'assessmentService',
    Ember.Object.create({
      notifyQuizzesAssessmentChange: function() {
        assert.ok(false, 'notifyQuizzesAssessmentChange should not be called');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'collectionService',
    Ember.Object.create({
      notifyQuizzesCollectionChange: function() {
        assert.ok(false, 'notifyQuizzesCollectionChange should not be called');
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.notifyQuizzesCollectionChange(null).then(function(notified) {
    assert.equal(notified, false, 'Wrong response');
    done();
  });
});

test('notifyQuizzesCollectionChange with collection', function(assert) {
  const service = this.subject();
  assert.expect(2);
  const collection = Ember.Object.create({ id: 123, isAssessment: false });

  service.set(
    'assessmentService',
    Ember.Object.create({
      notifyQuizzesAssessmentChange: function() {
        assert.ok(false, 'notifyQuizzesAssessmentChange should not be called');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'collectionService',
    Ember.Object.create({
      notifyQuizzesCollectionChange: function(collectionId) {
        assert.equal(collectionId, 123, 'Wrong collection id');
        return Ember.RSVP.resolve(true);
      }
    })
  );

  var done = assert.async();
  service.notifyQuizzesCollectionChange(collection).then(function(notified) {
    assert.equal(notified, true, 'Wrong response');
    done();
  });
});

test('notifyQuizzesCollectionChange with assessment', function(assert) {
  const service = this.subject();
  assert.expect(2);
  const collection = Ember.Object.create({ id: 123, isAssessment: true });

  service.set(
    'assessmentService',
    Ember.Object.create({
      notifyQuizzesAssessmentChange: function(assessmentId) {
        assert.equal(assessmentId, 123, 'Wrong assessment id');
        return Ember.RSVP.resolve(true);
      }
    })
  );

  service.set(
    'collectionService',
    Ember.Object.create({
      notifyQuizzesCollectionChange: function() {
        assert.ok(false, 'notifyQuizzesCollectionChange should not be called');
        return Ember.RSVP.resolve();
      }
    })
  );

  var done = assert.async();
  service.notifyQuizzesCollectionChange(collection).then(function(notified) {
    assert.equal(notified, true, 'Wrong response');
    done();
  });
});

test('updateQuestion - OE - Rubric OFF - Scoring ON - From Rubric OFF', function(assert) {
  const service = this.subject();
  const expectedQuestionId = 'question-id';
  const expectedQuestionModel = QuestionModel.create({
    title: 'Question title',
    questionType: 'OE',
    rubric: Rubric.create(Ember.getOwner(this).ownerInjection(), {
      scoring: true,
      rubricOn: false
    })
  });

  const expectedRubricModel = expectedQuestionModel.rubric;

  assert.expect(4);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      updateQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'rubricService',
    Ember.Object.create({
      updateScore: function(rubricModel, questionId) {
        assert.deepEqual(
          rubricModel,
          expectedRubricModel,
          'Wrong rubric object'
        );
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'questionSerializer',
    Ember.Object.create({
      serializeUpdateQuestion: function(questionObject) {
        assert.deepEqual(
          questionObject,
          expectedQuestionModel,
          'Wrong question object'
        );
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .updateQuestion(expectedQuestionId, expectedQuestionModel)
    .then(function() {
      done();
    });
});

test('updateQuestion - OE - Rubric OFF - Scoring ON - From Rubric ON', function(assert) {
  const service = this.subject();
  const expectedQuestionId = 'question-id';
  const expectedQuestionModel = QuestionModel.create({
    title: 'Question title',
    questionType: 'OE',
    rubric: Rubric.create(Ember.getOwner(this).ownerInjection(), {
      id: 'rubric-id',
      title: 'Rubric title',
      scoring: true,
      rubricOn: false
    })
  });

  const expectedRubricModel = expectedQuestionModel.rubric;
  const expectedRubricId = expectedRubricModel.id;

  assert.expect(5);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      updateQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'rubricService',
    Ember.Object.create({
      deleteRubric: function(rubricId) {
        assert.equal(rubricId, expectedRubricId, 'Wrong rubric id');
        return Ember.RSVP.resolve();
      },
      updateScore: function(rubricModel, questionId) {
        assert.deepEqual(
          rubricModel,
          expectedRubricModel,
          'Wrong rubric object'
        );
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'questionSerializer',
    Ember.Object.create({
      serializeUpdateQuestion: function(questionObject) {
        assert.deepEqual(
          questionObject,
          expectedQuestionModel,
          'Wrong question object'
        );
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .updateQuestion(expectedQuestionId, expectedQuestionModel)
    .then(function() {
      done();
    });
});

test('updateQuestion - OE - Rubric OFF - Scoring OFF - From Rubric OFF', function(assert) {
  const service = this.subject();
  const expectedQuestionId = 'question-id';
  const expectedQuestionModel = QuestionModel.create({
    title: 'Question title',
    questionType: 'OE',
    rubric: Rubric.create(Ember.getOwner(this).ownerInjection(), {
      scoring: false,
      rubricOn: false
    })
  });

  const expectedRubricModel = expectedQuestionModel.rubric;

  assert.expect(4);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      updateQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'rubricService',
    Ember.Object.create({
      updateScore: function(rubricModel, questionId) {
        assert.deepEqual(
          rubricModel,
          expectedRubricModel,
          'Wrong rubric object'
        );
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'questionSerializer',
    Ember.Object.create({
      serializeUpdateQuestion: function(questionObject) {
        assert.deepEqual(
          questionObject,
          expectedQuestionModel,
          'Wrong question object'
        );
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .updateQuestion(expectedQuestionId, expectedQuestionModel)
    .then(function() {
      done();
    });
});

test('updateQuestion - OE - Rubric OFF - Scoring OFF - From Rubric ON', function(assert) {
  const service = this.subject();
  const expectedQuestionId = 'question-id';
  const expectedQuestionModel = QuestionModel.create({
    title: 'Question title',
    questionType: 'OE',
    rubric: Rubric.create(Ember.getOwner(this).ownerInjection(), {
      id: 'rubric-id',
      title: 'Rubric title',
      scoring: false,
      rubricOn: false
    })
  });

  const expectedRubricModel = expectedQuestionModel.rubric;
  const expectedRubricId = expectedRubricModel.id;

  assert.expect(3);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      updateQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'rubricService',
    Ember.Object.create({
      deleteRubric: function(rubricId) {
        assert.equal(rubricId, expectedRubricId, 'Wrong rubric id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'questionSerializer',
    Ember.Object.create({
      serializeUpdateQuestion: function(questionObject) {
        assert.deepEqual(
          questionObject,
          expectedQuestionModel,
          'Wrong question object'
        );
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .updateQuestion(expectedQuestionId, expectedQuestionModel)
    .then(function() {
      done();
    });
});

test('updateQuestion - OE - Rubric ON - Scoring OFF', function(assert) {
  const service = this.subject();
  const expectedQuestionId = 'question-id';
  const expectedQuestionModel = QuestionModel.create({
    title: 'Question title',
    questionType: 'OE',
    rubric: Rubric.create(Ember.getOwner(this).ownerInjection(), {
      id: 'rubric-id',
      title: 'Rubric title',
      scoring: false,
      rubricOn: true
    })
  });

  assert.expect(2);

  service.set(
    'questionAdapter',
    Ember.Object.create({
      updateQuestion: function(questionId) {
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set(
    'questionSerializer',
    Ember.Object.create({
      serializeUpdateQuestion: function(questionObject) {
        assert.deepEqual(
          questionObject,
          expectedQuestionModel,
          'Wrong question object'
        );
        return {};
      }
    })
  );

  var done = assert.async();
  service
    .updateQuestion(expectedQuestionId, expectedQuestionModel)
    .then(function() {
      done();
    });
});
