import Ember from 'ember';
import {
  ROLES,
  CONTENT_TYPES,
  PLAYER_EVENT_MESSAGE,
  FEEDBACK_USER_CATEGORY,
  FEEDBACK_RATING_TYPE
} from 'gooru-web/config/config';
import { roundFloat } from 'gooru-web/utils/math';
import { generateUUID } from 'gooru-web/utils/utils';
import ActivityFeedbackMixin from 'gooru-web/mixins/activity-feedback-mixin';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import sha1 from 'sha1';
import Env from '../config/environment';
const ConfigEvent = Env.events || {};
/**
 * Study Player External Controller
 *
 * @module
 */
export default Ember.Controller.extend(
  ActivityFeedbackMixin,
  TenantSettingsMixin,
  {
    queryParams: [
      'resourceId',
      'role',
      'type',
      'sourceId',
      'classId',
      'courseId',
      'collectionId',
      'unitId',
      'lessonId',
      'milestoneId',
      'source',
      'isIframeMode'
    ],

    // -------------------------------------------------------------------------
    // Dependencies
    /**
     * @property {CourseMapService}
     */
    courseMapService: Ember.inject.service('api-sdk/course-map'),

    /**
     * @property {NavigateMapService}
     */
    navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

    studyPlayerController: Ember.inject.controller('study-player'),

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

    /**
     * @dependency {i18nService} Service to retrieve translations information
     */
    i18n: Ember.inject.service(),

    session: Ember.inject.service('session'),

    analyticsService: Ember.inject.service('api-sdk/analytics'),

    eventsService: Ember.inject.service('api-sdk/events'),

    portfolioService: Ember.inject.service('api-sdk/portfolio'),

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      /**
       * Action triggered for the next button
       */
      playNext: function() {
        let controller = this;
        controller.set('playerEvents', null);
        let submittedDataParams = controller.get('dataParams');
        let submittedScoreInPercentage = submittedDataParams
          ? controller.getScoreInPercentage(submittedDataParams)
          : null;
        controller.playNextContent(submittedScoreInPercentage);
      },

      /**
       * Action triggered for the next button
       */
      onFeedbackCapture() {
        const controller = this;
        controller.set('isLoading', true);

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

      /**
       * Action triggered when toggle screen view
       */
      onToggleScreen() {
        let controller = this;
        let studyPlayerController = controller.get('studyPlayerController');
        let isFullScreen = studyPlayerController.get('isFullScreen');
        studyPlayerController.set('isFullScreen', !isFullScreen);
        controller.set('isFullScreen', !isFullScreen);
        if (isFullScreen) {
          Ember.$('body')
            .removeClass('fullscreen')
            .addClass('fullscreen-exit');
        } else {
          Ember.$('body')
            .removeClass('fullscreen-exit')
            .addClass('fullscreen');
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
      },

      onStartContentPlayed() {
        let controller = this;
        let collection = controller.get('collection');
        let eventContext = controller.getEventParams('start');
        controller.set('isContentPlayed', true);
        controller.setLastPlayedContent(collection.get('id'), eventContext);
        controller.openConfirmAlertBox('start');
        controller
          .get('eventsService')
          .saveExternalCollection(eventContext)
          .then();
      },

      toggleDetailPullup() {
        this.toggleProperty('isShowFullView');
      },

      showTimer() {
        this.toggleProperty('isShowTimeSpent');
      },

      onPlayerAction(action) {
        this.set('playerEvents', action);
      },

      onVisibilityChange() {
        this.visibilityChange();
      },

      onStopPlayContentEvent(score) {
        this.openConfirmAlertBox('stop');
        this.stopPlayContentEvent(score);
      },

      showFeedbackContainer() {
        this.toggleProperty('isShowFeedbackContainer');
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
     * Indicates if it should show the back button
     * @property {boolean}
     */
    showBackButton: false,

    /**
     * @property {String} It decide to show the back to course map or not.
     */
    showBackToCourseMap: true,

    /**
     * Indicates if it should default player header
     * @property {boolean}
     */
    showPlayerHeader: false,

    /**
     * Current map location
     * @property {MapLocation}
     */
    mapLocation: null,

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

    /**
     * @property {boolean} isShowFeedback
     * Property to show/hide feedback component
     */
    isShowFeedback: false,

    isShowFeedbackContainer: false,

    /**
     * Resets to default values
     */
    resetValues: function() {
      //TODO: call the parent reset values method
      this.setProperties({
        collectionId: null,
        resourceId: null,
        type: null
      });
    },

    /**
     * @property {Boolean} isFullScreen
     */
    isFullScreen: Ember.computed(function() {
      let controller = this;
      let studyPlayerController = controller.get('studyPlayerController');
      let isFullScreen = studyPlayerController.get('isFullScreen');
      return isFullScreen;
    }),

    /**
     * @property {Boolean} isEnableFullScreen
     * Property to enable/disable fullscreen mode
     */
    isEnableFullScreen: Ember.computed('tenantSettingsObj', function() {
      let tenantSetting = this.get('tenantSettingsObj');
      return tenantSetting &&
        tenantSetting.ui_element_visibility_settings &&
        tenantSetting.ui_element_visibility_settings
          .enable_study_player_fullscreen_mode === true
        ? tenantSetting.ui_element_visibility_settings
          .enable_study_player_fullscreen_mode
        : false;
    }),

    isAsssessment: Ember.computed('type', function() {
      let controller = this;
      let type = controller.get('type');
      return type === 'assessment-external';
    }),

    /**
     * @property {Boolean} isOfflineActivity
     * Property to whether the current item is an Offline Activity or not
     */
    isOfflineActivity: Ember.computed('type', function() {
      const component = this;
      return component.get('type') === CONTENT_TYPES.OFFLINE_ACTIVITY;
    }),

    isDone: false,

    /**
     * @property {Boolean} isShowOaLandingPage
     * Property to show/hide OA landing page
     */
    isShowOaLandingPage: true,

    /**
     * @property {Boolean}
     */
    isPublicClass: Ember.computed.alias('class.isPublic'),

    /**
     * @property {Boolean} isContentPlayed
     *
     */
    isContentPlayed: false,

    /**
     * @property {String} timeZone
     */
    timeZone: Ember.computed(function() {
      return moment.tz.guess() || null;
    }),

    contentResponces: null,

    eventId: generateUUID(),

    startTime: new Date().getTime(),

    endTime: new Date().getTime(),

    setLastPlayedContent(contextId, eventContext) {
      const lastPlayedContent = {
        contextId,
        eventContext
      };
      window.lastPlayedContent = lastPlayedContent;
    },

    sessionId: generateUUID(),

    isShowTimeSpent: false,

    playerEvents: null,

    isShowFullView: false,

    hideContinue: false,

    // -------------------------------------------------------------------------
    // Methods

    /**
     * Initialize once Component Initialize
     */
    init() {
      this.set('bgUrl', this.tenantSettingBgCheck());
    },

    openConfirmAlertBox(isShow) {
      if (isShow === 'start') {
        $(document).ready(function() {
          $(window).bind('beforeunload', function() {
            return confirm('message');
          });
        });
        window.addEventListener('beforeunload', event => {
          // Cancel the event as stated by the standard.
          event.preventDefault();
          // Chrome requires returnValue to be set.
          event.returnValue = '';
        });
      }
    },

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

      window.lastPlayedResource = null;
      $(document).on('visibilitychange', function() {
        controller.visibilityChange();
      });
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
          let nextContentType = mapLocation.get('context.itemType');
          if (status === 'done') {
            controller.setProperties({
              isDone: true,
              hasAnySuggestion: false
            });
          } else {
            if (
              nextContentType === CONTENT_TYPES.EXTERNAL_ASSESSMENT ||
              nextContentType === CONTENT_TYPES.EXTERNAL_COLLECTION ||
              nextContentType === CONTENT_TYPES.OFFLINE_ACTIVITY
            ) {
              controller.set(
                'hideContinue',
                nextContentType !== CONTENT_TYPES.OFFLINE_ACTIVITY
              );
              controller.playNextExternalContent(mapLocation);
            } else {
              controller.toPlayer();
            }
          }
        });
    },

    /**
     * @function playNextExternalContent
     * Method to play external content as next item
     */
    playNextExternalContent(mapLocation) {
      const controller = this;
      const context = mapLocation.get('context');
      const courseId = context.get('courseId');
      const unitId = context.get('unitId');
      const lessonId = context.get('lessonId');
      const collectionId = context.get('itemId');
      const collectionType = context.get('itemType');
      let unit = controller.get('unit');
      let lesson = controller.get('lesson');
      let lastPlayedUnitId = unit.get('id');
      let lastPlayedLessonId = lesson.get('id');
      controller.set('isLoading', true);
      return Ember.RSVP.hash({
        //loading breadcrumb information and navigation info
        unit:
          lastPlayedUnitId !== unitId
            ? controller.get('unitService').fetchById(courseId, unitId)
            : unit,
        lesson:
          lastPlayedLessonId !== lessonId
            ? controller
              .get('lessonService')
              .fetchById(courseId, unitId, lessonId)
            : lesson,
        collection:
          collectionType === CONTENT_TYPES.EXTERNAL_ASSESSMENT
            ? controller
              .get('assessmentService')
              .readExternalAssessment(collectionId)
            : collectionType === CONTENT_TYPES.OFFLINE_ACTIVITY
              ? controller
                .get('offlineActivityService')
                .readActivity(collectionId)
              : controller
                .get('collectionService')
                .readExternalCollection(collectionId)
      }).then(({ unit, lesson, collection }) => {
        controller.setProperties({
          unitId: unit.get('id'),
          lessonId: lesson.get('id'),
          collectionId: collection.get('id'),
          type: collectionType,
          unit,
          lesson,
          collection,
          mapLocation,
          content: mapLocation.get('content'),
          dataParams: null,
          isShowOaLandingPage: true, //By default show OA Landing page
          isLoading: false
        });
      });
    },

    /**
     * @function getScoreInPercentage
     * Method to get score in percentage
     */
    getScoreInPercentage(dataParams) {
      let scoreInPercentage = dataParams.percent_score;
      if (!scoreInPercentage) {
        let score = parseInt(dataParams.score);
        let maxScore = parseInt(dataParams.max_score);
        scoreInPercentage = (score / maxScore) * 100;
      }
      return roundFloat(scoreInPercentage);
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
        content_type: controller.get('type'),
        user_category_id: userCategoryId,
        user_feedbacks: userFeedback,
        user_id: userId
      };
      return userFeedbackObj;
    },

    LUContentURLGeneration() {
      let controller = this;
      let content = controller.get('collection');
      let collectionId = content.get('id');
      let collectionType = controller.get('type');
      let contentURL = content.get('url');
      let userId = controller.get('session.userId');
      let toolConfig = controller.get('toolDetails.toolConfig');
      let additionalParams = toolConfig.additional_query_params;
      let key = toolConfig.key;
      let username = additionalParams
        ? additionalParams.username
        : 'goorupartner';
      let params = new URL(contentURL).searchParams;
      let lessionId = params.get('lesson_id');
      let token = sha1(userId + lessionId + key);
      let host = window.location.host;
      let callbackURL = `${host}/player-external-collection/${collectionId}/${collectionType}`;
      let addtionalParams = `&token=${token}&student_id=${userId}&username=${username}&subdomain=${callbackURL}&high_score=100`;
      let url = contentURL + addtionalParams;
      content.set('url', url);

      /**
       * method used to listen the events from iframe.
       **/
      function receiveMessage(event) {
        if (
          event.data.message === PLAYER_EVENT_MESSAGE.GRU_CALLBACK_SUCCESSFULLY
        ) {
          controller.set('contentResponces', event.data.queryParams);
          controller.stopPlayContentEvent(null);
        }
      }

      window.addEventListener('message', receiveMessage, false);
    },

    getEventParams(eventType) {
      let controller = this;
      let eventId = controller.get('eventId');
      let apiKey = ConfigEvent.eventAPIKey;
      let mapLocation = controller.get('mapLocation');
      let context = mapLocation.get('context');
      let userId = controller.get('session.userId');

      var eventData = [
        {
          eventId: eventId,
          eventName: 'collection.play',
          context: {
            type: eventType,
            contentGooruId: context.get('collectionId'),
            collectionType: context.get('itemType'),
            courseGooruId: context.get('courseId'),
            classGooruId: context.get('classId'),
            unitGooruId: context.get('unitId'),
            lessonGooruId: context.get('lessonId'),
            tenantId: controller.get('session.tenantId'),
            pathId: context.get('pathId'),
            contentSource: controller.get('source')
          },
          payLoadObject: {
            gradingType: 'system',
            isStudent: true
          },
          session: {
            apiKey: apiKey,
            sessionId: controller.get('sessionId')
          },
          user: {
            gooruUId: userId
          },
          version: {
            logApi: ConfigEvent.apiVersion
          },
          metrics: {},
          timezone: controller.get('timeZone'),
          startTime: controller.get('startTime'),
          endTime: controller.get('endTime')
        }
      ];

      return eventData;
    },

    visibilityChange() {
      let controller = this;
      let collection = controller.get('collection');
      if (window.lastPlayedContent && window.lastPlayedContent.contextId) {
        if (document.hidden) {
          let eventContext = controller.getEventParams('pause');
          eventContext[0].endTime = new Date().getTime();
          controller.setLastPlayedContent(collection.get('id'), eventContext);
          controller
            .get('eventsService')
            .saveExternalCollection(eventContext)
            .then();
        } else {
          let eventContext = controller.getEventParams('resume');
          eventContext[0].startTime = new Date().getTime();
          eventContext[0].endTime = new Date().getTime();
          controller.setLastPlayedContent(collection.get('id'), eventContext);
          controller
            .get('eventsService')
            .saveExternalCollection(eventContext)
            .then();
        }
      }
    },

    stopPlayContentEvent(score) {
      let controller = this;
      let eventContext = controller.getEventParams('stop');
      eventContext[0].endTime = new Date().getTime();
      let contentScore = controller.get('contentResponces.contentScore');
      let finalScore =
        score || score === 0
          ? Math.round(score)
          : contentScore
            ? Number(contentScore)
            : 0;
      eventContext[0].metrics.score = finalScore;
      controller
        .get('eventsService')
        .saveExternalCollection(eventContext)
        .then(function() {
          let collection = controller.get('collection');
          let mapLocation = controller.get('mapLocation');
          let context = mapLocation.get('context');
          let userId = controller.get('session.userId');
          let itemId = collection.get('id');
          let sessionId = controller.get('sessionId');
          let contentSource = controller.get('source');
          let contentType = context
            .get('itemType')
            .includes(CONTENT_TYPES.ASSESSMENT)
            ? CONTENT_TYPES.ASSESSMENT
            : CONTENT_TYPES.COLLECTION;
          const requestParams = {
            userId,
            itemId,
            sessionId,
            contentSource
          };
          controller
            .get('portfolioService')
            .getActivityPerformanceBySession(requestParams, contentType)
            .then(function(summaryData) {
              $(document).off('visibilitychange');
              let queryParams = {
                collectionId: collection.get('id'),
                classId: context.get('classId'),
                courseId: context.get('courseId'),
                isIframeMode: true,
                role: controller.get('session.role'),
                type: controller.get('type'),
                score: summaryData.get('score'),
                timespent: summaryData.get('timespent'),
                isStudyPlayer: false,
                source: controller.get('source')
              };
              controller.set('isContentPlayed', false);
              controller.transitionToRoute(
                'reports.study-student-external-collection',
                {
                  queryParams: queryParams
                }
              );
            });
        });
    }
  }
);
