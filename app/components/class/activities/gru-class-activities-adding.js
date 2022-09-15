import Ember from 'ember';
import {
  SCREEN_SIZES,
  CONTENT_TYPES,
  MEETING_TOOLS
} from 'gooru-web/config/config';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Component.extend(TenantSettingsMixin, {
  classNames: ['class-activities', 'gru-clas-activities-adding'],

  classNameBindings: ['isMultiClassCourseMap:cm-view', 'isShowFullView:open'],

  passwordData: '1234567890',

  session: Ember.inject.service(),
  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @return videConferenceService
   */
  videConferenceService: Ember.inject.service('api-sdk/video-conference'),

  didInsertElement() {
    this.scrollHandler();
    if (
      this.get('isPremiumClass') &&
      this.get('activeCmClass.milestoneViewApplicable') &&
      this.get('isShowCourseMap')
    ) {
      this.fetchMilestones();
    }
  },

  actions: {
    goBackToTenantLibraries() {
      this.set('isShowTenantLibraries', true);
    },
    onSelectExternalActivity() {
      const component = this;
      component.set('isEnableExternalActivity', true);
    },

    onAddExternalActivity(
      activityData,
      scheduledDate,
      scheduledMonth,
      scheduledYear
    ) {
      const component = this;
      const content = activityData.get('collection');
      component.assignActivityToMultipleClass(
        content,
        scheduledDate,
        scheduledDate,
        scheduledMonth,
        scheduledYear
      );
    },

    onShowTenantLibraries(tenantLibraries) {
      const component = this;
      component.set('tenantLibraries', tenantLibraries);
      component.set('isShowTenantLibraries', true);
      component.set('isShowCourseMap', false);
      component.set('isFetchedAllContents', true);
    },

    onSelectTenantLibrary(tenantLibrary) {
      const component = this;
      component.set('activeTenantLibrary', tenantLibrary);
    },

    onShowFilteredContents(filteredContents, isRefreshed = true) {
      const component = this;
      let isNewSetOfContents =
        isRefreshed || component.get('scrollEndHitCount') === 0;
      component.set('isFetchedAllContents', filteredContents.length < 20);
      if (filteredContents.length) {
        let todayActivities = component.get('todayActivities');
        filteredContents.map(content => {
          content.isAdded = !!todayActivities.findBy('contentId', content.id);
        });
        filteredContents = isNewSetOfContents
          ? filteredContents
          : component.get('filteredContents').concat(filteredContents);
      }

      if (isNewSetOfContents || filteredContents.length <= 0) {
        component.set('scrollEndHitCount', 0);
        component.$('.body-container').scrollTop(0);
      }
      component.set('filteredContents', filteredContents);
      component.set('isShowTenantLibraries', false);
      component.set('isShowCourseMap', false);
      component.set('isFetchingContents', false);
    },
    onAddActivityPop(content) {
      this.set('isAddActivity', true);
      this.set('activeActivityContent', content);
    },
    onAddActivity(
      content,
      scheduleDate = null,
      endDate = null,
      month,
      year,
      isScheduleByMonth = false
    ) {
      const component = this;
      scheduleDate = isScheduleByMonth
        ? null
        : scheduleDate || moment().format('YYYY-MM-DD');
      component.assignActivityToMultipleClass(
        content,
        scheduleDate,
        endDate,
        month,
        year
      );
    },

    onShowCourseMap() {
      const component = this;
      component.set('isShowCourseMap', true);
      component.set('isShowTenantLibraries', false);
      component.set('scrollEndHitCount', 0);
      component.set('isFetchedAllContents', true);
      if (
        this.get('isPremiumClass') &&
        this.get('activeCmClass.milestoneViewApplicable')
      ) {
        this.fetchMilestones();
      }
    },

    onShowDateRangePicker(content) {
      const component = this;
      const contentFormat = content.get('format') || content.get('contentType');
      component.set('contentToSchedule', content);
      component.set('isShowDateRangePicker', true);
      component.set(
        'isShowStartEndDatePicker',
        contentFormat === CONTENT_TYPES.OFFLINE_ACTIVITY
      );
    },

    onCloseDateRangePicker() {
      this.set('isShowDateRangePicker', false);
    },

    scheduleContentForDate(scheduleDate, endDate, conferenceContent = {}) {
      const component = this;
      let content = component.get('contentToSchedule');
      content = Object.assign(content, conferenceContent);
      component.assignActivityToMultipleClass(content, scheduleDate, endDate);
      component.set('isShowDateRangePicker', false);
    },

    scheduleContentForMonth(month, year) {
      const component = this;
      const content = component.get('contentToSchedule');
      const scheduleDate = null;
      const endDate = null;
      component.assignActivityToMultipleClass(
        content,
        scheduleDate,
        endDate,
        month,
        year
      );
      component.set('isShowDateRangePicker', false);
    },

    onTogglePanel() {
      const component = this;
      let top = isCompatibleVW(SCREEN_SIZES.EXTRA_SMALL) ? '102px' : '50px';
      if (component.get('isShowFullView')) {
        component.$().css(
          {
            top: 'unset'
          },
          400
        );
        component.$().removeClass('open');
      } else {
        component.$().animate(
          {
            top
          },
          400
        );
        component.$().addClass('open');
      }
      component.toggleProperty('isShowFullView');
    },

    onShowContentPreview(previewContent) {
      const component = this;
      component.set('previewContent', previewContent);
      if (previewContent.get('format') === 'offline-activity') {
        component.set('isShowOfflineActivityPreview', true);
      } else {
        component.set('isShowContentPreview', true);
      }
    },

    onToggleMultiClassPanel(component = this) {
      component.$('.multi-class-list').slideToggle();
      component.toggleProperty('isMultiClassListExpanded');
    },

    //Action triggered when selecting a class from dropdown
    onSelectCmClass(classInfo) {
      const component = this;
      component.set('activeCmClass', classInfo);
      component.getClassInfo(classInfo.get('id')).then(classData => {
        component.set('activeCmClass', classData);
        if (component.get('isPremiumClass')) {
          component.fetchMilestones();
        }
      });
      component.actions.onToggleMultiClassPanel(component);
    },

    //Action triggered click on content title in milestone view
    onPreviewContent(unitId, lessonId, content) {
      this.send('onShowContentPreview', content);
    }
  },

  activeTenantLibrary: {},

  isShowFullView: false,

  isMobileView: isCompatibleVW(SCREEN_SIZES.MEDIUM),

  isShowStartEndDatePicker: false,

  isMultiClassCourseMap: Ember.computed(
    'isShowCourseMap',
    'isMultiClassEnabled',
    function() {
      return !!(this.get('isShowCourseMap') && this.get('isMultiClassEnabled'));
    }
  ),

  /**
   * @property {Boolean} isCourseAttached
   * Property to check whether Class has attached with a course or not
   */
  isCourseAttached: Ember.computed('activeCmClass', function() {
    return !!this.get('activeCmClass.courseId');
  }),

  defaultTab: Ember.Object.create({}),

  /**
   * @property {Object} activeCmClass
   * Property for the active class object
   */
  activeCmClass: Ember.computed(function() {
    return this.get('primaryClass');
  }),

  isMultiClassListExpanded: false,

  scrollEndHitCount: 0,

  isFetchingContents: false,

  isFetchedAllContents: false,

  enableVideoConference: Ember.computed.alias('session.enabledVideoConference'),

  /**
   * @property {Boolean} isAddActivity used to toggle activity popup
   */
  isAddActivity: false,

  /**
   * @property {Object} activeActivityContent help to maintain active content
   */
  activeActivityContent: null,

  /**
   * Maintains the list of added collection ids from today's class activities
   * @type {Object}
   */
  todayActivitiesContentIds: Ember.computed('todayActivities.[]', function() {
    let classActivities = this.get('todayActivities')
      ? this.get('todayActivities')
      : Ember.A([]);
    let collectionIds = classActivities.map(classActivity => {
      return (
        classActivity.get('collection.id') || classActivity.get('contentId')
      );
    });
    return collectionIds;
  }),

  observeTodayActivities: Ember.observer('todayActivities.[]', function() {
    const component = this;
    let todayActivities = component.get('todayActivities');
    let filteredContents = component.get('filteredContents');
    if (filteredContents && filteredContents.length) {
      filteredContents.map(content => {
        content.set(
          'isAdded',
          !!todayActivities.findBy('contentId', content.id)
        );
      });
    }
  }),

  assignActivityToMultipleClass(
    content,
    scheduleDate,
    endDate,
    month = undefined,
    year = undefined
  ) {
    const component = this;
    content.set('isScheduledActivity', !!scheduleDate);
    content.set('isUnscheduledActivity', month && year);
    const secondaryClasses = component.get('secondaryClasses');
    const classesToBeAdded = Ember.A([component.get('primaryClass')]).concat(
      secondaryClasses
    );
    let promiseList = classesToBeAdded.map(classes => {
      return new Ember.RSVP.Promise((resolve, reject) => {
        component
          .addActivityToClass(
            classes.get('id'),
            content,
            scheduleDate,
            month,
            year,
            endDate
          )
          .then(function(activityId) {
            const activityClasses =
              content.get('activityClasses') || Ember.A([]);
            let activityClass = Ember.Object.create({
              id: classes.get('id'),
              activity: Ember.Object.create({
                id: activityId,
                date: scheduleDate,
                month,
                year
              })
            });
            activityClasses.pushObject(activityClass);
            content.set('activityClasses', activityClasses);
            if (content.get('hasVideoConference')) {
              return component.fetchActivityUsers(
                activityClass,
                content,
                classes,
                resolve
              );
            } else {
              resolve();
            }
          }, reject);
      });
    });
    Ember.RSVP.all(promiseList).then(() => {
      if (moment().isSame(scheduleDate, 'day')) {
        content.set('isAdded', true);
      } else {
        content.set('isScheduled', true);
      }
      component.sendAction('activityAdded', content);
    });
  },

  addActivityToClass(classId, content, scheduleDate, month, year, endDate) {
    const component = this;
    const contentId = content.get('id');
    const contentType = content.get('format');
    return component
      .get('classActivityService')
      .addActivityToClass(
        classId,
        contentId,
        contentType,
        scheduleDate,
        month,
        year,
        endDate
      );
  },

  /**
   * @function getClassInfo
   * @param {UUID} classId
   * @return Promise classdata
   */
  getClassInfo(classId) {
    const component = this;
    return component.get('classService').readClassInfo(classId);
  },

  /**
   * @func scrollHandler
   * Method to handle scrolling event of body container
   */
  scrollHandler() {
    const component = this;
    component.$('.body-container').on('scroll', function() {
      if (
        !component.get('isFetchingContents') &&
        !component.get('isFetchedAllContents')
      ) {
        const innerHeight = component.$(this).innerHeight();
        const scrollTop = component.$(this).scrollTop();
        const scrollHeight = component.$(this)[0].scrollHeight;
        if (scrollTop + innerHeight >= scrollHeight - 100) {
          component.set('isFetchingContents', true);
          component.incrementProperty('scrollEndHitCount');
        }
      }
    });
  },

  /**
   * @func fetchMilestones
   * Method to fetch milestone data
   */
  fetchMilestones() {
    const component = this;
    const currentClass = component.get('activeCmClass');
    const fwCode = currentClass.get('preference.framework') || 'GUT';
    const courseId = currentClass.get('courseId');
    const subject = currentClass.get('preference.subject');
    const milestonePromise = currentClass.get('milestoneViewApplicable')
      ? component.get('courseService').getCourseMilestones(courseId, fwCode)
      : Ember.RSVP.resolve([]);
    return Ember.RSVP.hash({
      milestones: milestonePromise,
      gradeSubject: subject
        ? component.get('taxonomyService').fetchSubject(subject)
        : {}
    }).then(function(hash) {
      component.set('milestones', hash.milestones);
      component.set('gradeSubject', hash.gradeSubject);
    });
  },

  fetchActivityUsers(activities, content, classes, resolve) {
    let component = this;

    return Ember.RSVP.hash({
      activityMembers: component
        .get('classActivityService')
        .fetchUsersForClassActivity(
          classes.get('id'),
          activities.get('activity.id')
        )
    }).then(({ activityMembers }) => {
      let emailIDs = activityMembers.filterBy('email').mapBy('email') || [];
      if (emailIDs.length) {
        return component
          .createConferenceEvent(classes, content, emailIDs)
          .then(eventDetails => {
            if (eventDetails.meetingUrl) {
              let updateParams = {
                classId: classes.get('id'),
                contentId: activities.get('activity.id'),
                data: {
                  meeting_id: eventDetails.meetingId,
                  meeting_url: eventDetails.meetingUrl,
                  meeting_endtime: content.meetingEndTime,
                  meeting_starttime: content.meetingStartTime,
                  meeting_timezone: moment.tz.guess()
                }
              };
              let activity = activities.get('activity');
              activities.set(
                'activity',
                Object.assign(activity, updateParams.data)
              );
              component
                .get('videConferenceService')
                .updateConferenceEvent(updateParams)
                .then(() => {
                  resolve();
                });
            } else {
              return resolve();
            }
          });
      } else {
        return resolve();
      }
    });
  },

  createConferenceEvent(classes, content, emailIDs) {
    const component = this;
    if (component.preferredMeetingTool() === MEETING_TOOLS.zoom) {
      let params = {
        topic: `${classes.title} : ${content.title}`,
        type: 2,
        start_time: content.meetingStartTime,
        duration: moment(content.meetingEndTime).diff(
          moment(content.meetingStartTime),
          'minutes'
        ),
        timezone: moment.tz.guess(),
        password: component.get('passwordData')
      };
      return component.get('videConferenceService').createZoomMeeting(params);
    } else {
      let params = {
        summary: `${classes.title} : ${content.title}`,
        startDateTime: content.meetingStartTime,
        endDateTime: content.meetingEndTime,
        attendees: emailIDs,
        timeZone: moment.tz.guess()
      };
      if (params.attendees.length) {
        return component
          .get('videConferenceService')
          .createConferenceEvent(params);
      }
    }
  }
});
