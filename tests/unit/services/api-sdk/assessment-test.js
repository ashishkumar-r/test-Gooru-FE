import Ember from 'ember';
import { test } from 'ember-qunit';
import moduleForService from 'gooru-web/tests/helpers/module-for-service';
import AssessmentModel from 'gooru-web/models/content/assessment';

moduleForService(
  'service:api-sdk/assessment',
  'Unit | Service | api-sdk/assessment',
  {
    needs: ['service:api-sdk/profile']
  }
);

test('createAssessment', function(assert) {
  const service = this.subject();
  let assessmentModel = Ember.Object.create();
  assert.expect(2);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/assessments',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'assessment-id' },
          ''
        ];
      },
      false
    );
  });

  service.set(
    'assessmentSerializer',
    Ember.Object.create({
      serializeCreateAssessment: function(assessmentObject) {
        assert.deepEqual(
          assessmentObject,
          assessmentModel,
          'Wrong assessment object'
        );
        return {};
      }
    })
  );

  var done = assert.async();

  service.createAssessment(assessmentModel).then(function() {
    assert.equal(
      assessmentModel.get('id'),
      'assessment-id',
      'Wrong assessment id'
    );
    done();
  });
});

test('readAssessment', function(assert) {
  const service = this.subject();
  const expectedAssessmentId = 'assessment-id';
  const expectedProfileId = 'profile-id';
  assert.expect(3);

  service.set(
    'assessmentAdapter',
    Ember.Object.create({
      readAssessment: function(assessmentId) {
        assert.equal(assessmentId, expectedAssessmentId, 'Wrong Assessment id');
        return Ember.RSVP.resolve({
          id: assessmentId,
          ownerId: expectedProfileId
        });
      }
    })
  );
  service.set(
    'assessmentSerializer',
    Ember.Object.create({
      normalizeReadAssessment: function(assessmentData) {
        assert.deepEqual(
          assessmentData,
          { id: expectedAssessmentId, ownerId: expectedProfileId },
          'Wrong Assessment data'
        );
        return Ember.Object.create(assessmentData);
      }
    })
  );

  service.set(
    'profileService',
    Ember.Object.create({
      readUserProfile: function(profileId) {
        assert.equal(profileId, expectedProfileId, 'Wrong Profile id');
        return Ember.RSVP.resolve(
          Ember.Object.create({ id: expectedProfileId })
        );
      }
    })
  );

  var done = assert.async();
  service.readAssessment(expectedAssessmentId).then(function() {
    done();
  });
});

