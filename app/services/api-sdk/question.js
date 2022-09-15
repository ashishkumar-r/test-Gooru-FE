import Ember from 'ember';
import QuestionSerializer from 'gooru-web/serializers/content/question';
import QuestionAdapter from 'gooru-web/adapters/content/question';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import { getTaxonomyIds } from 'gooru-web/utils/utils';

/**
 * @typedef {Object} QuestionService
 */
export default Ember.Service.extend({
  /**
   * @property {QuestionSerializer} questionSerializer
   */
  questionSerializer: null,

  /**
   * @property {QuestionAdapter} questionAdapter
   */
  questionAdapter: null,

  /**
   * @property {AssessmentService}
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {RubricService}
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @property {AssessmentService}
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  init: function() {
    this._super(...arguments);
    this.set(
      'questionSerializer',
      QuestionSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'questionAdapter',
      QuestionAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomyAdapter',
      TaxonomyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Creates a new question
   *
   * @param questionData object with the question data
   * @returns {Promise}
   */
  createQuestion: function(questionData) {
    const service = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      let serializedClassData = service
        .get('questionSerializer')
        .serializeCreateQuestion(questionData);
      service
        .get('questionAdapter')
        .createQuestion({
          body: serializedClassData
        })
        .then(function(responseData, textStatus, request) {
          let questionId = request.getResponseHeader('location');
          questionData.set('id', questionId);
          resolve(questionData);
        }, reject);
    });
  },

  /**
   * Finds an questions by id
   * @param {string} questionId
   * @returns {Ember.RSVP.Promise}
   */
  readQuestion: function(questionId, isDefaultShowFW, classFramework) {
    const service = this;
    const serializer = service.get('questionSerializer');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('questionAdapter')
        .readQuestion(questionId)
        .then(function(responseData /*, textStatus, request */) {
          let questionInfo = serializer.normalizeReadQuestion(responseData);
          let taxonomyIds = getTaxonomyIds(questionInfo, false);
          if (isDefaultShowFW && taxonomyIds.length) {
            service
              .getcrosswalkCompetency(questionInfo, classFramework, taxonomyIds)
              .then(function() {
                resolve(questionInfo);
              });
          } else {
            resolve(questionInfo);
          }
        }, reject);
    });
  },

  /**
   * Updates a question
   *
   * @param questionId the id of the question to be updated
   * @param questionModel the question model with the data
   * @param {content/Collection|content/Assessment} collection provided when the question belongs to a collection
   * @returns {Promise}
   */
  updateQuestion: function(questionId, questionModel, collection = null) {
    const service = this;
    let serializedData = service
      .get('questionSerializer')
      .serializeUpdateQuestion(questionModel);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('questionAdapter')
        .updateQuestion(questionId, serializedData)
        .then(function() {
          if (
            questionModel.get('isOpenEnded') ||
            questionModel.get('isScientificFreeRes') ||
            questionModel.get('isScientificFIB') ||
            questionModel.get('isSerpDecoding') ||
            questionModel.get('isSerpSayOutLoud') ||
            questionModel.get('isSerpUnderline') ||
            questionModel.get('isSerpWPM')
          ) {
            const rubric = questionModel.get('rubric');
            if (
              (rubric && questionModel.get('isScientificFreeRes')) ||
              questionModel.get('isScientificFIB') ||
              questionModel.get('isSerpDecoding') ||
              questionModel.get('isSerpSayOutLoud') ||
              questionModel.get('isSerpUnderline') ||
              questionModel.get('isSerpWPM')
            ) {
              let maxScore = questionModel.get('maxScore');
              rubric.set('maxScore', parseInt(maxScore));
              rubric.set('increment', 1);
            }
            if (rubric && rubric.get('rubricOn')) {
              //Scenario: Rubric ON - Scoring OFF
              return Ember.RSVP.resolve();
            } else if (rubric && rubric.get('scoring')) {
              if (rubric && rubric.get('title')) {
                //Scenario: Rubric OFF - Scoring ON - From Rubric ON
                return service
                  .get('rubricService')
                  .deleteRubric(rubric.get('id'))
                  .then(function() {
                    return service
                      .get('rubricService')
                      .updateScore(rubric, questionId);
                  });
              } else {
                //Scenario: Rubric OFF - Scoring ON - From Rubric OFF
                return service
                  .get('rubricService')
                  .updateScore(rubric, questionId);
              }
            } else if (rubric && rubric.get('title')) {
              //Scenario: Rubric OFF - Scoring OFF - From Rubric ON
              return service
                .get('rubricService')
                .deleteRubric(rubric.get('id'));
            } else {
              //Scenario: Rubric OFF - Scoring OFF - From Rubric OFF
              return service
                .get('rubricService')
                .updateScore(rubric, questionId);
            }
          } else {
            return Ember.RSVP.resolve();
          }
        })
        .then(function() {
          service.notifyQuizzesCollectionChange(collection);
          resolve();
        }, reject);
    });
  },

  /**
   * Updates the question title
   *
   * @param questionId the id of the question to be updated
   * @param title
   * @param {content/Collection|content/Assessment} collection provided when the question belongs to a collection
   * @returns {Promise}
   */
  updateQuestionTitle: function(questionId, title, collection = null) {
    const service = this;
    let serializedData = service
      .get('questionSerializer')
      .serializeUpdateQuestionTitle(title);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('questionAdapter')
        .updateQuestion(questionId, serializedData)
        .then(function() {
          service.notifyQuizzesCollectionChange(collection);
          resolve();
        }, reject);
    });
  },

  /**
   * Delete question
   *
   * @param questionId question id to delete
   * @param {content/Collection|content/Assessment} collection provided when the question belongs to a collection
   * @returns {Ember.RSVP.Promise}
   */
  deleteQuestion: function(questionId, collection = null) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('questionAdapter')
        .deleteQuestion(questionId)
        .then(function() {
          service.notifyQuizzesCollectionChange(collection);
          resolve();
        }, reject);
    });
  },

  /**
   * Copies a question by id
   * @param {string} questionId
   * @returns {Ember.RSVP.Promise}
   */
  copyQuestion: function(questionId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('questionAdapter')
        .copyQuestion(questionId)
        .then(function(responseData, textStatus, request) {
          resolve(request.getResponseHeader('location'));
        }, reject);
    });
  },

  /**
   * Add a question by id
   * @param {string} questionId
   * @param {string} subQuestionId
   * @returns {Ember.RSVP.Promise}
   */
  addQuestion: function(questionId, subQuestionId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('questionAdapter')
        .addQuestion(questionId, subQuestionId)
        .then(function(responseData, textStatus, request) {
          resolve(request.getResponseHeader('location'));
        }, reject);
    });
  },

  /**
   * Reorder questions resources
   *
   * @param questionId the id of the questions to be updated
   * @param {string[]} questionIds
   * @returns {Promise}
   */
  reorderQuestions: function(questionId, subQuestionIds, assessment = null) {
    const service = this;
    let serializedData = service
      .get('questionSerializer')
      .serializeReorderQuestions(subQuestionIds);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('questionAdapter')
        .reorderQuestions(questionId, serializedData)
        .then(function() {
          if (assessment) {
            service.notifyQuizzesCollectionChange(assessment);
          }
          resolve();
        }, reject);
    });
  },

  /**
   * Notifies a change at quizzes for the provided collection
   * @param {content/Collection|content/Assessment} collection
   */
  notifyQuizzesCollectionChange: function(collection) {
    if (collection) {
      const collectionId = collection.get('id');
      return collection.get('isAssessment')
        ? this.get('assessmentService').notifyQuizzesAssessmentChange(
          collectionId
        )
        : this.get('collectionService').notifyQuizzesCollectionChange(
          collectionId
        );
    }
    return Ember.RSVP.resolve(false);
  },
  fetchReadactivity: function(questionId, sourceQuestionId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('questionAdapter')
        .fetchReadactivity(questionId, sourceQuestionId)
        .then(function(responseData) {
          resolve(responseData);
        }, reject);
    });
  },

  /**
   * Finds an questions by id
   * @param {string} questionId
   * @returns {Ember.RSVP.Promise}
   */
  getTags: function(text, limit, offset) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('questionAdapter')
        .getTags(text, limit, offset)
        .then(
          function(responseData) {
            resolve(responseData.tags);
          },
          function() {
            resolve([]);
          }
        );
    });
  },

  /**
   * get difficulty level
   * @param {string} null
   * @returns {Ember.RSVP.Promise}
   */
  getDifficultyLevel: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('questionAdapter')
        .getDifficultyLevel()
        .then(
          function(response) {
            resolve(response.difficultyLevels);
          },
          function() {
            resolve([]);
          }
        );
    });
  },

  getcrosswalkCompetency: function(question, classFramework, taxonomyIds) {
    const service = this;
    return service
      .get('taxonomyAdapter')
      .crosswalkCompetency(classFramework, taxonomyIds)
      .then(function(crosswalkResponse) {
        let frameworkCrossWalkComp = service
          .get('taxonomySerializer')
          .normalizeCrosswalkCompetency(crosswalkResponse);
        let standards = question.standards;
        standards.map(data => {
          let taxonomyData = frameworkCrossWalkComp.findBy(
            'sourceDisplayCode',
            data.code
          );
          if (taxonomyData) {
            data.code = taxonomyData.targetDisplayCode;
            data.frameworkCode = taxonomyData.targetFrameworkId;
          }
        });
      });
  }
});
