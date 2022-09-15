import Ember from 'ember';
import StudentLearnerProficiency from 'gooru-web/mixins/student-learner-proficiency';
import StudyPlayer from 'gooru-web/mixins/study-player';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Controller.extend(
  StudentLearnerProficiency,
  StudyPlayer,
  tenantSettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies
    /**
     * @property {NavigateMapService}
     */
    navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

    /**
     * @type {AttemptService} attemptService
     * @property {Ember.Service} Service to send attempt related events
     */
    quizzesAttemptService: Ember.inject.service('quizzes/attempt'),

    /**
     * @property {CourseMapService}
     */
    courseMapService: Ember.inject.service('api-sdk/course-map'),

    /**
     * @property {session}
     */
    session: Ember.inject.service('session'),

    /**
     * @requires studyPlayerController
     */
    studyPlayerController: Ember.inject.controller('study-player'),

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      //Action triggered when click on next
      onPlayNext() {
        const controller = this;
        const navigateMapService = controller.get('navigateMapService');
        const profileId = controller.get('session.userData.gooruUId');
        const contextId = controller.get('contextId');
        controller
          .get('quizzesAttemptService')
          .getAttemptIds(contextId, profileId)
          .then(attemptIds =>
            !attemptIds || !attemptIds.length
              ? {}
              : this.get('quizzesAttemptService').getAttemptData(
                attemptIds[attemptIds.length - 1]
              )
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

            mapLocationNxt.context.set(
              'score',
              attemptData.get('averageScore')
            );
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

      closePullUp() {
        const component = this;
        component.set('isOpenPlayer', false);
      },

      playContent(queryParams, contentId, content) {
        const component = this;
        component.set(
          'playerUrl',
          component.target
            .get('router')
            .generate('player', contentId, { queryParams })
        );
        component.set('isOpenPlayer', true);
        component.set('playerContent', content);
      }
    },

    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {UUID} contextId
     */
    contextId: null,

    /**
     * Report Source Type
     * @property {String} source
     */
    source: null,

    /**
     * @property {String} role
     */
    role: null,

    /**
     * @property {UUID} unitId
     * Unit ID available in query param
     */
    unitId: null,

    /**
     * @property {UUID} lessonId
     * Lesson ID available in query param
     */
    lessonId: null,

    /**
     * @property {UUID} milestoneId
     * Milestone ID available in query param
     */
    milestoneId: null,

    /**
     * @property {Number} pathId
     * Path Id available in query param
     */
    pathId: 0,

    /**
     * @property {String} pathType
     * Path type available in query param
     */
    pathType: null,

    /**
     * @property {UUID} unitId
     * Unit ID available in query param
     */
    collectionType: null,

    /**
     * @property {UUID} unitId
     * Unit ID available in query param
     */
    collectionId: null,

    /**
     * @property {boolean}
     */
    hasSignatureCollectionSuggestions: Ember.computed.alias(
      'mapLocation.hasSignatureCollectionSuggestions'
    ),

    /**
     * @property {boolean}
     */
    hasSignatureAssessmentSuggestions: Ember.computed.alias(
      'mapLocation.hasSignatureAssessmentSuggestions'
    ),

    /**
     * @property {boolean}
     */
    isDone: Ember.computed('mapLocation.context.status', function() {
      return (
        (this.get('mapLocation.context.status') || '').toLowerCase() === 'done'
      );
    }),

    /**
     * @property {boolean}
     */
    hasAnySuggestion: Ember.computed(
      'hasSignatureAssessmentSuggestions',
      'hasSignatureCollectionSuggestions',
      'showSuggestion',
      function() {
        return (
          (this.get('hasSignatureCollectionSuggestions') ||
            this.get('hasSignatureAssessmentSuggestions')) &&
          this.get('showSuggestion')
        );
      }
    ),

    /**
     * @property {Json}
     * Computed property to store suggestedContent
     */
    suggestedContent: Ember.computed('mapLocation', function() {
      let controller = this;
      let suggestions = controller.get('mapLocation.suggestions');
      return suggestions && suggestions[0] ? suggestions[0] : null;
    }),

    /**
     * @property {Boolean} isPlayerProficiency
     * Property to check whether to show player proficiency or not
     */
    isPlayerProficiency: Ember.computed('contextId', function() {
      return !!this.get('contextId');
    }),

    /**
     * @property {Boolean} isFullScreen
     */
    isFullScreen: Ember.computed(function() {
      let controller = this;
      let studyPlayerController = controller.get('studyPlayerController');
      let isFullScreen = studyPlayerController.get('isFullScreen');
      return isFullScreen;
    })
  }
);