test('updateAssessment', function(assert) {
  const service = this.subject();
  const expectedAssessmentId = 'assessment-id';
  const expectedAssessmentModel = AssessmentModel.create({
    title: 'Assessment title'
  });

  assert.expect(3);

  service.set(
    'assessmentSerializer',
    Ember.Object.create({
      serializeUpdateAssessment: function(assessmentModel) {
        assert.deepEqual(
          assessmentModel,
          expectedAssessmentModel,
          'Wrong assessment model'
        );
        return {};
      }
    })
  );
  service.set(
    'assessmentAdapter',
    Ember.Object.create({
      updateAssessment: function(assessmentId) {
        assert.equal(assessmentId, expectedAssessmentId, 'Wrong assessment id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesAssessmentChange', function(assessmentId) {
    assert.equal(assessmentId, expectedAssessmentId, 'Wrong assessment id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service
    .updateAssessment(expectedAssessmentId, expectedAssessmentModel)
    .then(function() {
      done();
    });
});

test('updateAssessmentTitle', function(assert) {
  const service = this.subject();
  const expectedAssessmentId = 'assessment-id';

  assert.expect(3);

  service.set(
    'assessmentSerializer',
    Ember.Object.create({
      serializeUpdateAssessmentTitle: function(title) {
        assert.equal(title, 'title', 'Wrong assessment title');
        return {};
      }
    })
  );
  service.set(
    'assessmentAdapter',
    Ember.Object.create({
      updateAssessment: function(assessmentId) {
        assert.equal(assessmentId, expectedAssessmentId, 'Wrong assessment id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesAssessmentChange', function(assessmentId) {
    assert.equal(assessmentId, expectedAssessmentId, 'Wrong assessment id');
    return Ember.RSVP.resolve();
  });
  var done = assert.async();
  service.updateAssessmentTitle(expectedAssessmentId, 'title').then(function() {
    done();
  });
});

test('addQuestion', function(assert) {
  const service = this.subject();
  const expectedAssessmentId = 'assessment-id';
  const expectedQuestionId = 'question-id';

  assert.expect(3);

  service.set(
    'assessmentAdapter',
    Ember.Object.create({
      addQuestion: function(assessmentId, questionId) {
        assert.equal(assessmentId, expectedAssessmentId, 'Wrong assessment id');
        assert.equal(questionId, expectedQuestionId, 'Wrong question id');
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesAssessmentChange', function(assessmentId) {
    assert.equal(assessmentId, expectedAssessmentId, 'Wrong assessment id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();
  service
    .addQuestion(expectedAssessmentId, expectedQuestionId)
    .then(function() {
      done();
    });
});

test('deleteAssessment', function(assert) {
  const expectedAssessment = Ember.Object.create({
    id: 'assessment-id',
    isExternalAssessment: false
  });

  const secondExpectedAssessment = Ember.Object.create({
    id: 'second-assessment-id',
    isExternalAssessment: true
  });
  const service = this.subject();

  assert.expect(3);

  service.set(
    'assessmentAdapter',
    Ember.Object.create({
      deleteAssessment: function(assessmentId) {
        assert.equal(assessmentId, expectedAssessment.id, 'Wrong assessment');
        return Ember.RSVP.resolve();
      },
      deleteExternalAssessment: function(assessmentId) {
        assert.equal(
          assessmentId,
          secondExpectedAssessment.id,
          'Wrong assessment'
        );
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesAssessmentChange', function(assessmentId) {
    assert.equal(assessmentId, 'assessment-id', 'Wrong assessment id');
    return Ember.RSVP.resolve();
  });

  var done = assert.async();

  service
    .deleteAssessment(
      Ember.Object.create({
        id: 'assessment-id',
        isExternalAssessment: false
      })
    )
    .then(function() {
      service
        .deleteAssessment(
          Ember.Object.create({
            id: 'second-assessment-id',
            isExternalAssessment: true
          })
        )
        .then(function() {
          done();
        });
    });
});

test('copyAssessment', function(assert) {
  const service = this.subject();

  assert.expect(1);

  // There is not a Adapter stub in this case
  // Pretender was included because it is needed to simulate the response Headers including the Location value
  this.pretender.map(function() {
    this.post(
      '/api/nucleus/v1/copier/assessments/assessment-id',
      function() {
        return [
          201,
          { 'Content-Type': 'text/plain', Location: 'copy-assessment-id' },
          ''
        ];
      },
      false
    );
  });

  var done = assert.async();
  service.copyAssessment('assessment-id').then(function(response) {
    assert.equal(response, 'copy-assessment-id', 'Wrong assessment id');
    done();
  });
});

test('reorderAssessment', function(assert) {
  const service = this.subject();
  const expectedAssessmentId = 'assessment-id';

  assert.expect(5);

  service.set(
    'assessmentSerializer',
    Ember.Object.create({
      serializeReorderAssessment: function(resourceIds) {
        assert.equal(resourceIds.length, 2, 'Wrong total resources');
        assert.equal(resourceIds[0], 'a', 'Wrong id at index 0');
        return 'fake-data';
      }
    })
  );
  service.set(
    'assessmentAdapter',
    Ember.Object.create({
      reorderAssessment: function(assessmentId, data) {
        assert.equal(assessmentId, expectedAssessmentId, 'Wrong assessment id');
        assert.equal(
          data,
          'fake-data',
          'Wrong data parameter coming from serializer'
        );
        return Ember.RSVP.resolve();
      }
    })
  );

  service.set('notifyQuizzesAssessmentChange', function(assessmentId) {
    assert.equal(assessmentId, expectedAssessmentId, 'Wrong assessment id');
    return Ember.RSVP.resolve();
  });
  var done = assert.async();
  service.reorderAssessment(expectedAssessmentId, ['a', 'b']).then(function() {
    done();
  });
});

test('notifyQuizzesAssessmentChange', function(assert) {
  const service = this.subject();
  const expectedAssessmentId = 'assessment-id';

  assert.expect(2);

  service.set(
    'quizzesCollectionService',
    Ember.Object.create({
      notifyCollectionChange: function(assessmentId, type) {
        assert.equal(assessmentId, expectedAssessmentId, 'Wrong assessment id');
        assert.equal(type, 'assessment', 'Wrong type');
        return Ember.RSVP.resolve();
      }
    })
  );
  var done = assert.async();
  service.notifyQuizzesAssessmentChange(expectedAssessmentId).then(function() {
    done();
  });
});
