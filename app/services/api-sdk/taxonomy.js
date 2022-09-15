import Ember from 'ember';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
/**
 * API-SDK Service for the Taxonomies back-end endpoints
 *
 * @typedef {Object} APITaxonomyService
 */
export default Ember.Service.extend({
  taxonomySerializer: null,

  taxonomyAdapter: null,

  init() {
    this._super(...arguments);
    this.set(
      'taxonomySerializer',
      TaxonomySerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'taxonomyAdapter',
      TaxonomyAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Fetches the Taxonomy Subjects
   *
   * @param category - The classification type
   * @returns {Promise}
   */
  fetchSubjects: function(category, filter = {}) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchSubjects(category, filter)
        .then(
          function(response) {
            resolve(
              service.get('taxonomySerializer').normalizeFetchSubjects(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Fetches the Taxonomy Subjects from DS
   *
   * @param category - The classification type
   * @returns {Promise}
   */
  fetchTaxonomySubjects(taxonomyCategory) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchTaxonomySubjects(taxonomyCategory)
        .then(
          function(response) {
            resolve(
              service
                .get('taxonomySerializer')
                .normalizeTaxonomySubjects(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Fetches the Taxonomy Subjects by user id
   *
   * @param taxonomyCategory
   * @returns {Promise}
   */
  getTaxonomySubjectsByUserId(taxonomyCategory) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .getTaxonomySubjectsByUserId(taxonomyCategory)
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

  fetchCrossWalkFWC(frameworkCode, subjectCode) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('taxonomyAdapter')
        .fetchCrossWalkFWC(frameworkCode, subjectCode)
        .then(function(response) {
          resolve(
            service.get('taxonomySerializer').normalizeFWCMatrixs(response)
          );
        })
        .catch(function() {
          Ember.Logger.error(
            `${subjectCode} is doesn't exists in this ${frameworkCode}`
          );
          resolve([]);
        });
    });
  },

  /**
   * Fetches the Taxonomy Courses
   *
   * @param frameworkId - the framework ID
   * @param subjectId - the taxonomy subject ID
   * @returns {Promise}
   */
  fetchCourses: function(frameworkId, subjectId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchCourses(frameworkId, subjectId)
        .then(
          function(response) {
            resolve(
              service.get('taxonomySerializer').normalizeFetchCourses(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Fetches the Taxonomy Domains
   *
   * @param frameworkId - the framework ID
   * @param subjectId - the taxonomy subject ID
   * @param courseId - the taxonomy course ID
   * @returns {Promise}
   */
  fetchDomains: function(frameworkId, subjectId, courseId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchDomains(frameworkId, subjectId, courseId)
        .then(
          function(response) {
            resolve(
              service.get('taxonomySerializer').normalizeFetchDomains(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Fetches the Taxonomy Codes
   *
   * @param frameworkId - the framework ID
   * @param subjectId - the taxonomy subject ID
   * @param courseId - the taxonomy course ID
   * @param domainId - the taxonomy domain ID
   * @returns {Promise}
   */
  fetchCodes: function(frameworkId, subjectId, courseId, domainId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchCodes(frameworkId, subjectId, courseId, domainId)
        .then(
          function(response) {
            resolve(
              service.get('taxonomySerializer').normalizeFetchCodes(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Fetches the Taxonomy Codes by IDs
   *
   * @param codesIds - the list of codes IDs
   * @returns {Promise}
   */
  fetchCodesByIds: function(codesIds) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchCodesByIds(codesIds)
        .then(
          function(response) {
            resolve(
              service.get('taxonomySerializer').normalizeFetchCodes(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function fetchDomainGradeBoundaryBySubjectId
   */
  fetchDomainGradeBoundaryBySubjectId(gradeId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchDomainGradeBoundaryBySubjectId(gradeId)
        .then(
          function(response) {
            resolve(
              service
                .get('taxonomySerializer')
                .normalizeDomainGradeBoundary(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function fetchGradesBySubject
   */
  fetchGradesBySubject(filters) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchGradesBySubject(filters)
        .then(
          function(response) {
            resolve(
              service.get('taxonomySerializer').normalizeGrades(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },
  /**
   * Fetches the Taxonomy Subjects
   *
   * @param category - The classification type
   * @returns {Promise}
   */
  fetchSubject: function(category) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchSubject(category)
        .then(
          function(response) {
            resolve(
              service.get('taxonomySerializer').normalizeFetchSubject(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },
  /**
   * Fetches the Taxonomy Subjects
   *
   * @param category - The classification type
   * @returns {Promise}
   */
  fetchSubjectFWKs: function(category) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchSubjectFWKs(category)
        .then(
          function(response) {
            resolve(
              service
                .get('taxonomySerializer')
                .normalizeFetchSubjectFrameworks(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  fetchCategories: function() {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('taxonomyAdapter')
        .fetchCategories()
        .then(function(response) {
          resolve(
            service.get('taxonomySerializer').normalizeFetchCategories(response)
          );
        });
    });
  },

  /**
   *
   * @param prerequisites gut code
   * @returns {Promise.<Question[]>}
   */
  fetchPrerequisites: function(prerequisites) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchPrerequisites(prerequisites)
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
   * Fetches competency gutCode
   *
   * @param competencyCode - The competency code
   * @param framework - class framework
   * @returns {Promise}
   */
  fetchCrosswalkCompetency: function(competencyCode, classFramework) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .crosswalkCompetency(classFramework, competencyCode)
        .then(
          function(response) {
            resolve(
              service
                .get('taxonomySerializer')
                .normalizeCrosswalkCompetency(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Fetches the Taxonomy Codes
   *
   * @param frameworkId - the framework ID
   * @param subjectId - the taxonomy subject ID
   * @param courseId - the taxonomy course ID
   * @param domainId - the taxonomy domain ID
   * @returns {Promise}
   */
  fetchCompetencyCodes: function(frameworkId, competncyId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('taxonomyAdapter')
        .fetchCompetencyCodes(frameworkId, competncyId)
        .then(
          function(response) {
            resolve(
              service.get('taxonomySerializer').normalizeFetchCodes(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  }
});
