import Ember from 'ember';
import DashboardAdapter from 'gooru-web/adapters/dashboard/dashboard';
import DashboardSerializer from 'gooru-web/serializers/dashboard/dashboard';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';

export default Ember.Service.extend({
  dashboardAdapter: null,

  dashboardSerializer: null,

  init() {
    this._super(...arguments);
    this.set(
      'dashboardAdapter',
      DashboardAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'dashboardSerializer',
      DashboardSerializer.create(Ember.getOwner(this).ownerInjection())
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

  fetchDashboardPerformance(params) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .fetchDashboardPerformance(params)
        .then(
          response => {
            resolve(
              service
                .get('dashboardSerializer')
                .normalizePerformanceStats(response)
            );
          },
          () => {
            resolve({});
          }
        );
    });
  },

  fetchLessonStats(params) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .fetchLessonStats(params)
        .then(
          response => {
            resolve(
              service.get('dashboardSerializer').normalizeLessonStats(response)
            );
          },
          () => {
            resolve({});
          }
        );
    });
  },

  fetchSuggestionStats(params) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .fetchSuggestionStats(params)
        .then(
          response => {
            resolve(
              service
                .get('dashboardSerializer')
                .normalizeSuggestionStats(response)
            );
          },
          () => {
            resolve({});
          }
        );
    });
  },

  fetchStreakStats(params) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .fetchStreakStats(params)
        .then(
          response => {
            resolve(
              service.get('dashboardSerializer').normalizeStreakStats(response)
            );
          },
          () => {
            resolve({});
          }
        );
    });
  },

  fetchMasteredStats(params) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .fetchMasteredStats(params)
        .then(
          response => {
            resolve(
              service
                .get('dashboardSerializer')
                .normalizeMasteredStats(response)
            );
          },
          () => {
            resolve({});
          }
        );
    });
  },

  fetchMilestoneStats(params, classFramework, isDefaultShowFW) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .fetchMilestoneStats(params)
        .then(
          response => {
            let milestones = service
              .get('dashboardSerializer')
              .normalizeMilestoneStats(response);
            if (isDefaultShowFW) {
              let taxonomyCodes = [];
              milestones.map(milestone => {
                let taxonomyCode = milestone.students.map(
                  student => student.highestCompetency
                );
                taxonomyCodes = taxonomyCodes.concat(taxonomyCode);
              });
              if (taxonomyCodes.length) {
                service
                  .get('taxonomyAdapter')
                  .crosswalkCompetency(classFramework, taxonomyCodes)
                  .then(function(crosswalkResponse) {
                    let frameworkCrossWalkComp = service
                      .get('taxonomySerializer')
                      .normalizeCrosswalkCompetency(crosswalkResponse);
                    milestones.map(milestone => {
                      milestone.students.map(student => {
                        let taxonomyData = frameworkCrossWalkComp.findBy(
                          'sourceDisplayCode',
                          student.highestCompetency
                        );
                        student.highestCompetency = taxonomyData
                          ? taxonomyData.targetDisplayCode
                          : student.highestCompetency;
                      });
                    });
                    resolve(milestones);
                  });
              } else {
                resolve(milestones);
              }
            } else {
              resolve(milestones);
            }
          },
          () => {
            resolve(
              service.get('dashboardSerializer').normalizeMilestoneStats({})
            );
          }
        );
    });
  },

  fetchDiagnasticStats(params, classFramework = null) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .fetchDiagnasticStats(params)
        .then(
          response => {
            let diagnasticStarts = service
              .get('dashboardSerializer')
              .normalizeDiagnasticStats(response);
            let taxonomyCodes = [];
            diagnasticStarts.map(diagnasticStart => {
              let taxonomyCode = diagnasticStart.students.map(
                student => student.startingCompetency
              );
              taxonomyCodes = taxonomyCodes.concat(taxonomyCode);
            });
            if (classFramework && taxonomyCodes.length) {
              service
                .getcrosswalkCompetency(
                  diagnasticStarts,
                  classFramework,
                  taxonomyCodes
                )
                .then(function() {
                  resolve(diagnasticStarts);
                });
            } else {
              resolve(diagnasticStarts);
            }
          },
          () => {
            resolve(
              service.get('dashboardSerializer').normalizeDiagnasticStats({})
            );
          }
        );
    });
  },

  fetchRemindersList(params) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .fetchRemindersList(params)
        .then(
          response => {
            resolve(
              service.get('dashboardSerializer').normalizeReminders(response)
            );
          },
          () => {
            resolve(service.get('dashboardSerializer').normalizeReminders({}));
          }
        );
    });
  },
  fetchAssessment(classId, classFramework = null) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .fetchAssessment(classId)
        .then(response => {
          let taxonomyCodes = Ember.A();
          const assessmentList = service
            .get('dashboardSerializer')
            .normalizeFetchAssessment(response);
          assessmentList.forEach(assessment => {
            if (assessment.questions) {
              assessment.questions.forEach(question => {
                if (question.competency) {
                  taxonomyCodes.push(question.competency.code);
                }
              });
            }
          });
          taxonomyCodes = taxonomyCodes.uniq();
          if (classFramework && taxonomyCodes.length) {
            service
              .get('taxonomyAdapter')
              .crosswalkCompetency(classFramework, taxonomyCodes)
              .then(function(crosswalkResponse) {
                let frameworkCrossWalkComp = service
                  .get('taxonomySerializer')
                  .normalizeCrosswalkCompetency(crosswalkResponse);
                assessmentList.forEach(assessment => {
                  if (assessment.questions) {
                    assessment.questions.forEach(question => {
                      if (question.competency) {
                        const taxonomyData = frameworkCrossWalkComp.findBy(
                          'sourceDisplayCode',
                          question.competency.code
                        );
                        if (taxonomyData) {
                          question.loCode = taxonomyData.targetLoCode;
                          question.loName = taxonomyData.targetLoName;
                        }
                      }
                    });
                  }
                });
                resolve(assessmentList);
              });
          }
          resolve(assessmentList);
        });
    });
  },
  getDiagnosticAssessment(params, classFramework, isDefaultShowFW) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .getDiagnosticAssessment(params)
        .then(response => {
          if (isDefaultShowFW && Ember.isArray(response.domains)) {
            let taxonomyCodes = [];
            response.domains.map(domain => {
              let taxonomyCode = domain.competencies.map(
                competency => competency.code
              );
              taxonomyCodes = taxonomyCodes.concat(taxonomyCode);
            });
            if (taxonomyCodes.length) {
              service
                .get('taxonomyAdapter')
                .crosswalkCompetency(classFramework, taxonomyCodes)
                .then(function(crosswalkResponse) {
                  let frameworkCrossWalkComp = service
                    .get('taxonomySerializer')
                    .normalizeCrosswalkCompetency(crosswalkResponse);
                  response.domains.map(domain => {
                    domain.competencies.map(competency => {
                      let taxonomyData = frameworkCrossWalkComp.findBy(
                        'sourceDisplayCode',
                        competency.code
                      );
                      competency.code = taxonomyData
                        ? taxonomyData.targetDisplayCode
                        : competency.code;
                      if (taxonomyData) {
                        competency.loCode = taxonomyData.targetLoCode;
                        competency.loName = taxonomyData.targetLoName;
                      }
                    });
                  });
                  resolve(response);
                });
            } else {
              resolve(response);
            }
          } else {
            resolve(response);
          }
        });
    });
  },
  getAllDomain(classId) {
    let service = this;
    return new Ember.RSVP.Promise(resolve => {
      service
        .get('dashboardAdapter')
        .getAllDomain(classId)
        .then(response => {
          resolve(response);
        });
    });
  },

  getcrosswalkCompetency: function(
    diagnasticResponse,
    classFramework,
    taxonomyCodes
  ) {
    const service = this;
    return service
      .get('taxonomyAdapter')
      .crosswalkCompetency(classFramework, taxonomyCodes)
      .then(function(crosswalkResponse) {
        let frameworkCrossWalkComp = service
          .get('taxonomySerializer')
          .normalizeCrosswalkCompetency(crosswalkResponse);
        diagnasticResponse.map(data => {
          let students = data.students;
          students.map(student => {
            let taxonomyData = frameworkCrossWalkComp.findBy(
              'sourceDisplayCode',
              student.startingCompetency
            );
            student.startingCompetency = taxonomyData
              ? taxonomyData.targetDisplayCode
              : student.startingCompetency;
            if (taxonomyData) {
              student.loCode = taxonomyData.targetLoCode;
              student.loName = taxonomyData.targetLoName;
            }
          });
        });
      });
  }
});
