import Ember from 'ember';
import {
  PLAYER_EVENT_MESSAGE,
  FEEDBACK_USER_CATEGORY,
  CONTENT_TYPES
} from 'gooru-web/config/config';
import { generateUUID } from 'gooru-web/utils/utils';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import sha1 from 'sha1';
import Env from '../config/environment';
import ModalMixin from 'gooru-web/mixins/modal';

const ConfigEvent = Env.events || {};

export default Ember.Controller.extend(TenantSettingsMixin, ModalMixin, {
  // -------------------------------------------------------------------------
  // Attributes
  queryParams: [
    'role',
    'type',
    'classId',
    'collectionId',
    'source',
    'courseId',
    'unitId',
    'lessonId',
    'isIframeMode',
    'isPreviewReferrer',
    'caContentId'
  ],

  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  /**
   * @property {activityFeedbackService}
   */
  activityFeedbackService: Ember.inject.service('api-sdk/activity-feedback'),

  analyticsService: Ember.inject.service('api-sdk/analytics'),

  eventsService: Ember.inject.service('api-sdk/events'),

  portfolioService: Ember.inject.service('api-sdk/portfolio'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onStartContentPlayed() {
      let controller = this;
      let collection = controller.get('externalResource');
      let eventContext = controller.getEventParams('start');
      controller.set('isContentPlayed', true);
      controller.setLastPlayedContent(collection.get('id'), eventContext);
      controller.openConfirmAlertBox('start');
      controller
        .get('eventsService')
        .saveExternalCollection(eventContext)
        .then();
    },

    onVisibilityChange() {
      this.visibilityChange();
    },

    onStopPlayContentEvent(score) {
      this.openConfirmAlertBox('stop');
      this.stopPlayContentEvent(score);
    },

    /**
     * Action triggered when toggle screen mode
     */
    onToggleScreen() {
      let component = this;
      component.toggleScreenMode();
    },
    remixCollection: function() {
      let collection = this.get('externalResource');
      const type =
        this.get('type') === 'collection-external'
          ? 'collections-external'
          : 'assessments-external';
      collection.set('type', type);
      var remixModel = {
        content: collection
      };
      if (this.get('type') === 'collection-external') {
        this.send(
          'showModal',
          'content.modals.gru-collection-remix',
          remixModel
        );
      } else {
        this.send(
          'showModal',
          'content.modals.gru-assessment-remix',
          remixModel
        );
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {UUID} userId
   * Current logged in user Id
   */
  userId: Ember.computed.alias('session.userId'),

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

  /**
   * @property {Boolean} isFullScreen
   * Property to enable/disable fullscreen mode
   */
  isFullScreen: false,

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

  /**
   * Initialize once Component Initialize
   */
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

  // -------------------------------------------------------------------------
  // Events
  intializeLtiTool: function() {
    this.set('isContentPlayed', true);
  },
  initialize: function() {
    let controller = this;
    let content = controller.get('externalResource');
    let collectionId = content.get('id');
    let collectionType = controller.get('type');
    let contentURL = content.get('url');
    let userId = controller.get('userId');
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

    window.lastPlayedResource = null;
    $(document).on('visibilitychange', function() {
      controller.visibilityChange();
    });
  },

  // -------------------------------------------------------------------------
  // Methods

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

  getEventParams(eventType) {
    let controller = this;
    let eventId = controller.get('eventId');
    let apiKey = ConfigEvent.eventAPIKey;
    let mapLocation = controller.get('mapLocation');
    let context = mapLocation.get('context');
    let userId = controller.get('session.userId');

    let contextInfo = null;
    if (controller.get('caContentId')) {
      contextInfo = btoa(
        JSON.stringify({ dcaContentId: controller.get('caContentId') })
      );
    }

    var eventData = [
      {
        eventId: eventId,
        eventName: 'collection.play',
        context: {
          type: eventType,
          contentGooruId: context.get('collectionId'),
          collectionType: context.get('itemType'),
          courseGooruId: context.get('courseId'),
          classGooruId: context.get('classId') ? context.get('classId') : null,
          unitGooruId: context.get('unitId'),
          lessonGooruId: context.get('lessonId'),
          tenantId: controller.get('session.tenantId'),
          pathId: context.get('pathId'),
          contentSource: controller.get('source'),
          additionalContext: contextInfo
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
    let collection = controller.get('externalResource');
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

  stopPlayContentEvent(score, isClose = true) {
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
        let collection = controller.get('externalResource');
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
              source: controller.get('source'),
              isPreviewReferrer: controller.get('isPreviewReferrer')
            };
            controller.set('isContentPlayed', false);
            if (isClose) {
              controller.transitionToRoute(
                'reports.student-external-collection',
                {
                  queryParams: queryParams
                }
              );
            }
          });
      });
  },

  /**
   * @function toggleScreenMode
   * Method to toggle fullscreen mode
   */
  toggleScreenMode() {
    let component = this;
    Ember.$('body').toggleClass('fullscreen');
    component.toggleProperty('isFullScreen');
  }
});
