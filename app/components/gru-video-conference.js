import Ember from 'ember';
import { formatimeToDateTime } from 'gooru-web/utils/utils';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  classNames: ['gru-video-conference'],

  isCloseBtn: false,

  isGuestAccount: Ember.computed.alias('session.isGuest'),

  selectedStudent: Ember.computed('members.@each', function() {
    return this.get('members')
      .filterBy('isSelected')
      .mapBy('id');
  }),

  selectedStudentEmail: Ember.computed('members.@each', function() {
    return this.get('members')
      .filterBy('isSelected')
      .filterBy('email')
      .mapBy('email');
  }),

  videConferenceService: Ember.inject.service('api-sdk/video-conference'),

  videoTitle: null,

  isShowCloseBtn: false,

  isShowValidationMsg: false,

  isShowStudentsList: false,

  isShowButton: true,

  isShowOnlyMeeting: false,

  meetUrl: null,

  newActivity: Ember.computed('selectedStudent', function() {
    return Ember.Object.create({
      usersCount: -1
    });
  }),

  forMonth: Ember.computed(function() {
    return moment().format('MM');
  }),

  forYear: Ember.computed(function() {
    return moment().format('YYYY');
  }),

  startTime: Ember.computed('activeActivityContent', function() {
    return moment().format('hh:mm A');
  }),

  endTime: Ember.computed('activeActivityContent', 'startTime', function() {
    return moment()
      .add(1, 'hours')
      .format('hh:mm A');
  }),
  isUpdateVideoConference: Ember.computed('activeActivityContent', function() {
    return !!this.get('activeActivityContent.meeting_url');
  }),

  didInsertElement() {
    let component = this;
    let member = this.get('members').copy();
    member = member.filterBy('isActive');
    member = member.map(item => {
      item.set('isSelected', true);
      item.set('name', item.fullName);
      return item;
    });
    this.set('members', member);
    this.set('videoTitle', Ember.Object.create({}));
    this.set('MeetingUrl', Ember.Object.create({}));
    component.selectTimePickerDropdown();
    // component.set('selectedStudent', Ember.A([]));
  },

  actions: {
    onCodeChange() {
      if (this.get('videoTitle').name.length > 0) {
        this.set('isShowValidationMsg', false);
      } else {
        this.set('isShowValidationMsg', true);
      }
    },
    onToggleParticipant() {
      let controller = this;
      controller.toggleProperty('isShowStudentsList');
    },

    onSelectDate(date) {
      this.set('startDate', date);
      if (moment().format('D') < moment(this.get('startDate')).format('D')) {
        const freashDate = '12.00 AM';
        this.set('startTime', freashDate);
        this.set(
          'endTime',
          moment(freashDate, 'hh:mm A')
            .add(1, 'hours')
            .format('hh:mm A')
        );
      } else {
        let startTime = this.roundTimeQuarterHour();
        this.set('startTime', startTime);
        this.set(
          'endTime',
          moment(startTime, 'hh:mm A')
            .add(1, 'hours')
            .format('hh:mm A')
        );
      }
      this.selectTimePickerDropdown();
    },
    createActivity() {
      const forMonth = moment(this.get('startDate')).format('M');
      const forYear = moment(this.get('startDate')).format('YYYY');
      let startDate = this.get('startDate')
        ? this.get('startDate')
        : moment().format('YYYY-MM-DD');
      let endDate = this.get('startDate')
        ? this.get('startDate')
        : moment().format('YYYY-MM-DD');

      var beginningTime = moment(this.$('.startTime').val(), 'h:mma');
      var endSelectTime = moment(this.$('.endTime').val(), 'h:mma');

      if (endDate === undefined || !beginningTime.isBefore(endSelectTime)) {
        const endAddDate = moment(startDate)
          .add(1, 'days')
          .toDate();
        endDate = moment(endAddDate).format('YYYY-MM-DD');
      }

      // Temp fix to handle Zoom GMT time format
      let startTime = moment(
        `${startDate} ${this.$('.startTime').val()}`,
        'YYYY-MM-DD hh:mm a'
      )
        .utc()
        .toDate();
      startTime = startTime.toISOString().replace('.000Z', 'Z');

      const endTime = formatimeToDateTime(endDate, this.$('.endTime').val());

      const meetingUrl = this.get('meetUrl');
      const meetingInfo = {
        class_id: this.get('primaryClass.id'),
        dca_added_date: startDate,
        end_date: endDate,
        meetingStartTime: startTime,
        meetingEndTime: endTime,
        meeting_url: meetingUrl,
        title: this.get('videoTitle').name,
        for_month: parseInt(forMonth),
        for_year: parseInt(forYear),
        userIds: this.get('selectedStudent'),
        userEmails: this.get('selectedStudentEmail')
      };
      if (this.get('videoTitle').name && meetingUrl) {
        let httppProtocol =
          meetingUrl.indexOf('https://') === 0 ||
          meetingUrl.indexOf('http://') === 0;
        if (httppProtocol) {
          this.set('isShowValidateurl', false);
          this.sendAction('onRefreshData', meetingInfo);
        } else {
          this.set('isShowValidateurl', true);
        }
      } else {
        if (this.get('videoTitle').name) {
          this.sendAction('onRefreshData', meetingInfo);
        } else {
          this.set('isShowValidationMsg', true);
        }
      }
    }
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

  selectTimePickerDropdown() {
    let component = this;
    this.$('.startTime').timepicker({
      timeFormat: 'hh:mm p',
      interval: 15,
      defaultTime: this.roundTimeQuarterHour(),
      change: function() {
        const endTime = moment(component.$(this).val(), 'hh:mm A')
          .add(1, 'hours')
          .format('hh:mm A');
        component
          .$('.endTime')
          .timepicker('option', 'minTime', endTime)
          .val(endTime);
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
  }
});
