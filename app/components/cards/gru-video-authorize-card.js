import Ember from 'ember';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { MEETING_TOOLS } from 'gooru-web/config/config';

export default Ember.Component.extend(TenantSettingsMixin, {
  /**
   * Class attributes
   */
  classNames: ['gru-video-authorize-card'],

  /**
   * @return videConferenceService
   */
  videConferenceService: Ember.inject.service('api-sdk/video-conference'),

  /**
   * @property {Boolean} isConferenceAllow hold the toggleProperty
   */
  isConferenceAllow: false,

  /**
   * @property {String} meetingTool hold the preferred  meeting tool name
   */
  meetingTool: Ember.computed(function() {
    return this.preferredMeetingTool();
  }),

  actions: {
    /**
     * @function onDeny action trigger when click on deny
     */
    onDeny() {
      this.sendAction('onDeny');
    },

    /**
     * @function onAllow action trigger when click on deny
     */
    onAllow() {
      let currentPath = window.location.href;
      let params = {
        redirectUrl:
          currentPath.indexOf('?') !== -1
            ? `${currentPath}&videoConference=true`
            : `${currentPath}?videoConference=true`
      };
      this.authorize(params);
    }
  },

  authorize(params) {
    if (this.preferredMeetingTool() === MEETING_TOOLS.zoom) {
      this.get('videConferenceService')
        .authorizeZoom(params)
        .then(redirectUrl => {
          this.sendAction('onAllow');
          this.openAuthorizeWindow(redirectUrl);
        });
    } else {
      this.get('videConferenceService')
        .authorizeConference(params)
        .then(redirectUrl => {
          this.sendAction('onAllow');
          this.openAuthorizeWindow(redirectUrl);
        });
    }
  },

  openAuthorizeWindow(redirectUrl) {
    window.open(
      redirectUrl,
      '_blank',
      'toolbar=yes,scrollbars=yes,resizable=yes,top=100,left=50px,width=800,height=700'
    );
  }
});
