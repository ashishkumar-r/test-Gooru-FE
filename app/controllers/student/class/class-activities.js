import Ember from 'ember';
import SessionMixin from 'gooru-web/mixins/session';
import ModalMixin from 'gooru-web/mixins/modal';
import { PLAYER_EVENT_SOURCE, SCREEN_SIZES } from 'gooru-web/config/config';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import Language from 'gooru-web/mixins/language';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

/**
 * Class activities controller
 *
 * Controller responsible of the logic for the student class activities tab
 */
export default Ember.Controller.extend(
  SessionMixin,
  ModalMixin,
  TenantSettingsMixin,
  Language,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * Read the class data from the parent student class controller
     * @property {Object}
     */
    classController: Ember.inject.controller('student.class'),

    /**
     * @requires service:api-sdk/class-activity
     */
    classActivityService: Ember.inject.service('api-sdk/class-activity'),

    /**
     * @requires service:api-sdk/analytics
     */
    analyticsService: Ember.inject.service('api-sdk/analytics'),

    /**
     * @requires service:api-sdk/suggest
     */
    suggestService: Ember.inject.service('api-sdk/suggest'),

    /**
     * @requires service:api-sdk/offline-activity-analytics
     */
    oaAnaltyicsService: Ember.inject.service(
      'api-sdk/offline-activity/oa-analytics'
    ),

    /**
     * @requires service:api-sdk/offline-activity
     */
    offlineActivityService: Ember.inject.service(
      'api-sdk/offline-activity/offline-activity'
    ),

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    // -------------------------------------------------------------------------
    // Actions

    actions: {
      onShowClassActivities() {
        const controller = this;
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_CA_TAB);
        controller.set('showItemsToGrade', false);
      },

      onShowItemsToGrade() {
        const controller = this;
        controller
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_CA_ITEM_TO_GRADE_TAB);
        controller.set('showItemsToGrade', true);
      },

      onSelectWeek(startDate, endDate) {
        let controller = this;
        let forMonth = moment(endDate).format('MM');
        let forYear = moment(endDate).format('YYYY');
        controller.set('forMonth', forMonth);
        controller.set('forYear', forYear);
        controller.set('startDate', startDate);
        controller.set('endDate', endDate);
        controller.loadActivities(startDate, endDate);
        controller.send('toggleDatePicker');
      },

      onShowSuggestion(classActivity) {
        const controller = this;
        controller.set('selectedClassActivity', classActivity);
        controller.fetchSuggestionContent(classActivity);
      },

      onOpenReportGrade(itemToGrade) {
        let controller = this;
        controller.set('itemToGradeContextData', itemToGrade);
        controller.set('showOAGrade', true);
      },

      toggleDatePicker() {
        let controller = this;
        controller.toggleProperty('isActive');
        controller.animateDatePicker();
      },

      onSelectRangeType(rangeType) {
        const controller = this;

        if (rangeType === 'daily') {
          controller
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_CA_DAILY);
        } else if (rangeType === 'weekly') {
          controller
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_CA_WEEKLY);
        } else if (rangeType === 'monthly') {
          controller
            .get('parseEventService')
            .postParseEvent(PARSE_EVENTS.CLICK_STUDENT_CA_MONTHLY);
        }

        let forMonth = moment().format('MM');
        let forYear = moment().format('YYYY');
        controller.set('isDaily', false);
        controller.set('isMonthly', false);
        controller.set('isWeekly', false);
        controller.set('forMonth', forMonth);
        controller.set('forYear', forYear);
        let selectedDate = moment().format('YYYY-MM-DD');
        if (rangeType === 'daily') {
          controller.set('isDaily', true);
        } else if (rangeType === 'weekly') {
          controller.set('isWeekly', true);
          selectedDate = moment()
            .startOf('week')
            .format('YYYY-MM-DD');
          controller.set('selectedWeekDate', selectedDate);
        } else {
          controller.set('isMonthly', true);
          controller.set('selectedMonth', moment().format('YYYY-MM'));
        }
        controller.loadActivitiesForMonth();
      },

      studentDcaReport(
        collection,
        studentPerformance,
        activityDate,
        classActivity,
        isSuggested
      ) {
        let controller = this;
        let userId = controller.get('session.userId');
        let users = controller.get('class.members').filterBy('id', userId);
        let params = {
          userId: userId,
          classId: controller.get('class.id'),
          collectionId:
            collection.get('id') || collection.get('suggestedContentId'),
          type:
            collection.get('format') || collection.get('suggestedContentType'),
          isStudent: true,
          collection,
          activityDate,
          studentPerformance,
          classActivity,
          users,
          startDate: classActivity.get('activation_date'),
          endDate: classActivity.get('end_date')
        };
        controller.set('isShowStudentExternalAssessmentReport', false);
        controller.set('showStudentDcaReport', false);
        controller.set('isShowStudentExternalCollectionReport', false);
        controller.set('isShowOfflineActivityReport', false);
        const isCollection = params.type === 'collection';
        if (collection.get('format') === 'assessment-external') {
          controller.set('isShowStudentExternalAssessmentReport', true);
        } else if (collection.get('format') === 'collection-external') {
          controller.set('isShowStudentExternalCollectionReport', true);
        } else if (collection.get('format') === 'offline-activity') {
          controller.set('isShowOfflineActivityReport', true);
        } else {
          controller.set('showStudentDcaReport', true);
        }
        controller.set('isSuggestedCollection', isSuggested && isCollection);
        controller.set('useSession', isSuggested && !isCollection);
        controller.set('studentReportContextData', params);
      },

      onClosePullUp() {
        let controller = this;
        controller.set('isShowStudentExternalCollectionReport', false);
        controller.set('isShowStudentExternalAssessmentReport', false);
        controller.set('studentDcaReport', false);
        controller.set('isShowOfflineActivityReport', false);
      },

      showPreviousMonth(date) {
        let controller = this;
        let forMonth = moment(date).format('MM');
        let forYear = moment(date).format('YYYY');
        controller.set('forMonth', forMonth);
        controller.set('forYear', forYear);
        controller.loadActivitiesForMonth();
      },

      onSelectMonth(date) {
        let controller = this;
        let startDate = `${date}-01`;
        let endDate = moment(startDate)
          .endOf('month')
          .format('YYYY-MM-DD');
        let forMonth = moment(startDate).format('MM');
        let forYear = moment(startDate).format('YYYY');
        controller.set('forMonth', forMonth);
        controller.set('forYear', forYear);
        controller.set('startDate', startDate);
        controller.set('endDate', endDate);
        controller.loadActivities(startDate, endDate);
        controller.send('toggleDatePicker');
      },

      showNextMonth(date) {
        let controller = this;
        let forMonth = moment(date).format('MM');
        let forYear = moment(date).format('YYYY');
        controller.set('forMonth', forMonth);
        controller.set('forYear', forYear);
        controller.loadActivitiesForMonth();
      },

      onSelectDate(date) {
        let controller = this;
        controller.set('startDate', date);
        controller.set('endDate', null);
        controller.loadActivities(date);
        controller.send('toggleDatePicker');
      },

      onSelectToday(date) {
        let controller = this;
        controller.send('onSelectDate', date);
        controller.set('endDate', null);
      },

      playContent(playerUrl, content) {
        const controller = this;
        controller.set('playerUrl', playerUrl);
        controller.set('isOpenPlayer', true);
        controller.set('playerContent', content);
        controller.set(
          'isSuggestedContentPlay',
          content.get('isSuggestedContentPlay')
        );
      },

      closePullUp() {
        const controller = this;
        const isSuggestedContentPlay = controller.get('isSuggestedContentPlay');
        if (isSuggestedContentPlay) {
          const classActivity = controller.get('selectedClassActivity');
          classActivity.set('suggestions', false);
          controller.fetchSuggestionContent(classActivity);
        } else {
          const startDate = controller.get('startDate');
          const endDate = controller.get('endDate');
          controller.loadActivities(startDate, endDate);
          controller.loadItemsToGrade();
        }
        controller.set('isOpenPlayer', false);
        controller.get('classController').send('reloadData');
      }
    },

    // -------------------------------------------------------------------------
    // Properties
    /**
     * @property {String} endDate
     * Property to handle endDate
     */
    endDate: null,
    /**
     * @property {Boolean} isMobileView
     * Property to handle is mobile view
     */
    isMobileView: isCompatibleVW(SCREEN_SIZES.MEDIUM),

    /**
     * @property {Boolean} isDaily
     * Property to handle daily view
     */
    isDaily: true,

    /**
     * @property {Boolean} isWeekly
     * Property to handle weekly view
     */
    isWeekly: false,

    /**
     * @property {Boolean} isMonthly
     * Property to handle montly view
     */
    isMonthly: false,

    queryParams: ['tab'],

    /**
     * @property {String} tab
     */
    tab: null,

    resetPerformance: false,

    /**
     * Contains classActivity objects
     * @property {classActivity[]} classActivities
     */
    classActivities: Ember.A([]),

    /**
     * Class id
     * @property {String}
     */
    classId: Ember.computed.alias('classController.class.id'),

    /**
     * Class Object
     * @property {Object}
     */
    class: Ember.computed.alias('classController.class'),

    /**
     * @property {boolean} Indicates if there are class activities
     */
    showClassActivities: Ember.computed.gt('classActivities.length', 0),

    /**
     * @property {Boolean} isShowStudentExternalAssessmentReport
     */
    isShowStudentExternalAssessmentReport: false,

    /**
     * @property {Boolean} studentDcaReport
     */
    studentDcaReport: false,

    /**
     * Class id
     * @property {String}
     */
    collection: Ember.computed.alias('classController.class.collection'),

    /**
     * Maintain  state of loading data
     * @type {Boolean}
     */
    isLoading: false,

    /**
     * Maintains the value which of month activities displaying
     * @type {Integer}
     */
    forMonth: Ember.computed(function() {
      return moment().format('MM');
    }),
    /**
     * Maintains the value which of year activities displaying
     * @type {Integer}
     */
    forYear: Ember.computed(function() {
      return moment().format('YYYY');
    }),

    /**
     * Maintains the value of date is today or not
     * @type {Integer}
     */
    isToday: Ember.computed('startDate', function() {
      return this.get('startDate') === moment().format('YYYY-MM-DD');
    }),

    /**
     * Maintains the value of selected date of the user
     * @type {String}
     */
    startDate: Ember.computed(function() {
      return moment().format('YYYY-MM-DD');
    }),

    /**
     * Maintains the value to show items to grade
     * @type {Boolean}
     */
    showItemsToGrade: false,

    scheduledActivitiesList: Ember.computed('classActivities.[]', function() {
      const component = this;
      const scheduledActivitiesList = Ember.A([]);
      const classActivities = component.get('classActivities');
      classActivities.forEach(data => {
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
    }),

    /**
     * It Maintains the list of scheduled class activities datewise.
     * @type {Array}
     */
    scheduledClassActivitiesDatewise: Ember.computed(
      'classActivitiesOfMonth.[]',
      function() {
        let controller = this;
        let activities = Ember.A();
        controller.get('classActivitiesOfMonth').forEach(classActivity => {
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

    itemsToGrade: Ember.A([]),

    scheduleDateBefore: null,

    studentId: Ember.computed('session', function() {
      let controller = this;
      return controller.get('session.userId');
    }),

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

    /**
     * A link to the parent class controller
     * @see controllers/class.js
     * @property {studentTimespentData}
     */
    studentTimespentData: Ember.computed.alias(
      'classController.studentTimespentData'
    ),

    classFramework: Ember.computed.alias('classController.classFramework'),

    isDefaultShowFW: Ember.computed.alias('classController.isDefaultShowFW'),

    // -------------------------------------------------------------------------
    // Methods

    initialize() {
      let controller = this;
      controller._super(...arguments);
      let todayDate = moment().format('YYYY-MM-DD');
      let classes = controller.get('class');
      controller.changeLanguages(classes);
      controller.loadItemsToGrade();
      controller.loadActivities(todayDate);
    },

    /**
     * @function animateDatePicker
     * Method to slide up and down date picker
     */
    animateDatePicker() {
      let element = Ember.$('.header-container .date-range-picker-container');
      let dateDisplayEle = Ember.$(
        '.date-range-picker-container .ca-date-picker-container'
      );
      if (!element.hasClass('active')) {
        element.slideDown(400, function() {
          element.addClass('active');
          dateDisplayEle.addClass('active');
        });
      } else {
        element.slideUp(400, function() {
          element.removeClass('active');
          dateDisplayEle.removeClass('active');
        });
      }
    },
    // Note: This method is used to support for content type filter
    filterActivitiesByContent() {
      const controller = this;
      const filteredContentTypes = controller
        .get('contentTypes')
        .filterBy('isActive', true)
        .map(content => {
          return content.get('type');
        });
      let classActivities = controller.get('classActivities');
      let filteredActivites = classActivities.filter(classActivity => {
        let contentType = classActivity.get('contentType');
        contentType =
          contentType === 'assessment-external'
            ? 'assessment'
            : contentType === 'collection-external'
              ? 'collection'
              : contentType;
        return filteredContentTypes.includes(contentType);
      });
      controller.set('classActivities', filteredActivites);
    },

    loadActivities(startDate, endDate) {
      const controller = this;
      if (!endDate) {
        endDate = startDate;
      }
      controller.set('isLoading', true);
      const userId = controller.get('session.userId');
      const classId = controller.get('classId');
      const classFramework = controller.get('classFramework');
      const requestBody = {
        start_date: startDate,
        end_date: endDate
      };
      return controller
        .get('classActivityService')
        .getScheduledActivitiesByDate(
          classId,
          requestBody,
          false,
          classFramework,
          userId
        )
        .then(function(response) {
          let classActivities = [].concat.apply([], response);
          classActivities = classActivities.filter(
            activity => activity.activation_date
          );
          if (classActivities.length) {
            controller.getSuggestionCounts(classActivities);
          }
          if (
            (controller.get('isMonthly') || controller.get('isWeekly')) &&
            classActivities &&
            classActivities.length
          ) {
            let totalLength = classActivities.length - 1;
            let getDate = classActivities[totalLength];
            if (getDate.added_date < controller.get('startDate')) {
              controller.set('scheduleDateBefore', getDate.added_date);
            } else {
              controller.set('scheduleDateBefore', null);
            }
          }
          controller.set('classActivities', classActivities);
          controller.set('isLoading', false);
        });
    },

    getSuggestionCounts(classActivities) {
      const controller = this;
      const classId = controller.get('classId');
      const userId = controller.get('session.userId');
      const caIds = classActivities.map(classActivity =>
        classActivity.get('id')
      );
      const context = {
        scope: PLAYER_EVENT_SOURCE.CLASS_ACTIVITY,
        caIds,
        userId
      };
      controller
        .get('suggestService')
        .getSuggestionCountForCA(classId, context)
        .then(contents => {
          contents.map(content => {
            const caId = content.get('caId');
            let classActivity = classActivities.findBy('id', caId);
            classActivity.set('suggestionCount', content.get('total'));
          });
        });
    },

    fetchSuggestionContent(classActivity) {
      const controller = this;
      const classId = controller.get('classId');
      const userId = controller.get('session.userId');
      const caId = classActivity.get('id');
      const context = {
        scope: PLAYER_EVENT_SOURCE.CLASS_ACTIVITY,
        caIds: [caId],
        detail: true,
        userId
      };
      if (!classActivity.get('suggestions')) {
        controller
          .get('suggestService')
          .fetchSuggestionsByCAId(classId, context)
          .then(content => {
            let suggestions = content.get('suggestions');
            classActivity.set('suggestions', suggestions);
            classActivity.set('isSuggestionFetched', true);
          });
      }
    },

    /**
     * @function loadActivitiesForMonth
     * Method to fetch activities for a month
     */
    loadActivitiesForMonth() {
      const controller = this;
      const classId = controller.get('classId');
      let forMonth = controller.get('forMonth');
      let forYear = controller.get('forYear');
      let startDate = `${forYear}-${forMonth}-01`;
      let userId = controller.get('session.userId');
      let endDate = moment(startDate)
        .endOf('month')
        .format('YYYY-MM-DD');
      controller.set('isLoading', true);
      controller
        .get('classActivityService')
        .getStudentScheduledActivities(userId, classId, startDate, endDate)
        .then(classActivities => {
          controller.set('classActivitiesOfMonth', classActivities);
          controller.set('isLoading', false);
        });
    },

    loadItemsToGrade() {
      let controller = this;
      const classId = controller.get('classId');
      const userId = controller.get('session.userId');
      Ember.RSVP.hash({
        oaItems: controller
          .get('oaAnaltyicsService')
          .getOAToGrade(classId, userId)
      }).then(function(hash) {
        let gradeItems = hash.oaItems.gradeItems;
        if (gradeItems) {
          let itemsToGrade = Ember.A([]);
          gradeItems.map(function(item) {
            let gradeItem;
            gradeItem = controller.createActivityGradeItemObject(item);
            if (gradeItem) {
              itemsToGrade.push(gradeItem);
            }
          });
          Ember.RSVP.all(itemsToGrade).then(function(gradeItems) {
            controller.set('itemsToGrade', gradeItems);
          });
        }
      });
    },

    /**
     * Creates the grade item information for activity level
     * @param {[]} grade item
     * @param {item} item
     */
    createActivityGradeItemObject: function(item) {
      const controller = this;
      const activityId = item.get('collectionId');
      const contentType = item.get('collectionType');
      const dcaContentId = item.get('dcaContentId');
      const itemObject = Ember.Object.create();
      return new Ember.RSVP.Promise(function(resolve, reject) {
        controller
          .get('offlineActivityService')
          .readActivity(activityId)
          .then(function(content) {
            itemObject.setProperties({
              classId: controller.get('class.id'),
              dcaContentId,
              content,
              contentType
            });
            resolve(itemObject);
          }, reject);
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
    }
  }
);
