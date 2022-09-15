import Ember from 'ember';
import {
  PLAYER_EVENT_SOURCE,
  CLASS_ACTIVITIES_SEARCH_TABS
} from 'gooru-web/config/config';
import { getObjectsDeepCopy } from 'gooru-web/utils/utils';
import Language from 'gooru-web/mixins/language';

export default Ember.Controller.extend(Language, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * Class controller
   */
  classController: Ember.inject.controller('teacher.class'),

  /**
   * @requires service:api-sdk/analytics
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @requires service:api-sdk/class-activity
   */
  classActivityService: Ember.inject.service('api-sdk/class-activity'),

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
   * @requires service:api-sdk/assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @requires RubricService
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @requires ClassService
   */
  classService: Ember.inject.service('api-sdk/class'),

  actions: {
    /**
     * Launch an assessment on-air
     *
     * @function actions:goLive
     */
    goLive(options) {
      const controller = this;
      this.set('isShowGoLive', true);
      const classId = controller.get('classId');
      const collectionType =
        options.contentType === 'collection' ||
        options.contentType === 'collection-external'
          ? 'collection'
          : 'assessment';
      const collectionId = options.collectionId;
      const activityDate = options.content
        ? options.content.activation_date
        : moment().format('YYYY-MM-DD');
      const endDate = options.content
        ? options.content.end_date
        : moment().format('YYYY-MM-DD');
      return Ember.RSVP.hash({
        studentsPerformance: controller
          .get('analyticsService')
          .getDCAPerformance(
            classId,
            collectionId,
            collectionType,
            activityDate,
            endDate
          )
      }).then(({ studentsPerformance }) => {
        if (!controller.isDestroyed) {
          let params = Ember.A([]);
          if (studentsPerformance && studentsPerformance.length) {
            studentsPerformance.forEach(item => {
              let param = {
                userId: item.user,
                score: item.assessment ? item.assessment.score : 0
              };
              params.pushObject(param);
            });
          }
          let avgScore = JSON.stringify(params);
          const url = `/reports/class/${classId}/collection/${options.collectionId}?collectionType=${options.collectionType}&caContentId=${options.caContentId}&source=${PLAYER_EVENT_SOURCE.DAILY_CLASS}&isClassActivity=true&avgScoreData=${avgScore}`;
          this.set('goLiveUrl', url);
        }
      });
    },

    activityAdded(newlyAddedActivity) {
      const controller = this;
      controller.set('newlyAddedActivity', newlyAddedActivity);
    },
    onRefreshData(meetingInfo) {
      this.set('onRefreshData', meetingInfo);
    },

    onShowConfirmPullup(isShow, activityTitle, classroomName) {
      const controller = this;
      controller.set('activityTitle', activityTitle);
      controller.set('classroomName', classroomName);
      controller.set('isShowConfirmPullup', isShow);
      controller.set('isLoading', true);
      Ember.run.later(
        controller,
        function() {
          controller.set('isLoading', false);
        },
        2000
      );
    },

    closeConfirmPullup() {
      const controller = this;
      controller.set('isShowConfirmPullup', false);
      controller.set('activityTitle', null);
      controller.set('classroomName', null);
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * A link to the parent class controller
   * @see controllers/class.js
   * @property {Class}
   */
  class: Ember.computed.alias('classController.class'),

  /**
   * @property {Object} course
   */
  course: Ember.computed.alias('class.course'),

  /**
   * @property {UUID} classId
   */
  classId: Ember.computed.alias('class.id'),

  /**
   * @property {UUID} courseId
   */
  courseId: Ember.computed.alias('course.id'),

  /**
   * @property {Array} students
   */
  students: Ember.computed.alias('class.members'),

  /**
   * @property {String} subjectCode
   */
  subjectCode: Ember.computed.alias('course.subject'),

  /**
   * @type {Boolean}
   * Property to check whether a class is premium
   */
  isPremiumClass: Ember.computed('class', function() {
    let controller = this;
    const currentClass = controller.get('class');
    let setting = currentClass.get('setting');
    return setting ? setting['course.premium'] : false;
  }),

  secondaryClasses: Ember.computed.alias('classController.secondaryClasses'),

  secondaryClassDropdown: Ember.computed.alias(
    'classController.multiGradeList'
  ),

  secondaryClassList: Ember.computed.alias(
    'classController.secondaryClassList'
  ),

  isSecondaryClass: Ember.computed.gt('secondaryClasses.length', 0),

  /*
   * @property {Json} classPreference
   */
  classPreference: Ember.computed.alias('class.preference'),

  isMultiClassEnabled: Ember.computed.alias(
    'classController.isMultiClassEnabled'
  ),

  todayActivities: Ember.A([]),

  /**
   * @property {String} classActivitiesDefaultTabKey
   * Property for the default tab key set at Settigns
   */
  classActivitiesDefaultTabKey: Ember.computed.alias(
    'classController.classActivitiesDefaultTabKey'
  ),

  /**
   * @property {Object} defaultTab
   * Property for the default tab object
   */
  defaultTab: Ember.computed('classActivitiesDefaultTabKey', function() {
    const controller = this;
    const classActivitiesTabs = getObjectsDeepCopy(
      CLASS_ACTIVITIES_SEARCH_TABS
    );
    const defaultTabKey = controller.get('classActivitiesDefaultTabKey');
    return classActivitiesTabs.findBy('id', defaultTabKey);
  }),

  secondaryClassesData: Ember.computed.alias(
    'classController.secondaryClassesData'
  ),

  classFramework: Ember.computed.alias('classController.classFramework'),

  isDefaultShowFW: Ember.computed.alias('classController.isDefaultShowFW'),

  changeLanguage() {
    const controller = this;
    let classes = controller.get('class');
    controller.changeLanguages(classes);
  },

  resetProperties() {
    const controller = this;
    controller.set('defaultTabKey', Ember.Object.create({}));
    controller.set('todayActivities', Ember.A([]));
  }
});
