import Ember from 'ember';
import {
  aggregateMilestonePerformanceScore,
  aggregateMilestonePerformanceTimeSpent
} from 'gooru-web/utils/performance-data';
import { getObjectCopy } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['reports', 'backdrop-pull-ups', 'pull-up-course-report'],

  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {PerformanceService}
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  courseService: Ember.inject.service('api-sdk/course'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Action triggered when the user invoke the pull up.
     **/
    onPullUpClose(closeAll) {
      this.closePullUp(closeAll);
    },

    openUnitReport(unit, units) {
      let component = this;
      let params = {
        classId: component.get('classId'),
        courseId: component.get('courseId'),
        unit: unit,
        units: units,
        classMembers: component.get('classMembers'),
        unitId: unit.get('id'),
        lessonId: component.get('lessonId')
      };
      if (component.get('isShowMilestoneReport')) {
        params.milestoneId = unit.get('milestone_id');
      }
      this.sendAction('onOpenUnitReport', params);
    },

    onClosePullUp() {
      let component = this;
      component.set('showStudentCourseReport', false);
      component.closePullUp(true);
    },
    /**
     * Trigger the event to open student course report
     */
    openStudentCourseReport(userId) {
      this.onOpenStudentCourseReport(userId);
    },

    onClickChart(userId, showReport) {
      if (showReport) {
        this.onOpenStudentCourseReport(userId);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didRender() {
    this.handleAppContainerScroll();
  },

  /**
   * Function to triggered once when the component element is first rendered.
   */
  didInsertElement() {
    this.handleScrollToFixHeader();
    this.openPullUp();
    if (this.get('isShowMilestoneReport')) {
      this.loadMilestoneReportData();
    } else {
      this.loadData();
    }
  },
  // -------------------------------------------------------------------------
  // Properties

  /**
   * ClassId belongs to this course report.
   * @type {String}
   */
  classId: Ember.computed.alias('context.classId'),

  /**
   * Class belongs to this course report.
   * @type {String}
   */
  class: Ember.computed.alias('context.class'),

  /**
   * Computed Property to extract framework code from settings
   * @return {String}
   */
  fwCode: Ember.computed('class', function() {
    let preference = this.get('class.preference');
    return preference != null ? preference.get('framework') : null;
  }),

  /**
   * Computed Property to extract framework code from settings
   * @return {String}
   */
  subject: Ember.computed('class', function() {
    let preference = this.get('class.preference');
    return preference != null ? preference.get('subject') : null;
  }),

  /**
   * CourseId belongs to this course report.
   * @type {String}
   */
  courseId: Ember.computed.alias('context.courseId'),

  /**
   * Course belongs to this course report.
   * @type {String}
   */
  course: Ember.computed.alias('context.course'),

  /**
   * Unit Id belongs to this course report.
   * @type {String}
   */
  unitId: Ember.computed.alias('context.unitId'),

  /**
   * Maintains list of course items.
   * @type {Array}
   */
  units: Ember.computed('context.course', function() {
    let units = this.get('context.course.children');
    return units;
  }),

  /**
   * Propery to hide the default pullup.
   * @property {showPullUp}
   */
  showPullUp: false,

  /**
   * List of class members
   * @type {Object}
   */
  classMembers: Ember.computed.alias('context.classMembers'),

  /**
   *  Stutent  report data
   * @type {Object}
   */
  studentReportData: Ember.A([]),

  /**
   * It maintains the state of loading
   * @type {Boolean}
   */
  isLoading: false,

  /**
   * This attribute decide default sorting key
   * @type {String}
   */
  defaultSortCriteria: 'lastName',

  /**
   * Maintain the status of sort by firstName
   * @type {String}
   */
  sortByFirstnameEnabled: false,

  /**
   * Maintain the status of sort by lastName
   * @type {String}
   */
  sortByLastnameEnabled: true,

  /**
   * Maintain the status of sort by score
   * @type {String}
   */
  sortByScoreEnabled: false,

  /**
   * Maintains the state of student unit report
   * @type {Boolean}
   */
  showStudentCourseReport: false,

  gradeSubject: {},

  //--------------------------------------------------------------------------
  // Methods
  didDestroyElement() {
    this.handleAppContainerScroll();
  },

  /**
   * Function to animate the  pullup from bottom to top
   */
  openPullUp() {
    let component = this;
    component.$().animate(
      {
        top: '10%'
      },
      400
    );
  },

  closePullUp(closeAll) {
    let component = this;
    component.$().animate(
      {
        top: '100%'
      },
      400,
      function() {
        component.set('showPullUp', false);
        if (closeAll) {
          component.sendAction('onClosePullUp');
        }
      }
    );
  },

  handleAppContainerScroll() {
    let activePullUpCount = Ember.$(document.body).find('.backdrop-pull-ups')
      .length;
    if (activePullUpCount > 0) {
      Ember.$(document.body).addClass('no-vertical-scroll');
    } else if (activePullUpCount === 0) {
      Ember.$(document.body).removeClass('no-vertical-scroll');
    }
  },

  handleScrollToFixHeader() {
    let component = this;
    component.$('.course-report-container .report-content').scroll(function() {
      let scrollTop = component
        .$('.course-report-container .report-content')
        .scrollTop();
      let scrollFixed = component.$(
        '.course-report-container .report-content .pull-up-course-report-listview .on-scroll-fixed'
      );
      let height =
        component
          .$('.course-report-container .report-content .report-carousel')
          .height() +
        component
          .$(
            '.course-report-container .report-content .report-header-container'
          )
          .height();
      if (scrollTop >= height) {
        let position = scrollTop - height;
        component.$(scrollFixed).css('top', `${position}px`);
      } else {
        component.$(scrollFixed).css('top', '0px');
      }
    });
  },

  loadData() {
    let component = this;
    const classId = this.get('classId');
    let courseId = component.get('courseId');
    let classMembers = this.get('classMembers');
    let units = component.get('units');
    component.set('isLoading', true);

    return Ember.RSVP.hash({
      performance: component
        .get('performanceService')
        .findClassPerformance(classId, courseId, classMembers, units)
    }).then(({ performance }) => {
      if (!component.isDestroyed) {
        component.calcluateUnitPerformance(performance);
        component.parseClassMemberAndPerformanceData(performance);
        component.set('sortByLastnameEnabled', true);
        component.set('sortByFirstnameEnabled', false);
        component.set('sortByScoreEnabled', false);
        component.set('isLoading', false);
      }
    });
  },

  calcluateUnitPerformance(performance) {
    let component = this;
    let units = component.get('units');
    let unitList = Ember.A([]);
    units.forEach(function(unit) {
      let unitCopy = unit.isUnit0 ? getObjectCopy(unit) : unit.copy();
      const averageScore = performance.score;
      const timeSpent = performance.timeSpent;
      const completionDone = performance.completionDone;
      const completionTotal = performance.completionTotal;
      unitCopy.set(
        'performance',
        Ember.Object.create({
          score: averageScore,
          timeSpent: timeSpent,
          hasStarted: averageScore > 0 || timeSpent > 0,
          isCompleted: completionDone > 0 && completionDone >= completionTotal
        })
      );
      unitList.pushObject(unitCopy);
    });
    component.set('units', unitList);
  },

  getClassPerformanceForClassMember(userId) {
    let component = this;
    let studentReportData = component.get('studentReportData');
    let userPerformance = studentReportData.findBy('id', userId);
    if (userPerformance.get('hasStarted')) {
      return Ember.Object.create({
        score: userPerformance.get('score'),
        hasStarted: userPerformance.get('hasStarted')
      });
    }
  },

  parseClassMemberAndPerformanceData(performance) {
    let component = this;
    let classMembers = component.get('classMembers');
    let users = Ember.A([]);
    classMembers.forEach(member => {
      let user = component.createUser(member);
      let units = component.get('units');
      let userId = member.get('id');
      let userPerformance = Ember.A([]);

      performance.forEach(item => {
        let userPerformanceList = item.usageData.findBy('userId', userId);
        if (userPerformanceList) {
          userPerformance.push(userPerformanceList);
        }
      });
      let resultSet = component.parsePerformanceUnitAndUserData(
        userId,
        units,
        userPerformance
      );
      user.set('userPerformanceData', resultSet.userPerformanceData);
      user.set('hasStarted', resultSet.hasStarted);
      user.set('score', resultSet.overAllScore);
      user.set('isShowLearnerData', member.isShowLearnerData);
      // Reform score value and store in score-use-for-sort field, to handle sort.
      // -1 defines not started.
      if (!resultSet.hasStarted) {
        user.set('score-use-for-sort', -1);
      } else {
        user.set('score-use-for-sort', resultSet.overAllScore);
      }
      user.set('difference', 100 - resultSet.overAllScore);
      users.pushObject(user);
    });
    users = users.sortBy(component.get('defaultSortCriteria'));
    component.set('studentReportData', users);
  },

  createUser(user) {
    return Ember.Object.create({
      id: user.get('id'),
      firstName: user.get('firstName'),
      lastName: user.get('lastName'),
      avatarUrl: user.get('avatarUrl')
    });
  },

  parsePerformanceUnitAndUserData(userId, units, userPerformance) {
    let userPerformanceData = Ember.A([]);
    let totalScore = 0;
    let totalTimeSpent = 0;
    let hasStarted = false;
    let numberunitstarted = 0;
    units.forEach((unit, index) => {
      let unitId = unit.get('id');
      let performanceData = Ember.Object.create({
        id: unit.get('id'),
        sequence: index + 1
      });
      if (userPerformance) {
        let unitResult = userPerformance.findBy('unitId', unitId);
        if (unitResult) {
          performanceData.set('hasStarted', true);
          hasStarted = true;
          let score = unitResult.get('score') ? unitResult.get('score') : 0;
          performanceData.set('timeSpent', unitResult.get('timeSpent'));
          performanceData.set('score', score);
          totalScore = totalScore + score;
          totalTimeSpent = totalTimeSpent + unitResult.get('timeSpent');
          numberunitstarted++;
        } else {
          performanceData.set('hasStarted', false);
        }
      } else {
        performanceData.set('hasStarted', false);
      }
      userPerformanceData.pushObject(performanceData);
    });
    let overAllScore =
      numberunitstarted > 0 ? Math.floor(totalScore / numberunitstarted) : 0;
    let resultSet = {
      userPerformanceData: userPerformanceData,
      overAllScore: overAllScore,
      hasStarted: hasStarted,
      totalTimeSpent: totalTimeSpent
    };
    return resultSet;
  },

  onOpenStudentCourseReport(userId) {
    let component = this;
    let classData = component.get('class');
    let studentClassData = classData.copy(true);
    studentClassData.set('preference', classData.get('preference'));
    studentClassData.set(
      'memberGradeBounds',
      classData.get('memberGradeBounds')
    );
    studentClassData.set(
      'performanceSummary',
      component.getClassPerformanceForClassMember(userId)
    );
    if (component.get('isShowMilestoneReport')) {
      component.set('selectedStudentId', userId);
      component.set('studentClassData', studentClassData);
      component.set('isShowStudentMilestoneCourseReport', true);
    } else {
      let params = Ember.Object.create({
        userId: userId,
        classId: component.get('classId'),
        courseId: component.get('courseId'),
        course: component.get('course'),
        class: studentClassData,
        loadUnitsPerformance: true
      });
      component.set('showStudentCourseReport', true);
      component.set('studentCourseReportContext', params);
    }
  },

  loadMilestoneReportData() {
    const component = this;
    let courseId = component.get('courseId');
    component.set('isLoading', true);
    let fwCode = component.get('fwCode');
    let filters = {
      subject: component.get('subject')
    };
    let fwkCode = component.get('fwCode');
    if (fwkCode) {
      filters.fw_code = fwkCode;
    }

    Ember.RSVP.hash({
      milestones: component
        .get('courseService')
        .getCourseMilestones(courseId, fwCode)
    }).then(({ milestones }) => {
      if (!component.isDestroyed) {
        let milestoneData = component.renderMilestonesBasedOnStudentGradeRange(
          milestones
        );
        component.set('milestones', milestoneData);
        component.fetchMilestonePerformance();
        component.set('isLoading', false);
      }
    });
  },

  fetchMilestonePerformance() {
    let component = this;
    let performanceService = component.get('performanceService');
    let classId = component.get('classId');
    let courseId = component.get('courseId');
    let fwCode = component.get('fwCode');
    let milestones = component.get('milestones');
    return performanceService
      .getPerformanceForMilestones(
        classId,
        courseId,
        'assessment',
        undefined,
        fwCode
      )
      .then(milestonesPerformance => {
        milestones.forEach((milestone, index) => {
          let milestonePerformanceItems = milestonesPerformance.filterBy(
            'milestoneId',
            milestone.get('milestone_id')
          );
          milestone.set(
            'performance',
            Ember.Object.create({
              score: null,
              timeSpent: null,
              hasStarted: false
            })
          );
          if (milestonePerformanceItems.length) {
            let milestonePerformanceScore = aggregateMilestonePerformanceScore(
              milestonePerformanceItems
            );
            let milestonePerformanceTimeSpent = aggregateMilestonePerformanceTimeSpent(
              milestonePerformanceItems
            );
            if (milestonePerformanceScore || milestonePerformanceTimeSpent) {
              milestone.set('performance.score', milestonePerformanceScore);
              milestone.set(
                'performance.timeSpent',
                milestonePerformanceTimeSpent
              );
              milestone.set('performance.hasStarted', true);
            }
          }
          milestone.set('sequence', index + 1);
        });
        component.parseStudentsMilestonsPerformanceData(milestonesPerformance);
      });
  },

  parseStudentsMilestonsPerformanceData(milestonesPerformance) {
    let component = this;
    let classMembers = component.get('classMembers');
    let users = Ember.A([]);
    let milestones = component.get('milestones');
    classMembers.forEach(member => {
      let user = component.createUser(member);
      let userId = member.get('id');
      let userMilestonesPerformance = milestonesPerformance.filterBy(
        'userUid',
        userId
      );
      let resultSet = component.parseUserMilestonesPerformance(
        milestones,
        userMilestonesPerformance
      );
      user.set('userPerformanceData', resultSet.userPerformanceData);
      user.set('hasStarted', resultSet.hasStarted);
      user.set('score', resultSet.overAllScore);
      user.set('score-use-for-sort', resultSet.overAllScore);
      users.pushObject(user);
    });
    users = users.sortBy(component.get('defaultSortCriteria'));
    component.set('studentReportData', users);
  },

  parseUserMilestonesPerformance(milestones, userMilestonesPerformance) {
    if (milestones && milestones.length) {
      let userPerformanceData = Ember.A([]);
      let totalScore = 0;
      let totalTimeSpent = 0;
      let hasStarted = false;
      let numberunitstarted = 0;
      milestones.forEach((milestone, index) => {
        let milestoneId = milestone.get('milestone_id');
        let milestonePerformanceData = Ember.Object.create({
          id: milestoneId,
          sequence: index + 1,
          hasStarted: false
        });
        let userMilestonePerformance = userMilestonesPerformance.findBy(
          'milestoneId',
          milestoneId
        );
        if (userMilestonePerformance) {
          milestonePerformanceData.set('hasStarted', true);
          hasStarted = true;
          let score = userMilestonePerformance.get(
            'performance.scoreInPercentage'
          )
            ? userMilestonePerformance.get('performance.scoreInPercentage')
            : 0;
          milestonePerformanceData.set(
            'timeSpent',
            userMilestonePerformance.get('performance.timeSpent')
          );
          milestonePerformanceData.set('score', score);
          totalScore = totalScore + score;
          totalTimeSpent =
            totalTimeSpent +
            userMilestonePerformance.get('performance.performance.timeSpent');
          numberunitstarted++;
        }
        userPerformanceData.pushObject(milestonePerformanceData);
      });
      let overAllScore =
        numberunitstarted > 0 ? Math.floor(totalScore / numberunitstarted) : 0;
      let resultSet = {
        userPerformanceData: userPerformanceData,
        overAllScore: overAllScore,
        hasStarted: hasStarted,
        totalTimeSpent: totalTimeSpent
      };
      return resultSet;
    }
  },

  /**
   * This Method is responsible for milestone display based on students class grade.
   * @return {Array}
   */
  renderMilestonesBasedOnStudentGradeRange(milestones) {
    let component = this;
    let milestoneData = Ember.A([]);
    let classGradeId = component.get('class.gradeCurrent');
    milestones.forEach(milestone => {
      let gradeId = milestone.get('grade_id');
      if (classGradeId === gradeId) {
        milestone.set('isClassGrade', true);
      }
      milestoneData.pushObject(milestone);
    });
    return milestoneData;
  }
});
