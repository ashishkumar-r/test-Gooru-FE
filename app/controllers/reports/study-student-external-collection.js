import Ember from 'ember';
import {
  ROLES,
  CONTENT_TYPES,
  PLAYER_EVENT_MESSAGE,
  FEEDBACK_USER_CATEGORY,
  FEEDBACK_RATING_TYPE
} from 'gooru-web/config/config';
import ActivityFeedbackMixin from 'gooru-web/mixins/activity-feedback-mixin';
/**
 *
 * Controls the access to the analytics data for a
 * student related to a collection of resources
 *
 */

export default Ember.Controller.extend(ActivityFeedbackMixin, {
  queryParams: [
    'collectionId',
    'classId',
    'courseId',
    'isIframeMode',
    'role',
    'type',
    'score',
    'timespent',
    'isStudyPlayer',
    'source'
  ],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  /**
   * @property {Ember.Service} Service to retrieve an assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Ember.Service} Service to retrieve a collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  offlineActivityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  /**
   * @type {UnitService} Service to retrieve unit information
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * @type {LessonService} Service to retrieve lesson information
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  // -------------------------------------------------------------------------
  // Actions

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Action triggered for the next button
     */
    playNext: function() {
      let controller = this;
      let collection = controller.get('collection');
      let submittedScoreInPercentage = collection.get('isAssessment')
        ? controller.get('score')
        : null;
      controller.playNextContent(submittedScoreInPercentage);
    },

    /**
     * Action triggered for the next button
     */
    onFeedbackCapture() {
      const controller = this;
      const userFeedback = controller.get('userCategoryFeedback');
      if (userFeedback && userFeedback.length) {
        let learningFeedback = controller.getFeedbackObject();
        controller
          .get('activityFeedbackService')
          .submitUserFeedback(learningFeedback)
          .then(() => {
            controller.send('playNext');
          });
      } else {
        controller.send('playNext');
      }
    },

    onExit(rouet, id) {
      const controller = this;
      let isIframeMode = controller.get('isIframeMode');
      if (isIframeMode) {
        window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
      } else {
        controller.transitionToRoute(rouet, id);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {string}
   */
  classId: null,

  /**
   * @property {string}
   */
  courseId: null,

  /**
   * @property {string}
   */
  collectionId: null,

  /**
   * @property {Object} dataParams
   * Submitted external assessment data params
   */
  dataParams: null,

  /**
   * @property {Boolean} isShowActivityFeedback
   * Property to evaluate whether the feedback tab should shown
   */
  isShowActivityFeedback: false,

  /**
   * @property {array[]} feedbackCategory
   * store feedback category list
   */
  feedbackCategory: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Initialize once Component Initialize
   */
  initial: function() {
    const controller = this;
    let type = controller.get('type');
    let contentCategory;
    controller.fetchActivityFeedbackCateory().then(() => {
      let categoryLists = controller.get('categoryLists');
      if (type === CONTENT_TYPES.OFFLINE_ACTIVITY) {
        contentCategory = categoryLists.get('offlineActivities');
      } else if (type === CONTENT_TYPES.EXTERNAL_ASSESSMENT) {
        contentCategory = categoryLists.get('externalAssessments');
      } else {
        contentCategory = categoryLists.get('externalCollections');
      }
      if (contentCategory && contentCategory.length) {
        controller.set('isShowActivityFeedback', true);
        controller.set(
          'feedbackCategory',
          contentCategory.sortBy('feedbackTypeId')
        );
        controller.set('format', type);
      } else {
        controller.set('isShowActivityFeedback', false);
        controller.set('feedbackCategory', null);
      }
    });
  },

  /**
   * @function getFeedbackObject
   * Method to return feedback objective
   */

  getFeedbackObject() {
    const controller = this;
    let userId = controller.get('session.userId');
    let role = controller.get('session.role')
      ? controller.get('session.role')
      : ROLES.STUDENT;
    let userCategoryId = FEEDBACK_USER_CATEGORY[`${role}`];
    let userFeedback = Ember.A([]);
    let categoryLists = controller.get('userCategoryFeedback');
    let collection = controller.get('collection');
    categoryLists.map(category => {
      let feedbackObj = {
        feeback_category_id: category.categoryId
      };
      if (category.feedbackTypeId === FEEDBACK_RATING_TYPE.QUANTITATIVE) {
        feedbackObj.user_feedback_quantitative = category.rating;
      } else if (category.feedbackTypeId === FEEDBACK_RATING_TYPE.BOTH) {
        feedbackObj.user_feedback_qualitative = category.comments;
      } else if (category.feedbackTypeId === FEEDBACK_RATING_TYPE.QUALITATIVE) {
        feedbackObj.user_feedback_qualitative = category.quality;
      }
      userFeedback.pushObject(feedbackObj);
    });
    let userFeedbackObj = {
      content_id: collection.get('id'),
      content_type: controller.get('type'),
      user_category_id: userCategoryId,
      user_feedbacks: userFeedback,
      user_id: userId
    };
    return userFeedbackObj;
  },

  /**
   * Navigate to study player to play next collection/assessment
   */
  toPlayer: function() {
    const context = this.get('mapLocation.context');
    let queryParams = {
      role: ROLES.STUDENT,
      source: this.get('source'),
      isIframeMode: this.get('isIframeMode')
    };
    let classId = context.get('classId');
    if (classId) {
      queryParams.classId = classId;
    }
    this.transitionToRoute('study-player', context.get('courseId'), {
      queryParams
    });
  },

  /**
   * @function playNextContent
   * Method to play next content
   */
  playNextContent: function(submittedScoreInPercentage) {
    const controller = this;
    const navigateMapService = this.get('navigateMapService');
    let context = this.get('mapLocation.context');
    context.score = submittedScoreInPercentage;
    navigateMapService
      .getStoredNext()
      .then(() => navigateMapService.next(context))
      .then(mapLocation => {
        let status = (mapLocation.get('context.status') || '').toLowerCase();
        if (status === 'done') {
          controller.setProperties({
            isDone: true,
            hasAnySuggestion: false
          });
        } else {
          controller.toPlayer();
        }
      });
  }
});
