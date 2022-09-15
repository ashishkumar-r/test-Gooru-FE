import Ember from 'ember';
import { download } from '../../../utils/csv';
import { formatTime } from '../../../utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['class-progress-report-preview'],

  /**
   * @property {Number} chartHeight
   */
  chartHeight: 450,

  /**
   * @property {Number} cellWidth
   */
  cellWidth: 35,

  /**
   * @requires service:i18n
   */
  i18n: Ember.inject.service(),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  // -------------------------------------------------------------------------
  // Events
  didInsertElement() {
    const component = this;
    component.$('[data-toggle="tooltip"]').tooltip({
      trigger: 'hover'
    });
    component.loadStudentCompetencies();
  },

  /**
   * Observe the report change
   */
  studentReportObserver: Ember.observer(
    'studentsDomainPerformance',
    'studentsSummaryReportData',
    function() {
      const component = this;
      component.loadStudentCompetencies();
    }
  ),

  //--------------------------------------------------------------------------
  //Actions
  actions: {
    onPrintPreview() {
      let className = this.get('class.title');

      let startDate = moment(this.get('reportStartDate')).format(
        'DD MMMM YYYY'
      );
      let endDate = moment(this.get('reportEndDate')).format('DD MMMM YYYY');
      var tempTitle = document.title;
      document.title = `${className}-${startDate} to ${endDate}`;
      window.print();
      document.title = tempTitle;
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_CLASS_PROGRESS_PDF_DOWNLOAD
      );
    },

    onDownloadCSV() {
      let studentsSummaryReportData = this.get('studentsSummaryReportData');

      const fromDate = moment(this.get('reportStartDate')).format(
        'MMM Do YYYY'
      );

      const endDate = this.get('reportEndDate')
        ? moment(this.get('reportEndDate')).format('MMM Do YYYY')
        : '';

      const dateRange = `${fromDate}  ${endDate}`;

      let studentsSummaryReport = [];

      studentsSummaryReport.push({
        ReportDateRange: this.get('i18n').t('class-report-date-range').string,
        StudentLastName: this.get('i18n').t('common.lastName').string,
        StudentFirstName: this.get('i18n').t('common.firstName').string,
        CompetenciesDiagnosticGained: this.get('i18n').t(
          'common.competencies-gained-from-diagnostics'
        ).string,
        CompetenciesGained: this.get('i18n').t('competencies-gained').string,
        CompetenciesReinforced: this.get('i18n').t('competencies-reinforced')
          .string,
        CompetenciesInferred: this.get('i18n').t('competencies-inferred')
          .string,
        CompetenciesInProgress: this.get('i18n').t(
          'class-progress-report-competencies-inprogress'
        ).string,
        TimeSpentonCollections: this.get('i18n').t(
          'class-time-spent-on-collection'
        ).string,
        TimeSpentonAssessments: this.get('i18n').t(
          'class-time-spent-on-assessments'
        ).string,
        TotalTimeSpent: this.get('i18n').t(
          'student-landing.course.total-time-spent'
        ).string,
        AverageScore: this.get('i18n').t('common.averageScore').string,
        BadgesEarned: this.get('i18n').t('badges-earned').string,
        SuggestionsTaken: this.get('i18n').t('suggestion-taken').string
      });

      studentsSummaryReportData.length
        ? studentsSummaryReportData.map(data => {
          studentsSummaryReport.push({
            ReportDateRange: dateRange,
            StudentLastName: data.student.lastName,
            StudentFirstName: data.student.firstName,
            CompetenciesDiagnosticGained:
                data.weeklyReportData.diagnosticGainedStatus,
            CompetenciesGained:
                data.weeklyReportData.masteredCompetenciesCount,
            CompetenciesReinforced:
                data.weeklyReportData.reInforcedCompetenciesCount,
            CompetenciesInferred:
                data.weeklyReportData.inferredCompetenciesCount,
            CompetenciesInProgress:
                data.weeklyReportData.inprogressCompetenciesCount,
            TimeSpentonCollections: formatTime(
              data.weeklyReportData.collectionTimespent
            ),
            TimeSpentonAssessments: formatTime(
              data.weeklyReportData.assessmentTimespent
            ),
            TotalTimeSpent: formatTime(data.weeklyReportData.totalTimespent),
            AverageScore: data.weeklyReportData.averageScore,
            BadgesEarned: data.weeklyReportData.badgeEarned,
            SuggestionsTaken: data.weeklyReportData.suggestionTaken
          });
        })
        : '';

      const rows = [
        studentsSummaryReport.map(data => data.ReportDateRange),
        studentsSummaryReport.map(data => data.StudentLastName),
        studentsSummaryReport.map(data => data.StudentFirstName),
        studentsSummaryReport.map(data => data.CompetenciesDiagnosticGained),
        studentsSummaryReport.map(data => data.CompetenciesGained),
        studentsSummaryReport.map(data => data.CompetenciesReinforced),
        studentsSummaryReport.map(data => data.CompetenciesInferred),
        studentsSummaryReport.map(data => data.CompetenciesInProgress),
        studentsSummaryReport.map(data => data.TimeSpentonCollections),
        studentsSummaryReport.map(data => data.TimeSpentonAssessments),
        studentsSummaryReport.map(data => data.TotalTimeSpent),
        studentsSummaryReport.map(data => data.AverageScore),
        studentsSummaryReport.map(data => data.BadgesEarned),
        studentsSummaryReport.map(data => data.SuggestionsTaken)
      ];

      let [row] = rows;
      const rowData = row.map((value, column) => rows.map(row => row[column]));

      let sheetClassName = this.get('class.title');

      const sheetName = `${'ClassProgressReport - '}${sheetClassName}`;

      download(sheetName, rowData);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.CLICK_PO_CLASS_PROGRESS_CSV_DOWNLOAD
      );
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function loadStudentCompetencies
   * Method to load student competencies
   */
  loadStudentCompetencies() {
    let studentsDomainPerformance = this.get('studentsDomainPerformance');
    studentsDomainPerformance.forEach(domainPerformance => {
      let weeklyReportData = domainPerformance.get('weeklyReportData');
      if (weeklyReportData) {
        let masteredCompetencies = weeklyReportData.get('masteredCompetencies');
        let inprogressCompetencies = weeklyReportData.get(
          'inprogressCompetencies'
        );
        let competenciesData = Ember.A([]);
        if (masteredCompetencies.length > inprogressCompetencies.length) {
          masteredCompetencies.forEach((competencies, index) => {
            let competencyObj = Ember.Object.create({
              masteredCompetencyData:
                competencies.status > 3
                  ? `${competencies.code}-${competencies.competencyStudentDesc}`
                  : '',
              inprogressCompetencyData: inprogressCompetencies[index]
                ? inprogressCompetencies[index].status === 1
                  ? `${inprogressCompetencies[index].code}-${inprogressCompetencies[index].competencyStudentDesc}`
                  : ''
                : ''
            });
            competenciesData.push(competencyObj);
          });
        } else {
          inprogressCompetencies.forEach((competencies, index) => {
            let competencyObj = Ember.Object.create({
              masteredCompetencyData: masteredCompetencies[index]
                ? masteredCompetencies[index].status > 3
                  ? `${masteredCompetencies[index].code}-${masteredCompetencies[index].competencyStudentDesc}`
                  : ''
                : '',
              inprogressCompetencyData:
                competencies.status === 1
                  ? `${competencies.code}-${competencies.competencyStudentDesc}`
                  : ''
            });
            competenciesData.push(competencyObj);
          });
        }
        domainPerformance.set('studentCompetenciesData', competenciesData);
      }
    });
  }
});
