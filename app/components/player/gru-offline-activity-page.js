import Ember from 'ember';
import {
  PLAYER_EVENT_SOURCE,
  PLAYER_EVENT_MESSAGE,
  EXTERNAL_PLAYER_ACTIONS
} from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['oa-study-player', 'gru-offline-activity-page'],

  // -------------------------------------------------------------------------
  // Dependencies
  oaAnalyticsService: Ember.inject.service(
    'api-sdk/offline-activity/oa-analytics'
  ),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.loadOfflineActivitySubmissions();
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    //Action triggered when click on start button
    onStartPlayer() {
      const component = this;
      component.set('isShowLandingPage', false);
    },

    //Action triggered when click on cancel button
    onClosePlayer() {
      const component = this;
      const classId = component.get('classId');
      const source = component.get('source');
      const isIframeMode = component.get('isIframeMode');
      if (isIframeMode) {
        window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
      } else if (classId && source === PLAYER_EVENT_SOURCE.COURSE_MAP) {
        component
          .get('router')
          .transitionTo('student.class.course-map', classId, {
            queryParams: {
              refresh: true
            }
          });
      } else if (classId && source === PLAYER_EVENT_SOURCE.DAILY_CLASS) {
        component
          .get('router')
          .transitionTo('student.class.class-activities', classId);
      } else {
        component.get('router').transitionTo('student-home');
      }
    }
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Boolean} isShowLandingPage
   * Property to show/hide OA start page
   */
  isShowLandingPage: Ember.computed(
    'offlineActivitySubmissions.tasks',
    function() {
      const component = this;
      const offlineActivitySubmissions = component.get(
        'offlineActivitySubmissions'
      );
      const oaTaskSubmissions = offlineActivitySubmissions
        ? offlineActivitySubmissions.tasks.objectAt(0)
        : null;
      return !(
        oaTaskSubmissions &&
        oaTaskSubmissions.taskId &&
        component.get('playerEvents')
      );
    }
  ),

  /**
   * @property {Object} mapLocationContext
   * Property for current mapLocation context
   */
  mapLocationContext: Ember.computed.alias('mapLocation.context'),

  /**
   * @property {UUID} classId
   * Property for active class ID
   */
  classId: Ember.computed.alias('mapLocationContext.classId'),

  /**
   * @property {UUID} courseId
   * Property for active course ID
   */
  courseId: Ember.computed.alias('mapLocationContext.courseId'),

  /**
   * @property {UUID} unitId
   * Property for active Item's Unit ID
   */
  unitId: Ember.computed.alias('mapLocationContext.unitId'),

  /**
   * @property {UUID} lessonId
   * Property for active item's lesson ID
   */
  lessonId: Ember.computed.alias('mapLocationContext.lessonId'),

  /**
   * @property {Object} offlineActivitySubmissions
   * Property for selected offline activity submissions
   */
  offlineActivitySubmissions: null,

  playerEvents: null,

  onWatchAction: Ember.observer('playerEvents', function() {
    const playerEvents = this.get('playerEvents');
    if (playerEvents === EXTERNAL_PLAYER_ACTIONS.START) {
      this.send('onStartPlayer');
    }
  }),

  isShowFullView: false,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadOfflineActivitySubmissions
   * Method to load selected offline activity submissions
   */
  loadOfflineActivitySubmissions() {
    const component = this;
    component.set('isLoading', true);
    Ember.RSVP.hash({
      offlineActivitySubmissions: component.fetchTasksSubmissions()
    }).then(({ offlineActivitySubmissions }) => {
      component.set('offlineActivitySubmissions', offlineActivitySubmissions);
      component.set('isLoading', false);
    });
  },

  /**
   * @function fetchTasksSubmissions
   * Method to fetch student submitted oa task data
   */
  fetchTasksSubmissions() {
    const component = this;
    const classId = component.get('classId');
    const oaId = component.get('offlineActivity.id');
    const userId = component.get('session.userId');
    const courseId = component.get('courseId');
    const unitId = component.get('unitId');
    const lessonId = component.get('lessonId');
    const dataParam = {
      courseId,
      unitId,
      lessonId
    };
    return component
      .get('oaAnalyticsService')
      .getSubmissionsToGrade(classId, oaId, userId, dataParam);
  }
});
