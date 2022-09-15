import Ember from 'ember';
import CompetencyAdapter from 'gooru-web/adapters/competency/competency';
import CompetencySerializer from 'gooru-web/serializers/competency/competency';
/**
 * Service for the competency
 *
 * @typedef {Object} competencyService
 */
export default Ember.Service.extend({
  competencyAdapter: null,

  competencySerializer: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'competencyAdapter',
      CompetencyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'competencySerializer',
      CompetencySerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Get user competencies
   * @returns {Promise.<[]>}
   */
  getUserCompetencies: function(userId, activeDuration) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getUserCompetencies(userId, activeDuration)
        .then(function(response) {
          resolve(
            service
              .get('competencySerializer')
              .normalizeUserCompetencies(response)
          );
        }, reject);
    });
  },

  /**
   * Get user performance competency collections
   * @returns {Promise.<[]>}
   */
  getUserPerformanceCompetencyCollections: function(
    userId,
    competencyCode,
    status
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getUserPerformanceCompetencyCollections(userId, competencyCode, status)
        .then(function(response) {
          resolve(
            service
              .get('competencySerializer')
              .normalizeUserPerformanceCompetencyCollections(response)
          );
        }, reject);
    });
  },

  /**
   * Get Competency Matrix Coordinates for Subject
   * @returns {Promise.<[]>}
   */
  getCompetencyMatrixCoordinates: function(subject) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getCompetencyMatrixCoordinates(subject)
        .then(response => {
          resolve(
            service
              .get('competencySerializer')
              .normalizeCompetencyMatrixCoordinates(
                response.competencyMatrixCoordinates.value
              )
          );
        }, reject);
    });
  },

  /**
   * Get user competency Matrix for courses by subject
   * @returns {Promise.<[]>}
   */
  getCompetencyMatrixCourse: function(user, subject) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getCompetencyMatrixCourse(user, subject)
        .then(function(response) {
          resolve(
            service
              .get('competencySerializer')
              .normalizeCompetencyMatrixCourse(response)
          );
        }, reject);
    });
  },

  /**
   * Get user competency Matrix for domains by subject
   * @returns {Promise.<[]>}
   */
  getCompetencyMatrixDomain: function(user, subject, timeSeries) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getCompetencyMatrixDomain(user, subject, timeSeries)
        .then(function(response) {
          resolve(
            service
              .get('competencySerializer')
              .normalizeCompetencyMatrixDomain(response)
          );
        }, reject);
    });
  },

  /**
   * Get  competency Matrix  by subject
   * @returns {Promise.<[]>}
   */
  getCompetencyMatrix: function(user, subject) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getCompetencyMatrix(user, subject)
        .then(function(response) {
          resolve(
            service
              .get('competencySerializer')
              .normalizeCompetencyMatrix(response)
          );
        }, reject);
    });
  },
  /**
   * @function getUserSignatureContentList
   * Method to fetch user competency list of signature content
   */
  getUserSignatureCompetencies(userId, subject) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getUserSignatureCompetencies(userId, subject)
        .then(function(response) {
          resolve(
            service
              .get('competencySerializer')
              .normalizeSignatureCompetencies(response)
          );
        }, reject);
    });
  },

  /**
   * @function getUserProficiencyBaseLine
   * Method to fetch user proficiency baseline
   */
  getUserProficiencyBaseLine(classId, courseId, userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getUserProficiencyBaseLine(classId, courseId, userId)
        .then(function(response) {
          resolve(
            service
              .get('competencySerializer')
              .normalizeCompetencyMatrixDomain(response)
          );
        }, reject);
    });
  },

  /**
   * @function getDomainLevelSummary
   * Method to fetch domain level summary
   */
  getDomainLevelSummary(filters) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getDomainLevelSummary(filters)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function getDomainLevelSummary
   * Method to fetch domain level summary
   */
  fetchStudentsByCompetency(params) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .fetchStudentsByCompetency(params)
        .then(
          function(response) {
            resolve(
              service
                .get('competencySerializer')
                .normalizeCompetencyStudents(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function getDomainTopicsLevelSummary
   * Method to fetch domain topics level summary
   */
  getDomainTopicsLevelSummary(filters) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getDomainTopicsLevelSummary(filters)
        .then(
          function(response) {
            resolve(
              service
                .get('competencySerializer')
                .normalizeDomainTopicMatrix(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function getDomainsCompletionReport
   * Method to get domain completion report
   */
  getDomainsCompletionReport(requestBody) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getDomainsCompletionReport(requestBody)
        .then(
          function(response) {
            resolve(
              service
                .get('competencySerializer')
                .normalizeDomainsCompletionReport(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function getUsersCompetencyPerformanceSummary
   * Method to fetch users compeletion performance summary
   */
  getUsersCompetencyPerformanceSummary(requestBody) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getUsersCompetencyPerformanceSummary(requestBody)
        .then(
          function(response) {
            resolve(
              service
                .get('competencySerializer')
                .normalizeUsersCompetencyPerformanceSummary(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function getCompetencyCompletionStats
   * Provide Competency Completion Stats for Premium Classes"
   */
  getCompetencyCompletionStats(classIds, user) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .getCompetencyCompletionStats(classIds, user)
        .then(
          function(response) {
            resolve(
              service
                .get('competencySerializer')
                .normalizeCompetencyCompletionStats(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function fetchStudentCompetencySummary
   * Method to fetch student destination based competency summary
   */
  fetchStudentCompetencySummary(requestBody) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .fetchStudentCompetencySummary(requestBody)
        .then(
          function(response) {
            resolve(
              service
                .get('competencySerializer')
                .normalizeStudentCompetencySummary(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  fetchStudentDomainTopicCompetency(
    user,
    subject,
    timeLine,
    classId,
    framework
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .fetchStudentDomainTopicCompetency(
          user,
          subject,
          timeLine,
          classId,
          framework
        )
        .then(
          function(response) {
            resolve(
              service
                .get('competencySerializer')
                .serializeDomainTopicCompetency(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  fetchDomainTopicMetadata(dataParam) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .fetchDomainTopicMetadata(dataParam)
        .then(
          function(response) {
            resolve(
              service
                .get('competencySerializer')
                .serializeDomainTopicMetadata(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  fetchClassCompetencyReport(classId, framework) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .fetchClassCompetencyReport(classId, framework)
        .then(
          function(response) {
            resolve(
              service
                .get('competencySerializer')
                .serializeClassCompetencyReport(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  fetchCompetency(params) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .fetchCompetency(params)
        .then(
          function(response) {
            resolve(
              service.get('competencySerializer').normalizeCompetency(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  fetchLJCompetency(params) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('competencyAdapter')
        .fetchLJCompetency(params)
        .then(
          function(response) {
            resolve(
              service
                .get('competencySerializer')
                .normalizeLJCompetency(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  }
});
