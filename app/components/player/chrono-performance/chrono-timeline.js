import Ember from 'ember';
import { isCompatibleVW } from 'gooru-web/utils/utils';
import {
  SCREEN_SIZES,
  PLAYER_EVENT_SOURCE,
  CONTENT_TYPES
} from 'gooru-web/config/config';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['chrono-timeline'],

  // -------------------------------------------------------------------------
  // Dependencies
  session: Ember.inject.service('session'),

  /**
   * @requires {LessonService} Service to retrieve a lesson
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {timeData}
   */
  timeData: Ember.A([]),

  /**
   * @property {showCourseReport}
   */
  showCourseReport: null,

  /**
   * @property {showCollectionReport}
   */
  showCollectionReport: null,

  /**
   * @property {studentCourseReportContext}
   */
  studentCourseReportContext: null,

  /**
   * @property {showExternalAssessmentReport}
   */
  showExternalAssessmentReport: null,

  /**
   * @property {studentCollectionReportContext}
   */
  studentCollectionReportContext: null,

  /**
   * @property {positionToCenter}
   */
  positionToCenter: true,

  /**
   * @property {Boolean}
   * Property to store given screen value is compatible
   */
  isMobileView: isCompatibleVW(SCREEN_SIZES.MEDIUM),

  /**
   * @property {activities}
   */
  activities: Ember.computed(
    'timeData.[]',
    'timeData.@each.selected',
    function() {
      return this.parseTimelineData();
    }
  ),

  /**
   * @property {Boolean} isShowProficiencyProgressBar
   * Property to show student proficiency progress bar only if it has a class
   */
  isShowProficiencyProgressBar: Ember.computed('class', function() {
    const component = this;
    return component.get('class') && component.get('class.id');
  }),

  didInsertElement() {
    let component = this;
    component._super(...arguments);
    let timeData = component.get('timeData');
    let numberOfTimeData = timeData.length;
    let lastIndex = numberOfTimeData - 1;
    let selectedTimeData = timeData.objectAt(lastIndex);
    selectedTimeData.set('selected', true);
    Ember.$(document).on('keydown', function(e) {
      var keycode = e.keyCode;
      if (keycode === 37 || keycode === 39) {
        let incrementVal = keycode === 37 ? 1 : -1;
        component.handleCardNavigation(incrementVal);
      }
    });
    if (component.get('isMobileView')) {
      component.swipeHandler();
    }
  },

  /**
   * @function swipeHandler
   * Method triggered on swipe of card in mobile
   */
  swipeHandler() {
    let component = this;
    component.$('#carousel').swipe({
      //Generic swipe handler for all directions
      swipe: function(event, direction) {
        if (direction === 'down') {
          window.scrollBy(0, -300);
          component.handleCardNavigation(-1);
        }
        if (direction === 'up') {
          window.scrollBy(0, 300);
          component.handleCardNavigation(1);
        }
      }
    });
  },

  /**
   * @function handleCardNavigation
   * Method triggered on navigation of card
   */
  handleCardNavigation(incrementVal) {
    let component = this;
    let timeData = component.get('timeData');
    let selectedTimeData = timeData.findBy('selected', true);
    let selectedIndex = timeData.indexOf(selectedTimeData);
    let nextIndex = selectedIndex + incrementVal;
    let activity = timeData.objectAt(nextIndex);
    if (activity) {
      component.send('onSelectCard', activity);
    }
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    onPaginateNext() {
      this.sendAction('paginateNext');
    },

    onClosePullUp() {
      let component = this;
      component.set('showCollectionReport', false);
      component.set('showExternalAssessmentReport', false);
      component.set('showStudentDcaReport', false);
      component.set('isShowStudentExternalCollectionReport', false);
      component.set('isShowStudentExternalAssessmentReport', false);
    },

    onOpenCourseReport() {
      let component = this;
      component.openStudentCourseReport();
    },

    showStudentProficiency() {
      let component = this;
      component.sendAction('showStudentProficiency');
    },

    onOpenCollectionReport(activity, collection, collectionType) {
      let component = this;
      component.openStudentCollectionReport(
        activity,
        collection,
        collectionType
      );
    },

    onSelectCard(activity) {
      let component = this;
      let timeData = component.get('timeData');
      let selectedTimeData = timeData.findBy('selected', true);
      let selectedIndex = component.get('activities').indexOf(activity);
      component.checkPagination(selectedIndex);
      selectedTimeData.set('selected', false);
      activity.set('selected', true);
      component.set('positionToCenter', true);
    }
  },

  // -------------------------------------------------------------------------
  // Events
  /**
   * @function didDestroyElement
   * Method to destroy keypress
   */
  didDestroyElement() {
    Ember.$(document).off('keydown');
  },
  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function parseTimelineData
   * Method to parse and set timeline data
   */
  parseTimelineData() {
    let component = this;
    let timeData = component.get('timeData');

    let numberOfTimeData = timeData.length;
    if (numberOfTimeData > 0) {
      let selectedTimeData = timeData.findBy('selected', true);
      let selectedIndex = timeData.indexOf(selectedTimeData);
      let leftPosSeq = 1;
      let leftStartIndex = selectedIndex - 4;
      let leftEndIndex = leftStartIndex + 4;

      component.updatePosition(
        timeData,
        leftStartIndex,
        leftEndIndex,
        'left',
        leftPosSeq
      );
      component.updatePosition(timeData, 0, leftStartIndex, 'left', 0);

      let rightPosSeq = 1;
      let rightStartIndex = selectedIndex + 1;
      let rightEndIndex = rightStartIndex + 4;
      component.updatePosition(
        timeData,
        rightStartIndex,
        rightEndIndex,
        'right',
        rightPosSeq
      );
      component.updatePosition(
        timeData,
        rightEndIndex,
        numberOfTimeData,
        'right',
        0
      );
    }
    let activities = Ember.A([]);
    timeData.forEach(data => {
      activities.pushObject(data);
    });
    return activities;
  },

  /**
   * @function checkPagination
   * Method to check and call paginate if condition is satisfied
   */
  checkPagination(selectedIndex) {
    let component = this;
    if (selectedIndex < 4) {
      component.sendAction('paginateNext');
    }
  },

  /**
   * @function openStudentCollectionReport
   * Method to open student collection report
   */
  openStudentCollectionReport(activity, collection, collectionType) {
    let component = this;
    if (activity.get('contentSource') === PLAYER_EVENT_SOURCE.DAILY_CLASS) {
      component.showDCAReport(activity, collection, collectionType);
    } else {
      component.showCourseMapReport(activity, collection, collectionType);
    }
  },

  showCourseMapReport(activity, collection, collectionType) {
    let component = this;
    let params = {
      userId: component.get('session.userId'),
      classId: activity.get('classId'),
      courseId: activity.get('courseId'),
      unitId: activity.get('unitId'),
      lessonId: activity.get('lessonId'),
      collectionId: activity.get('id'),
      sessionId:
        collectionType === 'assessment' ? activity.get('sessionId') : null,
      type: collectionType,
      isStudent: true,
      isTeacher: false,
      collection
    };
    if (collectionType === 'assessment-external') {
      component.set('showExternalAssessmentReport', true);
      component.set('showCollectionReport', false);
    } else if (collectionType === CONTENT_TYPES.OFFLINE_ACTIVITY) {
      params.performance = collection.get('performance');
      component.set('isShowOfflineActivityReport', true);
    } else {
      component.set('showExternalAssessmentReport', false);
      component.set('showCollectionReport', true);
    }
    component.set('studentReportContextData', params);
  },

  showDCAReport(activity, collection, collectionType) {
    let component = this;
    let params = component.getStudentDCAReportData(
      activity,
      collection,
      collectionType
    );
    if (collectionType === 'assessment-external') {
      component.set('isShowStudentExternalAssessmentReport', true);
      component.set('showStudentDcaReport', false);
      component.set('isShowStudentExternalCollectionReport', false);
    } else if (collectionType === 'collection-external') {
      component.set('showStudentDcaReport', false);
      component.set('isShowStudentExternalAssessmentReport', false);
      component.set('isShowStudentExternalCollectionReport', true);
    } else {
      component.set('showStudentDcaReport', true);
      component.set('isShowStudentExternalAssessmentReport', false);
      component.set('isShowStudentExternalCollectionReport', false);
    }
    component.set('studentReportContextData', params);
  },

  getDCACollectionData(collection, collectionType) {
    return Ember.Object.create({
      collectionType: collectionType,
      format: collectionType,
      id: collection.get('id'),
      title: collection.get('title'),
      thumbnailUrl: collection.get('thumbnailUrl'),
      questionCount: collection.get('questionCount'),
      resourceCount: collection.get('resourceCount'),
      oeQuestionCount: collection.get('oeQuestionCount')
    });
  },

  getDCACollectionPerformance(activity) {
    return Ember.Object.create({
      attempts: activity.get('attempts'),
      collectionId: activity.get('collectionId'),
      hasStarted: true,
      id: activity.get('id'),
      sessionId: activity.get('sessionId'),
      timeSpent: activity.get('timeSpent'),
      status: activity.get('status'),
      views: activity.get('views')
    });
  },

  getStudentDCAReportData(activity, collection, collectionType) {
    let component = this;
    return Ember.Object.create({
      activityDate: activity.get('lastAccessedDate'),
      collectionId: activity.get('collectionId'),
      classId: activity.get('classId'),
      isStudent: true,
      type: collectionType,
      userId: component.get('session.userId'),
      collection: component.getDCACollectionData(collection, collectionType),
      studentPerformance: component.getDCACollectionPerformance(activity)
    });
  },

  /**
   * @function openStudentCourseReport
   * Method to open student course report
   */
  openStudentCourseReport() {
    let component = this;
    component.set('showCourseReport', true);
    let params = Ember.Object.create({
      userId: component.get('session.userId'),
      classId: component.get('class.id'),
      class: component.get('class'),
      courseId: component.get('course.id'),
      course: component.get('course'),
      isTeacher: false,
      isStudent: true,
      loadUnitsPerformance: true
    });
    component.set('studentCourseReportContext', params);
  },

  /**
   * @function updatePosition
   * Method to update position in timeData
   */
  updatePosition(timeData, startIndex, endIndex, position, positionSeq) {
    for (let index = startIndex; index < endIndex; index++) {
      let data = timeData.objectAt(index);
      let seq = positionSeq === 0 ? positionSeq : positionSeq++;
      if (data) {
        data.set('position', position);
        data.set('positionSeq', seq);
      }
    }
  }
});
