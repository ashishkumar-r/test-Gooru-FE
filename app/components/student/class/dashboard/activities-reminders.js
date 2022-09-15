import Ember from 'ember';
import {
  PLAYER_EVENT_SOURCE,
  DIAGNOSTIC_CONTENT_SOURCE
} from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // ----------------------------------------------------
  // Attributes

  classNames: ['activities-reminders'],

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // ---------------------------------------------------------
  // Dependencies

  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  dashboardService: Ember.inject.service('api-sdk/dashboard'),

  session: Ember.inject.service(),

  // -------------------------------------------------------
  // Properties

  currentClass: null,

  activityContent: Ember.A([]),

  userId: Ember.computed.alias('session.userId'),

  isLoading: false,

  pendingCaCount: 0,

  refreshData: false,

  watchRefreshData: Ember.observer('refreshData', function() {
    if (this.get('refreshData')) {
      this.initializeLoad();

      this.set('refreshData', false);
    }
  }),

  isShowImpersonate: Ember.computed(function() {
    let impersonate;
    if (window.frameElement) {
      impersonate = window.parent.impersonate;
    }
    return impersonate;
  }),
  // ------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.initializeLoad();
  },

  // -----------------------------------------------------
  // Actions

  actions: {
    onPlayContent(classActivity) {
      let component = this;
      component
        .get('parseEventService')
        .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_DASHBOARD_ACTIVITY_PLAY);
      let content = classActivity.get('collection');
      let contentId = content.get('id');
      let collectionType = content.get('collectionType');
      let classData = component.get('currentClass');
      let classId = classData.get('id');
      let caContentId = classActivity.get('id');
      let queryParams = {
        collectionId: content.get('id'),
        classId,
        role: 'student',
        source:
          classActivity && classActivity.isDiagnostic
            ? DIAGNOSTIC_CONTENT_SOURCE.CA_DIAGNOSTIC
            : PLAYER_EVENT_SOURCE.DAILY_CLASS,
        type: collectionType,
        caContentId,
        isIframeMode: true
      };
      if (
        collectionType === 'assessment-external' ||
        collectionType === 'collection-external'
      ) {
        let playerUrl = component.get('router').generate('player-external', {
          queryParams
        });
        component.sendAction('playContent', playerUrl, content);
      } else if (collectionType === 'offline-activity') {
        queryParams.offlineActivityId = contentId;
        let playerUrl = component
          .get('router')
          .generate('player-offline-activity', contentId, {
            queryParams
          });
        component.sendAction('playContent', playerUrl, content);
      } else {
        let playerUrl = component.get('router').generate('player', contentId, {
          queryParams
        });
        component.sendAction('playContent', playerUrl, content);
      }
    },

    onClassActivity() {
      this.get('router').transitionTo('student.class.class-activities');
    }
  },

  // --------------------------------------------------------
  // Methods

  initializeLoad() {
    const component = this;
    component.set('isLoading', true);
    let classData = component.get('currentClass');
    const classId = classData.get('id');
    const params = {
      classId
    };
    component
      .get('dashboardService')
      .fetchRemindersList(params)
      .then(content => {
        content.results.map(data => {
          let isFutureDate = this.checkActivityDate(data);
          data.isActivityFuture = isFutureDate;
        });
        component.set('activityContent', content.results);
        component.set('pendingCaCount', content.pendingCaCount);
        component.set('isLoading', false);
      });
  },

  checkActivityDate(data) {
    let activityDate = data.activation_date;
    let currentDate = moment().format('YYYY-MM-DD');
    return moment(activityDate).isAfter(currentDate);
  }
});
