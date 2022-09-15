import Ember from 'ember';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import AnalyticsSerializer from 'gooru-web/serializers/analytics/analytics';
import {
  getQuestionUtil,
  QUESTION_TYPES,
  getQuestionTypeByApiType
} from 'gooru-web/config/question';
import { DEFAULT_IMAGES, CONTENT_TYPES } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { toLocal } from 'gooru-web/utils/utils';

export default Ember.Object.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  taxonomySerializer: null,

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  init: function() {
    this._super(...arguments);
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'analyticsSerializer',
      AnalyticsSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function serializePortfolioItems
   * @param {Object} portfolioItems
   * @param {String} contentType
   * Method to serialize portfolio activities
   */
  serializePortfolioItems(portfolioItems = {}, contentType) {
    const serializer = this;
    let serializedPortfolioItems = Ember.A([]);
    if (Ember.isArray(portfolioItems.usageData) || portfolioItems.usageData) {
      let learningActivities = portfolioItems.usageData;
      if (
        contentType === CONTENT_TYPES.OFFLINE_ACTIVITY ||
        !Ember.isArray(learningActivities)
      ) {
        const availableSubTypes = Object.keys(learningActivities);
        availableSubTypes.map(subType => {
          learningActivities[`${subType}`].map(learningActivity => {
            serializedPortfolioItems[`${subType}`] =
              serializedPortfolioItems[`${subType}`] || Ember.A([]);
            serializedPortfolioItems[`${subType}`].pushObject(
              serializer.serializePortfolioItem(learningActivity)
            );
          });
        });
      } else {
        learningActivities.map(learningActivity => {
          serializedPortfolioItems.pushObject(
            serializer.serializePortfolioItem(learningActivity)
          );
        });
      }
    }
    return serializedPortfolioItems;
  },

  /**
   * @function serializePortfolioItem
   * @param {Object} content
   * Method to serialize individual portfolio activity
   */
  serializePortfolioItem(content) {
    const serializer = this;
    const basePath = serializer.get('session.cdnUrls.content');
    const appRootPath = this.get('appRootPath'); //configuration appRootPath
    const contentType = content.type;
    let serializedPortfolioItem = Ember.Object.create({});
    if (content) {
      let thumbnailUrl = content.thumbnail ? basePath : appRootPath;
      let imageLoc = content.thumbnail || '';
      if (!content.thumbnail) {
        imageLoc = contentType.includes(CONTENT_TYPES.ASSESSMENT)
          ? DEFAULT_IMAGES.ASSESSMENT
          : contentType === CONTENT_TYPES.OFFLINE_ACTIVITY
            ? DEFAULT_IMAGES.OFFLINE_ACTIVITY
            : DEFAULT_IMAGES.COLLECTION;
      }
      let contentScore = content.score
        ? Math.round(content.score)
        : content.score;

      serializedPortfolioItem = Ember.Object.create({
        activityTimestamp: content.activityTimestamp,
        contentSource: content.contentSource,
        efficacy: 0.5 || content.efficacy,
        engagement: 0.5 || content.engagement,
        gradingStatus: content.gradingStatus,
        isGraded: content.graded,
        gutCodes: content.gutCodes,
        id: content.id,
        learningObjective: content.learningObjective,
        lastSessionId: content.sessionId,
        masterySummary: content.masterySummary,
        maxScore: content.maxScore,
        owner: serializer.normalizeOwner(content.owner),
        questionCount: content.questionCount,
        resourceCount: content.resourceCount,
        relevance: 0.5 || content.relevance,
        score: contentScore,
        status: content.status,
        subType: content.subType,
        taskCount: content.taskCount,
        taxonomy: serializer
          .get('taxonomySerializer')
          .normalizeTaxonomyObject(content.taxonomy),
        thumbnailUrl: thumbnailUrl + imageLoc,
        timespent: content.timeSpent || content.timespent,
        title: content.title,
        type: content.type,
        updatedAt: content.updatedAt
      });
    }
    return serializedPortfolioItem;
  },

  /**
   * @function serializeActivityAttempts
   * @param {Object} activityAttemptsObject
   * @return {Ember.Array}
   * Method to serialize list of activity attempts
   */
  serializeActivityAttempts(activityAttemptsObject) {
    const serializer = this;
    let activityAttempts = Ember.A([]);
    if (activityAttemptsObject && activityAttemptsObject.usageData.length) {
      let attemptsList = activityAttemptsObject.usageData;
      attemptsList.map(attempt => {
        activityAttempts.pushObject(
          serializer.normalizeActivityAttemptObject(attempt)
        );
      });
    }
    return activityAttempts;
  },

  /**
   * @function serializeActivityPerformance
   * @param {Object} payload
   * @return {Ember.Object}
   * Method to serialize activity performance
   */
  serializeActivityPerformance(payload) {
    const serializer = this;
    let collection = payload.collection || payload.assessment;
    let resources = payload.resources || payload.questions;
    return Ember.Object.create({
      score: collection ? collection.score : null,
      collectionId: collection ? collection.id : null,
      timespent: collection ? collection.timespent : null,
      resourceResults: resources
        ? serializer.normalizeResourceResults(resources)
        : [],
      reaction: collection ? collection.reaction : null,
      submittedAt:
        collection && collection.eventTime
          ? toLocal(collection.eventTime)
          : null,
      type: collection ? collection.type : null
    });
  },

  /**
   * @function normalizeResourceResults
   * @param {Ember.Array} resourceResults
   * @return {Ember.Array}
   */
  normalizeResourceResults(resourceResults = Ember.A([])) {
    const serializer = this;
    let normalizedResourceResults = Ember.A([]);

    resourceResults.map(resourceResult => {
      normalizedResourceResults.pushObject(
        serializer.normalizeResourceResult(resourceResult)
      );
    });
    return normalizedResourceResults;
  },

  /**
   * @function normalizeResourceResult
   * @param {Object} resourceResult
   * @return {Ember.Object}
   */
  normalizeResourceResult(resourceResult) {
    const serializer = this;
    let questionType = resourceResult.questionType;
    let questionUtil = undefined;
    let answerObjects = undefined;
    let resourceType = resourceResult.resourceType;
    if (resourceType === 'question') {
      if (Object.values(QUESTION_TYPES).indexOf(questionType) <= -1) {
        questionType = getQuestionTypeByApiType(questionType);
      }
      answerObjects = serializer
        .get('analyticsSerializer')
        .normalizeAnswerObjects(resourceResult.answerObject, questionType);
      questionUtil = getQuestionUtil(questionType).create();
    }

    let eventTime = resourceResult.eventTime
      ? toLocal(resourceResult.eventTime)
      : null;
    let timespent = resourceResult.timespent || resourceResult.timeSpent;
    const resourceItem = Ember.Object.create({
      //Commons fields for real time and student collection performance
      resourceId: resourceResult.id,
      id: resourceResult.id,
      reaction: resourceResult.reaction,
      timespent,
      answerObject: resourceResult.answerObject,
      answerStatus:
        resourceResult.answerStatus ||
        (!resourceResult.score &&
        !(resourceResult.answerObject && resourceResult.answerObject.length) &&
        !timespent
          ? 'skipped'
          : 'completed'),
      userAnswer:
        resourceType === 'question'
          ? questionUtil.toUserAnswer(answerObjects)
          : null,
      correct: resourceResult.score > 0,
      score: resourceResult.score,
      title: resourceResult.title,
      maxScore: resourceResult.maxScore,
      resourceType,
      questionType,
      eventTime,
      isGraded: resourceResult.isGraded,
      evidence: resourceResult.evidence
    });
    if (resourceResult.subQuestions) {
      resourceItem.set(
        'subQuestions',
        resourceResult.subQuestions.map(item =>
          this.normalizeResourceResult(item)
        )
      );
    }
    return resourceItem;
  },

  /**
   * @function normalizeActivityAttemptObject
   * @param {Object} attempt
   * @return {Ember.Object}
   */
  normalizeActivityAttemptObject(attempt) {
    return Ember.Object.create({
      classId: attempt.classId,
      contentSource: attempt.contentSource,
      createdAt: attempt.createdAt,
      id: attempt.id,
      maxScore: attempt.maxScore,
      score: attempt.score,
      sessionId: attempt.sessionId,
      timespent: attempt.timespent,
      type: attempt.type,
      updatedAt: attempt.updatedAt,
      dcaContentId: attempt.dcaContentId || undefined,
      courseId: attempt.courseId || undefined,
      unitId: attempt.unitId || undefined,
      lessonId: attempt.lessonId || undefined,
      status: attempt.status
    });
  },

  /**
   * Normalize the Read Profile endpoint response
   * @param payload is the endpoint response in JSON format
   * @returns {ProfileModel} a profile model object
   */
  normalizeOwner: function(owner) {
    const serializer = this;
    let ownerObject = Ember.Object.create({
      id: null,
      firstName: null,
      lastName: null,
      username: null,
      fullName: null,
      displayName: null,
      thumbnailUrl: null
    });
    if (owner) {
      const basePath = serializer.get('session.cdnUrls.user');
      const appRootPath = this.get('appRootPath'); //configuration appRootPath
      const thumbnailUrl = owner.thumbnail
        ? basePath + owner.thumbnail
        : appRootPath + DEFAULT_IMAGES.USER_PROFILE;

      ownerObject.setProperties({
        id: owner.id,
        firstName: owner.firstName,
        lastName: owner.lastName,
        username: owner.username,
        fullName: `${owner.lastName}, ${owner.firstName}`,
        displayName: owner.displayName,
        thumbnailUrl
      });
    }
    return ownerObject;
  }
});
