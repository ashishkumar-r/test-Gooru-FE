import Ember from 'ember';
import { formatimeToDateTime, dateTimeToTime } from 'gooru-web/utils/utils';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { MEETING_TOOLS } from 'gooru-web/config/config';

import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(TenantSettingsMixin, {
  /**
   * Class attributes defines
   */
  classNames: ['gru-video-conference-card'],

  session: Ember.inject.service('session'),

  passwordData: '1234567890',

  videConferenceService: Ember.inject.service('api-sdk/video-conference'),

  /**
   * @property {Boolean} hasVideoConference hold toggle checkbox activity
   */
  hasVideoConference: false,

  /**
   * @property {Object} activeActivityContent hold activity data
   */
  activeActivityContent: null,

  /**
   * @property {Boolean} isScheduled hold activity data
   */
  isScheduled: false,

  /**
   * @property {Boolean} isUpdateCard hold activity data
   */
  isUpdateCard: false,

  /**
   * @property {Boolean} conferenceToken
   */

  conferenceToken: Ember.computed('window', function() {
    return this.getAuthToken() || false;
  }),

  /**
   * Toggle Options for the Advanced Edit button
   * @property {Ember.Array}
   */
  switchOptions: Ember.A([
    Ember.Object.create({
      label: 'common.on',
      value: true
    }),
    Ember.Object.create({
      label: 'common.off',
      value: false
    })
  ]),

  options: {
    dropdown: false
  },
  /**
   * @return {String} hold the start time
   */
  startTime: Ember.computed('activeActivityContent', function() {
    return this.get('activeActivityContent.meeting_url')
      ? dateTimeToTime(this.get('activeActivityContent.meeting_starttime'))
      : moment().format('hh:mm A');
  }),
  /**
   * @return {String} hold the end time
   */
  endTime: Ember.computed('activeActivityContent.@each', function() {
    return this.get('activeActivityContent.meeting_url')
      ? dateTimeToTime(this.get('activeActivityContent.meeting_endtime'))
      : moment()
        .add(1, 'hours')
        .format('hh:mm A');
  }),

  isUpdateVideoConference: Ember.computed('activeActivityContent', function() {
    return !!this.get('activeActivityContent.meeting_url');
  }),

  meetUrl: Ember.computed('activeActivityContent', function() {
    return this.get('activeActivityContent.meeting_url')
      ? this.get('activeActivityContent.meeting_url')
      : null;
  }),

  updateStartDate: Ember.computed('activeActivityContent', function() {
    return this.get('activeActivityContent.added_date') || null;
  }),

  updateEndDate: Ember.computed('activeActivityContent', function() {
    return this.get('activeActivityContent.end_date') || null;
  }),

  isChangedTime: false,

  isFutureActivity: Ember.computed('activeActivityContent', function() {
    let activityData = this.get('activeActivityContent.added_date');
    return moment(activityData) > moment();
  }),
  /**
   * @property {Boolean} todayActivityList hold activity data
   */
  todayActivityList: Ember.computed(
    'activitiesList',
    'activityId',
    'activityStartDate',
    function() {
      let activityListData = this.get('activitiesList');
      let activityId = this.get('activityId');
      if (activityListData) {
        let activeActivity = activityListData.filterBy('contentId', activityId);
        let activityStartDate = this.get('activityStartDate');
        if (activeActivity && activeActivity.length) {
          let activitiesToday = activeActivity[0];
          let startDate = activitiesToday.get('added_date');
          let endDate = activitiesToday.get('end_date');
          return (
            moment(endDate).isAfter(activityStartDate) ||
            activityStartDate === startDate
          );
        }
      }
    }
  ),

  /**
   * Checking is demo account
   */
  isGuestAccount: Ember.computed.alias('session.isGuest'),

  isShowVideoConference: Ember.computed('primaryClass', function() {
    const isShowVideoConf =
      this.get('primaryClass.members') &&
      !this.get('primaryClass.members').length;
    return isShowVideoConf;
  }),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  didInsertElement() {
    const component = this;
    if (
      !component.get('conferenceToken') &&
      component.get('hasVideoConference')
    ) {
      this.sendAction('onToggleCheckbox', component.get('hasVideoConference'));
    }
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    this.$('.startTime').timepicker({
      timeFormat: 'hh:mm p',
      interval: 15,
      defaultTime: this.get('isUpdateVideoConference')
        ? this.get('startTime')
        : this.roundTimeQuarterHour(),

      change: function() {
        if (
          dateTimeToTime(
            component.get('activeActivityContent.meeting_starttime')
          ) !== $(this).val()
        ) {
          const endTime = moment(component.$(this).val(), 'hh:mm A')
            .add(1, 'hours')
            .format('hh:mm A');
          component
            .$('.endTime')
            .timepicker('option', 'minTime', endTime)
            .val(endTime);
        }
      }
    });
    this.$('.endTime').timepicker({
      timeFormat: 'hh:mm p',
      interval: 15,
      change: function() {
        if (
          this.get('activeActivityContent.meeting_endtime') !== $(this).val()
        ) {
          component.set('isChangedTime', true);
        }
      }
    });
    this.$('.meet-link').change(function() {
      component.set('isChangedTime', true);
    });
  },

  actions: {
    /**
     * @function onToggleCheckbox action help to toggle conference
     */
    onToggleCheckbox(value) {
      if (this.get('conferenceToken')) {
        this.set('hasVideoConference', value);
      } else {
        this.set('hasVideoConference', value);
        this.sendAction('onToggleCheckbox', value);
      }
    },

    /**
     * @function onAddActivity action help to add activity
     */
    onAddActivity() {
      if (this.get('isUpdateCard')) {
        if (
          this.get('dateRangeType') === 'isDaily' ||
          this.get('dateRangeType') === undefined
        ) {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_DAILY_ENABLE_VIDEO_CONF
          );
        } else if (this.get('dateRangeType') === 'isWeekly') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_WEEKLY_ENABLE_VIDEO_CONF
          );
        } else if (this.get('dateRangeType') === 'isMonthly') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_MONTHLY_ENABLE_VIDEO_CONF
          );
        }
      } else {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CA_SHOW_SCOPE_SEQUENCE_SCHEDULE_ADD_ACTIVITY
        );
      }

      let isScheduled = this.get('isScheduled');
      let updateStartDate = this.get('updateStartDate');
      let updateEndDate = this.get('updateEndDate');
      let content =
        this.get('activeActivityContent') || Ember.Object.create({});
      const startTime = !isScheduled
        ? formatimeToDateTime(updateStartDate, this.$('.startTime').val())
        : this.$('.startTime').val();
      const endTime = !isScheduled
        ? formatimeToDateTime(updateEndDate, this.$('.endTime').val())
        : this.$('.endTime').val();

      content.set('meetingStartTime', startTime);
      content.set('meetingEndTime', endTime);
      content.set('meetingUrl', this.get('meetUrl'));
      content.set('hasVideoConference', this.get('hasVideoConference'));
      if (!this.get('conferenceToken') && this.get('hasVideoConference')) {
        return Ember.RSVP.hash({
          token: this.fetchTokenService()
        }).then(({ token }) => {
          content.set('hasVideoConference', !!token);
          this.sendAction('onAddActivity', content);
        });
      } else {
        this.sendAction('onAddActivity', content);
      }
    },

    onRemoveConference() {
      const component = this;
      let content = this.get('activeActivityContent');
      let activityPromise = content.activityClasses.map(activity => {
        return new Ember.RSVP.Promise((resolve, reject) => {
          let params = {
            classId: activity.get('id'),
            contentId: activity.get('activity.id')
          };

          return Ember.RSVP.hash({
            updateMeetingConference: component.deleteConferenceEvent(
              content.meeting_id
            ),
            updateConference: this.get(
              'videConferenceService'
            ).deleteConferenceEvent(params)
          }).then(() => {
            resolve();
          }, reject);
        });
      });
      Ember.RSVP.all(activityPromise).then(() => {
        content.setProperties({
          meeting_id: null,
          meeting_url: null,
          meeting_endtime: null,
          meeting_starttime: null,
          meeting_timezone: null
        });
        this.set('isAddActivity', false);
      });
    },

    updateMeeting() {
      const component = this;

      if (
        component.get('dateRangeType') === 'isDaily' ||
        component.get('dateRangeType') === undefined
      ) {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CA_DAILY_VIDEO_CONF_UPDATE);
      } else if (component.get('dateRangeType') === 'isWeekly') {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CA_WEEKLY_VIDEO_CONF_UPDATE);
      } else if (component.get('dateRangeType') === 'isMonthly') {
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CA_MONTHLY_VIDEO_CONF_UPDATE);
      }

      let content = this.get('activeActivityContent');
      let updateStartDate = this.get('updateStartDate');
      let updateEndDate = this.get('updateEndDate');
      let params = {
        data: {
          meeting_id: content.get('meeting_id'),
          meeting_url: this.get('meetUrl')
            ? this.get('meetUrl')
            : content.get('meeting_url'),
          meeting_endtime: formatimeToDateTime(
            updateEndDate,
            this.$('.endTime').val()
          ),

          meeting_starttime: formatimeToDateTime(
            updateStartDate,
            this.$('.startTime').val()
          ),
          meeting_timezone: content.get('meeting_timezone')
        }
      };

      let activityPromise = content.activityClasses.map(activity => {
        return new Ember.RSVP.Promise((resolve, reject) => {
          params.classId = activity.get('id');
          params.contentId = activity.get('activity.id');
          return Ember.RSVP.hash({
            updateConference: this.get(
              'videConferenceService'
            ).updateConferenceEvent(params),
            updateMeeting: component.updateConferenceEvent(content)
          }).then(() => {
            resolve();
          }, reject);
        });
      });
      Ember.RSVP.all(activityPromise).then(() => {
        content.setProperties(params.data);
        this.set('isAddActivity', false);
      });
    },

    launchMeeting(meetingUrl) {
      if (meetingUrl) {
        window.open(
          meetingUrl,
          '_blank',
          'toolbar=yes,scrollbars=yes,resizable=yes,top=10,left=10,width=1000,height=700'
        );
        this.set('isAddActivity', false);

        if (
          this.get('dateRangeType') === 'isDaily' ||
          this.get('dateRangeType') === undefined
        ) {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_DAILY_VIDEO_CONF_START
          );
        } else if (this.get('dateRangeType') === 'isWeekly') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_WEEKLY_VIDEO_CONF_START
          );
        } else if (this.get('dateRangeType') === 'isMonthly') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_MONTHLY_VIDEO_CONF_START
          );
        }
      }
    }
  },

  fetchTokenService() {
    if (this.preferredMeetingTool() === MEETING_TOOLS.zoom) {
      return this.get('videConferenceService').fetchZoomToken();
    }
    return this.get('videConferenceService').fetchConferenceToken();
  },

  roundTimeQuarterHour() {
    let timeToReturn = new Date(
      moment()
        .add(5, 'm')
        .toDate()
    );
    timeToReturn.setMilliseconds(
      Math.round(timeToReturn.getMilliseconds() / 1000) * 1000
    );
    timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
    timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 15) * 15);
    return moment(timeToReturn).format('hh:mm A');
  },

  getAuthToken() {
    if (this.preferredMeetingTool() === MEETING_TOOLS.zoom) {
      return window.localStorage.getItem(
        `user_zoom_vid_config_${this.get('session.userId')}`
      );
    } else {
      return window.localStorage.getItem(
        `user_vid_config_${this.get('session.userId')}`
      );
    }
  },
  updateConferenceEvent(content) {
    const component = this;
    if (component.preferredMeetingTool() === MEETING_TOOLS.zoom) {
      let params = {
        topic: `${content.title} : ${content.title}`,
        type: 2,
        start_time: content.meeting_starttime,
        duration: moment(content.meeting_endtime).diff(
          moment(content.meeting_starttime),
          'minutes'
        ),
        timezone: moment.tz.guess(),
        password: component.get('passwordData')
      };
      return component
        .get('videConferenceService')
        .updateZoomMeeting(content.meeting_id, params);
    } else {
      let params = {
        summary: `${content.title} : ${content.title}`,
        startDateTime: content.meeting_starttime,
        endDateTime: content.meeting_endtime,
        meeting_url: content.meeting_url,
        timeZone: moment.tz.guess()
      };
      return component
        .get('videConferenceService')
        .updateConferenceCalendarEvent(content.meeting_id, params);
    }
  },

  deleteConferenceEvent(meetingId) {
    const component = this;
    if (component.preferredMeetingTool() === MEETING_TOOLS.zoom) {
      return component
        .get('videConferenceService')
        .deleteZoomMeeting(meetingId);
    } else {
      return component
        .get('videConferenceService')
        .deleteConferenceCalendarEvent(meetingId);
    }
  }
});
