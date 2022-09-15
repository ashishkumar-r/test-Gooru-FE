import Ember from 'ember';
import { getSubjectIdFromSubjectBucket } from 'gooru-web/utils/utils';
import {
  flattenGutToFwCompetency,
  flattenGutToFwDomain
} from 'gooru-web/utils/taxonomy';
import Language from 'gooru-web/mixins/language';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';

export default Ember.Controller.extend(
  Language,
  UIHelperMixin,
  TenantSettingsMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    classController: Ember.inject.controller('teacher.class'),

    /**
     * @requires competencyService
     */
    competencyService: Ember.inject.service('api-sdk/competency'),

    /**
     * @requires classService
     */
    classService: Ember.inject.service('api-sdk/class'),

    /**
     * @type {UnitService} Service to retrieve unit information
     */
    unitService: Ember.inject.service('api-sdk/unit'),
    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyService: Ember.inject.service('taxonomy'),

    /**
     * @type {Service} performance service
     */
    performanceService: Ember.inject.service('api-sdk/performance'),

    /**
     * @type {CourseService}
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyProvider: Ember.inject.service('api-sdk/taxonomy'),

    // -------------------------------------------------------------------------
    // Attributes

    queryParams: [
      'tab',
      'landingPage',
      'activeMinProfReport',
      'selectedUserId'
    ],

    tab: null,

    landingPage: null,

    domainCompetenciesList: Ember.A(),

    isShowBackBtn: false,

    classFramework: Ember.computed.alias('classController.classFramework'),

    isDefaultShowFW: Ember.computed.alias('classController.isDefaultShowFW'),
    // -------------------------------------------------------------------------
    // Actions
    actions: {
      //Action triggered when select a domain
      onSelectDomain(domain) {
        let controller = this;
        controller.set('isShowCourseCompetencyReport', false);
        controller.set('isShowDomainCompetencyReport', true);
        controller.set('activeDomain', domain);
      },

      //Action triggered when click back arrow
      onClickBack() {
        let controller = this;
        controller.set('isShowDomainCompetencyReport', false);
        controller.set('isShowCourseCompetencyReport', true);
      },

      //Action triggered when click class view
      onClickClassView() {
        let controller = this;
        controller.set('isShowCourseCompetencyReport', false);
        controller.set('isShowClassProficiencyReport', true);
      },

      //Action triggered when click course competency report view
      onClickCourseCompetencyView() {
        let controller = this;
        controller.set('isShowClassProficiencyReport', false);
        controller.set('isShowCourseCompetencyReport', true);
      },

      //Action triggered when select a student
      onSelectStudent(student) {
        let controller = this;
        let userId = student.id;
        let activeReport = controller.get('activeReport');
        let tab = activeReport.get('value');
        controller.transitionToRoute(
          'teacher.class.student-learner-proficiency',
          {
            queryParams: {
              studentId: userId,
              tab: tab
            }
          }
        );
      },

      /**
       * Action triggered when select a competency
       */
      onSelectCompetency(competency, userid, domainCompetencyList) {
        let controller = this;
        controller.set('domainCompetencyList', domainCompetencyList);
        controller.set('selectedCompetency', competency);
        controller.set('isShowCompetencyContentReport', true);
      },

      // Action triggered when close competency report pullup
      onCloseCompetencyReportPullUp() {
        this.set('isShowCompetencyContentReport', false);
      },

      /**
       * Action triggered when the user click outside of pullup.
       **/
      onClosePullUp() {
        this.set('isShowProficiencyPullup', false);
      },

      onSelectReport(report) {
        const controller = this;
        controller.setTitle('Learner Locator', report.text.string);
        let currentClass = controller.get('class');
        controller.set('activeReport', report);
        controller.set('isShowDomainCompetencyReport', false);
        controller
          .get('reportTypes')
          .map(reportType => controller.set(`${reportType.prop}`, false));
        controller.set(`${report.prop}`, true);
        controller.set('tab', null);
        currentClass.set('activeReport', report);
        controller.actions.onToggleReportTypeContainer();
      },

      onToggleReportTypeContainer() {
        $(
          '.students-proficiency-container .report-selector .report-types-container'
        ).slideToggle();
      },

      onToggleClassListContainer() {
        $(
          '.students-proficiency-container .class-selector .class-list-container'
        ).slideToggle();
      }
    },

    // -------------------------------------------------------------------------
    // Events

    init() {
      const controller = this;
      controller._super(...arguments);
      controller.set('isShowClassProgressReport', false);
      let tab = controller.get('tab');
      let currentClass = controller.get('class');
      let tenantSettings = controller.get('tenantSettings');
      let userPreference = controller.get('userPreference');
      let reportTypes = controller.get('reportTypes');
      let isPremiumClass = controller.get('isPremiumClass');
      let isShowMinProficiencyReport = !!(
        controller.get('activeMinProfReport') === true ||
        controller.get('activeMinProfReport') === 'true'
      );
      if (tenantSettings && userPreference) {
        let isShowCourseCompetencyReport = userPreference.class_report_default_landing_route
          ? userPreference.class_report_default_landing_route ===
            'domain-competency-report'
          : tenantSettings.class_report_default_landing_route
            ? tenantSettings.class_report_default_landing_route ===
            'domain-competency-report'
            : false;
        let isShowClassProficiencyReport = userPreference.class_report_default_landing_route
          ? isPremiumClass
            ? userPreference.class_report_default_landing_route ===
              'class-proficiency-report'
            : userPreference.class_report_default_landing_route ===
                'class-proficiency-report' ||
              userPreference.class_report_default_landing_route ===
                'class-progress-report'
          : tenantSettings.class_report_default_landing_route
            ? isPremiumClass
              ? tenantSettings.class_report_default_landing_route ===
              'class-proficiency-report'
              : tenantSettings.class_report_default_landing_route ===
                'class-proficiency-report' ||
              tenantSettings.class_report_default_landing_route ===
                'class-progress-report'
            : true;
        let isShowClassWeeklyReport = isPremiumClass
          ? userPreference.class_report_default_landing_route
            ? userPreference.class_report_default_landing_route ===
              'class-progress-report'
            : tenantSettings.class_report_default_landing_route
              ? tenantSettings.class_report_default_landing_route ===
              'class-progress-report'
              : false
          : false;
        let activeReport = isShowCourseCompetencyReport
          ? reportTypes.findBy('prop', 'isShowCourseCompetencyReport')
          : isShowClassWeeklyReport
            ? reportTypes.findBy('prop', 'isShowClassWeeklyReport')
            : isShowMinProficiencyReport
              ? reportTypes.findBy('prop', 'isShowMinProficiencyReport')
              : reportTypes.findBy('prop', 'isShowClassProficiencyReport');
        controller.setTitle('Learner Locator', activeReport.text.string);
        controller.set(
          'isShowCourseCompetencyReport',
          isShowCourseCompetencyReport
        );
        controller.set(
          'isShowClassProficiencyReport',
          isShowClassProficiencyReport
        );
        controller.set('isShowClassWeeklyReport', isShowClassWeeklyReport);
        controller.set('activeReport', activeReport);
        if (isShowMinProficiencyReport) {
          currentClass.set('activeReport', activeReport);
        }
      }
      if (tab || currentClass.get('activeReport')) {
        let report = tab
          ? controller.get('reportTypes').findBy('value', tab)
          : currentClass.get('activeReport');
        controller.set('activeReport', report);
        controller
          .get('reportTypes')
          .map(reportType => controller.set(`${reportType.prop}`, false));
        controller.set(`${report.prop}`, true);
      }
      const landingPage = controller.get('landingPage');
      if (landingPage) {
        controller.redirectFromPerformance();
      }
    },

    // -------------------------------------------------------------------------
    // Methods

    redirectFromPerformance() {
      const controller = this;
      const landingPage = controller.get('landingPage');
      controller.set('isShowCourseCompetencyReport', false);
      controller.set('isShowDomainCompetencyReport', false);
      controller.set('isShowClassWeeklyReport', false);
      controller.set('isShowClassProgressReport', false);
      controller.set('isShowClassProficiencyReport', false);

      if (landingPage && landingPage === 'class-progress') {
        controller.set('isShowClassProgressReport', true);
      } else if (landingPage && landingPage === 'student-progress') {
        controller.set('isShowClassWeeklyReport', true);
        controller.set('isShowBackBtn', true);
      } else {
        controller.set('isShowCourseCompetencyReport', true);
      }
    },

    changeLanguage() {
      const controller = this;
      let classes = controller.get('class');
      controller.changeLanguages(classes);
    },

    /**
     * @function loadStudentsProficiencyData
     * Method to load students proficiency data
     */
    loadStudentsProficiencyData() {
      let controller = this;
      controller.set('isLoading', true);
      const classData = controller.get('class');
      if (classData.preference && classData.preference.subject) {
        return Ember.RSVP.hash({
          classCompetencyReport: controller.getClassCompetencyReport(),
          crossWalkFWC: controller.fetchCrossWalkFWC()
        }).then(({ classCompetencyReport, crossWalkFWC }) => {
          controller.set(
            'fwCompetencies',
            flattenGutToFwCompetency(crossWalkFWC)
          );
          controller.set(
            'domainCompetenciesList',
            classCompetencyReport.domainCompetencies
          );
          controller.parseCrossWalkFWC();
          controller.set('domainLevelSummary', classCompetencyReport);
          controller.set(
            'studentCompetencyReport',
            classCompetencyReport.students
          );
          controller.fetchDomainGradeBoundary();
          controller.parseClassCompetencyReport(classCompetencyReport);
        });
      } else {
        return;
      }
    },

    /**
     * @function parseCrossWalkFWC
     * Method help to fetch crossWalkFWC competency display code
     */
    parseCrossWalkFWC() {
      const controller = this;
      const fwCompetencies = controller.get('fwCompetencies');
      const domainCompetenciesList = controller.get('domainCompetenciesList');
      domainCompetenciesList.forEach(domain => {
        domain.topics.forEach(topic => {
          topic.competencies.map(competency => {
            let crossWalkComp = fwCompetencies.find(
              fwComp => fwComp[competency.competencyCode]
            );
            if (crossWalkComp) {
              competency.set(
                'displayCode',
                crossWalkComp[competency.competencyCode]
                  .frameworkCompetencyDisplayCode
              );
            }
            return competency;
          });
        });
      });
    },

    /**
     * @function fetchDomainTopicsLevelSummary
     * Method to fetch domain level summary data
     */
    fetchDomainTopicsLevelSummary() {
      let controller = this;
      let competencyService = controller.get('competencyService');
      let filters = {
        classId: controller.get('classId')
      };
      let domainLevelSummaryPromise = Ember.RSVP.resolve(
        competencyService.getDomainTopicsLevelSummary(filters)
      );
      return Ember.RSVP.hash({
        domainLevelSummary: domainLevelSummaryPromise
      })
        .then(({ domainLevelSummary }) => {
          controller.set('isDataNotAvailable', false);
          return domainLevelSummary;
        })
        .catch(function() {
          controller.set('isDataNotAvailable', true);
        });
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
        controller
          .get('competencyService')
          .fetchClassCompetencyReport(
            controller.get('classId'),
            isDefaultShowFW ? framework : null
          )
      );
    },

    parseClassCompetencyReport(classCompetencyReport) {
      const controller = this;
      const classMembers = controller.get('classMembers');
      let highestDomainSize = 0;
      const studentCompetencyData = classCompetencyReport.get('students');
      const overallDomainCompetenciesReport = Ember.A([]);
      const overallCompetenciesReport = Ember.Object.create({
        'not-started': 0,
        'in-progress': 0,
        inferred: 0,
        completed: 0,
        mastered: 0,
        total: 0
      });
      const studentsCompetencyReport = Ember.A([]);
      classMembers.map(member => {
        const studentMatrix = studentCompetencyData.findBy(
          'id',
          member.get('id')
        );
        const userCompetencyMatrix = studentMatrix.get('userCompetencyMatrix');
        const studentCompetencyReport = controller.generateStudentData(member);
        userCompetencyMatrix.map(stuDomainMatrix => {
          stuDomainMatrix.setProperties({
            'not-started': 0,
            'in-progress': 0,
            inferred: 0,
            completed: 0,
            mastered: 0,
            total: 0
          });
          highestDomainSize =
            highestDomainSize < stuDomainMatrix.get('competencies.length')
              ? stuDomainMatrix.get('competencies.length')
              : highestDomainSize;
          stuDomainMatrix.topics.map(stuTopicMatrix => {
            stuTopicMatrix.setProperties({
              'not-started': 0,
              'in-progress': 0,
              inferred: 0,
              completed: 0,
              mastered: 0,
              total: 0
            });
            stuTopicMatrix.competencies.map(studCompData => {
              const statusValue = studCompData.get('competencyStatus');
              if (statusValue === 0) {
                stuDomainMatrix.incrementProperty('not-started');
                stuTopicMatrix.incrementProperty('not-started');
                overallCompetenciesReport.incrementProperty('not-started');
              } else if (statusValue === 1) {
                stuDomainMatrix.incrementProperty('in-progress');
                stuTopicMatrix.incrementProperty('in-progress');
                overallCompetenciesReport.incrementProperty('in-progress');
              } else if (statusValue >= 2 && statusValue <= 3) {
                stuDomainMatrix.incrementProperty('inferred');
                stuDomainMatrix.incrementProperty('mastered');
                stuTopicMatrix.incrementProperty('inferred');
                stuTopicMatrix.incrementProperty('mastered');
                overallCompetenciesReport.incrementProperty('mastered');
                overallCompetenciesReport.incrementProperty('inferred');
              } else {
                stuDomainMatrix.incrementProperty('mastered');
                stuTopicMatrix.incrementProperty('mastered');
                stuDomainMatrix.incrementProperty('completed');
                stuTopicMatrix.incrementProperty('completed');
                overallCompetenciesReport.incrementProperty('mastered');
                overallCompetenciesReport.incrementProperty('completed');
              }
            });
            stuTopicMatrix.set(
              'total',
              stuTopicMatrix.get('not-started') +
                stuTopicMatrix.get('in-progress') +
                stuTopicMatrix.get('mastered')
            );
            // studentDomainReport.topics.pushObject(stuTopicMatrix);
          });
          stuDomainMatrix.set(
            'total',
            stuDomainMatrix.get('not-started') +
              stuDomainMatrix.get('in-progress') +
              stuDomainMatrix.get('mastered')
          );
          overallCompetenciesReport.set(
            'total',
            overallCompetenciesReport.get('not-started') +
              overallCompetenciesReport.get('in-progress') +
              overallCompetenciesReport.get('mastered')
          );
          studentCompetencyReport
            .get('domainCompetencies')
            .pushObject(stuDomainMatrix);
          let overallDomainReport = overallDomainCompetenciesReport.findBy(
            'domainCode',
            stuDomainMatrix.get('domainCode')
          );
          if (overallDomainReport) {
            overallDomainReport.setProperties({
              'not-started':
                overallDomainReport.get('not-started') +
                stuDomainMatrix.get('not-started'),
              'in-progress':
                overallDomainReport.get('in-progress') +
                stuDomainMatrix.get('in-progress'),
              mastered:
                overallDomainReport.get('mastered') +
                stuDomainMatrix.get('mastered'),
              completed:
                overallDomainReport.get('completed') +
                stuDomainMatrix.get('completed'),
              total:
                overallDomainReport.get('total') + stuDomainMatrix.get('total')
            });
          } else {
            overallDomainReport = Ember.Object.create({
              'not-started': stuDomainMatrix.get('not-started'),
              'in-progress': stuDomainMatrix.get('in-progress'),
              mastered: stuDomainMatrix.get('mastered'),
              completed: stuDomainMatrix.get('completed'),
              total: stuDomainMatrix.get('total'),
              domainSeq: stuDomainMatrix.get('domainSeq'),
              domainCode: stuDomainMatrix.get('domainCode'),
              domainName: stuDomainMatrix.get('domainName')
            });
            overallDomainCompetenciesReport.pushObject(overallDomainReport);
          }
        });
        studentsCompetencyReport.pushObject(studentCompetencyReport);
      });
      controller.set(
        'studentsDomainPerformance',
        studentsCompetencyReport.sortBy('lastName')
      );
      controller.set('domainCoverageCount', overallDomainCompetenciesReport);
      controller.set('courseCoverageCount', overallCompetenciesReport);
      controller.set(
        'totalCompetencies',
        overallCompetenciesReport.get('total')
      );
      controller.set('maxNumberOfCompetencies', highestDomainSize);
      controller.set('isLoading', false);
    },

    /**
     * @function parseStudentsDomainProficiencyData
     * Method to parse students domain proficiency data
     */
    parseStudentsDomainProficiencyData() {
      let controller = this;
      let studentsDomainPerformance = Ember.A([]);
      let domainLevelSummary = controller.get('domainLevelSummary');
      let classMembers = controller.get('classMembers');
      let totalCompetencies = 0;
      let maxNumberOfCompetencies = 0;
      if (domainLevelSummary) {
        let studentsCompetencyMatrix = domainLevelSummary.students;
        let domainCompetencies = domainLevelSummary.domainCompetencies;
        let notStartedCourseCompetencyCoverage = 0;
        let inProgressCourseCompetencyCoverage = 0;
        let masteredCourseCompetencyCoverage = 0;
        let studentsDomainCompetencyCoverage = Ember.A([]);
        classMembers.map(member => {
          let studentDomainPerformance = controller.generateStudentData(member);
          let studentCompetencyMatrix = studentsCompetencyMatrix.findBy(
            'id',
            member.id
          );
          let userCompetencyMatrix = studentCompetencyMatrix
            ? studentCompetencyMatrix.userCompetencyMatrix
            : null;
          let studentDomainCompetencies = Ember.A([]);
          domainCompetencies.map(domain => {
            let studentCompetencies = Ember.Object.create({
              domainCode: domain.domainCode,
              domainName: domain.domainName,
              domainSeq: domain.domainSeq,
              competencies: Ember.A([])
            });
            let notStartedDomainCompetencyCoverage = 0;
            let inProgressDomainCompetencyCoverage = 0;
            let masteredDomainCompetencyCoverage = 0;
            let studentDomainCompetenciesInfo = Ember.A([]);
            let competencies = domain.competencies;
            let userDomainCompetencyMatrix = userCompetencyMatrix.findBy(
              'domainCode',
              domain.domainCode
            );
            let userDomainMatrixCompetencies =
              userDomainCompetencyMatrix.competencies;
            maxNumberOfCompetencies =
              maxNumberOfCompetencies < competencies.length
                ? competencies.length
                : maxNumberOfCompetencies;
            let skyLineCompetency = 0;
            competencies.forEach(function(competency, competencyIndex) {
              totalCompetencies++;
              let studentCompetencyPerformanceData = Ember.Object.create({
                competencyCode: competency.competencyCode,
                competencyName: competency.competencyName,
                competencyDesc: competency.competencyDesc,
                competencySeq: competency.competencySeq,
                topicCode: competency.topicCode,
                topicName: competency.topicName,
                topicSeq: competency.topicSeq,
                competencyStudentDesc: competency.competencyStudentDesc,
                competencyStatus: 0,
                isSkyLineCompetency: false
              });
              const competencyData = userDomainMatrixCompetencies.findBy(
                'competencyCode',
                competency.competencyCode
              );
              const competencyStatus = competencyData.get('competencyStatus');
              studentCompetencyPerformanceData.set(
                'competencyStatus',
                competencyStatus
              );
              studentDomainCompetenciesInfo.push(
                studentCompetencyPerformanceData
              );
              if (competencyStatus === 0) {
                notStartedCourseCompetencyCoverage++;
                notStartedDomainCompetencyCoverage++;
              } else if (competencyStatus === 1) {
                inProgressCourseCompetencyCoverage++;
                inProgressDomainCompetencyCoverage++;
              } else {
                masteredCourseCompetencyCoverage++;
                masteredDomainCompetencyCoverage++;
                skyLineCompetency = competencyIndex;
              }
            });
            let curDomainObject =
              studentsDomainCompetencyCoverage[domain.domainSeq - 1];
            let curDomainInProgressCount = curDomainObject
              ? curDomainObject.get('in-progress')
              : 0;
            let curDomainNotStartedCount = curDomainObject
              ? curDomainObject.get('not-started')
              : 0;
            let curDomainMasteredCount = curDomainObject
              ? curDomainObject.get('mastered')
              : 0;
            studentsDomainCompetencyCoverage[
              domain.domainSeq - 1
            ] = Ember.Object.create({
              domainCode: domain.domainCode,
              domainName: domain.domainName,
              domainSeq: domain.domainSeq,
              'in-progress':
                curDomainInProgressCount + inProgressDomainCompetencyCoverage,
              'not-started':
                curDomainNotStartedCount + notStartedDomainCompetencyCoverage,
              mastered:
                curDomainMasteredCount + masteredDomainCompetencyCoverage,
              'total-coverage':
                curDomainInProgressCount +
                inProgressDomainCompetencyCoverage +
                notStartedDomainCompetencyCoverage +
                masteredDomainCompetencyCoverage
            });
            studentDomainCompetenciesInfo
              .objectAt(skyLineCompetency)
              .set('isSkyLineCompetency', true);
            studentCompetencies.set(
              'competencies',
              studentDomainCompetenciesInfo.sortBy('competencyStatus').reverse()
            );
            studentCompetencies.set(
              'actualCompetencies',
              studentDomainCompetenciesInfo
            );
            studentCompetencies.set(
              'in-progress',
              inProgressDomainCompetencyCoverage
            );
            studentCompetencies.set(
              'mastered',
              masteredDomainCompetencyCoverage
            );
            studentCompetencies.set(
              'not-started',
              notStartedDomainCompetencyCoverage
            );
            studentDomainCompetencies.push(studentCompetencies);
          });
          studentDomainPerformance.set(
            'domainCompetencies',
            studentDomainCompetencies
          );
          studentsDomainPerformance.push(studentDomainPerformance);
        });
        controller.set('domainCoverageCount', studentsDomainCompetencyCoverage);
        let courseCoverageCount = Ember.Object.create({
          'not-started': notStartedCourseCompetencyCoverage,
          'in-progress': inProgressCourseCompetencyCoverage,
          mastered: masteredCourseCompetencyCoverage
        });
        controller.set('courseCoverageCount', courseCoverageCount);
      }
      controller.set('maxNumberOfCompetencies', maxNumberOfCompetencies);
      controller.set(
        'studentsDomainPerformance',
        studentsDomainPerformance.sortBy('lastName')
      );
      controller.set(
        'totalCompetencies',
        totalCompetencies / classMembers.length
      );
      controller.set('isLoading', false);
      return studentsDomainPerformance;
    },

    /**
     * @function generateStudentData
     * Method to generate student data structure
     */
    generateStudentData(student) {
      return Ember.Object.create({
        firstName: student.get('firstName'),
        lastName: student.get('lastName'),
        fullName: `${student.get('lastName')}, ${student.get('firstName')}`,
        id: student.get('id'),
        email: student.get('email'),
        thumbnail: student.get('avatarUrl'),
        username: student.get('username'),
        isActive: student.get('isActive'),
        isShowLearnerData: student.get('isShowLearnerData'),
        domainCompetencies: Ember.A([])
      });
    },

    /**
     * @function resetProperties
     * Method to reset to default values
     */
    resetProperties() {
      let controller = this;
      controller.set('domainLevelSummary', null);
      controller.set('isShowDomainCompetencyReport', false);
      controller.set('isShowCourseCompetencyReport', false);
      controller.set('isShowClassProficiencyReport', false);
      controller.set('isShowClassWeeklyReport', false);
      controller.set('isShowClassProgressReport', false);
      controller.set('studentDomainPerformance', Ember.A([]));
      controller.set('domainBoundariesContainer', Ember.A([]));
      controller.set('tab', null);
      controller.set('landingPage', null);
      controller.set('activeMinProfReport', false);
    },

    /**
     * @function loadClassData
     * @param {UUID} classId
     * Method to fetch all the class dependencies for a given class id
     */
    loadClassData(classId) {
      const controller = this;
      const existingClassData =
        controller.get('secondaryClassesData').findBy('id', classId) ||
        (controller.get('class.id') === classId
          ? controller.get('class')
          : null);
      const classPromise = existingClassData
        ? Ember.RSVP.resolve(existingClassData)
        : controller.get('classService').readClassInfo(classId);
      const membersPromise = controller
        .get('classService')
        .readClassMembers(classId);
      return Ember.RSVP.hash({
        class: classPromise,
        members: membersPromise
      }).then(function(hash) {
        const aClass = hash.class;
        const members = hash.members;
        const preference = aClass.get('preference');
        const classPerformanceSummaryItems = hash.classPerformanceSummaryItems;
        let classPerformanceSummary = classPerformanceSummaryItems
          ? classPerformanceSummaryItems.findBy('classId', classId)
          : null;
        aClass.set('performanceSummary', classPerformanceSummary);
        const setting = aClass.get('setting');
        const isPremiumClass = setting != null && setting['course.premium'];
        const courseId = aClass.get('courseId');
        let coursePromise = Ember.RSVP.resolve(Ember.Object.create({}));
        const competencyCompletionStats = isPremiumClass
          ? controller.get('competencyService').getCompetencyCompletionStats([
            {
              classId: classId,
              subjectCode: preference.subject
            }
          ])
          : Ember.RSVP.resolve(Ember.A());

        if (courseId) {
          coursePromise = controller.get('courseService').fetchById(courseId);
        }
        const frameworkId = aClass.get('preference.framework');
        const subjectId = aClass.get('preference.subject');

        let crossWalkFWCPromise = null;
        if (frameworkId && subjectId) {
          crossWalkFWCPromise = controller
            .get('taxonomyService')
            .fetchCrossWalkFWC(frameworkId, subjectId);
        }
        return Ember.RSVP.hash({
          course: coursePromise,
          crossWalkFWC: crossWalkFWCPromise,
          competencyStats: competencyCompletionStats
        }).then(function(hash) {
          const course = hash.course;
          const crossWalkFWC = hash.crossWalkFWC || [];
          aClass.set('owner', members.get('owner'));
          aClass.set('collaborators', members.get('collaborators'));
          aClass.set('memberGradeBounds', members.get('memberGradeBounds'));
          aClass.set('members', members.get('members'));
          aClass.set(
            'competencyStats',
            hash.competencyStats.findBy('classId', classId)
          );
          if (classId !== controller.get('primaryClassId')) {
            aClass.set('isSecondaryClass', true);
          }
          controller.set('class', aClass);
          controller.set('course', course);
          controller.set('members', members);
          controller.set(
            'fwCompetencies',
            flattenGutToFwCompetency(crossWalkFWC)
          );
          controller.set('fwDomains', flattenGutToFwDomain(crossWalkFWC));
          controller.loadStudentsProficiencyData();
          controller
            .get('classController')
            .send('onSelectSecondaryClass', aClass);
        });
      });
    },

    /**
     * @function fetchCrossWalkFWC
     * Method to fetch cross walk competencies
     */
    fetchCrossWalkFWC() {
      let controller = this;
      const frameworkId = controller.get('class.preference.framework');
      const subjectId = controller.get('class.preference.subject');
      let crossWalkPromise = Ember.RSVP.resolve(null);
      if (frameworkId) {
        crossWalkPromise = controller
          .get('taxonomyService')
          .fetchCrossWalkFWC(frameworkId, subjectId);
      }
      return crossWalkPromise;
    },

    /**
     * @function fetchDomainGradeBoundary
     * Method to fetch domain grade boundary
     */
    fetchDomainGradeBoundary() {
      let component = this;
      let taxonomyService = component.get('taxonomyProvider');
      let gradeId = component.get('class.gradeCurrent');
      return Ember.RSVP.hash({
        domainBoundary: gradeId
          ? Ember.RSVP.resolve(
            taxonomyService.fetchDomainGradeBoundaryBySubjectId(gradeId)
          )
          : Ember.RSVP.resolve(null)
      }).then(({ domainBoundary }) => {
        component.set('domainBoundariesContainer', domainBoundary);
      });
    },

    // -------------------------------------------------------------------------
    // Properties
    /**
     * @property {Class}
     */
    class: Ember.computed('classController.class', function() {
      return this.get('classController.class') || {};
    }),

    /**
     * @property {Course}
     */
    course: Ember.computed(
      'classController.class',
      'class.members',
      function() {
        return this.get('classController.course') || {};
      }
    ),

    /**
     * @property {classMembers}
     */
    classMembers: Ember.computed('class.members', function() {
      return this.get('class.members');
    }),
    /**
     * @property {classId}
     */
    classId: Ember.computed('class', function() {
      let controller = this;
      return controller.get('class.id');
    }),

    /**
     * @property {UUUID} primaryClassId
     * Property for primary class id
     */
    primaryClassId: Ember.computed('classController.class.id', function() {
      return this.get('classController.class.id');
    }),

    /**
     * @property {courseId}
     */
    courseId: Ember.computed('course', function() {
      let controller = this;
      return controller.get('course.id');
    }),

    /**
     * @property {Boolean} isPremiumClass
     */
    isPremiumClass: Ember.computed(
      'classController.isPremiumClass',
      function() {
        return this.get('classController.isPremiumClass');
      }
    ),
    /**
     * @property {subjectCode}
     */
    subjectCode: Ember.computed('course', function() {
      let controller = this;
      let course = controller.get('course');
      let subjectBucket = course.get('subject');
      return subjectBucket
        ? getSubjectIdFromSubjectBucket(subjectBucket)
        : null;
    }),

    /**
     * @property {String}
     * Property to store course subject bucket or K12.MA will be default
     */
    subjectBucket: Ember.computed('course', function() {
      let controller = this;
      return controller.get('course.subject') || 'K12.MA';
    }),

    /**
     * @property {Boolean} isShowProficiencyPullup
     */
    isShowProficiencyPullup: false,

    /**
     * @property {Array} domainLevelSummary
     */
    domainLevelSummary: null,

    /**
     * @property {Number} maxCompetencyLength
     */
    maxCompetencyLength: 0,

    /**
     * @property {Boolean} isShowCourseCompetencyReport
     */
    isShowCourseCompetencyReport: Ember.computed(
      'tenantSettings',
      'userPreference',
      function() {
        let tenantSettings = this.get('tenantSettings');
        let userPreference = this.get('userPreference');
        return userPreference.class_report_default_landing_route
          ? userPreference.class_report_default_landing_route ===
              'domain-competency-report'
          : tenantSettings.class_report_default_landing_route
            ? tenantSettings.class_report_default_landing_route ===
            'domain-competency-report'
            : false;
      }
    ),

    /**
     * @property {Boolean} isShowDomainCompetencyReport
     */
    isShowDomainCompetencyReport: false,

    /**
     * @property {Boolean} isShowCompetencyReport
     */
    isShowCompetencyReport: Ember.computed('course', function() {
      let controller = this;
      let course = controller.get('course');
      let subjectCode = controller.get('subjectCode');
      let classMembers = controller.get('classMembers');
      return this.get('isPremiumClass')
        ? classMembers.length
        : course && subjectCode && classMembers.length;
    }),

    /**
     * @property {Object} activeReport
     */
    activeReport: Ember.computed(
      'reportTypes',
      'isShowDomainCompetencyReport',
      'isShowClassWeeklyReport',
      'isShowClassProficiencyReport',
      function() {
        let activeReport = this.get('isShowDomainCompetencyReport')
          ? this.get('reportTypes').findBy(
            'prop',
            'isShowCourseCompetencyReport'
          )
          : this.get('isShowClassWeeklyReport')
            ? this.get('reportTypes').findBy('prop', 'isShowClassWeeklyReport')
            : this.get('reportTypes').findBy(
              'prop',
              'isShowClassProficiencyReport'
            );
        return activeReport;
      }
    ),

    /**
     * @property {Array} reportTypes
     */
    reportTypes: Ember.computed('isPremiumClass', 'class.members', function() {
      const controller = this;
      let reportTypes = Ember.A([
        Ember.Object.create({
          text: controller.get('i18n').t('report.class-proficiency-report'),
          value: 'class-proficiency',
          prop: 'isShowClassProficiencyReport'
        }),
        Ember.Object.create({
          text: controller.get('i18n').t('report.domain-proficiency-report'),
          value: 'course-proficiency',
          prop: 'isShowCourseCompetencyReport'
        })
      ]);
      if (controller.get('isSerpTenant')) {
        reportTypes.pushObject(
          Ember.Object.create({
            text: controller.get('i18n').t('report.min-proficiency-report'),
            value: 'min-proficiency',
            prop: 'isShowMinProficiencyReport'
          })
        );
      }
      if (controller.get('isPremiumClass')) {
        reportTypes.pushObject(
          Ember.Object.create({
            text: controller.get('i18n').t('report.class-weekly-report'),
            value: 'class-weekly',
            prop: 'isShowClassWeeklyReport'
          })
        );
      }
      return reportTypes;
    }),

    /**
     * @property {Boolean} isShowClassWeeklyReport
     */
    isShowClassWeeklyReport: Ember.computed(
      'tenantSettings',
      'userPreference',
      'isPremiumClass',
      function() {
        let tenantSettings = this.get('tenantSettings');
        let userPreference = this.get('userPreference');
        return this.get('isPremiumClass')
          ? userPreference.class_report_default_landing_route
            ? userPreference.class_report_default_landing_route ===
              'class-progress-report'
            : tenantSettings.class_report_default_landing_route
              ? tenantSettings.class_report_default_landing_route ===
              'class-progress-report'
              : false
          : false;
      }
    ),
    /**
     * @property {Boolean} isSerpTenant
     * Property to enable/disable fullscreen mode
     */
    isSerpTenant: Ember.computed('tenantSettingsObj', function() {
      let tenantSetting = this.get('tenantSettingsObj');
      return tenantSetting &&
        tenantSetting.ui_element_visibility_settings &&
        tenantSetting.ui_element_visibility_settings
          .show_activity_score_min_proficiency_report === true
        ? tenantSetting.ui_element_visibility_settings
          .show_activity_score_min_proficiency_report
        : false;
    }),

    /**
     * @property {Boolean} isShowClassProficiencyReport
     */
    isShowClassProficiencyReport: Ember.computed(
      'tenantSettings',
      'userPreference',
      'isPremiumClass',
      function() {
        let tenantSettings = this.get('tenantSettings');
        let userPreference = this.get('userPreference');
        let isPremiumClass = this.get('isPremiumClass');
        return userPreference.class_report_default_landing_route
          ? isPremiumClass
            ? userPreference.class_report_default_landing_route ===
              'class-proficiency-report'
            : userPreference.class_report_default_landing_route ===
                'class-proficiency-report' ||
              userPreference.class_report_default_landing_route ===
                'class-progress-report'
          : tenantSettings.class_report_default_landing_route
            ? isPremiumClass
              ? tenantSettings.class_report_default_landing_route ===
              'class-proficiency-report'
              : tenantSettings.class_report_default_landing_route ===
                'class-proficiency-report' ||
              tenantSettings.class_report_default_landing_route ===
                'class-progress-report'
            : true;
      }
    ),

    /**
     * @property {Array} studentsDomainPerformance
     */
    studentsDomainPerformance: Ember.A([]),

    /**
     * @property {JSON} courseCoverageCount
     */
    courseCoverageCount: Ember.Object.create({
      mastered: 0,
      'in-progress': 0,
      'not-started': 0
    }),

    /**
     * @property {Array} domainCoverageCount
     */
    domainCoverageCount: null,

    /**
     * @property {Number} totalCompetencies
     */
    totalCompetencies: 0,

    /**
     * @property {Number} numberOfStudents
     */
    numberOfStudents: Ember.computed('classMembers', function() {
      let controller = this;
      return controller.get('classMembers.length');
    }),
    /**
     * @property {String} subjectFramework
     */
    subjectFramework: Ember.computed('subjectBucket', function() {
      let controller = this;
      let subjectBucket = controller.get('subjectBucket');
      return subjectBucket ? subjectBucket.replace(/\./g, ' | ') : '';
    }),

    /**
     * @property {Array} fwCompetencies
     */
    fwCompetencies: Ember.computed(
      'classController.fwCompetencies',
      function() {
        return this.get('classController.fwCompetencies');
      }
    ),

    /**
     * @property {Array} fwDomains
     */
    fwDomains: Ember.computed('classController.fwDomains', function() {
      return this.get('classController.fwDomains');
    }),

    /**
     * Maintain secondary class list
     */
    selectedClassList: null,

    /**
     * @property {Array} domainBoundariesContainer
     */
    domainBoundariesContainer: Ember.A([]),

    secondaryClassesData: Ember.computed(
      'classController.secondaryClassesData',
      function() {
        return this.get('classController.secondaryClassesData');
      }
    ),

    subjectPreference: Ember.computed('class.preference.subject', function() {
      return this.get('class.preference.subject');
    })
  }
);
