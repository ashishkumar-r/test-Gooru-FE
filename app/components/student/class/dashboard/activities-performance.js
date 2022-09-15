import Ember from 'ember';
import { formatDate, getGradeRange } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // ----------------------------------------------------
  // Attributes

  classNames: ['activities-performance'],

  // ---------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/dashboard
   */
  dashboardService: Ember.inject.service('api-sdk/dashboard'),

  /**
   * @requires service:api-sdk/dashboard
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  session: Ember.inject.service(),

  // -------------------------------------------------------
  // Properties

  currentClass: null,

  activityPerformance: Ember.computed('activityScore', function() {
    let activityScore =
      this.get('activityScore') === null ? 0 : this.get('activityScore');

    return Ember.A([
      {
        score: activityScore,
        className: `fill-range-${getGradeRange(activityScore)}`
      },
      {
        score: 100 - activityScore,
        className: `fade-color-bg fill-range-${getGradeRange(activityScore)}`
      }
    ]);
  }),

  journeyPerformance: Ember.computed('journeyScore', function() {
    let journeyScore =
      this.get('journeyScore') === null ? 0 : this.get('journeyScore');
    return Ember.A([
      {
        score: journeyScore,
        className: `fill-range-${getGradeRange(journeyScore)}`
      },
      {
        score: 100 - journeyScore,
        className: `fade-color-bg fill-range-${getGradeRange(journeyScore)}`
      }
    ]);
  }),

  activityScore: 0,

  journeyScore: 0,

  overallScore: 0,

  lessonStats: null,

  masteredStats: null,

  streakStats: null,

  performanceData: null,

  refreshData: false,

  watchRefreshData: Ember.observer('refreshData', function() {
    if (this.get('refreshData')) {
      this.initialLoad();
      this.loadPerformanceData();

      this.set('refreshData', false);
    }
  }),

  userId: Ember.computed.alias('session.userId'),

  // ------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.initialLoad();
    this.loadPerformanceData();
  },

  // -----------------------------------------------------
  // Actions

  actions: {
    onGoPerformance() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_STUDENT_DASHBOARD_PERFORMANCE_OVERVIEW
      );
      this.sendAction('openProgressReport');
    }
  },

  // --------------------------------------------------------
  // Methods

  /**
   * @function initalLoad help to initialize the performance data
   */
  initialLoad() {
    const component = this;
    const currentClass = component.get('currentClass');
    const dashboardService = component.get('dashboardService');
    const classId = currentClass.id;
    const userId = component.get('userId');
    let params = {
      from: formatDate(currentClass.startDate, 'YYYY-MM-DD'),
      to: moment().format('YYYY-MM-DD'),
      userId,
      classIds: [classId]
    };
    Ember.RSVP.hash({
      performanceStats: dashboardService.fetchDashboardPerformance(params),
      lessonStats: dashboardService.fetchLessonStats(params),
      masteredStats: dashboardService.fetchMasteredStats(params),
      suggestionStats: dashboardService.fetchSuggestionStats(params),
      streakStats: dashboardService.fetchStreakStats(params)
    }).then(hash => {
      let activePerformance = hash.performanceStats.findBy('classId', classId);
      let activeLessonStats = hash.lessonStats.findBy('classId', classId);
      let activeMasteredStats = hash.masteredStats.findBy('classId', classId);
      let activeSuggestionStats = hash.suggestionStats.findBy(
        'classId',
        classId
      );
      let activeStreakStats = hash.streakStats.findBy('classId', classId);
      let performanceData = {
        ...activePerformance,
        ...activeSuggestionStats
      };
      component.set('lessonStats', activeLessonStats);
      component.set('masteredStats', activeMasteredStats);
      component.set('streakStats', activeStreakStats);
      component.set('performanceData', performanceData);
    });
  },

  loadPerformanceData() {
    const component = this;
    const userId = component.get('userId');
    const classData = component.get('currentClass');
    const performanceService = component.get('performanceService');
    const courseId = classData.get('courseId');
    const classId = classData.get('id');
    let classParams = [
      {
        classId,
        courseId
      }
    ];
    Ember.RSVP.hash({
      caPerformance: performanceService.getCAPerformanceData([classId], userId),
      ljPerformance: courseId
        ? performanceService.findClassPerformanceSummaryByStudentAndClassIds(
          userId,
          classParams
        )
        : Ember.A()
    }).then(hash => {
      let classCA = hash.caPerformance.findBy('classId', classId);
      let classLJ = hash.ljPerformance.findBy('classId', classId);
      let journeyScore = classLJ && classLJ.score >= 0 ? classLJ.score : null;
      let activityScore =
        classCA && classCA.scoreInPercentage >= 0
          ? classCA.scoreInPercentage
          : null;

      component.set('journeyScore', journeyScore);
      component.set('activityScore', activityScore);
      let overallScore = 0;
      let caTotalScore = classCA ? classCA.totalScore : 0;
      let ljTotalScore = classLJ ? classLJ.totalScore : 0;
      let caCompletedCount = classCA ? classCA.completedCount : 0;
      let ljCompletedCount = classLJ ? classLJ.totalCompleted : 0;
      let totalScore = ljTotalScore + caTotalScore;
      let totalCompletedCount = ljCompletedCount + caCompletedCount;
      if (totalCompletedCount > 0) {
        let overallScores = totalScore / totalCompletedCount;
        overallScore = Math.round(overallScores);
      }
      component.set('overallScore', overallScore);
    });
  }
});
