import Ember from 'ember';
import {
  getDomainCode,
  flattenGutToFwCompetency,
  flattenGutToFwDomain
} from 'gooru-web/utils/taxonomy';
import StudentLearnerProficiency from 'gooru-web/mixins/student-learner-proficiency';
import ClassProgressReport from 'gooru-web/mixins/reports/class-progress-report';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Component.extend(
  StudentLearnerProficiency,
  ClassProgressReport,
  TenantSettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Attributes

    classNames: ['gru-student-class-progress-report-popup'],

    // -------------------------------------------------------------------------
    // Dependencies

    reportService: Ember.inject.service('api-sdk/report'),

    /**
     * @type {ProfileService} Service to retrieve profile information
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyService: Ember.inject.service('taxonomy'),

    /**
     * @requires competencyService
     */
    competencyService: Ember.inject.service('api-sdk/competency'),

    session: Ember.inject.service('session'),

    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    // -------------------------------------------------------------------------
    // Events

    didInsertElement() {
      const component = this;
      component.$('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
      });
      let $competencyGroup = $('#competency-group');
      $competencyGroup.on('show.bs.collapse', '.collapse', function() {
        $competencyGroup.find('.collapse.in').collapse('hide');
      });
      component.loadStudentsProficiencyData();
      if (component.get('isDashboardPage')) {
        component.set(
          'rangeStartDate',
          moment()
            .startOf('month')
            .format('YYYY-MM-DD')
        );
        component.set(
          'rangeEndDate',
          moment()
            .endOf('month')
            .format('YYYY-MM-DD')
        );
        component.set('forMonth', moment().format('MM'));
        component.set('forYear', moment().format('YYYY'));
        component.set('isDaily', false);
        component.set('isMonthly', true);
      }
    },

    // -------------------------------------------------------------------------
    // Actions

    actions: {
      /**
       * @function onClose
       */
      onClose() {
        this.set('isShowReport', false);
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.BACK_PO_TO_DASHBOARD
        );
      },

      //Action triggered when click performance of an activity
      onShowActivityReport(activity) {
        const component = this;
        component.set('reportActivityId', activity.id);
        component.set('reportActivityType', activity.format);
        component.set('repostReadContent', activity.resources);
        component.set('isCompetencyReport', !!activity.isLatestReport);
        if (activity.type === CONTENT_TYPES.OFFLINE_ACTIVITY) {
          component.set('isShowOfflineActivityReport', true);
        } else {
          component.set('isShowPortfolioActivityReport', true);
        }
      }
    },

    // -------------------------------------------------------------------------
    // Properties

    /**
     * @property {Boolean} isShowReport used to toggle popup show
     */
    isShowReport: false,

    /**
     * @property {UUID} classId
     */
    classId: Ember.computed.alias('class.id'),

    /**
     * @property {Array} domainLevelSummary
     */
    domainLevelSummary: null,

    /**
     * @property {string} session tenant image url
     */
    tenantLogoUrl: Ember.computed.alias('session.tenantLogoUrl'),

    /**
     * @property {string} session tenant name
     */
    tenantName: Ember.computed('session', function() {
      return (
        this.get('session.tenantName') || this.get('session.tenantShortName')
      );
    }),

    reportStartDate: Ember.computed('rangeStartDate', function() {
      return this.get('rangeStartDate')
        ? this.get('rangeStartDate')
        : this.get('rangeEndDate');
    }),

    reportEndDate: Ember.computed('rangeEndDate', function() {
      return this.get('rangeEndDate');
    }),

    /**
     * @property {Object} studentDestination
     */
    studentDestination: Ember.computed('studentInfo', function() {
      let memberbounds = this.get('class.memberGradeBounds');
      let userId = this.get('studentInfo.id');
      let activeStudentGrade =
        memberbounds && memberbounds.find(item => item[userId]);
      return activeStudentGrade ? activeStudentGrade[userId] : null;
    }),

    competenciesBucket: Ember.A(),

    isCompetencyReport: false,

    isDashboardPage: false,

    // -------------------------------------------------------------------------
    // Methods

    /**
     * @function getTaxonomyCategories
     * Method to get Taxonomy Categories
     */

    getTaxonomyCategories() {
      const component = this;
      const currentClass = component.get('class');
      const frameworkId = currentClass.get('preference.framework');
      const subjectId = currentClass.get('preference.subject');
      let crossWalkFWCPromise = null;
      if (frameworkId && subjectId) {
        crossWalkFWCPromise = component
          .get('taxonomyService')
          .fetchCrossWalkFWC(frameworkId, subjectId);
      }
      return Ember.RSVP.hash({
        taxonomyCategories: component.get('taxonomyService').getCategories(),
        crossWalkFWC: crossWalkFWCPromise
      }).then(({ taxonomyCategories, crossWalkFWC }) => {
        component.set('taxonomyCategories', taxonomyCategories);
        component.set('fwCompetencies', flattenGutToFwCompetency(crossWalkFWC));
        component.set('fwDomains', flattenGutToFwDomain(crossWalkFWC));
        component.loadData();
      });
    },

    /**
     * @function loadStudentsProficiencyData
     * Method to load students proficiency data
     */
    loadStudentsProficiencyData() {
      let component = this;
      const classData = component.get('class');
      if (classData && classData.preference.subject) {
        return Ember.RSVP.hash({
          classCompetencyReport: component.getClassCompetencyReport()
        }).then(({ classCompetencyReport }) => {
          component.set('domainLevelSummary', classCompetencyReport);
          component.loadStudentSummaryReportData();
        });
      } else {
        component.loadStudentSummaryReportData();
        return;
      }
    },

    getClassCompetencyReport() {
      const controller = this;
      let tenantSetting = controller.get('tenantSettingsObj');
      let framework = controller.get('class.preference.framework');
      let subject = controller.get('class.preference.subject');
      let isDefaultShowFW = false;
      if (
        tenantSetting &&
        tenantSetting.default_show_fw_competency_proficiency_view &&
        tenantSetting.default_show_fw_competency_proficiency_view.length
      ) {
        let classPreference = subject.concat('.', framework);
        isDefaultShowFW =
          tenantSetting.default_show_fw_competency_proficiency_view.indexOf(
            classPreference
          ) !== -1;
      }
      return Ember.RSVP.resolve(
        this.get('competencyService').fetchClassCompetencyReport(
          this.get('classId'),
          isDefaultShowFW ? framework : null
        )
      );
    },

    /**
     * @function loadStudentSummaryReportData
     * Method to load summary report data
     */
    loadStudentSummaryReportData() {
      const component = this;
      let isWeekly = component.get('isWeekly');
      const userId = component.get('userId');
      return Ember.RSVP.hash({
        summaryReportData: isWeekly
          ? component.fetchStudentsWeeklySummaryReport()
          : component.fetchStudentsClassSummaryReport(),
        studentTimespentData: component.fetchStudentTimespentReport(),
        studentCompetencyData: component.fetchStudentCompetencyReport(userId)
      }).then(
        ({
          summaryReportData,
          studentTimespentData,
          studentCompetencyData
        }) => {
          component.set('expandIndex', 0);
          component.parseStudentsTimespentSummaryReportData(
            studentTimespentData
          );
          component.parseStudentCompetencyStats(
            studentTimespentData,
            studentCompetencyData
          );
          component.parseStudentsWeeklySummaryReportData(
            summaryReportData,
            studentTimespentData
          );
        }
      );
    },

    /**
     * @function fetchStudentsWeeklySummaryReport
     * Method to fetch students weekly summary report
     */
    fetchStudentsWeeklySummaryReport() {
      const component = this;
      const classId = component.get('classId');
      const startDate = component.get('rangeStartDate');
      const endDate = component.get('rangeEndDate');
      const subjectCode = component.get('class.preference.subject');
      const userId = component.get('userId');
      const dataParam = {
        fromDate: startDate,
        toDate: endDate,
        subjectCode: subjectCode,
        userId: userId
      };
      return component
        .get('reportService')
        .fetchStudentsWeeklySummaryReport(classId, dataParam);
    },

    /**
     * @function fetchStudentsClassSummaryReport
     * Method to fetch students class summary report
     */
    fetchStudentsClassSummaryReport() {
      const component = this;
      const classId = component.get('classId');
      const startDate = component.get('rangeStartDate');
      const endDate = component.get('rangeEndDate');
      const subjectCode = component.get('class.preference.subject');
      const userId = component.get('userId');
      const dataParam = {
        fromDate: startDate ? startDate : endDate,
        toDate: endDate,
        subjectCode: subjectCode,
        userId: userId
      };
      return component
        .get('reportService')
        .fetchStudentsSummaryReport(classId, dataParam);
    },

    /**
     * @function fetchStudentTimespentReport
     * Method to fetch students time spent report
     */
    fetchStudentTimespentReport() {
      const component = this;
      const classId = component.get('classId');
      const startDate = component.get('rangeStartDate');
      const endDate = component.get('rangeEndDate');
      const userId = component.get('userId');
      const dataParam = {
        classId: classId,
        userId: userId,
        to: endDate
      };
      if (startDate) {
        dataParam.from = startDate;
      }
      return component
        .get('reportService')
        .fetchStudentTimespentReport(dataParam);
    },

    /**
     * @function fetchStudentCompetencyReport
     * Method to fetch students time spent report
     */
    fetchStudentCompetencyReport(userId) {
      const component = this;
      const classId = component.get('classId');
      const startDate = component.get('rangeStartDate');
      const endDate = component.get('rangeEndDate');
      const subjectCode = component.get('class.preference.subject');
      const dataParam = {
        classId: classId,
        userId: userId,
        to: endDate,
        subjectCode: subjectCode
      };
      if (startDate) {
        dataParam.from = startDate;
      }
      return component
        .get('reportService')
        .fetchStudentCompetencyReport(dataParam);
    },

    /**
     * @function parseStudentsWeeklySummaryReportData
     * Method to parse students weekly summary report
     */
    parseStudentsWeeklySummaryReportData(
      summaryReportData,
      studentTimespentData
    ) {
      const component = this;
      component.set('teacherInfo', summaryReportData.get('teacher'));
      let studentsSummaryReportData = summaryReportData.get(
        'studentsSummaryData'
      );
      let studentSummaryData = studentsSummaryReportData.get('firstObject');
      let studentInfo = studentSummaryData.get('student');
      let totalAssessmentTimespent = null;
      let totalCollectionTimespent = null;
      component.set('studentProfile', studentInfo);
      studentTimespentData.map(reportData => {
        let timespentData = reportData.get('data');
        timespentData.map(data => {
          if (
            data.get('format') === CONTENT_TYPES.COLLECTION ||
            data.get('format') === CONTENT_TYPES.EXTERNAL_COLLECTION
          ) {
            totalCollectionTimespent =
              totalCollectionTimespent + data.get('totalTimespent');
          } else if (
            data.get('format') === CONTENT_TYPES.ASSESSMENT ||
            data.get('format') === CONTENT_TYPES.EXTERNAL_ASSESSMENT
          ) {
            totalAssessmentTimespent =
              totalAssessmentTimespent + data.get('totalTimespent');
          }
        });
      });
      let summaryData = studentSummaryData.get('summaryData');
      let weeklySummaryData = summaryData || null;
      if (weeklySummaryData) {
        let completedCompetencies = weeklySummaryData.get(
          'completedCompetencies'
        );
        let inprogressCompetencies = weeklySummaryData.get(
          'inprogressCompetencies'
        );
        let inferredCompetencies = weeklySummaryData.get(
          'inferredCompetencies'
        );
        let interactionContents = weeklySummaryData.get('interactionData');
        let masteredCompetencies = weeklySummaryData.get(
          'masteredCompetencies'
        );
        let suggestionContents = weeklySummaryData.get('suggestionData');

        //parse low level data
        let assessmentInteration = interactionContents.get('assessmentData');
        let assessmentSuggestion = suggestionContents.get('assessmentData');
        let collectionSuggestion = suggestionContents.get('collectionData');
        let completedCompetenciesSource = completedCompetencies.filter(function(
          item
        ) {
          return item.contentSource.indexOf('diagnostic') !== -1;
        });
        completedCompetencies = completedCompetencies.filter(
          item => item.contentSource.indexOf('diagnostic') === -1
        );
        let weeklyReportData = Ember.Object.create({
          masteredCompetencies: masteredCompetencies.concat(
            completedCompetencies
          ),
          diagnosticGainedStatus: completedCompetenciesSource.length,
          masteredCompetenciesCount:
            masteredCompetencies.length + completedCompetencies.length,
          inferredCompetencies: inferredCompetencies,
          inferredCompetenciesCount: inferredCompetencies.length,
          inprogressCompetencies: inprogressCompetencies,
          inprogressCompetenciesCount: inprogressCompetencies.length,
          totalTimespent: totalAssessmentTimespent + totalCollectionTimespent,
          collectionTimespent: totalCollectionTimespent,
          assessmentTimespent: totalAssessmentTimespent,
          isNotStarted: assessmentInteration.get('isNotStarted'),
          badgeEarned: masteredCompetencies.length,
          averageScore: assessmentInteration.get('averageScore'),
          suggestionTaken:
            assessmentSuggestion.get('count') +
            collectionSuggestion.get('count')
        });
        let studentCompetencies = inprogressCompetencies.concat(
          masteredCompetencies,
          completedCompetencies
        );
        let domainCompetencies = component.get(
          'domainLevelSummary.domainCompetencies'
        );
        studentCompetencies.map(competency => {
          let domainCode = getDomainCode(competency.id);
          let domainCompetencyData = domainCompetencies
            ? domainCompetencies.findBy('domainCode', domainCode)
            : null;
          if (domainCompetencyData) {
            let competencyData = domainCompetencyData.competencies.findBy(
              'competencyCode',
              competency.id
            );
            competency.competencyStudentDesc =
              competencyData.competencyStudentDesc;
          }
        });
        component.set('weeklyReportData', weeklyReportData);
        component.getTaxonomyCategories();
      }
    }
  }
);
