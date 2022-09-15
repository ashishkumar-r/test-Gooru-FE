import Ember from 'ember';
import { getDomainCode } from 'gooru-web/utils/taxonomy';
import {
  CONTENT_TYPES,
  COMPETENCY_STATUS_VALUE
} from 'gooru-web/config/config';
import { getObjectsDeepCopy, arrayChunks } from 'gooru-web/utils/utils';
import StudentLearnerProficiency from 'gooru-web/mixins/student-learner-proficiency';
import ClassProgressReport from 'gooru-web/mixins/reports/class-progress-report';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
export default Ember.Component.extend(
  StudentLearnerProficiency,
  ClassProgressReport,
  {
    // -------------------------------------------------------------------------
    // Attributes
    classNames: ['weekly-report', 'student-weekly-report'],

    // -------------------------------------------------------------------------
    // Dependencies
    reportService: Ember.inject.service('api-sdk/report'),

    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyService: Ember.inject.service('taxonomy'),

    i18n: Ember.inject.service(),

    session: Ember.inject.service('session'),

    /**
     * @property {Object} studentProfile
     */
    studentProfile: null,

    isShowCompetencies: true,

    /**
     * portfolio service dependency injection
     * @type {Object}
     */
    portfolioService: Ember.inject.service('api-sdk/portfolio'),

    onLoadClassProperty: Ember.observer('class', function() {
      this.loadSummaryReportData();
      this.getTaxonomyCategories();
    }),

    competenciesBucket: Ember.A(),

    isCompetencyReport: false,

    /**
     * @property {Service} parseEvent service
     */
    parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

    // -------------------------------------------------------------------------
    // Events

    didInsertElement() {
      const component = this;
      component.$('[data-toggle="tooltip"]').tooltip({
        trigger: 'hover'
      });
      component.loadSummaryReportData();
      component.getTaxonomyCategories();
    },

    didRender() {
      const component = this;
      component
        .$('.body-container .body-right')
        .on('scroll', component.scrollEventHandler);

      let $competencyGroup = $('#competency-group');
      $competencyGroup.on('show.bs.collapse', '.collapse', function() {
        $competencyGroup.find('.collapse.in').collapse('hide');
      });
    },
    /**
     * @property {Array} filteredSummaryData
     * Property for filtered student list
     */
    filteredSummaryData: Ember.A([]),

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      goBacktoPerformance() {
        const component = this;
        component.set('class.isDisable', false);
        const classId = component.get('classId');
        component.get('router').transitionTo('teacher.class.atc', classId);
      },
      onSearchStudent(searchTerms) {
        let filteredSummaryData = this.get('filteredSummaryData');
        let filteredStudents = getObjectsDeepCopy(filteredSummaryData).filter(
          student => {
            searchTerms = searchTerms.toLowerCase();
            return (
              (student.student.firstName &&
                student.student.firstName
                  .toLowerCase()
                  .startsWith(searchTerms)) ||
              (student.student.lastName &&
                student.student.lastName.toLowerCase().startsWith(searchTerms))
            );
          }
        );
        this.set('studentsSummaryReportData', filteredStudents);
      },
      //Action triggered when select a student
      onSelectStudent(studentReport) {
        const component = this;
        if (studentReport.get('active')) {
          component.resetActiveStudentData();
        } else {
          this.get('parseEventService').postParseEvent(
            PARSE_EVENTS.CLICK_INDIVIDUAL_REPORTS
          );
          const userDetails = studentReport.get('student');
          const userId = userDetails.get('id');
          const classId = component.get('classId');
          component.resetActiveStudentData(true);
          return Ember.RSVP.hash({
            studentPortfolioData: component.getUserPortfolioDetails(
              userId,
              classId
            ),
            studentTimespentData: component.fetchStudentTimespentReport(userId),
            studentCompetencyData: component.fetchStudentCompetencyReport(
              userId
            )
          }).then(
            ({
              studentPortfolioData,
              studentTimespentData,
              studentCompetencyData
            }) => {
              studentReport.set('active', true);
              component.set('userId', userId);
              component.set('currentUserDetails', userDetails);
              component.set('isShowStudentCompetencies', true);
              component.set(
                'individualStudentReport',
                studentReport.get('weeklyReportData')
              );
              component.set('studentProfile', studentReport.student);
              component.loadData();
              component.parseStudentsTimespentSummaryReportData(
                studentTimespentData
              );
              component.parseStudentCompetencyStats(
                studentTimespentData,
                studentCompetencyData
              );
              component.parseStudentCompetencyActivties(
                studentReport,
                studentPortfolioData
              );
            }
          );
        }
      },

      isShowCompetency() {
        this.set('isShowCompetencies', !this.get('isShowCompetencies'));
        if (event.type === 'keypress') {
          if ($('#competency-group #collapse-competencies').hasClass('in')) {
            $('#competency-group #collapse-competencies').removeClass('in');
          } else {
            $('#competency-group #collapse-competencies').addClass('in');
          }
        }
      },

      //Action triggered when remove a student
      onRemoveActiveStudentData() {
        this.get('parseEventService').postParseEvent(
          PARSE_EVENTS.CLICK_PO_CLASS_PROGRESS_USER_CLOSE
        );
        this.resetActiveStudentData();
      },

      //Action triggered when click performance of an activity
      onShowReport(activity) {
        const component = this;
        component.set('reportActivityId', activity.collectionId);
        component.set('reportActivityType', activity.type);
        if (activity.type === CONTENT_TYPES.OFFLINE_ACTIVITY) {
          component.set('isShowOfflineActivityReport', true);
        } else {
          component.set('isShowPortfolioActivityReport', true);
        }
      },

      //Datepicker selection of a date
      onSelectDate(date, isDateChange) {
        let component = this;
        let forMonth = moment(date).format('MM');
        let forYear = moment(date).format('YYYY');
        let isWeekly = component.get('isWeekly');
        if (isDateChange) {
          component.set('forMonth', forMonth);
          component.set('forYear', forYear);
          component.set('selectedDate', date);
          component.set('rangeEndDate', date);
          component.set('rangeStartDate', null);
          component.set('isAllTime', false);
          component.set('isDateRange', false);
          component.loadSummaryReportData(isWeekly);
          component.resetActiveStudentData();
          component.send('closeDatePicker');
        }
      },

      onSelectWeek(startDate, endDate, isDateChange) {
        let component = this;
        let forMonth = moment(endDate).format('MM');
        let forYear = moment(endDate).format('YYYY');
        let isWeekly = component.get('isWeekly');
        if (isDateChange) {
          component.set('forMonth', forMonth);
          component.set('forYear', forYear);
          component.set('selectedWeekDate', startDate);
          component.set('rangeStartDate', startDate);
          component.set('rangeEndDate', endDate);
          component.set('isAllTime', false);
          component.set('isDateRange', false);
          component.loadSummaryReportData(isWeekly);
          component.resetActiveStudentData();
          component.send('closeDatePicker');
        }
      },

      onSelectMonth(date, isDateChange) {
        let component = this;
        let startDate = `${date}-01`;
        let endDate = moment(startDate)
          .endOf('month')
          .format('YYYY-MM-DD');
        let forMonth = moment(startDate).format('MM');
        let forYear = moment(startDate).format('YYYY');
        let isWeekly = component.get('isWeekly');
        if (isDateChange) {
          component.set('forMonth', forMonth);
          component.set('forYear', forYear);
          component.set('selectedMonth', date);
          component.set('rangeStartDate', startDate);
          component.set('rangeEndDate', endDate);
          component.set('isAllTime', false);
          component.set('isDateRange', false);
          component.loadSummaryReportData(isWeekly);
          component.resetActiveStudentData();
          component.send('closeDatePicker');
        }
      },

      getTillnowData() {
        let component = this;
        component
          .get('parseEventService')
          .postParseEvent(PARSE_EVENTS.CLICK_PO_CLASS_PROGRESS_DATE_ALLTIME);
        let startDate = moment(component.get('classStartDate')).format(
          'YYYY-MM-DD'
        );
        let endDate = moment().format('YYYY-MM-DD');
        component.set('isDaily', false);
        component.set('isMonthly', false);
        component.set('isWeekly', false);
        component.set('isDateRange', false);
        component.set('isAllTime', true);
        component.set('rangeStartDate', startDate);
        component.set('rangeEndDate', endDate);
        component.loadSummaryReportData(false);
        component.resetActiveStudentData();
        component.send('closeDatePicker');
      },

      /**
       * Select from date and to date while submit
       */

      onChangeDateForStudent(startDate, endDate) {
        let component = this;
        component.set('rangeStartDate', moment(startDate).format('YYYY-MM-DD'));
        component.set('rangeEndDate', moment(endDate).format('YYYY-MM-DD'));
        component.loadSummaryReportData(false);
        component.resetActiveStudentData();
        component.send('onCloseDatePicker');
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
     * @property {Number} activeWeek
     * Property for number of earlier week data to be populated
     * Default 0 => Current Week
     */
    activeWeek: 0,

    /**
     * Set custom range start date
     */
    rangeStartDate: null,

    /**
     * Set custom range start date
     */
    currentUserDetails: null,

    /**
     * Set custom range end date
     */
    rangeEndDate: Ember.computed(function() {
      return moment()
        .endOf('day')
        .format('YYYY-MM-DD');
    }),

    /**
     * @property {UUID} classId
     */
    classId: Ember.computed.alias('class.id'),

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
    studentDestination: Ember.computed('studentProfile', function() {
      let memberbounds = this.get('class.memberGradeBounds');
      let userId = this.get('studentProfile.id');
      let activeStudentGrade =
        memberbounds && memberbounds.find(item => item[userId]);
      return activeStudentGrade ? activeStudentGrade[userId] : null;
    }),

    competenciesData: {},

    // -------------------------------------------------------------------------
    // Methods

    /**
     * @function loadSummaryReportData
     * Method to load summary report data
     */
    loadSummaryReportData(isWeekly = false) {
      const component = this;
      component.set('isLoading', true);
      return Ember.RSVP.hash({
        summaryReportData: isWeekly
          ? component.fetchStudentsWeeklySummaryReport()
          : component.fetchStudentsClassSummaryReport(),
        classMembersTimespent: component.fetchStudentsTimespentSummaryreport()
      }).then(({ summaryReportData, classMembersTimespent }) => {
        if (!component.isDestroyed) {
          component.parseStudentsWeeklySummaryReportData(
            summaryReportData,
            classMembersTimespent
          );
        }
      });
    },

    /**
     * @function getTaxonomyCategories
     * Method to get Taxonomy Categories
     */

    getTaxonomyCategories() {
      const component = this;
      return Ember.RSVP.hash({
        taxonomyCategories: component.get('taxonomyService').getCategories()
      }).then(({ taxonomyCategories }) => {
        component.set('taxonomyCategories', taxonomyCategories);
      });
    },

    /**
     * @function parseStudentsWeeklySummaryReportData
     * Method to parse students weekly summary report
     */
    parseStudentsWeeklySummaryReportData(
      summaryReportData,
      classMembersTimespent
    ) {
      const component = this;
      let parsedStudentsSummaryReportData = Ember.A([]);
      component.set('teacherInfo', summaryReportData.get('teacher'));
      let studentsSummaryReportData = summaryReportData.get(
        'studentsSummaryData'
      );
      let studentsDomainPerformance = this.get('studentsDomainPerformance');

      studentsSummaryReportData.map(studentSummaryReportData => {
        let studentInfo = studentSummaryReportData.get('student');
        let isShareData = studentsDomainPerformance.findBy(
          'id',
          studentInfo.get('id')
        );
        if (isShareData) {
          studentInfo.isShowLearnerData = isShareData.isShowLearnerData;
        }

        let studentTimespentData = classMembersTimespent.findBy(
          'id',
          studentInfo.get('id')
        );
        let parsedStudentSummaryData = Ember.Object.create({
          student: studentInfo,
          weeklyReportData: Ember.Object.create({})
        });
        let summaryData = studentSummaryReportData.get('summaryData');
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
          let reInforcedCompetencies = weeklySummaryData.get(
            'reInforcedCompetencies'
          );
          let interactionContents = weeklySummaryData.get('interactionData');
          let masteredCompetencies = weeklySummaryData.get(
            'masteredCompetencies'
          );
          let suggestionContents = weeklySummaryData.get('suggestionData');
          let diagnosticStatus = weeklySummaryData.get(
            'diagnosticAssessmentStatus'
          );
          let completedCompetenciesSource = completedCompetencies.filter(
            function(item) {
              return item.contentSource.indexOf('diagnostic') !== -1;
            }
          );
          completedCompetencies = completedCompetencies.filter(
            item => item.contentSource.indexOf('diagnostic') === -1
          );
          //parse low level data
          let assessmentInteration = interactionContents.get('assessmentData');
          let assessmentSuggestion = suggestionContents.get('assessmentData');
          let collectionSuggestion = suggestionContents.get('collectionData');
          let weeklyReportData = Ember.Object.create({
            masteredCompetencies: masteredCompetencies.concat(
              completedCompetencies
            ),
            masteredCompetenciesCount:
              masteredCompetencies.length + completedCompetencies.length,
            diagnosticGainedStatus: completedCompetenciesSource.length,
            masteryChallengeCount: masteredCompetencies.length,
            inferredCompetencies: inferredCompetencies,
            inferredCompetenciesCount: inferredCompetencies.length,
            reInforcedCompetencies: reInforcedCompetencies,
            reInforcedCompetenciesCount: reInforcedCompetencies.length,
            inprogressCompetencies: inprogressCompetencies,
            inprogressCompetenciesCount: inprogressCompetencies.length,
            totalTimespent: studentTimespentData
              ? studentTimespentData.get('totalCollectionTimespent') +
                studentTimespentData.get('totalAssessmentTimespent')
              : null,
            collectionTimespent: studentTimespentData
              ? studentTimespentData.get('totalCollectionTimespent')
              : null,
            assessmentTimespent: studentTimespentData
              ? studentTimespentData.get('totalAssessmentTimespent')
              : null,
            isNotStarted: assessmentInteration.get('isNotStarted'),
            diagnosticStatus: diagnosticStatus,
            badgeEarned: masteredCompetencies.length,
            averageScore: assessmentInteration.get('averageScore'),
            suggestionTaken:
              assessmentSuggestion.get('count') +
              collectionSuggestion.get('count')
          });
          parsedStudentSummaryData.set('weeklyReportData', weeklyReportData);
        }
        parsedStudentsSummaryReportData.pushObject(parsedStudentSummaryData);
      });

      if (!component.isDestroyed) {
        component.set(
          'studentsSummaryReportData',
          parsedStudentsSummaryReportData.sortBy('student.lastName')
        );
        let studentsSummaryReportData = component.get(
          'studentsSummaryReportData'
        );
        let studentsDomainPerformance = component.get(
          'studentsDomainPerformance'
        );
        studentsDomainPerformance.map(studentsDomain => {
          let studentSummary = studentsSummaryReportData.find(
            studentsSummary => {
              return studentsDomain.id === studentsSummary.student.id;
            }
          );
          if (studentSummary) {
            let masteredCompetencies =
              studentSummary.weeklyReportData.masteredCompetencies;
            let inprogressCompetencies =
              studentSummary.weeklyReportData.inprogressCompetencies;
            let studentCompetencies = inprogressCompetencies.concat(
              masteredCompetencies
            );
            let domainCompetencies = component.get(
              'domainLevelSummary.domainCompetencies'
            );
            studentCompetencies.map(competency => {
              let domainCode = getDomainCode(competency.id);
              let domainCompetencyData = domainCompetencies.findBy(
                'domainCode',
                domainCode
              );
              if (domainCompetencyData) {
                let competencyData = domainCompetencyData.competencies.findBy(
                  'competencyCode',
                  competency.id
                );
                if (competencyData) {
                  competency.competencyStudentDesc =
                    competencyData.competencyStudentDesc;
                }
              }
            });
            studentsDomain.set('studentCompetencies', studentCompetencies);
            studentsDomain.set(
              'weeklyReportData',
              studentSummary.weeklyReportData
            );
          }
        });
        component.set(
          'filteredSummaryData',
          getObjectsDeepCopy(component.get('studentsSummaryReportData'))
        );
        component.set('isLoading', false);
      }
    },

    /**
     * @function parseStudentCompetencyActivties
     * Method to parse student competency activities
     */
    parseStudentCompetencyActivties(studentReportData, studentPortfolioData) {
      const component = this;
      const weeklyReportData = studentReportData.get('weeklyReportData');
      const masteredCompetencies = getObjectsDeepCopy(
        weeklyReportData.get('masteredCompetencies')
      );
      const inProgressCompetencies = getObjectsDeepCopy(
        weeklyReportData.get('inprogressCompetencies')
      );
      const inferredCompetencies = getObjectsDeepCopy(
        weeklyReportData.get('inferredCompetencies')
      );
      const domainCompetencies = component.get(
        'domainLevelSummary.domainCompetencies'
      );
      const studentCompetencies = [
        ...masteredCompetencies,
        ...inferredCompetencies,
        ...inProgressCompetencies
      ];
      component.set('studentDomainCompetencies', studentCompetencies);
      studentCompetencies.forEach(studentCompetency => {
        const competencyCode = studentCompetency.get('id');
        const competencyActivities = studentPortfolioData[competencyCode];
        const domainCode = getDomainCode(competencyCode);
        const domainCompetencyData = domainCompetencies.findBy(
          'domainCode',
          domainCode
        );
        const competencyData = domainCompetencyData.competencies.findBy(
          'competencyCode',
          competencyCode
        );
        studentCompetency.set(
          'domainCode',
          domainCompetencyData.get('domainCode')
        );
        studentCompetency.set(
          'domainName',
          domainCompetencyData.get('domainName')
        );
        studentCompetency.set('topicCode', competencyData.get('topicCode'));
        studentCompetency.set('topicName', competencyData.get('topicName'));
        studentCompetency.set('topicSeq', competencyData.get('topicSeq'));
        studentCompetency.set(
          'competencyName',
          competencyData.get('competencyName')
        );
        studentCompetency.set(
          'competencyStudentDesc',
          competencyData.get('competencyStudentDesc')
        );
        studentCompetency.set('competencyCode', competencyCode);
        studentCompetency.set('activities', competencyActivities);
      });

      const detailedMasteredCompetencies = studentCompetencies.filterBy(
        'status',
        COMPETENCY_STATUS_VALUE.EARNED
      );
      const detailedInferredCompetencies = studentCompetencies.filterBy(
        'status',
        COMPETENCY_STATUS_VALUE.INFERRED
      );
      const detailedInProgressCompetencies = studentCompetencies.filterBy(
        'status',
        COMPETENCY_STATUS_VALUE.IN_PROGRESS
      );
      const masteredWithInferredCompetencies = detailedMasteredCompetencies.map(
        masteredCompetency => {
          const competencyCode = masteredCompetency.get('id');
          const domainCode = getDomainCode(competencyCode);
          masteredCompetency.inferredCompetencies = detailedInferredCompetencies
            .filterBy('domainCode', domainCode)
            .filterBy('topicCode', masteredCompetency.get('topicCode'));
          return masteredCompetency;
        }
      );
      const chunkArrays = arrayChunks(
        [
          ...masteredWithInferredCompetencies,
          ...detailedInProgressCompetencies
        ],
        2
      );
      component.set('studentCompetencyActivties', {
        masteredAndInferredCompetencies: chunkArrays[0],
        inferredAndInProgressCompetencies: chunkArrays[1]
      });
    },

    /**
     * @func getUserPortfolioDetails
     * Method used to get User Portfolio Details
     */
    getUserPortfolioDetails(userId, classId) {
      const component = this;
      const startDate = component.get('rangeStartDate');
      const endDate = component.get('rangeEndDate');
      const dataParam = {
        userId: userId,
        classId: classId,
        startDate: startDate ? startDate : endDate,
        endDate: endDate
      };
      return component
        .get('portfolioService')
        .getUserPortfolioDetails(dataParam)
        .then(response => {
          return response.classUserCompetenciesPortfolio;
        });
    },

    /**
     * @func resetActiveStudentData
     * Method to reset active student
     */
    resetActiveStudentData(isShowCompetencies = false) {
      const component = this;
      if (component.get('studentsSummaryReportData')) {
        component.get('studentsSummaryReportData').map(reportData => {
          reportData.set('active', false);
        });
      }
      component.set('isShowStudentCompetencies', isShowCompetencies);
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
      let classFramework = component.get('classFramework');
      let isDefaultShowFW = component.get('isDefaultShowFW');
      const dataParam = {
        fromDate: startDate,
        toDate: endDate,
        subjectCode: subjectCode
      };
      return component
        .get('reportService')
        .fetchStudentsWeeklySummaryReport(
          classId,
          dataParam,
          classFramework,
          isDefaultShowFW
        );
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
      let classFramework = component.get('classFramework');
      let isDefaultShowFW = component.get('isDefaultShowFW');
      const dataParam = {
        fromDate: startDate ? startDate : endDate,
        toDate: endDate,
        subjectCode: subjectCode
      };
      return component
        .get('reportService')
        .fetchStudentsSummaryReport(
          classId,
          dataParam,
          classFramework,
          isDefaultShowFW
        );
    },

    /**
     * @function scrollEventHandler
     * Method to handle scrolling event for respective container
     */
    scrollEventHandler() {
      const scrollingElementContainer = this;
      const targetElementContainer = Ember.$(
        '.student-weekly-report .header-container .header-right'
      );
      targetElementContainer.scrollLeft(scrollingElementContainer.scrollLeft);
    },

    /**
     * @function fetchStudentTimespentReport
     * Method to fetch students time spent report
     */
    fetchStudentTimespentReport(userId) {
      const component = this;
      const classId = component.get('classId');
      const startDate = component.get('rangeStartDate');
      const endDate = component.get('rangeEndDate');
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
      let classFramework = component.get('classFramework');
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
        .fetchStudentCompetencyReport(dataParam, classFramework, true);
    },

    /**
     * @function fetchClassStats
     * Method to fetch students class stats
     */
    fetchClassStats() {
      let component = this;
      let startDate = component.get('rangeStartDate');
      let endDate = component.get('rangeEndDate');
      let params = {
        from: startDate,
        to: endDate,
        classIds: [component.get('class.id')]
      };
      return component.get('competencyService').fetchClassStats(params);
    }
  }
);
