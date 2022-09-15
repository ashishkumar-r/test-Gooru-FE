import Ember from 'ember';
import { PLAYER_EVENT_MESSAGE, ROLES } from 'gooru-web/config/config';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Route.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  offlineActivityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  session: Ember.inject.service('session'),

  /**
   * @type {reportService} Service to retrieve report information
   */
  reportService: Ember.inject.service('api-sdk/report'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  classFramework: Ember.computed('class', function() {
    return this.get('class.preference') &&
      this.get('class.preference.framework')
      ? this.get('class.preference.framework')
      : null;
  }),

  // -------------------------------------------------------------------------
  // Events
  beforeModel(transition) {
    this._super(...arguments);
    if (!this.get('session.isAnonymous')) {
      const queryParams = transition.queryParams;
      if (queryParams && queryParams.classId) {
        return this.readClassInfo(queryParams.classId);
      }
    }
  },

  model(queryParams) {
    const route = this;
    const offlineActivityId = queryParams.offlineActivityId;
    const offlineActivityService = route.get('offlineActivityService');
    let timeSpentPromise = Ember.RSVP.Promise.resolve([]);
    let classFramework = route.get('classFramework');
    let isDefaultShowFW = route.get('isDefaultShowFW');
    if (queryParams.classId && route.get('session.role') === ROLES.STUDENT) {
      let dataParam = {
        classId: queryParams.classId,
        userId: route.get('session.userId'),
        to: moment().format('YYYY-MM-DD')
      };
      timeSpentPromise = route
        .get('reportService')
        .fetchStudentTimespentReport(dataParam);
    }
    return Ember.RSVP.hash({
      offlineActivity: offlineActivityId
        ? offlineActivityService.readActivity(
          offlineActivityId,
          isDefaultShowFW,
          classFramework
        )
        : {},
      studentTimespentData: timeSpentPromise
    }).then(({ offlineActivity, studentTimespentData }) => {
      return Ember.Object.create({
        offlineActivity,
        studentTimespentData
      });
    });
  },

  setupController(controller, model) {
    window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_LOADING_COMPLETED, '*');
    controller.set('offlineActivity', model.get('offlineActivity'));
    controller.set('studentTimespentData', model.get('studentTimespentData'));
    controller.loadOfflineActivitySubmissions();
    if (!this.get('session.isAnonymous')) {
      controller.fetchActivityFeedbackCateory();
    }
  },

  resetController(controller) {
    controller.set('offlineActivity', {});
    controller.set('isPreview', false);
    controller.set('offlineActivitySubmissions', null);
  },

  readClassInfo(classId) {
    const route = this;
    const classPromise = classId
      ? route.get('classService').readClassInfo(classId)
      : Ember.RSVP.resolve({});
    return classPromise.then(function(classData) {
      route.set('class', classData);
    });
  }
});
