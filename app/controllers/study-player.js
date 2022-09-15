import Ember from 'ember';
import PlayerController from 'gooru-web/controllers/player';
import StudyPlayer from 'gooru-web/mixins/study-player';
/**
 * Study Player Controller
 *
 * @module
 * @augments ember/PlayerController
 */
export default PlayerController.extend(StudyPlayer, {
  queryParams: [
    'resourceId',
    'role',
    'type',
    'subtype',
    'sourceId',
    'classId',
    'unitId',
    'lessonId',
    'collectionId',
    'source',
    'pathId',
    'minScore',
    'collectionSource',
    'isStudyPlayer',
    'pathType',
    'itemId',
    'isNotification',
    'milestoneId',
    'isIframeMode',
    'ctxPathId',
    'ctxPathType'
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

  /**
   * @type {AttemptService} attemptService
   * @property {Ember.Service} Service to send attempt related events
   */
  quizzesAttemptService: Ember.inject.service('quizzes/attempt'),

  session: Ember.inject.service('session'),

  /**
   * @dependency {i18nService} Service to retrieve translations information
   */
  i18n: Ember.inject.service(),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * If the user want to continue playing the collection
     */
    playActualCollection: function() {
      const navigateMapService = this.get('navigateMapService');
      navigateMapService
        .getStoredNext()
        .then(mapLocation => navigateMapService.next(mapLocation.context))
        .then(() => this.set('showSuggestion', false));
    },

    updateModel(option) {
      this.send('updateModelM', option);
    },

    onPlayNext: function() {
      const controller = this;
      let contextId =
        controller.get('contextResult.context.id') ||
        controller.get('contextResult.contextId');
      let profileId = controller.get('session.userData.gooruUId');
      const navigateMapService = controller.get('navigateMapService');
      controller
        .get('quizzesAttemptService')
        .getAttemptIds(contextId, profileId)
        .then(attemptIds =>
          !attemptIds || !attemptIds.length
            ? {}
            : controller
              .get('quizzesAttemptService')
              .getAttemptData(attemptIds[attemptIds.length - 1])
        )
        .then(attemptData =>
          Ember.RSVP.hash({
            attemptData,
            mapLocationNxt: navigateMapService.getStoredNext()
          })
        )
        .then(({ mapLocationNxt, attemptData }) => {
          if (controller.get('hasSuggestion')) {
            mapLocationNxt.context.set('status', 'content-served');
          }

          mapLocationNxt.context.set('score', attemptData.get('averageScore'));
          return navigateMapService.next(mapLocationNxt.context);
        })
        .then(({ context, suggestions, hasContent }) => {
          controller.set('mapLocation.context', context);
          controller.set('mapLocation.suggestions', suggestions);
          controller.set('mapLocation.hasContent', hasContent);
          let suggestedContent = controller.get('suggestedContent');
          if (suggestedContent) {
            controller.set('isShowSuggestion', true);
          } else {
            controller.checknPlayNext();
          }
        });
    },
    onEmptyNextPlay() {
      const controller = this;
      const mapLocation = controller.get('mapLocation');
      const navigateMapService = controller.get('navigateMapService');
      navigateMapService
        .getStoredNext()
        .then(function(mapLocationNxt) {
          if (controller.get('hasSuggestion')) {
            mapLocationNxt.context.set('status', 'content-served');
          }
          return navigateMapService.next(mapLocationNxt.context);
        })
        .then(({ context, suggestions, hasContent }) => {
          mapLocation.set('context', context);
          mapLocation.set('suggestions', suggestions);
          mapLocation.set('hasContent', hasContent);
          let suggestedContent = controller.get('suggestedContent');
          if (suggestedContent) {
            controller.set('isShowSuggestion', true);
          } else {
            controller.checknPlayNext();
          }
        });
    },

    onDiagnosticNext() {
      const controller = this;
      let contextId =
        controller.get('contextResult.context.id') ||
        controller.get('contextResult.contextId');
      let profileId = controller.get('session.userData.gooruUId');
      controller
        .get('quizzesAttemptService')
        .getAttemptIds(contextId, profileId)
        .then(attemptIds =>
          !attemptIds || !attemptIds.length
            ? {}
            : controller
              .get('quizzesAttemptService')
              .getAttemptData(attemptIds[attemptIds.length - 1])
        )
        .then(attemptData => {
          controller.set('isDiagnosticPlayer', true);
          controller.set('resourceId', null);
          controller
            .get('mapLocation.context')
            .set('score', attemptData.get('averageScore'));
          controller.playNextContent();
        });
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {string}
   */
  classId: null,

  /**
   * @property {Boolean}
   * Property to show/hide suggestion component
   */
  isShowSuggestion: false,

  /**
   * @property {Boolean}
   */
  isStatusDone: false,

  /**
   * @property {Json}
   * Computed property to store suggestedContent
   */
  suggestedContent: Ember.computed('mapLocation', function() {
    let controller = this;
    let suggestions = controller.get('mapLocation.suggestions');
    return suggestions ? suggestions[0] : null;
  }),

  /**
   * @property {string}
   */
  milestoneId: null,

  /**
   * @property {string}
   */
  unitId: null,

  /**
   * @property {string}
   */
  lessonId: null,

  /**
   * @property {string}
   */
  collectionId: null,

  /**
   * @property {string}
   */
  pathId: null,

  /**
   * student test report shows confetti badge.
   * @property {integer}
   */
  minScore: null,

  /**
   * Source of collection
   * @property {Sring}
   */
  collectionSource: null,

  /**
   * @property {Boolean}
   * Property to find out whether study-player rendered or not
   */
  isStudyPlayer: true,

  /**
   * Indicate if show pre test suggestion
   * @property {Boolean} showSuggestion
   */
  showSuggestion: true,

  /**
   * Current map location
   * @property {MapLocation}
   */
  mapLocation: null,

  /**
   * Indicates if it should default player header
   * @property {boolean}
   */
  showPlayerHeader: false,

  /**
   * @property {Array} list of suggested resourceIds of a collection
   */
  suggestedResources: null,

  /**
   * @property {Boolean} isFullScreen
   * Property to enable/disable fullscreen mode
   */
  isFullScreen: false,

  isNotification: false,

  isIframeMode: false,

  isDiagnosticPlayer: false,

  isInitiated: false,

  /**
   * Resets to default values
   */
  resetValues: function() {
    //TODO: call the parent reset values method
    this.setProperties({
      showSuggestion: true,
      classId: null,
      milestoneId: null,
      unitId: null,
      lessonId: null,
      collectionId: null,
      resourceId: null,
      type: null,
      isStudyPlayer: true,
      isNotification: false,
      isIframeMode: false
    });
  },

  /**
   * @function toggleScreenMode
   * Method to toggle screen mode
   */
  toggleScreenMode() {
    let controller = this;
    let isFullScreen = controller.get('isFullScreen');
    if (isFullScreen) {
      Ember.$('body').addClass('fullscreen');
    } else {
      Ember.$('body').removeClass('fullscreen');
    }
  }
});
