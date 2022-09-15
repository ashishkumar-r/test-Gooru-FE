import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import QuestionModel from 'gooru-web/models/content/question';
import { DEFAULT_QUESTION } from 'gooru-web/config/question';

export default Ember.Route.extend(PrivateRouteMixin, {
  queryParams: {
    isCollection: {},
    collectionId: {},
    questionType: {},
    compQuestionId: {
      refreshModel: true
    }
  },

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/question
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @requires service:api-sdk/collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    let route = this;
    let collection = Ember.Object.create({});
    let questionType = params.questionType;
    let compQuestionId =
      params.compQuestionId && params.compQuestionId !== 'null'
        ? params.compQuestionId
        : null;
    let questions = QuestionModel.create(
      Ember.getOwner(this).ownerInjection(),
      {
        title: route.get('i18n').t(`common.question-type.${questionType}`)
          .string,
        type: DEFAULT_QUESTION[questionType].type
      }
    );
    let modelData = {
      questions,
      collection,
      questionType,
      compQuestionId
    };
    if (params.collectionId && params.collectionId !== 'null') {
      collection.setProperties({
        id: params.collectionId
      });
      modelData.isCollection = !!(params.isCollection === 'true');
    }
    return modelData;
  },

  setupController(controller, model) {
    controller.set('question', model.questions);
    if (model.isCollection) {
      controller.set('isCollection', model.isCollection);
    }
    controller.set('isCreateQuestion', true);
    controller.set('collection', model.collection);
    controller.set('createQuestiontype', model.questionType);
    controller.set('compQuestionId', model.compQuestionId);
  },

  resetController(controller) {
    controller.set('compQuestionId', null);
    controller.set('collection', null);
    controller.set('collectionId', null);
  }
});
