import Ember from 'ember';
import {
  PLAYER_EVENT_SOURCE,
  ROLES,
  PLAYER_EVENT_MESSAGE,
  FEEDBACK_USER_CATEGORY,
  CONTENT_TYPES
} from 'gooru-web/config/config';
import ModalMixin from 'gooru-web/mixins/modal';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Controller.extend(TenantSettingsMixin, ModalMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  queryParams: [
    'caContentId',
    'classId',
    'role',
    'isPreview',
    'source',
    'isIframeMode'
  ],

  // -------------------------------------------------------------------------
  // Dependencies
  oaAnalyticsService: Ember.inject.service(
    'api-sdk/offline-activity/oa-analytics'
  ),

  session: Ember.inject.service('session'),

  oaService: Ember.inject.service('api-sdk/offline-activity/offline-activity'),

  /**
   * @property {activityFeedbackService}
   */
  activityFeedbackService: Ember.inject.service('api-sdk/activity-feedback'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click on start player
    onStartPlayer() {
      const controller = this;
      controller.set('isShowStartPlayer', false);
    },

    //Action triggered when click on close player
    onClosePlayer: function() {
      const controller = this;
      const classId = controller.get('classId');
      const source = controller.get('source');
      const isIframeMode = controller.get('isIframeMode');
      //Redirect to CA if class ID is available otherwise go back to last accessed url
      if (isIframeMode) {
        window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
      } else if (classId) {
        controller.transitionToRoute('student.class.class-activities', classId);
      } else if (source === PLAYER_EVENT_SOURCE.RGO) {
        window.close();
      } else {
        window.history.back();
      }
    },

    toggleDetailPullup() {
      this.toggleProperty('isFullView');
    },

    showTimer() {
      this.toggleProperty('isShowStudyTimerWidget');
    },

    onCompleteOA() {
      this.set('isShowCompletionConfirmation', true);
    },

    onCancelCompletion() {
      this.set('isShowCompletionConfirmation', false);
    },

    onCompleteSubmission() {
      this.set('tiggerAction', true);
      this.set('isShowCompletionConfirmation', false);
      this.set('isEnableCompleteButton', false);
    },
    /**
     * Action triggered to remix the collection
     * @param content
     */
    remixOaAcitivity: function(offlineActivity) {
      let component = this;
      if (this.get('session.isAnonymous')) {
        this.send('showModal', 'content.modals.gru-login-prompt');
      } else {
        component
          .get('oaService')
          .readActivity(offlineActivity.id)
          .then(function(result) {
            let model = {
              content: result,
              lessonId: offlineActivity.lessonId,
              unitId: offlineActivity.unitId,
              courseId: offlineActivity.courseId,
              isCollection: false,
              isOfflineActivity: true,
              onRemixSuccess: component.get('onRemixLessonItem')
            };
            component.send('showModal', 'content.modals.gru-oa-remix', model);
          });
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {UUID} caContentId
   * DCA content ID
   */
  caContentId: null,
  /**
   * @property {collection} collection - The current Collection
   */
  collection: null,
  /**
   * @property {UUID} offlineActivityId
   */
  offlineActivityId: null,

  /**
   * @property {UUID} classId
   */
  classId: null,

  /**
   * @property {Object} role
   * Default role value
   */
  role: ROLES.STUDENT,

  /**
   * @property {Boolean} isShowStartPlayer
   */
  isShowStartPlayer: Ember.computed('offlineActivitySubmissions', function() {
    const controller = this;
    const offlineActivitySubmissions = controller.get(
      'offlineActivitySubmissions'
    );
    const oaTaskSubmissions = offlineActivitySubmissions
      ? offlineActivitySubmissions.tasks.objectAt(0)
      : null;
    return !(oaTaskSubmissions && oaTaskSubmissions.taskId);
  }),

  /**
   * @property {Object} offlineActivity
   */
  offlineActivity: {},

  /**
   * @property {Boolean} isPreview
   */
  isPreview: false,

  /**
   * @property {Boolean} isTeacher
   */
  isTeacher: Ember.computed.equal('role', ROLES.TEACHER),

  /**
   * @property {Object} offlineActivitySubmissions
   * Property for selected offline activity submissions
   */
  offlineActivitySubmissions: null,

  isFullView: false,

  isShowStudyTimerWidget: false,

  activityTasks: Ember.computed.alias('offlineActivity.tasks'),

  isActivitySubmitted: Ember.computed('offlineActivitySubmissions', function() {
    const activitySubmissions = this.get('offlineActivitySubmissions');
    const isSumbitted = activitySubmissions && activitySubmissions.sessionId;
    return isSumbitted;
  }),

  offlineActivityWatcher: Ember.observer(
    'offlineActivity.tasks.@each.isAddedMandatorySubmission',
    'offlineActivity.tasks.@each.isTaskSubmitted',
    'offlineActivity.tasks',
    'isActivitySubmitted',
    function() {
      const activityTasks = this.get('offlineActivity.tasks');
      if (
        activityTasks &&
        activityTasks.length > 0 &&
        !this.get('isActivitySubmitted')
      ) {
        const isInCompleteTaskAvailable = activityTasks.filter(
          task => !task.isAddedMandatorySubmission && task.isEvidenceRequired
        );
        const isUnSubmittedTaskAvailable = activityTasks.filter(
          task => !task.isTaskSubmitted && task.isEvidenceRequired
        );
        let enableCompletionButton = !(
          isInCompleteTaskAvailable.length || isUnSubmittedTaskAvailable.length
        );
        this.set('isEnableCompleteButton', enableCompletionButton);
      } else {
        this.set('isEnableCompleteButton', false);
      }
    }
  ),

  isEnableCompleteButton: false,

  isShowCompletionConfirmation: false,

  tiggerAction: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadOfflineActivitySubmissions
   * Method to load offline activity submissions
   */
  loadOfflineActivitySubmissions() {
    const controller = this;
    controller.set('isLoading', true);
    Ember.RSVP.hash({
      offlineActivitySubmissions: !(
        controller.get('isPreview') &&
        (controller.get('isTeacher') ||
          controller.get('source') === PLAYER_EVENT_SOURCE.RGO)
      )
        ? controller.fetchTasksSubmissions()
        : null
    }).then(({ offlineActivitySubmissions }) => {
      controller.set('offlineActivitySubmissions', offlineActivitySubmissions);
      controller.set('isLoading', false);
    });
  },

  /**
   * @function fetchTasksSubmissions
   * Method to fetch student submitted oa task data
   */
  fetchTasksSubmissions() {
    const component = this;
    const classId = component.get('classId');
    const oaId = component.get('caContentId');
    const userId = component.get('session.userId');
    return component
      .get('oaAnalyticsService')
      .getSubmissionsToGrade(classId, oaId, userId);
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
        let type = CONTENT_TYPES.OFFLINE_ACTIVITY;
        let contentCategory = categoryLists.get('offlineActivities');
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
  }
});
