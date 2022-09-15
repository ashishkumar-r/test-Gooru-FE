import Ember from 'ember';
import ReportAdapter from 'gooru-web/adapters/report/report';
import ReportSerializer from 'gooru-web/serializers/report/report';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';

export default Ember.Service.extend({
  // -------------------------------------------------------------------------
  // Events

  init: function() {
    this._super(...arguments);
    this.set(
      'adapter',
      ReportAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'serializer',
      ReportSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomyAdapter',
      TaxonomyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {GoalAdapter} adapter
   */
  adapter: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @function fetchStudentsSummaryReport
   * Method to fetch students summary report data
   */
  fetchStudentsSummaryReport(classId, params, classFramework, isDefaultShowFW) {
    const service = this;
    const adapter = service.get('adapter');
    const serializer = service.get('serializer');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      adapter.fetchStudentsSummaryReport(classId, params).then(
        function(reportData) {
          let studentSummaryReport = serializer.normalizeStudentsSummaryReport(
            reportData
          );
          if (isDefaultShowFW) {
            let studentsSummaryData = studentSummaryReport.studentsSummaryData;
            let studentsSummaryCompetencies = [];
            studentsSummaryData.map(studentSummary => {
              let summaryData = studentSummary.summaryData;
              let studentSummaryCompetencies = [
                ...summaryData.completedCompetencies,
                ...summaryData.inferredCompetencies,
                ...summaryData.inprogressCompetencies,
                ...summaryData.masteredCompetencies,
                ...summaryData.reInforcedCompetencies
              ];
              studentsSummaryCompetencies = studentsSummaryCompetencies.concat(
                studentSummaryCompetencies
              );
            });
            if (studentsSummaryCompetencies.length) {
              service
                .getcrosswalkCompetency(
                  studentsSummaryCompetencies,
                  classFramework
                )
                .then(function() {
                  resolve(studentSummaryReport);
                });
            } else {
              resolve(studentSummaryReport);
            }
          } else {
            resolve(studentSummaryReport);
          }
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  /**
   * @function fetchStudentsWeeklySummaryReport
   * Method to fetch student's weekly summary report data
   */
  fetchStudentsWeeklySummaryReport(
    classId,
    data,
    classFramework,
    isDefaultShowFW
  ) {
    const service = this;
    const adapter = service.get('adapter');
    const serializer = service.get('serializer');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      adapter.fetchStudentsWeeklySummaryReport(classId, data).then(
        function(weeklyReportData) {
          let studentSummaryReport = serializer.normalizeStudentsWeeklySummaryReport(
            weeklyReportData
          );
          if (isDefaultShowFW) {
            let studentsSummaryData = studentSummaryReport.studentsSummaryData;
            let studentsSummaryCompetencies = [];
            studentsSummaryData.map(studentSummary => {
              let summaryData = studentSummary.summaryData;
              let studentSummaryCompetencies = [
                ...summaryData.completedCompetencies,
                ...summaryData.inferredCompetencies,
                ...summaryData.inprogressCompetencies,
                ...summaryData.masteredCompetencies,
                ...summaryData.reInforcedCompetencies
              ];
              studentsSummaryCompetencies = studentsSummaryCompetencies.concat(
                studentSummaryCompetencies
              );
            });
            if (studentsSummaryCompetencies.length) {
              service
                .getcrosswalkCompetency(
                  studentsSummaryCompetencies,
                  classFramework
                )
                .then(function() {
                  resolve(studentSummaryReport);
                });
            } else {
              resolve(studentSummaryReport);
            }
          } else {
            resolve(studentSummaryReport);
          }
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  /**
   * @function fetchStudentTimespentReport
   * Method to fetch student's timespent report data
   */
  fetchStudentTimespentReport(params) {
    const service = this;
    const adapter = service.get('adapter');
    const serializer = service.get('serializer');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      adapter.fetchStudentTimespentReport(params).then(
        function(reportData) {
          resolve(serializer.normalizeStudentsTimespentReport(reportData));
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  /**
   * @function fetchStudentCompetencyReport
   * Method to fetch student's timespent report data
   */
  fetchStudentCompetencyReport(params, classFramework, isDefaultShowFW) {
    const service = this;
    const adapter = service.get('adapter');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      adapter.fetchStudentCompetencyReport(params).then(
        function(reportData) {
          let studentCompetencyReport = [
            ...reportData.diagnostic,
            ...reportData.new,
            ...reportData.reinforced
          ];
          if (isDefaultShowFW && studentCompetencyReport.length) {
            service
              .getcrosswalkCompetency(studentCompetencyReport, classFramework)
              .then(function() {
                resolve(reportData);
              });
          } else {
            resolve(reportData);
          }
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  /**
   * @function fetchStudentsTimespentSummaryreport
   * Method to fetch student's timespent report data
   */
  fetchStudentsTimespentSummaryreport(params) {
    const service = this;
    const adapter = service.get('adapter');
    const serializer = service.get('serializer');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      adapter.fetchStudentsTimespentSummaryreport(params).then(
        function(reportData) {
          resolve(
            serializer.normalizeStudentsTimespentSummaryreport(reportData)
          );
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  fetchDiagnosticSummaryData(params) {
    const service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('adapter')
        .fetchDiagnosticSummaryData(params)
        .then(
          response => {
            resolve(
              service.get('serializer').normalizeDiagnosticSummary(response)
            );
          },
          () => {
            resolve(null);
          }
        );
    });
  },

  fetchMinProficiencySummary(params) {
    const service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('adapter')
        .fetchMinProficiencySummary(params)
        .then(
          response => {
            resolve(
              service.get('serializer').normalizeMinProficiency(response)
            );
          },
          () => {
            resolve(null);
          }
        );
    });
  },

  /**
   * @function fetchStudentSelReport
   * Method to fetch students sel reports
   */
  fetchStudentSelReport(classId, params) {
    const service = this;
    const adapter = service.get('adapter');
    return new Ember.RSVP.Promise(resolve => {
      adapter.fetchStudentSelReport(classId, params).then(
        reportData => {
          resolve(reportData);
        },
        () => {
          resolve(null);
        }
      );
    });
  },

  /**
   * @function fetchLessonSummaryReport
   * Method to fetch lesson summary report
   */
  fetchLessonSummaryReport(classId, lessonId, params) {
    const service = this;
    const adapter = service.get('adapter');
    return new Ember.RSVP.Promise(resolve => {
      adapter.fetchLessonSummaryReport(classId, lessonId, params).then(
        reportData => {
          resolve(reportData);
        },
        () => {
          resolve(null);
        }
      );
    });
  },

  /**
   * @function fetchActivitySummaryReport
   * Method to fetch activity summary report
   */
  fetchActivitySummaryReport(classId, lessonId, activityType, params) {
    const service = this;
    const adapter = service.get('adapter');
    return new Ember.RSVP.Promise(resolve => {
      adapter
        .fetchActivitySummaryReport(classId, lessonId, activityType, params)
        .then(
          reportData => {
            resolve(reportData);
          },
          () => {
            resolve(null);
          }
        );
    });
  },

  /**
   * @function fetchQuizSummaryReport
   * Method to fetch quiz summary report
   */
  fetchQuizSummaryReport(classId, lessonId, activityType, params) {
    const service = this;
    const adapter = service.get('adapter');
    return new Ember.RSVP.Promise(resolve => {
      adapter
        .fetchQuizSummaryReport(classId, lessonId, activityType, params)
        .then(
          reportData => {
            resolve(reportData);
          },
          () => {
            resolve(null);
          }
        );
    });
  },

  /**
   * @function fetchFeelingSummaryReport
   * Method to fetch feeling summary report
   */
  fetchFeelingSummaryReport(classId, lessonId, activityType, params) {
    const service = this;
    const adapter = service.get('adapter');
    return new Ember.RSVP.Promise(resolve => {
      adapter
        .fetchFeelingSummaryReport(classId, lessonId, activityType, params)
        .then(
          reportData => {
            resolve(reportData);
          },
          () => {
            resolve(null);
          }
        );
    });
  },

  /**
   * @function fetchRechargeSummaryReport
   * Method to fetch recharge summary report
   */
  fetchRechargeSummaryReport(classId, lessonId, activityType, params) {
    const service = this;
    const adapter = service.get('adapter');
    return new Ember.RSVP.Promise(resolve => {
      adapter
        .fetchRechargeSummaryReport(classId, lessonId, activityType, params)
        .then(
          reportData => {
            resolve(reportData);
          },
          () => {
            resolve(null);
          }
        );
    });
  },

  /**
   * @function fetchActivityEvidenceReport
   * Method to fetch activity evidence report
   */
  fetchActivityEvidenceReport(classId, oaId) {
    const service = this;
    const adapter = service.get('adapter');
    return new Ember.RSVP.Promise(resolve => {
      adapter.fetchActivityEvidenceReport(classId, oaId).then(
        response => {
          resolve(
            service.get('serializer').normalizeActivityEvidence(response)
          );
        },
        () => {
          resolve(null);
        }
      );
    });
  },

  getcrosswalkCompetency(studentsSummaryCompetencies, classFramework) {
    let service = this;
    let taxonomyCodes = [];
    let taxonomyCode = studentsSummaryCompetencies.map(
      summaryCompetency => summaryCompetency.code
    );
    taxonomyCodes = taxonomyCodes.concat(taxonomyCode);
    return service
      .get('taxonomyAdapter')
      .crosswalkCompetency(classFramework, taxonomyCodes)
      .then(function(crosswalkResponse) {
        let frameworkCrossWalkComp = service
          .get('taxonomySerializer')
          .normalizeCrosswalkCompetency(crosswalkResponse);
        studentsSummaryCompetencies.map(summaryCompetency => {
          let taxonomyData = frameworkCrossWalkComp.findBy(
            'sourceDisplayCode',
            summaryCompetency.code
          );
          summaryCompetency.code = taxonomyData
            ? taxonomyData.targetDisplayCode
            : summaryCompetency.code;
          summaryCompetency.loCode = taxonomyData.targetLoCode;
          summaryCompetency.loName = taxonomyData.targetLoName;
        });
      });
  }
});
