import Ember from 'ember';
import { ANONYMOUS_COLOR } from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import visibilitySettings from 'gooru-web/mixins/visibility-settings';
import tenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
export default Ember.Controller.extend(
  ConfigurationMixin,
  visibilitySettings,
  tenantSettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies
    session: Ember.inject.service('session'),

    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyService: Ember.inject.service('taxonomy'),

    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomySdkService: Ember.inject.service('api-sdk/taxonomy'),
    /**
     * @type {ClassService} Service to retrieve class information
     */
    classService: Ember.inject.service('api-sdk/class'),

    /**
     * @type {PerformanceService} Service to retrieve class performance summary
     */
    performanceService: Ember.inject.service('api-sdk/performance'),

    /**
     * @requires service:api-sdk/competency
     */
    competencyService: Ember.inject.service('api-sdk/competency'),

    /**
     * @property {Service} Profile service
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * @type {reportService} Service to retrieve report information
     */
    reportService: Ember.inject.service('api-sdk/report'),

    /**
     * @property {TenantService} Serive to do retrieve competency score details
     */
    tenantService: Ember.inject.service('api-sdk/tenant'),

    /**
     * Toggle Options
     * @property {Ember.Array}
     */
    switchOptions: Ember.A([
      Ember.Object.create({
        label: 'common.yes',
        value: true
      }),
      Ember.Object.create({
        label: 'common.no',
        value: false
      })
    ]),

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      /**
       * Collapses the header section
       * @param {boolean} state
       */
      toggleHeader: function(state) {
        var $panels = $('.header .panel');
        if (state) {
          $panels.slideUp();
        } else {
          $panels.slideDown();
        }
      },

      reloadData: function() {
        const route = this;
        const myId = route.get('session.userId');
        const classId = route.get('class.id');
        const dataParam = {
          classId: classId,
          userId: myId,
          to: moment().format('YYYY-MM-DD')
        };
        const classPromise = route.get('classService').readClassInfo(classId);
        const timeSpentPromise = route
          .get('reportService')
          .fetchStudentTimespentReport(dataParam);
        const preference = route.get('class.preference');
        const membersPromise = route
          .get('classService')
          .readClassMembers(classId);

        return classPromise.then(function(classData) {
          let classCourseId = null;
          if (classData.courseId) {
            classCourseId = Ember.A([
              {
                classId: classId,
                courseId: classData.courseId
              }
            ]);
          }
          const performanceSummaryPromise = classCourseId
            ? route
              .get('performanceService')
              .findClassPerformanceSummaryByStudentAndClassIds(
                myId,
                classCourseId
              )
            : null;
          let caClassPerfSummaryPromise = route
            .get('performanceService')
            .getCAPerformanceData([classId], myId);
          const competencyCompletionStats = route.get('isPremiumCourse')
            ? route.get('competencyService').getCompetencyCompletionStats(
              [
                {
                  classId: classId,
                  subjectCode: preference.subject
                }
              ],
              myId
            )
            : Ember.RSVP.resolve(Ember.A());
          var shareData = route.getTenantSetting();
          return Ember.RSVP.hash({
            class: classPromise,
            members: membersPromise,
            classPerformanceSummaryItems: performanceSummaryPromise,
            competencyStats: competencyCompletionStats,
            performanceSummaryForDCA: caClassPerfSummaryPromise,
            studentTimespentData: timeSpentPromise,
            shareData: shareData
          }).then(function(hash) {
            const aClass = hash.class;
            const studentTimespentData = hash.studentTimespentData;
            const members = hash.members;
            const classPerformanceSummaryItems =
              hash.classPerformanceSummaryItems;
            let classPerformanceSummary = classPerformanceSummaryItems
              ? classPerformanceSummaryItems.findBy('classId', classId)
              : null;
            aClass.set('performanceSummary', classPerformanceSummary);
            const performanceSummaryForDCA = hash.performanceSummaryForDCA
              ? hash.performanceSummaryForDCA.objectAt(0)
              : null;
            const tenantSetting = hash.shareData;
            aClass.set(
              'isShareData',
              tenantSetting.enable_learners_data_visibilty_pref === 'on' &&
                !aClass.isPublic
            );
            aClass.set('owner', members.get('owner'));
            aClass.set('details', members.get('details'));
            aClass.set('invitees', members.get('invitees'));
            aClass.set('performanceSummaryForDCA', performanceSummaryForDCA);
            aClass.set('members', members.get('members'));
            aClass.set('memberGradeBounds', members.get('memberGradeBounds'));
            aClass.set(
              'competencyStats',
              hash.competencyStats.findBy('classId', classId)
            );
            route.set('studentTimespentData', studentTimespentData);
            route.set('class', aClass);
          });
        });
      },

      /**
       * Trigger the event to open student course report
       */
      openCourseReport: function() {
        const controller = this;
        if (
          controller.get('class.milestoneViewApplicable') &&
          controller.get('class.milestoneViewApplicable') === true
        ) {
          controller.populateMilestoneReport();
        } else {
          controller.openStudentCourseReport();
        }
      },

      //Action triggered when click on CA score
      onOpenCAReport() {
        this.populateClassActivityReport();
      },

      closePullUp() {
        const controller = this;
        controller.set('isOpenPlayer', false);
      },

      /**
       * @function onToggleUpdateShareData
       * Method to use override share data
       */
      onToggleUpdateShareData(value) {
        const controller = this;
        const classId = controller.get('class.id');
        let preferenceData = {
          show_timespent: value,
          show_score: value,
          show_proficiency: value
        };
        controller
          .get('profileService')
          .updateShareData(preferenceData, classId)
          .then();
      }
    },

    // -------------------------------------------------------------------------
    // Events

    /**
     * DidInsertElement ember event
     */
    didInsertElement: function() {
      var item = this.get('menuItem');
      this.selectMenuItem(item);
    },

    // -------------------------------------------------------------------------
    // Properties
    /**
     * The class presented to the user
     * @property {Class}
     */
    class: null,

    /**
     * The course presented to the user
     * @property {Course}
     */
    course: null,

    isDisableNavbar: false,

    /**
     * The units presented to the user
     * @property {Unit}
     */
    units: null,

    /**
     * The menuItem selected
     * @property {String}
     */
    menuItem: null,

    /**
     * @property {ClassContentVisibility}
     */
    contentVisibility: null,

    /**
     * @property {boolean} Indicates if course has 1 or more units
     */
    hasUnits: Ember.computed.gt('course.unitCount', 0),

    /**
     * @property {boolean} Indicates if class has 1 or more students
     */
    hasStudents: Ember.computed.gt('class.countMembers', 0),

    barChartData: Ember.computed(function() {
      const completed = this.get('class.performanceSummary.totalCompleted');
      const total = this.get('class.performanceSummary.total');
      const percentage = completed ? (completed / total) * 100 : 0;
      return [
        {
          color: ANONYMOUS_COLOR,
          percentage
        }
      ];
    }),

    performancePercentage: Ember.computed('barChartData', function() {
      let data = this.get('barChartData').objectAt(0);
      return data.percentage.toFixed(0);
    }),

    /**
     * @property {boolean} To get active share data
     */
    getActiveShareData: Ember.computed('class', function() {
      let controller = this;
      const details = controller.get('class.details');
      const gooruUId = controller.get('session.userData.gooruUId');
      const shareData = details.findBy('id', gooruUId);
      if (
        shareData.show_proficiency &&
        shareData.show_score &&
        shareData.show_timespent
      ) {
        return true;
      } else {
        return false;
      }
    }),

    /**
     * Maintains the state of course report visibility
     * @type {Boolean}
     */
    showCourseReport: false,

    /**
     * Property to identify when there is no content to play
     */
    isNotAbleToStartPlayer: false,

    /**
     * Property used to identify destination.
     * @type {String}
     */
    destination: Ember.computed.alias('skylineInitialState.destination'),

    /**
     * Property used to identify whether class has premium course or not.
     * @type {Boolean}
     */
    isPremiumCourse: false,

    /**
     * @property {Boolean} isShowClassActivityReport
     */
    isShowClassActivityReport: false,

    /**
     * @property {Boolean} isShowMilestoneReport
     */
    isShowMilestoneReport: false,

    classFramework: Ember.computed('class', function() {
      return this.get('class.preference') &&
        this.get('class.preference.framework')
        ? this.get('class.preference.framework')
        : null;
    }),

    // -------------------------------------------------------------------------
    // Methods

    /**
     * Selected the menu item
     * @param {string} item
     */
    selectMenuItem: function(item) {
      this.set('menuItem', item);
    },

    openStudentCourseReport() {
      let controller = this;
      controller.set('showCourseReport', true);
      let params = Ember.Object.create({
        userId: controller.get('session.userId'),
        classId: controller.get('class.id'),
        class: controller.get('class'),
        courseId: controller.get('course.id'),
        course: controller.get('course'),
        isTeacher: false,
        isStudent: true,
        loadUnitsPerformance: true
      });
      controller.set('studentCourseReportContext', params);
    },

    onClosePullUp() {
      let controller = this;
      controller.set('showCourseReport', false);
    },

    /**
     * @function populateClassActivityReport
     * Method to bring class activity report
     */
    populateClassActivityReport() {
      const controller = this;
      controller.set('isShowClassActivityReport', true);
    },

    /**
     * @function populateMilestoneReport
     * Method to populate milestone report
     */
    populateMilestoneReport() {
      const controller = this;
      controller.set('isShowMilestoneReport', true);
    }
  }
);
