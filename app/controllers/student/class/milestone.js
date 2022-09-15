import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
/**
 * MileStone Course map controller
 *
 * Controller responsible of the logic for the course map milestone view
 */
export default Ember.Controller.extend(TenantSettingsMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: ['location', 'isProficiencyValue'],

  location: null,

  /**
   * Inject the  student class parent controller.
   */
  studentClassController: Ember.inject.controller('student.class'),

  session: Ember.inject.service('session'),

  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * route0 Service to perform route0 data operations
   */
  route0Service: Ember.inject.service('api-sdk/route0'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {Object} currentLocation
   */
  currentLocation: Ember.computed(function() {
    return this.get('studentClassController.class.currentLocation');
  }),

  /**
   * @property {Number} barChartData
   */
  barChartData: Ember.computed(function() {
    return this.get('studentClassController.barChartData');
  }),

  /**
   * Overall class level performance percentage.
   */
  performancePercentage: Ember.computed(function() {
    return this.get('studentClassController.performancePercentage');
  }),

  /**
   * Milestone progress decorator property
   */
  mileStone: Ember.computed(function() {
    return {
      iconClass: 'msaddonTop',
      offset: {
        left: '-20px',
        top: '9px'
      }
    };
  }),

  /**
   * Maintains the state of whether need to show all the rescoped content or not.
   * @type {Boolean}
   */
  showAllRescopedContent: false,

  /**
   * @property {Object} activeReportPeriod
   */
  activeReportPeriod: Ember.computed(function() {
    const component = this;
    return Ember.Object.create({
      text: component.get('i18n').t('common.progress-report'),
      value: 'progress-report',
      type: 'default'
    });
  }),

  /**
   * @property {UUID} userId
   * Current logged in user Id
   */
  userId: Ember.computed.alias('session.userId'),

  /**
   * @property {UUID} classId
   */
  classId: Ember.computed.alias('studentClassController.class.id'),

  /**
   * @property {UUID} courseId
   */
  courseId: Ember.computed.alias('studentClassController.course.id'),

  /**
   * Set course activated date
   **/
  courseStartDate: Ember.computed('course.createdDate', function() {
    if (this.get('course.createdDate')) {
      return moment(this.get('course.createdDate')).format('YYYY-MM-DD');
    }
    return moment()
      .subtract(1, 'M')
      .format('YYYY-MM-DD');
  }),

  /**
   * @property {Boolean} isPublicClass
   */
  isPublic: Ember.computed.alias('class.isPublic'),

  /**
   * @property {Boolean} isAllContentsAreRescoped
   */
  isAllContentsAreRescoped: false,

  /**
   * A link to the parent class controller
   * @see controllers/class.js
   * @property {studentTimespentData}
   */
  studentTimespentData: Ember.computed(
    'studentClassController.studentTimespentData',
    'studentTimeSpend',
    function() {
      return this.get('proficiencyStatus')
        ? this.get('studentTimeSpend')
        : this.get('studentClassController.studentTimespentData');
    }
  ),

  /**
   * A link to the content visibility from class controller
   * @see controllers/class.js
   * @property {ClassContentVisibility}
   */
  contentVisibility: Ember.computed.alias(
    'studentClassController.contentVisibility'
  ),

  unit0Milestones: Ember.A([]),

  classFramework: Ember.computed.alias('studentClassController.classFramework'),

  isDefaultShowFW: Ember.computed.alias(
    'studentClassController.isDefaultShowFW'
  ),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    resetPerformance: function() {
      const component = this;
      component.get('studentClassController').send('reloadData');
    },

    /**
     * This method will take care of routing page to student locate me view.
     */
    mileStoneHandler: function() {
      let component = this;
      component.transitionToRoute('student-locate', {
        queryParams: {
          classId: component.get('class.id'),
          courseId: component.get('class.courseId')
        }
      });
    },

    onToggleRescope() {
      this.toggleProperty('showAllRescopedContent');
    },

    //Action triggered when toggle course info
    onToggleCourseInfo() {
      $('.course-info-toggle-container').slideToggle();
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_STUDENT_LJ_INFO
      );
    },

    //Action triggered in init for check all the milestone contents are rescoped
    checkAllContentsAreRescoped(milestoneData) {
      const milestones = milestoneData;
      const rescopeMilestone = milestones.filterBy('rescope', true);
      let isAllContentsAreRescoped =
        milestones.length === rescopeMilestone.length;
      this.set('isAllContentsAreRescoped', isAllContentsAreRescoped);
    },

    /**
     * Action triggered when the user click an report
     */
    onToggleReportPeriod() {
      this.set('isShowStudentProgressReport', true);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.MILESTONE_PROGRESS_REPORT
      );
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadSelfGradeItems
   * Method to load self grading items
   * @return {Promise}
   */
  loadSelfGradeItems() {
    const controller = this;
    controller.fetchOaItemsToGradeByStudent().then(function(selfGradeItems) {
      controller.set('selfGradeItems', selfGradeItems.get('gradeItems'));
    });
  },

  /**
   * @function fetchOaItemsToGradeByStudent
   * Method to fetch list of OA items to be graded by student
   * @return {Promise}
   */
  fetchOaItemsToGradeByStudent() {
    const controller = this;
    const requestParam = {
      classId: controller.get('classId'),
      type: 'oa',
      source: 'coursemap',
      courseId: controller.get('courseId'),
      userId: controller.get('userId')
    };
    return controller.get('rubricService').getOaItemsToGrade(requestParam);
  }
});
