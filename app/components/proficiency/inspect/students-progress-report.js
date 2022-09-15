import Ember from 'ember';
import { formatTime } from '../../../utils/utils';

import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // ------------------------------------------------------
  // Attributes
  classNames: ['students-progress-report'],

  // ---------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/dashboard
   */
  dashboardService: Ember.inject.service('api-sdk/dashboard'),

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  // ------------------------------------------------------------
  // Properties

  /**
   * @property {Object} reportData has Student Competency count data
   */
  reportData: null,

  /**
   * @property {Object} studentProfile has Student details
   */
  studentProfile: null,

  /**
   * @property {String} startDate has selected start date
   */
  startDate: null,

  /**
   * @property {String} endDate has selected end date
   */
  endDate: null,

  /**
   * @property {Object} competenciesBucket has performance data
   */
  competenciesBucket: null,

  /**
   * @property {Object} class has performance data
   */
  class: null,

  lessonStats: null,

  masteredStats: null,

  streakStats: null,

  performanceData: null,

  dateWiseReport: false,

  diagnosticsMasteryLength: null,

  totalMasteryCount: Ember.computed('reportData', function() {
    const reportData = this.get('reportData');
    return (
      parseInt(reportData.masteredCompetenciesCount, 0) +
      parseInt(reportData.diagnosticGainedStatus, 0)
    );
  }),

  masteredList: Ember.computed('studentCompetencyData', function() {
    return this.get('studentCompetencyData.new')
      .filter(item => item.score >= 80 && item.status === 'complete')
      .sortBy('report_date');
  }),

  diagnosticsMastery: Ember.computed('studentCompetencyData', function() {
    return this.get('studentCompetencyData.diagnostic').sortBy('report_date');
  }),

  reinforcedGains: Ember.computed('studentCompetencyData', function() {
    return this.get('studentCompetencyData.reinforced').sortBy('report_date');
  }),

  growthList: Ember.computed('studentCompetencyData', function() {
    return this.get('studentCompetencyData.new')
      .filter(
        item => item.score <= 79 && item.score >= 51 && item.score !== null
      )
      .sortBy('report_date');
  }),

  concernList: Ember.computed('studentCompetencyData', function() {
    return this.get('studentCompetencyData.new')
      .filter(item => item.score < 51 && item.score !== null)
      .sortBy('report_date');
  }),

  assessmentInProgress: Ember.computed('studentCompetencyData', function() {
    return this.get('studentCompetencyData.new')
      .filter(item => item.score === null && item.status === 'inprogress')
      .sortBy('report_date');
  }),

  studentCompetenciesReport: Ember.A(),

  watchStudentData: Ember.observer('studentProfile', function() {
    this.initialLoad();
  }),

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // ----------------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.initialLoad();
    const diagnosticsMasteryData = this.get(
      'reportData'
    ).masteredCompetencies.filter(function(item) {
      return item.contentSource.indexOf('diagnostic') !== -1;
    });
    this.set('diagnosticsMasteryLength', diagnosticsMasteryData.length);
  },

  // ----------------------------------------------------------------------
  // Actions

  actions: {
    onPrintStudentData() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_INDIVIDUAL_REPORTS_DOWNLOAD_PDF
      );
      window.print();
    },

    onDowloadDropdown() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_INDIVIDUAL_REPORTS_DOWNLOAD
      );
    },

    onDownloadCSV() {
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_INDIVIDUAL_REPORTS_DOWNLOAD_CSV
      );

      if (this.get('dateWiseReport') === false) {
        const DownloadData = {
          StudenData: this.get('studentProfile').fullName,
          ClassName: this.get('class').title,
          TeacherName: this.get('class').owner.fullName,
          ReportDateRange: `${moment(this.get('startDate')).format(
            'MMM Do YYYY'
          )}  ${moment(this.get('endDate')).format('MMM Do YYYY')}`,
          CompetenciesMastered: this.get('reportData')
            .masteredCompetenciesCount,
          CompetenciesInProgress: this.get('reportData')
            .inprogressCompetenciesCount,
          TimeSpentonCollections: formatTime(
            this.get('reportData').collectionTimespent
          ),
          TimeSpentonAssessments: formatTime(
            this.get('reportData').assessmentTimespent
          ),
          TotalTimeSpent: formatTime(this.get('reportData').totalTimespent),
          ChallengesMastered: this.get('reportData').masteryChallengeCount,
          LongestMasteryStreak: this.get('streakStats').streakCompetencies,
          Scoredatleast90: this.get('masteredStats').totalMastered,
          SuggestionsTaken: this.get('performanceData').acceptedSuggestions
        };

        let MasteredData = [];

        this.get('masteredList').length &&
          this.get('masteredList').map(data => {
            MasteredData.push({
              CompetenciesMasteredName: data.code,
              MasteryDate: moment(data.activityDate).format('MMM Do YYYY'),
              MasteryScore: data.score,
              MasteryNumberOfScores: data.attempts,
              MasteryTitle: data.title
            });
          });
        const TargetScoreData = [];

        this.get('growthList').length &&
          this.get('growthList').map(data => {
            TargetScoreData.push({
              TargetsForGrowth: data.code,
              TagetMostRecentDate: moment(data.activityDate).format(
                'MMM Do YYYY'
              ),
              TagetMostRecentScore: data.score,
              TargetNumberOfTries: data.attempts
            });
          });

        const ConcernData = [];

        this.get('concernList').length &&
          this.get('concernList').map(data => {
            ConcernData.push({
              AreasOfConcern: data.code,
              AreasOfConcernDate: moment(data.activityDate).format(
                'MMM Do YYYY'
              ),
              AreasOfConcernScore: data.score,
              AreasOfConcernNumberOfTries: data.attempts
            });
          });

        let data = '';
        const tableData = [];

        const rows = [
          [
            this.get('i18n').t(
              'teacher-landing.class.class-management-tab.student-name'
            ).string,
            DownloadData.StudenData.replace(',', '')
          ],
          [
            this.get('i18n').t('common.class-name').string,
            DownloadData.ClassName
          ],
          [
            this.get('i18n').t('common.teacher-name').string,
            DownloadData.TeacherName.replace(',', '')
          ],
          [
            this.get('i18n').t('class-report-date-range').string,
            DownloadData.ReportDateRange
          ],
          [''],
          [
            this.get('i18n').t('class-progress-report-competencies-mastered')
              .string,
            DownloadData.CompetenciesMastered
          ],
          [
            this.get('i18n').t('class-progress-report-competencies-inprogress')
              .string,
            DownloadData.CompetenciesInProgress
          ],
          [''],
          [
            this.get('i18n').t('class-time-spent-on-collection').string,
            DownloadData.TimeSpentonCollections
          ],
          [
            this.get('i18n').t('class-time-spent-on-assessments').string,
            DownloadData.TimeSpentonAssessments
          ],
          [
            this.get('i18n').t('student-landing.course.total-time-spent')
              .string,
            DownloadData.TotalTimeSpent
          ],
          [''],
          [
            this.get('i18n').t('class-challenges-mastered').string,
            DownloadData.ChallengesMastered
          ],
          [
            this.get('i18n').t('longest-mastery-streak').string,
            DownloadData.LongestMasteryStreak
          ],
          [
            this.get('i18n').t('cp.score-at-90').string,
            DownloadData.Scoredatleast90
          ],
          [
            this.get('i18n').t('suggestion-taken').string,
            DownloadData.SuggestionsTaken
          ],
          [''],
          [
            this.get('i18n').t(
              'class-progress-report.individual-report.competencies-mastery'
            ).string,
            MasteredData.map(data => data.CompetenciesMasteredName)
          ],
          [
            this.get('i18n').t('assignments-view.title').string,
            MasteredData.map(data => data.MasteryTitle)
          ],
          [
            this.get('i18n').t('mastery-date').string,
            MasteredData.map(data => data.MasteryDate)
          ],
          [
            this.get('i18n').t('common.score').string,
            MasteredData.map(data => data.MasteryScore)
          ],
          [
            this.get('i18n').t('number-of-tries').string,
            MasteredData.map(data => data.MasteryNumberOfScores)
          ],
          [''],
          [
            this.get('i18n').t('cp.target-of-growth').string,
            TargetScoreData.map(data => data.TargetsForGrowth)
          ],
          [
            this.get('i18n').t('date-of-most-recent-attempt').string,
            TargetScoreData.map(data => data.TagetMostRecentDate)
          ],
          [
            this.get('i18n').t('most-recent-score').string,
            TargetScoreData.map(data => data.TagetMostRecentScore)
          ],
          [
            this.get('i18n').t('number-of-tries').string,
            TargetScoreData.map(data => data.TargetNumberOfTries)
          ],
          [''],
          [
            this.get('i18n').t('cp.area-of-concern').string,
            ConcernData.map(data => data.AreasOfConcern)
          ],
          [
            this.get('i18n').t('date-of-most-recent-attempt').string,
            ConcernData.map(data => data.AreasOfConcernDate)
          ],
          [
            this.get('i18n').t('most-recent-score').string,
            ConcernData.map(data => data.AreasOfConcernScore)
          ],
          [
            this.get('i18n').t('number-of-tries').string,
            ConcernData.map(data => data.AreasOfConcernNumberOfTries)
          ]
        ];

        for (const row of rows) {
          const rowData = [];
          for (const column of row) {
            rowData.push(column);
          }
          tableData.push(rowData.join(','));
        }
        data += tableData.join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(
          new Blob([data], {
            type: 'text/csv'
          })
        );
        a.setAttribute(
          'download',
          'IndividualStudentReport(OverviewReport).csv'
        );
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      } else if (this.get('dateWiseReport') === true) {
        const DownloadData = {
          StudenData: this.get('studentProfile').fullName,
          ClassName: this.get('class').title,
          TeacherName: this.get('class').owner.fullName,
          ReportDateRange: `${moment(this.get('startDate')).format(
            'MMM Do YYYY'
          )}  ${moment(this.get('endDate')).format('MMM Do YYYY')}`,
          CompetenciesMastered: this.get('reportData')
            .masteredCompetenciesCount,
          CompetenciesInProgress: this.get('reportData')
            .inprogressCompetenciesCount,
          TimeSpentonCollections: formatTime(
            this.get('reportData').collectionTimespent
          ),
          TimeSpentonAssessments: formatTime(
            this.get('reportData').assessmentTimespent
          ),
          TotalTimeSpent: formatTime(this.get('reportData').totalTimespent),
          ChallengesMastered: this.get('reportData').masteryChallengeCount,
          LongestMasteryStreak: this.get('streakStats').streakCompetencies,
          Scoredatleast90: this.get('masteredStats').totalMastered,
          SuggestionsTaken: this.get('performanceData').acceptedSuggestions
        };

        const totalActivityData = [];

        this.get('studentCompetenciesReport').length
          ? this.get('studentCompetenciesReport').map(data => {
            const totalMapData = {
              Date: ['Date'],
              activitesData: []
            };

            totalMapData.Date.push(
              moment(data.reportDate).format('MMM Do YYYY')
            );

            data.competency.map(data => {
              const competencyMapDate =
                  data.activities.length &&
                  data.activities.map(data => {
                    const activitiesMap = [
                      '',
                      data.format,
                      data.title,
                      formatTime(data.totalTimespent),
                      data.score
                    ];

                    return activitiesMap;
                  });

              totalMapData.activitesData.push(competencyMapDate);
            });

            totalActivityData.push(totalMapData);
          })
          : '';

        let data = '';
        const tableData = [];

        const excelRowMapData = totalActivityData.map(data => {
          return data;
        });

        let rows = [
          [
            this.get('i18n').t(
              'teacher-landing.class.class-management-tab.student-name'
            ).string,
            DownloadData.StudenData.replace(',', '')
          ],
          [
            this.get('i18n').t('common.class-name').string,
            DownloadData.ClassName
          ],
          [
            this.get('i18n').t('common.teacher-name').string,
            DownloadData.TeacherName.replace(',', '')
          ],
          [
            this.get('i18n').t('class-report-date-range').string,
            DownloadData.ReportDateRange
          ],
          [''],
          [
            this.get('i18n').t('class-progress-report-competencies-mastered')
              .string,
            DownloadData.CompetenciesMastered
          ],
          [
            this.get('i18n').t('class-progress-report-competencies-inprogress')
              .string,
            DownloadData.CompetenciesInProgress
          ],
          [''],
          [
            this.get('i18n').t('class-time-spent-on-collection').string,
            DownloadData.TimeSpentonCollections
          ],
          [
            this.get('i18n').t('class-time-spent-on-assessments').string,
            DownloadData.TimeSpentonAssessments
          ],
          [
            this.get('i18n').t('student-landing.course.total-time-spent')
              .string,
            DownloadData.TotalTimeSpent
          ],
          [''],
          [
            this.get('i18n').t('class-challenges-mastered').string,
            DownloadData.ChallengesMastered
          ],
          [
            this.get('i18n').t('longest-mastery-streak').string,
            DownloadData.LongestMasteryStreak
          ],
          [
            this.get('i18n').t('cp.score-at-90').string,
            DownloadData.Scoredatleast90
          ],
          [
            this.get('i18n').t('suggestion-taken').string,
            DownloadData.SuggestionsTaken
          ],
          ['']
        ];

        excelRowMapData.map(data => {
          rows.push(data.Date);

          rows.push(['Activities Completed']);

          for (const activitiesData of data.activitesData) {
            for (const activitiesDataLoop of activitiesData) {
              rows.push(activitiesDataLoop);
            }
          }

          rows.push('');
        });

        for (const row of rows) {
          const rowData = [];

          for (const column of row) {
            rowData.push(column);
          }

          tableData.push(rowData.join(','));
        }

        data += tableData.join('\n');
        const a = document.createElement('a');
        a.href = URL.createObjectURL(
          new Blob([data], {
            type: 'text/csv'
          })
        );
        a.setAttribute('download', 'IndividualStudentReport(ReportByDate).csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    },

    onShowReport(activity) {
      this.sendAction('onShowReport', activity);
    },
    showDateWisereport() {
      if (this.get('dateWiseReport')) {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_INDIVIDUAL_REPORTS_OVERVIEW
        );
      } else {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_INDIVIDUAL_REPORTS_DATE
        );
      }

      this.set('dateWiseReport', !this.get('dateWiseReport'));
    },
    onToggleCollapse(index) {
      this.set('expandIndex', this.get('expandIndex') !== index ? index : null);
    }
  },

  // ---------------------------------------------------------------------
  // Methods

  /**
   * @function initalLoacomputedd help to initialize the performance data
   */
  initialLoad() {
    const component = this;

    const currentClass = component.get('class');
    const dashboardService = component.get('dashboardService');
    const classId = currentClass.id;
    const studentProfile = component.get('studentProfile');
    const userId = studentProfile.get('id');
    const startDate = moment(
      component.get('startDate') || component.get('endDate')
    ).format('YYYY-MM-DD');
    const endDate = moment(component.get('endDate')).format('YYYY-MM-DD');
    let params = {
      from: startDate,
      to: endDate,
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
  }
});
