import Ember from 'ember';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { MEETING_TOOLS } from 'gooru-web/config/config';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(TenantSettingsMixin, UIHelperMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  videConferenceService: Ember.inject.service('api-sdk/video-conference'),

  // -------------------------------------------------------------------------
  // Attributes

  queryParams: {
    videoConference: {
      refreshModel: true
    }
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    didTransition() {
      this.get('controller')
        .get('classController')
        .fetchDcaSummaryPerformance();
    }
  },

  // -------------------------------------------------------------------------
  // Events

  beforeModel() {
    this.authorizeMeetingTool();
  },

  model(params) {
    const currentClass = this.modelFor('teacher.class').class;
    this.setTitle('Class Activities', currentClass.title);
    if (
      params.videoConference &&
      this.preferredMeetingTool() === MEETING_TOOLS.zoom
    ) {
      this.get('videConferenceService')
        .fetchZoomToken()
        .then(() => {
          window.close();
        });
    } else if (params.videoConference) {
      this.get('videConferenceService')
        .fetchConferenceToken()
        .then(() => {
          window.close();
        });
    }
  },

  setupController(controller) {
    controller.get('classController').selectMenuItem('class-activities');
    controller.changeLanguage();
  },

  // Reset controller properties
  resetController(controller) {
    controller.resetProperties();
    controller.set('isShowGoLive', false);
  },

  // -------------------------------------------------------------------------
  // Methods

  authorizeMeetingTool() {
    if (this.preferredMeetingTool() === MEETING_TOOLS.zoom) {
      return this.get('videConferenceService').fetchZoomToken();
    }
    return this.get('videConferenceService').fetchConferenceToken();
  }
});
