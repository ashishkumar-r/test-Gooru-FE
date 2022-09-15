import Ember from 'ember';
import {
  CONTENT_TYPES,
  SCREEN_SIZES,
  MEETING_TOOLS
} from 'gooru-web/config/config';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import { isCompatibleVW, getObjectsDeepCopy } from 'gooru-web/utils/utils';
import ModalMixin from 'gooru-web/mixins/modal';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import ClassroomMixin from 'gooru-web/mixins/classroom-mixin';

export default Ember.Component.extend(
  ModalMixin,
  TenantSettingsMixin,
  ClassroomMixin,
  {
    classNames: ['class-activities', 'gru-class-activities-listing'],

    /**
     * @type {ClassService} Service to retrieve class information
     */
    classService: Ember.inject.service('api-sdk/class'),

    /**
     * @requires service:api-sdk/class-activity
     */
    classActivityService: Ember.inject.service('api-sdk/class-activity'),

    performanceService: Ember.inject.service('api-sdk/performance'),

    analyticsService: Ember.inject.service('api-sdk/analytics'),

    passwordData: '1234567890',

    videConferenceService: Ember.inject.service('api-sdk/video-conference'),

    /**
     * @requires service:api-sdk/offline-activity-analytics
     */
    oaAnaltyicsService: Ember.inject.service(
      'api-sdk/offline-activity/oa-analytics'
    ),

    /**
     * @requires RubricService
     */
    rubricService: Ember.inject.service('api-sdk/rubric'),

    assessmentService: Ember.inject.service('api-sdk/assessment'),

    castEventService: Ember.inject.service('api-sdk/cast-event/cast-event'),

    /**
     * @requires service:api-sdk/course
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    collectionService: Ember.inject.service('api-sdk/collection'),

    // Observe todayActivities end at parent
    observeTodayActivities: Ember.observer('todayActivities', function() {
      const component = this;
      const activityList = component.get('todayActivities');
      component.set('activitiesList', activityList);
    }),

    didInsertElement() {
      const component = this;
      component.loadItemsToGrade();
      component.loadActivitiesForMonth(
        this.get('forMonth'),
        this.get('forYear')
      );
      component.fetchClassList();
    },

    actions: {
      onGoLive(params) {
        this.sendAction('onGoLive', params);
      },

      filterGrade(filter) {
        const component = this;
        component.set('filterItem', filter);
        component.groupGradingItem();
        component.send('onToggleFilterTypeContainer');
      },

      clickNext() {
        const component = this;
        if (component.get('filterItem') === 'student') {
          component.set('filterItem', 'activity');
        } else if (component.get('filterItem') === 'activity') {
          component.set('filterItem', 'date');
        } else {
          component.set('filterItem', 'student');
        }
        component.groupGradingItem();
      },

      clickPrev() {
        const component = this;
        if (component.get('filterItem') === 'activity') {
          component.set('filterItem', 'student');
        } else if (component.get('filterItem') === 'date') {
          component.set('filterItem', 'activity');
        } else {
          component.set('filterItem', 'date');
        }
        component.groupGradingItem();
      },

      onToggleFilterTypeContainer() {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_CA_ITEM_GRADE_SORT_BY
        );
        $(
          '.sorting-items-to-grade .filter-selector .filter-types-container'
        ).slideToggle();
      },

      /**
       *
       * @function actions:removeClassActivity
       */
      removeActivityClass(classActivity, activityClass, isRemoveClassActivity) {
        let component = this;
        let currentClassId = activityClass.get('id');
        let classActivityId = activityClass.get('activity.id');
        let classActivityType = activityClass.get('content.collectionType');
        var model = {
          type: classActivityType,
          deleteMethod: function() {
            return component
              .get('classActivityService')
              .removeClassActivity(currentClassId, classActivityId);
          },
          callback: {
            success: function() {
              if (isRemoveClassActivity) {
                component.removeClassActivity(classActivity);
              } else {
                let activityClasses = classActivity.get('activityClasses');
                activityClasses.removeObject(activityClass);
              }
            }
          }
        };
        this.actions.showModal.call(
          this,
          'content.modals.gru-remove-class-activity',
          model
        );
      },

      onShowStudentsList(activityClass) {
        const component = this;
        return Ember.RSVP.hash({
          classStudents: component.getClassMembers(activityClass.get('id'))
        }).then(({ classStudents }) => {
          activityClass.set('members', classStudents);
          component.set('selectedActivityClass', activityClass);
          component.set('isShowStudentsList', true);
        });
      },

      onOpenPerformanceEntry(activityClass) {
        const component = this;
        const activityContent = activityClass.get('content');
        const classId = activityClass.get('id');
        const activityId = activityClass.get('activity.id');
        return Ember.RSVP.hash({
          classStudents: component.getClassMembers(classId),
          activityMembers: component.fetchActivityUsers(classId, activityId),
          course: component.getClassCourse(classId)
        }).then(({ classStudents, activityMembers, course }) => {
          activityClass.set('course', course);
          activityClass.set('members', classStudents);
          let classActivityStudents = Ember.A([]);
          activityMembers.map(member => {
            let isActivityMember = classStudents.findBy('id', member.id);
            let isActiveMember = member.isActive;
            if (isActivityMember && isActiveMember) {
              classActivityStudents.push(isActivityMember);
            }
          });
          component.set(
            'selectedClassActivityMembers',
            classActivityStudents.sortBy('lastName')
          );
          let selectedClassActivity = activityClass.get('activity');
          // NOTE collection object required at Add Data flow
          selectedClassActivity.collection = activityContent;
          selectedClassActivity.isUpdatePerformance = !!activityContent.get(
            'performance'
          );
          component.set('selectedClassActivity', selectedClassActivity);
          component.set('selectedClassData', activityClass);
          component.set('selectedActivityContent', activityContent);
          component.set('isShowAddData', true);
        });
      },

      onClosePerformanceEntry() {
        const component = this;
        const activityClass = component.get('selectedClassData');
        component.fetchActivityPerformanceSummary(activityClass);
        component.set('isShowAddData', false);
        component.loadItemsToGrade();
        component.loadScheduledClassActivities(true);
        component.fetchCaPerformance();
      },
      onRefreshItemsToGrade(item) {
        const component = this;
        let gradingItemsList = component.get('gradingItemsList');
        const classId = item.get('classId');

        if (item.contentType === 'offline-activity') {
          const dcaContentId = item.get('dcaContentId');
          const gradedContent = gradingItemsList
            .filterBy('classId', classId)
            .findBy('dcaContentId', dcaContentId);
          if (gradedContent) {
            gradingItemsList.removeObject(gradedContent);
            const activityClass = component.get('selectedClassData');
            component.fetchActivityPerformanceSummary(activityClass);
            component.loadItemsToGrade();
          }
        } else {
          const contentId = item.get('content.id');
          const gradedContent = gradingItemsList
            .filterBy('classId', classId)
            .findBy('resourceId', contentId);
          if (gradedContent) {
            gradingItemsList.removeObject(gradedContent);
            const activityClass = component.get('selectedClassData');
            component.fetchActivityPerformanceSummary(activityClass);
            component.loadItemsToGrade();
          }
        }
      },

      onToggleDatePicker() {
        const component = this;
        let rangeType = component.get('scheduledActivitiesContext.activeRange');
        component.send('onSelectRangeType', rangeType);
        component
          .$('.header-container .date-range-picker-container')
          .slideToggle();
      },

      showPreviousMonth(date) {
        const component = this;
        let forMonth = moment(date).format('MM');
        let forYear = moment(date).format('YYYY');
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
        component.loadActivitiesForMonth(forMonth, forYear);
      },

      showNextMonth(date) {
        const component = this;
        let forMonth = moment(date).format('MM');
        let forYear = moment(date).format('YYYY');
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
        component.loadActivitiesForMonth(forMonth, forYear);
      },

      onSelectRangeType(rangeType) {
        const component = this;
        component.set('isDaily', false);
        component.set('isMonthly', false);
        component.set('isWeekly', false);
        component.set(`${rangeType}`, true);
        let selectedDate = moment().format('YYYY-MM-DD');
        if (rangeType === 'isWeekly') {
          selectedDate = moment()
            .startOf('week')
            .format('YYYY-MM-DD');
          component.set('selectedWeekDate', selectedDate);
        }
        if (rangeType === 'isMonthly') {
          component.set('selectedMonth', moment().format('YYYY-MM'));
        }
      },

      //Datepicker selection of a date
      onSelectDate(date, isDateChange) {
        let component = this;
        let forMonth = moment(date).format('MM');
        let forYear = moment(date).format('YYYY');
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
        component.set('selectedDate', date);
        component.set('selectedFilter', 'day');
        if (isDateChange) {
          component.set('startDate', date);
          component.set('endDate', date);
          component.set('isShowEndDate', false);
          component.set('isShowListCard', component.get('isMobileView'));
          component.send('closeDatePicker', isDateChange);
          if (component.get('isShowScheduledActivities')) {
            component.changeScheduledActivitiesContext('isDaily', date, date);
          }
        }
      },

      onSelectWeek(startDate, endDate, isDateChange) {
        let component = this;
        let forMonth = moment(endDate).format('MM');
        let forYear = moment(endDate).format('YYYY');
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
        component.set('selectedWeekDate', startDate);
        component.set('startDateOfWeek', startDate);
        component.set('endDateOfWeek', endDate);
        component.set('selectedFilter', 'week');
        if (isDateChange) {
          component.set('startDate', startDate);
          component.set('endDate', endDate);
          component.set('isShowEndDate', true);
          component.set('isShowListCard', true);
          component.send('closeDatePicker', isDateChange);
          if (component.get('isShowScheduledActivities')) {
            component.changeScheduledActivitiesContext(
              'isWeekly',
              startDate,
              endDate
            );
          }
        }
      },

      onSelectMonth(date, isDateChange) {
        let component = this;
        let startDate = `${date}-01`;
        let endDate = moment(startDate)
          .endOf('month')
          .format('YYYY-MM-DD');
        let forMonth = moment(startDate).format('MM');
        let forYear = moment(startDate).format('YYYY');
        component.set('forMonth', forMonth);
        component.set('forYear', forYear);
        component.set('selectedMonth', date);
        component.set('selectedFilter', 'month');
        if (isDateChange) {
          component.set('startDate', startDate);
          component.set('endDate', endDate);
          component.set('isShowEndDate', true);
          component.set('isShowListCard', true);
          component.send('closeDatePicker', isDateChange);
          if (component.get('isShowScheduledActivities')) {
            component.changeScheduledActivitiesContext(
              'isMonthly',
              startDate,
              endDate
            );
          }
        }
      },

      onSelectToday(date) {
        let component = this;
        component.send('onSelectDate', date, true);
      },

      onRescheduleActivity(classActivity) {
        const component = this;
        component.set('selectedClassActivity', classActivity);
        component.set('allowTwoDateRangePicker', true);
        component.set('isShowDaterangePicker', true);
      },

      onScheduleByDate(startDate, endDate) {
        const component = this;
        const classActivity = component.get('selectedClassActivity');
        if (classActivity.get('added_date')) {
          component.addActivityToClass(classActivity, startDate, endDate);
        } else {
          component.scheduleActivityToClass(classActivity, startDate, endDate);
        }
        const context = {
          classId: classActivity.get('classId'),
          startDate: startDate,
          endDate: endDate
        };
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.RESCHEDULE_ACTIVITY_CA,
          context
        );
        component.send('onCloseDaterangePicker');
      },

      onScheduleByMonth(month, year) {
        const component = this;
        const classActivity = component.get('selectedClassActivity');
        component.addActivityToClass(classActivity, null, null, month, year);
        component.send('onCloseDaterangePicker');
      },

      onCloseDaterangePicker() {
        this.set('isShowDaterangePicker', false);
      },

      onEnableMastery(classActivity) {
        const component = this;
        component.onUpdateMasteryAccrual(classActivity);
      },

      onToggleContent(content) {
        const component = this;
        if (content.get('isActive')) {
          const contentType =
            content.get('type') === 'offline-activity'
              ? 'offline'
              : content.get('type');
          component.set(`${contentType}Activities`, Ember.A([]));
        } else {
          component.loadScheduledClassActivities();
        }
        content.set('isActive', !content.get('isActive'));
        component.set('isShowScheduledActivities', true);
        component.set('isShowItemsToGrade', false);
        component.set('isShowUnscheduledActivities', false);
      },

      onloadScheduledClassActivities() {
        const component = this;
        let contextObj = component.get('scheduledActivitiesContext');
        let rangeType = contextObj.get('activeRange');
        component.set('startDate', contextObj.get('startDate'));
        component.set('endDate', contextObj.get('endDate'));
        component.send('onSelectRangeType', rangeType);
        let isMobileView = isCompatibleVW(SCREEN_SIZES.MEDIUM);
        let isListView = isMobileView ? true : rangeType !== 'isDaily';
        component.set('isShowListCard', isListView);
        component.set('isShowEndDate', rangeType !== 'isDaily');
        component.set('isLoading', true);
        component.set('isShowScheduledActivities', true);
        component.set('isShowItemsToGrade', false);
        component.set('isShowUnscheduledActivities', false);
        component.get('contentTypes').map(content => {
          content.set('isActive', true);
        });
        component.loadScheduledClassActivities();
      },

      onLoadUnscheduledActivities() {
        const component = this;
        let currentMonth = moment().format('YYYY-MM');
        let startDate = `${currentMonth}-01`;
        let endDate = moment(startDate)
          .endOf('month')
          .format('YYYY-MM-DD');
        let rangeType = component.get('scheduledActivitiesContext.activeRange');
        component.send('onSelectRangeType', rangeType);
        component.set('isShowEndDate', true);
        component.set('isLoading', true);
        component.set('selectedMonth', currentMonth);
        component.set('isShowListCard', true);
        component.set('startDate', startDate);
        component.set('endDate', endDate);
        component.set('isShowScheduledActivities', false);
        component.set('isShowItemsToGrade', false);
        component.set('isShowUnscheduledActivities', true);
        component.get('contentTypes').map(content => {
          content.set('isActive', false);
        });
        component.loadUnScheduledActivities();
      },

      onShowItemsToGrade() {
        const component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_CA_ITEM_GRADE);
        component.set('isShowScheduledActivities', false);
        component.set('isShowItemsToGrade', true);
        component.set('isShowUnscheduledActivities', false);
        component.get('contentTypes').map(content => {
          content.set('isActive', false);
        });
      },

      onGradeItem(gradingObject, activityClass) {
        const component = this;
        component.set('gradingObject', gradingObject);
        component.set('isShowGrading', true);
        if (gradingObject.get('contentType') === 'assessment') {
          component.set('isShowQuestionGrading', true);
        } else {
          component.set('isShowOaGrading', true);
        }
        if (activityClass) {
          component.set('selectedClassData', activityClass);
        }
      },

      onAllGradeItem(gradingObject, activityClass) {
        const component = this;
        component.set('gradingObject', gradingObject[0]);
        component.set('allGradingObject', gradingObject);

        component.set('isShowGrading', true);
        if (gradingObject[0].get('contentType') === 'assessment') {
          component.set('isShowQuestionGrading', true);
        } else {
          component.set('isShowOaGrading', true);
        }
        if (activityClass) {
          component.set('selectedClassData', activityClass);
        }
      },

      onShowContentPreview(previewContent) {
        const component = this;
        const assessmentCode = `${component.get(
          'primaryClass.code'
        )}${previewContent.get('id')}`;
        component.set('assessmentCode', assessmentCode);
        component.set('previewContent', previewContent);
        if (previewContent.get('contentType') === 'offline-activity') {
          component.set('isShowOfflineActivityPreview', true);
          component.set('isReportView', false);
        } else {
          component.set('isShowContentPreview', true);
        }
      },
      closeDatePicker(isDateChange) {
        const component = this;
        component.$('.header-container .date-range-picker-container').slideUp();
        if (isDateChange) {
          if (component.get('isShowUnscheduledActivities')) {
            component.loadUnScheduledActivities();
          } else {
            component.loadScheduledClassActivities();
          }
        }
      },
      // Action triggered when clicking performance from the class activity card
      onShowContentReport(classActivity) {
        const component = this;
        if (
          classActivity.get('contentType') === CONTENT_TYPES.OFFLINE_ACTIVITY
        ) {
          component.set('previewContent', classActivity);
          component.set('isShowOfflineActivityPreview', true);
          component.set('isReportView', true);
        } else {
          component.set('selectedActivity', classActivity);
          if (classActivity.isDiagnostic) {
            component.fetchCaPerformance();
            component.set('isShowDiagnosticReport', true);
          } else {
            component.set('isShowStudentsSummaryReport', true);
          }
        }
      },

      // Action triggered when clicking OA mark completed from the class activity card
      onMarkOACompleted() {
        this.loadItemsToGrade();
      },

      // Action trigger when we click video icon
      onUpdateVideConference(activityContent) {
        this.set('updateVideoConferenceContent', activityContent);
        this.set('isUpdateVideConference', true);
      },

      // Action trigger when we click add activity from the update conference popup
      onUpdateConference(content) {
        if (content.get('hasVideoConference')) {
          content.activityClasses.map(activity => {
            activity.set('meetingStartTime', content.get('meetingStartTime'));
            activity.set('meetingEndTime', content.get('meetingEndTime'));
            this.updateVideoConferenceList(content, activity);
          });
        }
      },

      dateCarousel(operation) {
        let rangeType = this.get('scheduledActivitiesContext.activeRange');
        let startDate = this.get('startDate');
        let endDate = this.get('endDate');
        let addType =
          rangeType === 'isDaily'
            ? 'day'
            : rangeType === 'isMonthly'
              ? 'month'
              : 'week';
        let momentStart = moment(startDate);
        this.set(
          'startDate',
          momentStart[operation](1, addType)
            .startOf('day')
            .format('YYYY-MM-DD')
        );
        let momentEnd = moment(endDate);
        this.set(
          'endDate',
          momentEnd[operation](1, addType)
            .endOf('day')
            .format('YYYY-MM-DD')
        );

        if (rangeType === 'isMonthly') {
          const date = moment(this.get('startDate'), 'YYYY/MM/DD');
          const month = date.format('M');
          const year = date.format('YYYY');
          const daysInMonth = moment(
            `${year}-${month}`,
            'YYYY-MM'
          ).daysInMonth();
          const parseDate = this.get('endDate').split('-');
          const parseYear = parseDate[0];
          const parseMonth = parseDate[1];
          const parseEndDate = `${parseYear}-${parseMonth}-${daysInMonth}`;
          this.set('endDate', parseEndDate);
        }

        this.loadScheduledClassActivities();
      },
      onChangeDateRangeType(type) {
        this.set('isLoading', true);
        this.set('isShowScheduledActivities', true);
        this.set('isShowItemsToGrade', false);
        this.set('isShowUnscheduledActivities', false);
        this.set('dateRangeType', type);

        let selectedDate = moment().format('YYYY-MM-DD');
        this.send('onSelectRangeType', type);
        if (type === 'isDaily') {
          this.send('onSelectDate', selectedDate, true);
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_DAILY_VIEW
          );
        }
        if (type === 'isWeekly') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_WEEKLY_VIEW
          );
          selectedDate = moment()
            .startOf('week')
            .format('YYYY-MM-DD');
          let endDate = moment(selectedDate)
            .endOf('week')
            .format('YYYY-MM-DD');
          this.send('onSelectWeek', selectedDate, endDate, true);
        }
        if (type === 'isMonthly') {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_CA_MONTHLY_VIEW
          );
          this.send('onSelectMonth', moment().format('YYYY-MM'), true);
        }
        this.send('showNextMonth', selectedDate);
      },

      onCAPresent(eventName, content) {
        this.caPresentEvent(eventName, content);
      },

      onShowConfirmPullup(isShow, activityTitle, classroomName) {
        this.sendAction(
          'onShowConfirmPullup',
          isShow,
          activityTitle,
          classroomName
        );
      },

      onShowProficiency(taxonomyTags) {
        this.set('taxonomyTag', taxonomyTags);
        this.set('isShowProficiencyPullup', true);
      },

      onCloseProficiency() {
        this.set('isShowProficiencyPullup', false);
      },

      onRefreshActivity() {
        this.loadScheduledClassActivities(true);
      }
    },

    isReportView: false,

    isDaily: true,

    selectedFilter: 'day',

    isShowItemsToGrade: false,

    isShowUnscheduledActivities: false,

    isShowScheduledActivities: true,

    isShowEndDate: false,

    filterItem: 'student',

    classId: Ember.computed.alias('primaryClass.id'),

    contentTypes: Ember.A([
      Ember.Object.create({
        type: 'collection',
        isActive: true
      }),
      Ember.Object.create({
        type: 'assessment',
        isActive: true
      }),
      Ember.Object.create({
        type: 'offline-activity',
        isActive: true
      })
    ]),

    forMonth: Ember.computed(function() {
      return moment().format('MM');
    }),

    forYear: Ember.computed(function() {
      return moment().format('YYYY');
    }),

    startDate: Ember.computed(function() {
      return moment().format('YYYY-MM-DD');
    }),

    endDate: Ember.computed(function() {
      return moment().format('YYYY-MM-DD');
    }),

    /**
     * it maintains date which user is selected
     * @property {String}
     */
    selectedDate: null,

    /**
     * It Maintains the list of class activities for a month
     * @property {Array}
     */
    classActivitiesOfMonth: Ember.A([]),

    /**
     * It Maintains the list of scheduled class activities datewise.
     * @type {Array}
     */
    scheduledClassActivitiesDatewise: Ember.computed(
      'classActivitiesOfMonth.[]',
      function() {
        let component = this;
        let activities = Ember.A();
        component.get('classActivitiesOfMonth').forEach(classActivity => {
          let addedDate = classActivity.get('added_date');
          let endDate = classActivity.get('end_date');
          let listOfDates = this.getListOfDates(addedDate, endDate);
          listOfDates.forEach(activeDate => {
            if (
              activeDate &&
              moment(activeDate).format('MM') === this.get('forMonth') &&
              moment(activeDate).format('YYYY') === this.get('forYear')
            ) {
              let isToday =
                moment(activeDate).format('YYYY-MM-DD') ===
                moment().format('YYYY-MM-DD');
              let activity = Ember.Object.create({
                day: moment(activeDate).format('DD'),
                hasActivity: true,
                isToday
              });
              activities.pushObject(activity);
            }
          });
        });
        return activities;
      }
    ),

    /**
     * @property {Array} scheduledActivities
     * Property to capture scheduled class activities grouped by date
     */
    scheduledActivities: Ember.A([]),

    assessmentActivities: Ember.A([]),

    collectionActivities: Ember.A([]),

    offlineActivities: Ember.A([]),

    datewiseActivities: Ember.A([]),

    groupActivities: Ember.A([]),

    scheduledActivitiesContext: Ember.computed(function() {
      let currentDate = moment().format('YYYY-MM-DD');
      let contextObj = Ember.Object.create({
        activeRange: 'isDaily',
        startDate: currentDate,
        endDate: currentDate
      });
      return contextObj;
    }),

    isShowListCard: Ember.computed(function() {
      const component = this;
      return isCompatibleVW(SCREEN_SIZES.MEDIUM)
        ? true
        : !component.get('isDaily');
    }),

    isMobileView: Ember.computed(function() {
      return isCompatibleVW(SCREEN_SIZES.MEDIUM);
    }),

    isLoading: false,

    isAdded: false,

    isShowStudentsSummaryReport: false,

    reportActivityList: Ember.A([]),

    selectedActivity: null,

    scheduleDateBefore: null,

    isShowDiagnosticReport: false,

    videoNewlyAddedActivity: Ember.observer('onRefreshData', function() {
      this.loadScheduledClassActivities(true);
      this.loadActivitiesForMonth(this.get('forMonth'), this.get('forYear'));
    }),

    observeNewlyAddedActivity: Ember.observer('newlyAddedActivity', function() {
      const component = this;
      const activity = component.get('newlyAddedActivity');
      component.set('isAdded', true);
      const activityClass = activity && activity.get('activityClasses').get(0);
      if (activity && activity.get('isScheduledActivity')) {
        if (
          activity.get('isAdded') &&
          activityClass.get('activity.date') === this.get('startDate')
        ) {
          //refresh today's activities  {activity.isAdded}
          component.loadScheduledClassActivities(true);
        } else {
          //refresh month's activities  {activity.isScheduled}
          component.loadActivitiesForMonth(
            this.get('forMonth'),
            this.get('forYear')
          );
        }
      } else {
        // component.loadUnScheduledActivities();
      }
    }),

    gradingObserver: Ember.observer('gradingItemsList.[]', function() {
      const component = this;
      component.groupGradingItems();
    }),

    /*
     * @return {Boolean} isUpdateVideConference
     */
    isUpdateVideConference: false,

    /**
     * @return {Object} isUpdateVideConference
     */
    updateVideoConferenceContent: null,

    /**
     * @property {Array} secondaryClassesData
     * Property for list of class data that were attached as secondary claases
     */
    secondaryClassesData: Ember.A([]),

    isToday: Ember.computed('startDate', function() {
      return !!(this.get('startDate') === moment().format('YYYY-MM-DD'));
    }),

    /**
     * @function loadScheduledClassActivities
     * @param {Boolean} isInitialLoad
     * Method to get scheduled class activities for given start and end date
     */
    loadScheduledClassActivities(isInitialLoad) {
      const component = this;
      const classId = component.get('classId');
      const secondaryClasses = component.get('secondaryClasses');
      const secondaryClassIds = secondaryClasses.mapBy('id');
      const startDate = component.get('startDate');
      const endDate = component.get('endDate');
      const isDefaultShowFW = component.get('isDefaultShowFW');
      const classFramework = component.get('classFramework');
      component.set('isLoading', true);
      const requestBody = {
        content_type: 'offline-activity,assessment,collection,meeting',
        secondaryclasses: secondaryClassIds.join(','),
        start_date: startDate,
        end_date: endDate
      };
      return Ember.RSVP.hash({
        scheduledActivities: component
          .get('classActivityService')
          .getScheduledActivitiesByDate(
            classId,
            requestBody,
            isDefaultShowFW,
            classFramework
          )
      }).then(({ scheduledActivities }) => {
        const groupedClassActivities = component.groupActivitiesByClass(
          scheduledActivities
        );
        const scheduledActivitiesLists = component.aggregateScheduledActivitiesByDate(
          groupedClassActivities
        );
        let rangeType = this.get('scheduledActivitiesContext.activeRange');
        if (
          (rangeType === 'isMonthly' || rangeType === 'isWeekly') &&
          scheduledActivitiesLists &&
          scheduledActivitiesLists.length
        ) {
          let totalLength = scheduledActivitiesLists.length - 1;
          let getDate = scheduledActivitiesLists[totalLength];
          if (getDate.added_date < this.get('startDate')) {
            this.set('scheduleDateBefore', getDate.added_date);
          } else {
            this.set('scheduleDateBefore', null);
          }
        }
        component.set('meetingScheduleActivities', Ember.A([]));
        if (scheduledActivitiesLists.length > 0) {
          scheduledActivitiesLists.forEach(data => {
            const meetingScheduleActivities = data.scheduledActivities.filter(
              item => {
                return item.contentType === 'meeting';
              }
            );
            let onRefreshData = this.get('onRefreshData');
            let emptyMeet = meetingScheduleActivities.filter(
              eventItem => !eventItem.meeting_url
            );
            if (onRefreshData && emptyMeet.length) {
              let lastData = emptyMeet.find(
                item => item.title === onRefreshData.title
              );
              if (lastData) {
                let emailIDs;
                if (onRefreshData) {
                  emailIDs = onRefreshData.userEmails;
                }
                if (emailIDs.length) {
                  this.createConferenceEvent(onRefreshData, emailIDs).then(
                    eventDetails => {
                      if (eventDetails.meetingUrl) {
                        let updateParams = {
                          classId: this.get('classId'),
                          contentId: lastData.id,
                          data: {
                            meeting_id: eventDetails.meetingId,
                            meeting_url: onRefreshData.meeting_url
                              ? onRefreshData.meeting_url
                              : eventDetails.meetingUrl,
                            meeting_endtime: onRefreshData.meetingEndTime,
                            meeting_starttime: onRefreshData.meetingStartTime,
                            meeting_timezone: moment.tz.guess()
                          }
                        };
                        lastData.setProperties({
                          meeting_url: onRefreshData.meeting_url
                            ? onRefreshData.meeting_url
                            : eventDetails.meetingUrl,
                          meeting_starttime: onRefreshData.meetingStartTime,
                          meeting_endtime: onRefreshData.meetingEndTime,
                          meeting_timezone: moment.tz.guess(),
                          meeting_id: eventDetails.meetingId
                        });
                        component
                          .get('classActivityService')
                          .addUsersToActivity(
                            onRefreshData.class_id,
                            lastData.id,
                            onRefreshData.userIds
                          );
                        component
                          .get('videConferenceService')
                          .updateConferenceEvent(updateParams);
                      }
                    }
                  );
                }
              }
            }
            let meetingActivity = component
              .get('meetingScheduleActivities')
              .concat(meetingScheduleActivities);
            component.set('meetingScheduleActivities', meetingActivity);
          });
        }
        component.set('scheduledActivitiesList', scheduledActivitiesLists);
        component.fetchMasteryAccrualContents(groupedClassActivities);

        if (isInitialLoad) {
          let activitiesList = component.get('scheduledActivitiesList');
          let todayDate = this.get('selectedDate')
            ? this.get('selectedDate')
            : moment().format('YYYY-MM-DD');
          let todayActivityList = activitiesList.findBy(
            'added_date',
            todayDate
          );
          if (todayActivityList) {
            component.set(
              'todayActivities',
              todayActivityList.get('scheduledActivities').reverse()
            );
          }
        }
        component.set('newlyAddedActivity', null);
        component.set('isLoading', false);
        return groupedClassActivities;
      });
    },

    /**
     * @function aggregateScheduledActivitiesByDate
     * @param groupedClassActivities
     * Method to get grouped activities by added date
     */
    aggregateScheduledActivitiesByDate(groupedClassActivities = Ember.A([])) {
      const scheduledActivitiesList = Ember.A([]);
      groupedClassActivities.forEach(data => {
        let addedDate = data.get('added_date');
        let classActivity = scheduledActivitiesList.findBy(
          'added_date',
          addedDate
        );
        if (!classActivity) {
          classActivity = Ember.Object.create({
            added_date: addedDate,
            scheduledActivities: Ember.A([])
          });
          scheduledActivitiesList.pushObject(classActivity);
        }
        classActivity.get('scheduledActivities').pushObject(data);
      });
      return scheduledActivitiesList.sortBy('added_date').reverse();
    },

    /**
     * Removes a class activity from a list of classActivities
     * @param {classActivity} classActivity
     */
    removeClassActivity(classActivity) {
      const component = this;
      let addedDate = classActivity.get('added_date');
      let todayActivities = component.get('todayActivities');
      todayActivities.removeObject(classActivity);
      component.set('todayActivities', todayActivities);
      let scheduledActivity = component.get('scheduledActivitiesList');
      let activityList = scheduledActivity.findBy('added_date', addedDate);
      activityList.get('scheduledActivities').removeObject(classActivity);
      let meetingScheduledActivity = component.get('meetingScheduleActivities');
      meetingScheduledActivity.removeObject(classActivity);
      this.loadActivitiesForMonth(this.get('forMonth'), this.get('forYear'));
    },

    loadUnScheduledActivities() {
      const component = this;
      const classId = component.get('classId');
      const secondaryClasses = component.get('secondaryClasses');
      const secondaryClassIds = secondaryClasses.map(secondaryClass => {
        return secondaryClass.get('id');
      });
      const forMonth = component.get('forMonth');
      const forYear = component.get('forYear');
      const requestBody = {
        content_type: 'offline-activity,assessment,collection,meeting',
        secondaryclasses: secondaryClassIds.join(','),
        for_month: forMonth,
        for_year: forYear
      };
      return Ember.RSVP.hash({
        unScheduledActivities: component
          .get('classActivityService')
          .getUnScheduledActivitiesByMonthYear(classId, requestBody)
      }).then(({ unScheduledActivities }) => {
        component.set(
          'unScheduledActivities',
          component.groupActivitiesByClass(unScheduledActivities)
        );
        component.set('isLoading', false);
      });
    },

    loadActivitiesForMonth(forMonth, forYear) {
      const component = this;
      const classId = component.get('classId');
      const startDate = `${forYear}-${forMonth}-01`;
      const isDefaultShowFW = component.get('isDefaultShowFW');
      const classFramework = component.get('classFramework');
      const endDate = moment(startDate)
        .endOf('month')
        .format('YYYY-MM-DD');
      const requestBody = {
        content_type: 'offline-activity,assessment,collection,meeting',
        start_date: startDate,
        end_date: endDate
      };
      component
        .get('classActivityService')
        .getScheduledActivitiesByDate(
          classId,
          requestBody,
          isDefaultShowFW,
          classFramework
        )
        .then(classActivities => {
          component.set('classActivitiesOfMonth', classActivities);
          this.loadScheduledClassActivities();
        });
    },

    loadItemsToGrade() {
      let component = this;
      const secondaryClasses = component.get('secondaryClasses');
      const classesToBeGraded = Ember.A([
        component.get('primaryClass.id')
      ]).concat(secondaryClasses.mapBy('id'));
      let gradingItemsList = Ember.A([]);
      classesToBeGraded.map(classId => {
        Ember.RSVP.hash({
          oaItems: component.get('oaAnaltyicsService').getOAToGrade(classId),
          questionItems: component
            .get('rubricService')
            .getQuestionsToGradeForDCA(classId)
        }).then(function(hash) {
          let questionItems = hash.questionItems.gradeItems.filterBy(
            'collectionType',
            CONTENT_TYPES.ASSESSMENT
          );
          let oaItems = hash.oaItems.gradeItems;
          let gradableItems = questionItems.concat(oaItems);
          if (gradableItems && gradableItems.length) {
            gradableItems.map(gradableItem => {
              gradableItem.set('classId', classId);
              gradingItemsList.pushObject(gradableItem);
            });
          }
        });
      });
      component.set('gradingItemsList', gradingItemsList);
    },

    groupActivitiesByClass(classActivities) {
      const component = this;
      const groupedActivities = Ember.A([]);
      const primaryClass = component.get('primaryClass');
      const secondaryClassesData = component.get('secondaryClassesData');
      classActivities.map(classActivity => {
        let activityClassData =
          secondaryClassesData.findBy('id', classActivity.get('classId')) ||
          primaryClass;

        let existingActivity;
        if (classActivity.contentType !== 'meeting') {
          existingActivity = groupedActivities.find(groupedActivity => {
            return (
              groupedActivity.get('contentId') ===
                classActivity.get('contentId') &&
              groupedActivity.get('added_date') ===
                classActivity.get('added_date') &&
              groupedActivity.get('end_date') === classActivity.get('end_date')
            );
          });
        }
        let activityClass = component.getStructuredClassActivityObject(
          classActivity,
          activityClassData
        );
        if (existingActivity) {
          let activityClasses = existingActivity.get('activityClasses');
          activityClasses.pushObject(activityClass);
        } else {
          classActivity.set('activityClasses', Ember.A([activityClass]));
          classActivity.set('isActive', !!classActivity.get('activation_date'));
          groupedActivities.pushObject(classActivity);
        }
      });
      return groupedActivities;
    },

    getStructuredClassActivityObject(classActivity, activityClassData) {
      return Ember.Object.create({
        id: classActivity.get('classId'),
        title: activityClassData.get('title'),
        courseId: activityClassData.get('courseId') || null,
        members: activityClassData.get('members') || null,
        course: activityClassData.get('course') || null,
        content: classActivity.get('collection'),
        code: activityClassData.get('code') || null,
        memberCount: activityClassData.get('memberCount') || 0,
        activity: Ember.Object.create({
          id: classActivity.get('id'),
          usersCount: classActivity.get('usersCount'),
          isCompleted: classActivity.get('isCompleted'),
          allowMasteryAccrual: classActivity.get('allowMasteryAccrual'),
          activation_date: classActivity.get('activation_date'),
          end_date: classActivity.get('end_date'),
          added_date: classActivity.get('added_date')
        })
      });
    },

    groupGradingItems() {
      const component = this;
      const gradingItemsList = component.get('gradingItemsList');

      if (gradingItemsList.length !== 0) {
        const groupedGradingItems = Ember.A([]);
        const gradingList = Ember.A([]);
        const secondaryClasses = component.get('secondaryClasses');

        gradingItemsList.map(gradingItem => {
          let existingGradingItem = groupedGradingItems.find(
            groupedGradingItem => {
              return (
                (gradingItem.get('contentType') === CONTENT_TYPES.ASSESSMENT &&
                  gradingItem.get('resourceId') &&
                  groupedGradingItem.get('resourceId')) ||
                (gradingItem.get('contentType') ===
                  CONTENT_TYPES.OFFLINE_ACTIVITY &&
                  gradingItem.get('collectionId') &&
                  groupedGradingItem.get('contentId'))
              );
            }
          );
          const classData =
            secondaryClasses.findBy('id', gradingItem.get('classId')) ||
            component.get('primaryClass');
          const classObject = Ember.Object.create({
            title: classData.get('title'),
            id: classData.get('id'),
            code: classData.get('code'),
            activityDate: gradingItem.get('activityDate') || undefined,
            studentCount: gradingItem.get('studentCount')
          });

          if (existingGradingItem) {
            let gradingClasses = existingGradingItem.get('gradingClasses');
            gradingClasses.pushObject(classObject);
          } else {
            existingGradingItem = Ember.Object.create({
              contentId: gradingItem.get('collectionId'),
              contentType: gradingItem.get('collectionType'),
              resourceId: gradingItem.get('resourceId'),
              activityId: gradingItem.get('dcaContentId') || undefined,
              gradingClasses: Ember.A([classObject]),
              subQuestionId: gradingItem.subQuestionId || undefined,
              studentCount: gradingItem.get('studentCount'),
              activationDate: gradingItem.get('activationDate'),
              students: gradingItem.get('students'),
              title: gradingItem.get('title'),
              dca_content_id: gradingItem.get('dca_content_id')
            });
            groupedGradingItems.pushObject(existingGradingItem);
          }
        });

        var setObj = new Set();
        var contentIdList = groupedGradingItems.reduce(
          (tempGroupedGradingItems, item) => {
            if (
              !setObj.has(
                item.contentType !== CONTENT_TYPES.OFFLINE_ACTIVITY &&
                  item.activationDate &&
                  item.contentId &&
                  item.dca_content_id
              )
            ) {
              setObj.add(item.activationDate, item);
              setObj.add(item.contentId, item);
              setObj.add(item.dca_content_id, item);

              tempGroupedGradingItems.push(item);
            }
            return tempGroupedGradingItems;
          },
          []
        );

        contentIdList.forEach(function(data) {
          var filterGrades = groupedGradingItems.filter(function(grade) {
            return (
              grade.activationDate === data.activationDate &&
              grade.contentId === data.contentId &&
              grade.dca_content_id === data.dca_content_id
            );
          });

          const tempGrading = Ember.Object.create({
            contentId: data.contentId,
            contentType: data.contentType,
            subQuestionId: data.subQuestionId,
            activationDate: data.activationDate,
            resourceId: data.resourceId,
            activityId: data.activityId,
            students: data.students,
            title: data.title,
            gradingClasses: data.gradingClasses,
            filterGrades: filterGrades
          });

          gradingList.pushObject(tempGrading);
          component.set('gradingItems', gradingList);
        });
      } else {
        component.set('gradingItems', Ember.A([]));
      }
    },

    groupGradingItem() {
      let component = this;
      if (component.get('filterItem') === 'student') {
        component.set(
          'gradingItems',
          component.get('gradingItems').sortBy('studentCount')
        );
      } else if (component.get('filterItem') === 'activity') {
        component.set(
          'gradingItems',
          component.get('gradingItems').sortBy('contentType')
        );
      } else {
        component.set(
          'gradingItems',
          component
            .get('gradingItems')
            .sortBy('activationDate')
            .reverse()
        );
      }
    },

    fetchActivityUsers(classId, activityId) {
      let component = this;
      return Ember.RSVP.hash({
        activityMembers: component
          .get('classActivityService')
          .fetchUsersForClassActivity(classId, activityId)
      }).then(({ activityMembers }) => {
        return activityMembers;
      });
    },

    /**
     * @function fetchActivityPerformanceSummary
     * Method to fetch given activity performance summary
     */
    fetchActivityPerformanceSummary(activityClass) {
      const component = this;
      const classActivityService = component.get('classActivityService');
      const classId = activityClass.get('id');
      const classActivity = activityClass.get('activity');
      const contentType =
        activityClass.get('content.collectionType') ||
        activityClass.get('content.format');
      const startDate = classActivity.get('activation_date')
        ? classActivity.get('activation_date')
        : moment().format('YYYY-MM-DD');
      const endDate = classActivity.get('activation_date')
        ? classActivity.get('activation_date')
        : moment().format('YYYY-MM-DD');
      classActivity.set('contentType', contentType);
      classActivity.set('collection', activityClass.get('content'));
      return Ember.RSVP.hash({
        activityPerformance: classActivityService.findClassActivitiesPerformanceSummary(
          classId,
          Ember.A([classActivity]),
          startDate,
          endDate
        )
      }).then(({ activityPerformance }) => {
        return activityPerformance;
      });
    },

    scheduleActivityToClass(classActivity, scheduleDate, endDate) {
      const component = this;
      const contentId = classActivity.get('contentId');
      const contentType = classActivity.get('contentType');
      const month = moment(scheduleDate).format('MM');
      const year = moment(scheduleDate).format('YYYY');
      const activityClasses = classActivity.get('activityClasses');
      const secondaryClasses = component.get('secondaryClasses');
      const classesToSchedule = Ember.A([
        component.get('primaryClass.id')
      ]).concat(secondaryClasses.mapBy('id'));
      classesToSchedule.map(classId => {
        const addedActivity = activityClasses.findBy('id', classId);
        if (addedActivity) {
          const activityId = addedActivity.get('activity.id');
          component
            .get('classActivityService')
            .scheduleClassActivity(classId, activityId, scheduleDate, endDate);
        } else {
          component
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
        }
      });
      if (component.get('isShowUnscheduledActivities')) {
        component.loadUnScheduledActivities();
      } else {
        component.loadScheduledClassActivities();
      }
    },

    addActivityToClass(
      classActivity,
      scheduleDate = null,
      endDate = null,
      month = null,
      year = null
    ) {
      const component = this;
      const contentId = classActivity.get('contentId');
      const contentType = classActivity.get('contentType');
      month = month || moment(scheduleDate).format('MM');
      year = year || moment(scheduleDate).format('YYYY');
      const secondaryClasses = component.get('secondaryClasses');
      const classesToSchedule = Ember.A([
        component.get('primaryClass.id')
      ]).concat(secondaryClasses.mapBy('id'));
      classesToSchedule.map(classId => {
        Ember.RSVP.hash({
          addedActivity: component
            .get('classActivityService')
            .addActivityToClass(
              classId,
              contentId,
              contentType,
              scheduleDate,
              month,
              year,
              endDate
            )
        }).then(({ addedActivity }) => {
          return addedActivity;
        });
      });
      component.loadScheduledClassActivities();
      component.send('showNextMonth', scheduleDate);
    },

    fetchMasteryAccrualContents(classActivities = Ember.A([])) {
      const component = this;
      classActivities = classActivities.filter(item => {
        return item.contentType !== 'meeting';
      });
      const contentIds = classActivities.mapBy('contentId');
      if (classActivities.length) {
        Ember.RSVP.hash({
          masteryAccrualContents: component
            .get('assessmentService')
            .assessmentsMasteryAccrual(contentIds)
        }).then(({ masteryAccrualContents }) => {
          masteryAccrualContents.map(masteryAccrualContent => {
            let masteryAccrualContentId = Object.keys(masteryAccrualContent);
            const contentId = masteryAccrualContentId.objectAt(0);
            const classActivity = classActivities.findBy(
              'contentId',
              contentId
            );
            classActivity.set(
              'masteryAccrualCompetencies',
              masteryAccrualContent[contentId]
            );
          });
        });
      }
    },

    onUpdateMasteryAccrual(classActivity) {
      let component = this;
      const activityClasses = classActivity.get('activityClasses');
      let masteryAccrualState = !classActivity.get('allowMasteryAccrual');
      const activityClassMap = activityClasses.map(activityClass => {
        const classId = activityClass.get('id');
        const contentId = activityClass.get('activity.id');
        return new Ember.RSVP.Promise((resolve, reject) => {
          component
            .get('classActivityService')
            .updateMasteryAccrualClassActivity(
              classId,
              contentId,
              masteryAccrualState
            )
            .then(() => {
              activityClass.set(
                'activity.allowMasteryAccrual',
                masteryAccrualState
              );
              resolve();
            }, reject);
        });
      });
      Ember.RSVP.all(activityClassMap).then(() => {
        classActivity.set('allowMasteryAccrual', masteryAccrualState);
      });
    },

    getClassCourse(classId) {
      const classData =
        this.get('secondaryClassesData').findBy('id', classId) ||
        this.get('primaryClass');
      return Ember.RSVP.hash({
        course: classData.get('course')
          ? Ember.RSVP.resolve(classData.get('course'))
          : classData.get('courseId')
            ? this.get('courseService').fetchById(classData.get('courseId'))
            : Ember.Object.create({})
      }).then(({ course }) => {
        classData.set('course', course);
        return course;
      });
    },

    getClassMembers(classId) {
      const classData =
        this.get('secondaryClassesData').findBy('id', classId) ||
        this.get('primaryClass');
      const isMembersExists =
        classData.get('members') && classData.get('members.length');
      return Ember.RSVP.hash({
        classMembers: !isMembersExists
          ? this.get('classService').readClassMembers(classId)
          : Ember.RSVP.resolve({})
      }).then(({ classMembers }) => {
        if (!isMembersExists) {
          classData.set('owner', classMembers.get('owner'));
          classData.set('collaborators', classMembers.get('collaborators'));
          classData.set(
            'memberGradeBounds',
            classMembers.get('memberGradeBounds')
          );
          classData.set('members', classMembers.get('members'));
        }
        return classData.get('members');
      });
    },

    markOfflineActivityStatus(classActivity) {
      const component = this;
      const activityClasses = classActivity.get('activityClasses');
      activityClasses.map(activityClass => {
        const classId = activityClass.get('id');
        const activityId = activityClass.get('activity.id');
        component
          .get('classActivityService')
          .completeOfflineActivity(classId, activityId)
          .then(() => {
            activityClass.set('activity.isCompleted', true);
          });
      });
    },

    changeScheduledActivitiesContext(daterange, startDate, endDate) {
      let contextObj = this.get('scheduledActivitiesContext');
      contextObj.set('startDate', startDate);
      contextObj.set('endDate', endDate);
      contextObj.set('activeRange', daterange);
    },

    updateVideoConferenceList(content, activity) {
      let component = this;
      let emailIDs =
        activity
          .get('members')
          .filterBy('email')
          .mapBy('email') || [];
      Ember.RSVP.hash({
        classStudents: component.getClassMembers(activity.get('id'))
      }).then(({ classStudents }) => {
        if (!emailIDs.length) {
          emailIDs = classStudents.mapBy('email');
        }
        if (emailIDs.length) {
          component
            .createConferenceEvent(activity, emailIDs)
            .then(eventDetails => {
              if (eventDetails.meetingUrl) {
                let updateParams = {
                  classId: activity.get('id'),
                  contentId: activity.get('activity.id'),
                  data: {
                    meeting_id: eventDetails.meetingId,
                    meeting_url: content.meetingUrl
                      ? content.meetingUrl
                      : eventDetails.meetingUrl,
                    meeting_endtime: activity.meetingEndTime,
                    meeting_starttime: activity.meetingStartTime,
                    meeting_timezone: moment.tz.guess()
                  }
                };
                content.setProperties(updateParams.data);
                component
                  .get('videConferenceService')
                  .updateConferenceEvent(updateParams);
              }
            });
        }
      });
    },

    getListOfDates(startDate, endDate) {
      let dateArray = Ember.A([]);
      while (moment(startDate) <= moment(endDate)) {
        dateArray.push(startDate);
        startDate = moment(startDate)
          .add(1, 'days')
          .format('YYYY-MM-DD');
      }
      return dateArray;
    },

    caPresentEvent(eventName, content) {
      const component = this;
      component.get('castEventService').castEvent(eventName, content);
    },

    createConferenceEvent(activity, emailIDs) {
      const component = this;
      if (component.preferredMeetingTool() === MEETING_TOOLS.zoom) {
        let params = {
          topic: `${activity.title} : ${activity.title}`,
          type: 2,
          start_time: activity.meetingStartTime,
          duration: moment(activity.meetingEndTime).diff(
            moment(activity.meetingStartTime),
            'minutes'
          ),
          timezone: moment.tz.guess(),
          password: component.get('passwordData')
        };
        return component.get('videConferenceService').createZoomMeeting(params);
      } else {
        let params = {
          summary: `${activity.title} : ${activity.title}`,
          startDateTime: activity.meetingStartTime,
          endDateTime: activity.meetingEndTime,
          attendees: emailIDs,
          timeZone: moment.tz.guess()
        };
        if (params.attendees.length) {
          return component
            .get('videConferenceService')
            .createConferenceEvent(params);
        }
      }
    },
    fetchCaPerformance() {
      if (
        this.get('selectedActivity') &&
        this.get('selectedActivity.collection')
      ) {
        const collectionId = this.get('selectedActivity.collection.id');
        const collectionType = this.get('selectedActivity.collection.format');
        let classFramework = this.get('classFramework');
        let isDefaultShowFW = this.get('isDefaultShowFW');
        const activityDate = this.get(
          'selectedActivity.activityClass.activity.activation_date'
        );
        const endDate = this.get(
          'selectedActivity.activityClass.activity.end_date'
        );
        let collectionPromise;
        if (collectionType === 'collection') {
          collectionPromise = this.get('collectionService').readCollection(
            collectionId,
            classFramework,
            isDefaultShowFW
          );
        } else {
          collectionPromise = this.get('assessmentService').readAssessment(
            collectionId,
            classFramework,
            isDefaultShowFW
          );
        }
        collectionPromise.then(response => {
          this.get('analyticsService')
            .getDCAPerformance(
              this.get('selectedActivity.classId'),
              collectionId,
              collectionType,
              activityDate,
              endDate
            )
            .then(studentRes => {
              const questions = response.children;
              const students = this.get('primaryClass.members').map(member => {
                let student = Ember.Object.create({
                  id: member.id,
                  firstName: member.firstName,
                  lastName: member.lastName,
                  name: `${member.lastName}, ${member.firstName}`,
                  avatarUrl: member.get('avatarUrl')
                });
                const stud = studentRes.findBy('user', member.id);
                if (stud && stud.resourceResults) {
                  const resourceResult = getObjectsDeepCopy(
                    stud.resourceResults
                  );
                  let studentQuestion = Ember.A([]);
                  questions.map(question => {
                    const qsnCopy = question.copy();
                    const option =
                      qsnCopy && qsnCopy.answers
                        ? qsnCopy.answers.copy()
                        : null;
                    const userAns = resourceResult.findBy(
                      'resourceId',
                      question.id
                    );
                    if (userAns) {
                      qsnCopy.status = userAns.correct;
                      qsnCopy.answerObject =
                        userAns && userAns.answerObject
                          ? userAns.answerObject
                          : null;
                      qsnCopy.score = userAns.score;
                      qsnCopy.userAns = userAns.userAnswer;
                    }
                    option.map(opt => {
                      if (userAns) {
                        opt.answer_text = userAns.userAnswer;
                        let crtAns;
                        if (userAns.answerObject) {
                          crtAns = userAns.answerObject.findBy(
                            'answerId',
                            opt.id
                          );
                        }
                        if (crtAns) {
                          opt.isShowAnswer = crtAns.status;
                        }
                      }
                    });
                    studentQuestion.push(qsnCopy);
                  });
                  student.set('questions', studentQuestion);
                } else {
                  student.set('questions', questions);
                }
                return student;
              });
              let reportData = {
                questions: response.children,
                students: students
              };
              this.set('reportData', reportData);
            });
        });
      }
    }
  }
);
