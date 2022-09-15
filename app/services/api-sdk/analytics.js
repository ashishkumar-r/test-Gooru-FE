import Ember from 'ember';
import PeerAdapter from 'gooru-web/adapters/analytics/peer';
import PeerSerializer from 'gooru-web/serializers/analytics/peer';
import CurrentLocationAdapter from 'gooru-web/adapters/analytics/current-location';
import CurrentLocationSerializer from 'gooru-web/serializers/analytics/current-location';
import StudentCollectionPerformanceSerializer from 'gooru-web/serializers/performance/student-collection-performance';

export default Ember.Service.extend({
  peerAdapter: null,

  peerSerializer: null,

  currentLocationAdapter: null,

  currentLocationSerializer: null,

  courseService: Ember.inject.service('api-sdk/course'),

  unitService: Ember.inject.service('api-sdk/unit'),

  lessonService: Ember.inject.service('api-sdk/lesson'),

  collectionService: Ember.inject.service('api-sdk/collection'),

  assessmentService: Ember.inject.service('api-sdk/assessment'),

  init: function() {
    this._super(...arguments);
    this.set(
      'peerAdapter',
      PeerAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'peerSerializer',
      PeerSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'currentLocationAdapter',
      CurrentLocationAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'currentLocationSerializer',
      CurrentLocationSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'studentCollectionPerformanceSerializer',
      StudentCollectionPerformanceSerializer.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
  },

  getCoursePeers: function(classId, courseId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('peerAdapter')
        .getCoursePeers(classId, courseId)
        .then(
          function(response) {
            resolve(service.get('peerSerializer').normalizePeers(response));
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  getUnitPeers: function(classId, courseId, unitId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('peerAdapter')
        .getUnitPeers(classId, courseId, unitId)
        .then(
          function(response) {
            resolve(service.get('peerSerializer').normalizePeers(response));
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  getLessonPeers: function(classId, courseId, unitId, lessonId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('peerAdapter')
        .getLessonPeers(classId, courseId, unitId, lessonId)
        .then(
          function(response) {
            resolve(service.get('peerSerializer').normalizePeers(response));
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  findResourcesByCollection: function(
    classId,
    courseId,
    unitId,
    lessonId,
    collectionId,
    collectionType
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .queryRecord({
          classId: classId,
          courseId: courseId,
          unitId: unitId,
          lessonId: lessonId,
          collectionId: collectionId,
          collectionType: collectionType
        })
        .then(
          function(events) {
            resolve(
              service.get('analyticsSerializer').normalizeResponse(events)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },
  findResourcesByCollectionforDCA: function(
    sessionId,
    collectionId,
    classId,
    userId,
    collectionType,
    dateVal,
    pathId,
    startDate,
    endDate
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .queryRecordForDCA({
          sessionId: sessionId,
          collectionId: collectionId,
          classId: classId,
          userId: userId,
          date: dateVal,
          collectionType: collectionType,
          pathId: pathId,
          startDate: startDate,
          endDate: endDate
        })
        .then(
          function(payload) {
            const assessmentResult = service
              .get('studentCollectionPerformanceSerializer')
              .normalizeStudentCollection(payload);
            resolve(assessmentResult);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Loads the current location for a student within several classes
   * @param {string[]} {classIds, course, fwCode? }
   * @param {string} userId
   * @param {boolean} fetchAll when true load dependencies for current location
   * @returns {Ember.RSVP.Promise.<CurrentLocation>}
   */
  getUserCurrentLocationByClassIds: function(
    classCourseIdsFwCode,
    userId,
    fetchAll = false
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (classCourseIdsFwCode && classCourseIdsFwCode.length) {
        service
          .get('currentLocationAdapter')
          .getUserCurrentLocationByClassIds(classCourseIdsFwCode, userId)
          .then(function(response) {
            const currentLocations = service
              .get('currentLocationSerializer')
              .normalizeForGetUserClassesLocation(response);
            if (fetchAll) {
              const promises = currentLocations.map(function(currentLocation) {
                return service.loadCurrentLocationData(currentLocation);
              });
              Ember.RSVP.all(promises).then(function() {
                resolve(currentLocations);
              }, reject);
            } else {
              resolve(currentLocations);
            }
          }, reject);
      } else {
        resolve([]);
      }
    });
  },

  /**
   * Loads the current location for a student within a class
   * @param {string} classId
   * @param {string} userId
   * @param {boolean} fetchAll when true load dependencies for current location
   * @returns {Ember.RSVP.Promise.<CurrentLocation>}
   */
  getUserCurrentLocation: function(
    classId,
    userId,
    queryParams,
    fetchAll = false
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('currentLocationAdapter')
        .getUserCurrentLocation(classId, userId, queryParams)
        .then(function(response) {
          const currentLocation = service
            .get('currentLocationSerializer')
            .normalizeForGetUserCurrentLocation(response);

          if (fetchAll && currentLocation) {
            service.loadCurrentLocationData(currentLocation).then(function() {
              resolve(currentLocation);
            }, reject);
          } else {
            resolve(currentLocation);
          }
        }, reject);
    });
  },

  /**
   * Loads the dependencies data for a current location
   * @param {CurrentLocation} currentLocation
   * @returns {Ember.RSVP.Promise.<CurrentLocation>}
   */
  loadCurrentLocationData: function(currentLocation) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      const courseId = currentLocation.get('courseId');
      const unitId = currentLocation.get('unitId');
      const lessonId = currentLocation.get('lessonId');
      const collectionId = currentLocation.get('collectionId');
      const collectionType = currentLocation.get('collectionType');

      let collection = undefined;
      if (collectionId) {
        if (collectionType === 'collection') {
          collection = service
            .get('collectionService')
            .readCollection(collectionId);
        } else {
          collection = service
            .get('assessmentService')
            .readAssessment(collectionId);
        }
      }
      Ember.RSVP.hash({
        course: courseId
          ? service.get('courseService').fetchByIdWithOutProfile(courseId)
          : undefined,
        unit: unitId
          ? service.get('unitService').fetchById(courseId, unitId)
          : undefined,
        lesson: lessonId
          ? service.get('lessonService').fetchById(courseId, unitId, lessonId)
          : undefined,
        collection: collection
      }).then(
        function(hash) {
          currentLocation.set('course', hash.course);
          currentLocation.set('unit', hash.unit);
          currentLocation.set('lesson', hash.lesson);
          currentLocation.set('collection', hash.collection);
          resolve(currentLocation);
        },
        function(error) {
          //handling server errors
          const status = error.status;
          if (status === 404) {
            resolve();
          } else {
            reject(error);
          }
        }
      );
    });
  },

  /**
   * Update score of questions in an Assessment/Collection
   * @param {string} RawData of questions score update for assessment or collection.
   * @returns {Promise.<boolean>}
   */
  updateQuestionScore: function(data) {
    var service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .updateQuestionScore(data)
        .then(function() {
          return resolve(true);
        }, reject);
    });
  },

  /**
   * @function getAtcPerformanceSummary
   * Method to fetch performance summary of a class for ATC view
   */
  getAtcPerformanceSummary(classId, courseId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .getAtcPerformanceSummary(classId, courseId)
        .then(function(classSummary) {
          resolve(
            service
              .get('analyticsSerializer')
              .normalizeAtcPerformanceSummary(classSummary)
          );
        }, reject);
    });
  },

  /**
   * @function getAtcPerformanceSummaryPremiumClass
   * Method to fetch performance summary of a premium class for ATC view
   */
  getAtcPerformanceSummaryPremiumClass(classId, subjectCode, filters) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .getAtcPerformanceSummaryPremiumClass(classId, subjectCode, filters)
        .then(function(classSummary) {
          resolve(
            service
              .get('analyticsSerializer')
              .normalizeAtcPerformanceSummaryPremiumClass(classSummary)
          );
        }, reject);
    });
  },

  /**
   * @function getInitialSkyline
   * Method to fetch initial skyline for ATC view
   */
  getInitialSkyline(classId, subjectCode, filters, fwCode) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .getInitialSkyline(classId, subjectCode, filters, fwCode)
        .then(function(summary) {
          resolve(
            service
              .get('analyticsSerializer')
              .normalizeAtcPerformanceSummaryPremiumClass(summary)
          );
        }, reject);
    });
  },

  studentSelfReporting(dataParams) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .studentSelfReporting(dataParams)
        .then(function(selfReportStatus) {
          resolve(selfReportStatus);
        }, reject);
    });
  },

  /**
   * This Method used to fetch DCA performance
   * @param  {ClassId} classId  Unique Id of the class
   */
  getDCASummaryPerformance(classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .getDCASummaryPerformance(classId)
        .then(
          function(events) {
            resolve(
              service
                .get('analyticsSerializer')
                .normalizeDCAPerformanceSummary(events)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * This Method used to fetch DCA yearly summary for offline class
   * @param  {ClassId} classId  Unique Id of the class
   */
  getDCAYearlySummary(classId, userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .getDCAYearlySummary(classId, userId)
        .then(
          function(events) {
            resolve(
              service
                .get('analyticsSerializer')
                .normalizeDCAYearlySummary(events)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * This Method used to fetch DCA collection/assesssment performance details for the specfic date.
   * @param  {ClassId} classId        Unique Id of the class
   * @param  {CollectionId} collectionId   Unique Id of the collection.
   * @param  {CollectionType} collectionType Type of the collection, it should be collection/assessment.
   * @param  {SessionId} sessionId           sessionId of the activity
   * @param  {UserId} userId
   */
  getDCAPerformanceBySessionId(
    userId,
    classId,
    collectionId,
    collectionType,
    sessionId
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .getDCAPerformanceBySessionId(
          userId,
          classId,
          collectionId,
          collectionType,
          sessionId
        )
        .then(
          function(events) {
            resolve(
              service
                .get('studentCollectionPerformanceSerializer')
                .normalizeStudentCollection(events)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * This Method used to fetch DCA collection/assesssment performance details for the specfic date.
   * @param  {ClassId} classId        Unique Id of the class
   * @param  {CollectionId} collectionId   Unique Id of the collection.
   * @param  {CollectionType} collectionType Type of the collection, it should be collection/assessment.
   * @param  {String} date           Date format should YYYY-MM-DD
   */
  getDCAPerformance(classId, collectionId, collectionType, date, endDate) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .getDCAPerformance(classId, collectionId, collectionType, date, endDate)
        .then(
          function(events) {
            resolve(
              service.get('analyticsSerializer').normalizeResponse(events)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  getGradeCompetencyCount(params) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .getGradeCompetencyCount(params)
        .then(
          function(gradeCompetencyCount) {
            resolve(
              service
                .get('analyticsSerializer')
                .normalizeGradeCompetencyCount(gradeCompetencyCount)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  findLikertResources: function(
    classId,
    courseId,
    unitId,
    lessonId,
    collectionId,
    collectionType,
    selectedQuestionId
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('analyticsAdapter')
        .queryLikertRecord({
          classId: classId,
          courseId: courseId,
          unitId: unitId,
          lessonId: lessonId,
          collectionId: collectionId,
          collectionType: collectionType,
          selectedQuestionId: selectedQuestionId
        })
        .then(
          function(events) {
            resolve(
              service.get('analyticsSerializer').normalizeLikertResponse(events)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  }
});
