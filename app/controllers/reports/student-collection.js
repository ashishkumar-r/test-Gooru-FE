import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import {
  FEEDBACK_USER_CATEGORY,
  CONTENT_TYPES,
  SCORES,
  ROLES,
  FEEDBACK_RATING_TYPE,
  PLAYER_EVENT_MESSAGE
} from 'gooru-web/config/config';
import { getSubjectId } from 'gooru-web/utils/taxonomy';
import { getMasteryMinScore } from 'gooru-web/utils/tenant';
import ReportMixin from 'gooru-web/mixins/reports/player-report-mixin';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

/**
 *
 * Controls the access to the analytics data for a
 * student related to a collection of resources
 *
 */

export default Ember.Controller.extend(
  ConfigurationMixin,
  ReportMixin,
  TenantSettingsMixin,
  {
    queryParams: [
      'classId',
      'courseId',
      'unitId',
      'lessonId',
      'collectionId',
      'userId',
      'type',
      'role',
      'contextId',
      'source',
      'minScore',
      'milestoneId',
      'isIframeMode'
    ],
    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * @requires service:api-sdk/taxonomy
     */
    taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

    session: Ember.inject.service('session'),

    /**
     * @property {activityFeedbackService}
     */
    activityFeedbackService: Ember.inject.service('api-sdk/activity-feedback'),

    tenantService: Ember.inject.service('api-sdk/tenant'),

    i18n: Ember.inject.service(),

    init() {
      this.set('bgUrl', this.tenantSettingBgCheck());
    },
    // -------------------------------------------------------------------------
    // Actions

    actions: {
      showTimer() {
        this.toggleProperty('isShowStudyTimer');
      },

      showFeedbackContainer() {
        this.toggleProperty('isShowFeedbackContainer');
      },

      submitUserFeedback() {
        let controller = this;
        let categoryLists = controller.get('userCategoryFeedback');
        if (categoryLists && categoryLists.length) {
          let learningFeedback = controller.getFeedbackObject();
          controller
            .get('activityFeedbackService')
            .submitUserFeedback(learningFeedback)
            .then(() => {
              this.set('isShowFeedbackContainer', false);
              this.set('isShowStudyTimer', false);
              window.parent.postMessage(
                PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE,
                '*'
              );
            });
        } else {
          window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
        }
      }
    },

    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {string} indicates if it is collection or assessment
     */
    type: null,

    /**
     * @property {string} indicates if it is a student or teacher view
     */
    role: null,

    /**
     * Indicates the component of the application that is originating the events
     * @property {String} source
     */
    source: null,

    /**
     * @property {Boolean} isAnonymous
     */
    isAnonymous: Ember.computed.alias('session.isAnonymous'),

    isIframeMode: false,

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

    masteryMinScore: SCORES.VERY_GOOD,

    /**
     * @property {boolean} showCorrectAnswer
     * Property to show/hide correct answer toggle
     */
    showCorrectAnswer: Ember.computed('currentClass', function() {
      let showCorrectAnswer = true;
      let currentClass = this.get('currentClass');
      if (currentClass) {
        let setting = currentClass.get('setting');
        if (setting) {
          showCorrectAnswer =
            setting.show_correct_answer || setting['show.correct.answer'];
        }
      }
      return showCorrectAnswer === undefined ? true : showCorrectAnswer;
    }),

    /**
     * @property {boolean} isAnswerKeyHidden - Should the answer key be hidden?
     */
    isAnswerKeyHidden: Ember.computed(
      'showCorrectAnswer',
      'masteryMinScore',
      function() {
        let controller = this;
        let minScore = controller.get('minScore');
        let showCorrectAnswer = controller.get('showCorrectAnswer');
        let masteryMinScore = controller.get('masteryMinScore');
        let averageScore = controller.get('attemptData.averageScore');
        let attempts = controller.get('collectionObj.attempts');
        let totalAttempts = controller.get('totalAttempts').length;
        let role = controller.get('role');
        let type = controller.get('type');
        if (role === ROLES.STUDENT && type === CONTENT_TYPES.ASSESSMENT) {
          let answerKeyHidden =
            showCorrectAnswer &&
            ((minScore && minScore <= averageScore) ||
              averageScore >= masteryMinScore ||
              attempts === totalAttempts);
          return !answerKeyHidden;
        }
        return !controller.get('showCorrectAnswer');
      }
    ),

    /**
     * @property {boolean} showExemplarText
     * Property to show exemplar text
     */
    showExemplarText: Ember.computed('currentClass', function() {
      const component = this;
      const classData = component.get('currentClass');
      return component.isShowExemplarText(classData);
    }),

    /**
     * @property {Boolean}
     */
    isPublicClass: Ember.computed.alias('currentClass.isPublic'),

    /**
     * @property {boolean} isShowStudyTimer
     * Property to show/hide study timer component
     */
    isShowStudyTimer: false,

    // -------------------------------------------------------------------------
    // Methods

    /**
     * @function findCompletionMinScore
     * @return {Number | Promise}
     * Method to find completion min score based on assessment subject
     * and framework tagged with class/tenants frameworks
     * otherwise it will be either teanant's default score or Gooru's default score
     */
    findCompletionMinScore() {
      const controller = this;
      const assessment = this.get('collectionObj');
      const classId =
        this.get('classId') || this.get('mapLocation.context.classId');
      const assessmentGutCodes = assessment.get('gutCodes');
      if (classId && assessmentGutCodes && assessmentGutCodes.length) {
        return Ember.RSVP.hash({
          classData: classId
            ? controller.get('currentClass')
            : Ember.RSVP.resolve({}),
          tenantSetting: this.getTenantSetting()
        }).then(({ classData, tenantSetting }) => {
          const assSubject = getSubjectId(assessmentGutCodes[0]);
          const tenantCompletionScore = getMasteryMinScore(
            assSubject,
            classData.preference,
            tenantSetting
          );
          controller.set(
            'masteryMinScore',
            tenantCompletionScore || SCORES.VERY_GOOD
          );
          return tenantCompletionScore || SCORES.VERY_GOOD;
        });
      }
      return Ember.RSVP.resolve(SCORES.VERY_GOOD);
    },

    /**
     * @function getTenantSetting
     * Method to get tenant setting for active user
     */
    getTenantSetting() {
      return this.get('tenantService').getActiveTenantSetting();
    },

    /**
     * @function fetchActivityFeedbackCateory
     * Method to fetch learning activity feedback
     */

    fetchActivityFeedbackCateory() {
      const controller = this;
      let role = controller.get('session.role');
      let userCategoryId = FEEDBACK_USER_CATEGORY[`${role}`];
      controller
        .get('activityFeedbackService')
        .getFeedbackCategory(userCategoryId)
        .then(categoryLists => {
          controller.set('categoryLists', categoryLists);
          let isCollection = controller.get('collection.isCollection');
          let type = isCollection
            ? CONTENT_TYPES.COLLECTION
            : CONTENT_TYPES.ASSESSMENT;
          let contentCategory = categoryLists.get(`${type}s`);
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
        } else if (
          category.feedbackTypeId === FEEDBACK_RATING_TYPE.QUALITATIVE
        ) {
          feedbackObj.user_feedback_qualitative = category.quality;
        }
        userFeedback.pushObject(feedbackObj);
      });
      let userFeedbackObj = {
        content_id: collection.get('id'),
        content_type: controller.get('format'),
        user_category_id: userCategoryId,
        user_feedbacks: userFeedback,
        user_id: userId
      };
      return userFeedbackObj;
    }
  }
);
