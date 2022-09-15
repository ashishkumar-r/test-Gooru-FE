import Ember from 'ember';
import ClassActivityAdapter from 'gooru-web/adapters/content/class-activity';
import ClassActivitySerializer from 'gooru-web/serializers/content/class-activity';
import TaxonomyAdapter from 'gooru-web/adapters/taxonomy/taxonomy';
import TaxonomySerializer from 'gooru-web/serializers/taxonomy/taxonomy';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import { getTaxonomyIdsBySearchContent } from 'gooru-web/utils/utils';
/**
 * @typedef {Object} ClassActivityService
 */
export default Ember.Service.extend({
  /**
   * @property {PerformanceService} performanceService
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @property {ClassActivityAdapter} classActivityAdapter
   */
  classActivityAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'classActivitySerializer',
      ClassActivitySerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'classActivityAdapter',
      ClassActivityAdapter.create(Ember.getOwner(this).ownerInjection())
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

  /**
   * Adds a new content to class
   *
   * @param {string} classId
   * @param {string} contentId
   * @param {string} contentType
   * @param {Date} addedDate
   * @param {Month} month optional, default is current month
   * @param {Year} year optional, default is current year
   * @returns {boolean}
   */
  addActivityToClass: function(
    classId,
    contentId,
    contentType,
    addedDate,
    forMonth = moment().format('MM'),
    forYear = moment().format('YYYY'),
    endDate
  ) {
    const service = this;
    if (addedDate != null) {
      forMonth = moment(addedDate).format('MM');
      forYear = moment(addedDate).format('YYYY');
    }
    let end_date = endDate ? endDate : addedDate;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .addActivityToClass(
          classId,
          contentId,
          contentType,
          addedDate,
          forMonth,
          forYear,
          end_date
        )
        .then(function(responseData, textStatus, request) {
          let newContentId = parseInt(request.getResponseHeader('location'));
          resolve(newContentId);
        }, reject);
    });
  },

  /**
   * Adds a new content to class
   *
   * @param {string} classId
   * @param {string} contentId
   * @param {Date} addedDate
   * @param {Date} endDate
   * @returns {boolean}
   */
  scheduleClassActivity: function(classId, contentId, addedDate, endDate) {
    const service = this;
    let end_date = endDate ? endDate : addedDate;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .scheduleClassActivity(classId, contentId, addedDate, end_date)
        .then(resolve, reject);
    });
  },

  /**
   * Enables the class content
   *
   * @param {string} classId
   * @param {string} classActivityId
   * @param {Date} activationDate
   * @returns {boolean}
   */
  enableClassActivity: function(
    classId,
    classActivityId,
    activationDate = new Date(),
    enable = true
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .enableClassActivity(classId, classActivityId, activationDate, enable)
        .then(function() {
          resolve(true);
        }, reject);
    });
  },

  /**
   * Gets all class activity for the authorized user (student|teacher)
   *
   * @param {string} classId
   * @param {string} contentType collection|assessment|resource|question
   * @param {Month} month optional, default is current month
   * @param {Year} year optional, default is current year
   * @returns {Promise}
   */
  findClassActivities: function(
    classId,
    contentType = undefined,
    forMonth = moment().format('MM'),
    forYear = moment().format('YYYY')
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .findClassActivities(classId, contentType, forMonth, forYear)
        .then(function(payload) {
          const classActivities = service
            .get('classActivitySerializer')
            .normalizeFindClassActivities(payload);
          const startDate = moment(`${forYear}-${forMonth}-01`).format(
            'YYYY-MM-DD'
          );
          const endDate = moment(startDate)
            .endOf('month')
            .format('YYYY-MM-DD');
          service
            .findClassActivitiesPerformanceSummary(
              classId,
              classActivities,
              startDate,
              endDate
            )
            .then(resolve, reject);
        });
    });
  },

  /**
   * Gets all class activity for the authorized user (student|teacher)
   *
   * @param {string} classId
   * @param {string} contentType collection|assessment|resource|question
   * @param {Month} month optional, default is current month
   * @param {Year} year optional, default is current year
   * @returns {Promise}
   */
  getUnScheduledActivities(classId, forMonth, forYear) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getUnScheduledActivities(classId, forMonth, forYear)
        .then(
          function(payload) {
            const classActivities = service
              .get('classActivitySerializer')
              .normalizeFindClassActivities(payload);
            resolve(classActivities);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets all class scheduled activity for the authorized user (student|teacher)
   *
   * @param {string} classId
   * @param {startDate} date optional, default is current date
   * @param {endDate} date optional, default is current date
   * @returns {Promise}
   */
  getScheduledClassActivitiesForMonth(
    classId,
    startDate = moment().format('YYYY-MM-DD'),
    endDate
  ) {
    const service = this;
    let end_date = endDate ? endDate : startDate;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getScheduledActivities(classId, startDate, end_date)
        .then(
          function(payload) {
            const classActivities = service
              .get('classActivitySerializer')
              .normalizeFindClassActivities(payload);
            resolve(classActivities);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets all class scheduled activity performance for specific dates (teacher)
   *
   * @param {string} classId
   * @param {startDate} date optional, default is current date
   * @param {endDate} date optional, default is current date
   * @returns {Promise}
   */
  getPerformanceOfClassActivitiesForMonth(
    classId,
    startDate = moment().format('YYYY-MM-DD'),
    endDate
  ) {
    const service = this;
    let end_date = endDate ? endDate : startDate;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getScheduledActivities(classId, startDate, end_date)
        .then(
          function(payload) {
            const classActivities = service
              .get('classActivitySerializer')
              .normalizeFindClassActivities(payload);
            service
              .findClassActivitiesPerformanceSummary(
                classId,
                classActivities,
                startDate,
                endDate
              )
              .then(resolve, reject);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets all class scheduled activity for the authorized user (student|teacher)
   *
   * @param {string} classId
   * @param {startDate} date optional, default is current date
   * @param {endDate} date optional, default is current date
   * @returns {Promise}
   */
  getScheduledClassActivitiesForDate(
    classId,
    startDate = moment().format('YYYY-MM-DD'),
    endDate
  ) {
    const service = this;
    let end_date = endDate ? endDate : startDate;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getScheduledActivities(classId, startDate, end_date)
        .then(
          function(payload) {
            const classActivities = service
              .get('classActivitySerializer')
              .normalizeFindClassActivities(payload);
            service
              .findClassActivitiesPerformanceSummary(
                classId,
                classActivities,
                startDate,
                end_date
              )
              .then(resolve, reject);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets all class scheduled activity for the authorized user (student|teacher)
   *
   * @param {string} classId
   * @param {Month} month optional, default is current month
   * @param {Year} year optional, default is current year
   * @returns {Promise}
   */
  getStudentScheduledActivities(
    userId,
    classId,
    startDate = moment().format('YYYY-MM-DD'),
    endDate
  ) {
    const service = this;
    let end_date = endDate ? endDate : startDate;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getScheduledActivities(classId, startDate, end_date)
        .then(
          function(payload) {
            const classActivities = service
              .get('classActivitySerializer')
              .normalizeFindClassActivities(payload);
            service
              .findStudentActivitiesPerformanceSummary(
                userId,
                classId,
                classActivities,
                startDate,
                end_date
              )
              .then(resolve, reject);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets all Active offline activities for the class (student|teacher)
   *
   * @param {string} classId
   * @returns {Promise}
   */
  fetchActiveOfflineActivities(classId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .fetchActiveOfflineActivities(classId)
        .then(
          function(payload) {
            const classActivities = service
              .get('classActivitySerializer')
              .normalizeFindClassActivities(payload);
            resolve(classActivities);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets all Completed offline activities for the class (student|teacher)
   *
   * @param {string} classId
   * @returns {Promise}
   */
  fetchCompletedOfflineActivities(classId, userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .fetchCompletedOfflineActivities(classId)
        .then(
          function(payload) {
            const classActivities = service
              .get('classActivitySerializer')
              .normalizeFindClassActivities(payload);
            service
              .findStudentOfflineActivitiesPerformanceSummary(
                classId,
                classActivities,
                userId
              )
              .then(resolve, reject);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Make offline activity as completed
   *
   * @param {string} classId
   * @param {string} contentId
   * @returns {Promise}
   */
  completeOfflineActivity(classId, contentId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .completeOfflineActivity(classId, contentId)
        .then(
          function(payload) {
            resolve(payload);
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets all class activity for the authorized user (student|teacher)
   *
   * @param {string} userId
   * @param {string} classId
   * @param {string} contentType collection|assessment|resource|question
   * @param {Month} month optional, default is current month
   * @param {Year} year optional, default is current year
   * @returns {Promise.<ClassActivity[]>}
   */
  findStudentClassActivities: function(
    userId,
    classId,
    contentType = undefined,
    forMonth = moment().format('MM'),
    forYear = moment().format('YYYY')
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .findClassActivities(classId, contentType, forMonth, forYear)
        .then(function(payload) {
          const classActivities = service
            .get('classActivitySerializer')
            .normalizeFindClassActivities(payload);
          const startDate = moment(`${forYear}-${forMonth}-01`).format(
            'YYYY-MM-DD'
          );
          const endDate = moment(startDate)
            .endOf('month')
            .format('YYYY-MM-DD');
          service
            .findStudentActivitiesPerformanceSummary(
              userId,
              classId,
              classActivities,
              startDate,
              endDate
            )
            .then(resolve, reject);
        });
    });
  },

  /**
   * Gets all performance of offline class activity for the authorized user (student|teacher)
   * @param {string} userId
   * @param {string} classId
   * @param {ClassActivity[]} classActivities
   * @returns {Promise.<ClassActivity[]>}
   */
  findStudentOfflineActivitiesPerformanceSummary: function(
    classId,
    classActivities,
    userId
  ) {
    const service = this;
    const performanceService = service.get('performanceService');
    let oaIds = classActivities.mapBy('id');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      if (oaIds.length) {
        performanceService
          .findOfflineClassActivityPerformanceSummaryByIds(
            classId,
            oaIds,
            userId
          )
          .then(function(performances) {
            performances.forEach(performance => {
              let classActivity = classActivities
                .filterBy('id', performance.get('dcaContentId'))
                .objectAt(0);

              if (classActivity) {
                let performanceData = performance.get(
                  'collectionPerformanceSummary'
                );
                performanceData.set(
                  'playedDate',
                  performance.get('activation_date')
                );
                classActivity.set('collection.performance', performanceData);
              }
            });
          }, reject);
      }
      resolve(classActivities);
    });
  },

  /**
   * Gets all class activity for the authorized user (student|teacher)
   * @param {string} userId
   * @param {string} classId
   * @param {ClassActivity[]} classActivities
   * @param {Date} startDate optional start date, default is now
   * @param {Date} endDate optional end date, default is now
   * @returns {Promise.<ClassActivity[]>}
   */
  findStudentActivitiesPerformanceSummary: function(
    userId,
    classId,
    classActivities,
    startDate = new Date(),
    endDate = new Date()
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let assessmentIds = classActivities
        .filterBy('collection.isAssessment')
        .mapBy('collection.id');
      let collectionIds = classActivities
        .filterBy('collection.isCollection')
        .mapBy('collection.id');
      let externalCollectionIds = classActivities
        .filterBy('collection.isExternalCollection')
        .mapBy('collection.id');
      collectionIds = collectionIds.concat(externalCollectionIds);
      let externalAssessmentIds = classActivities
        .filterBy('collection.isExternalAssessment')
        .mapBy('collection.id');
      assessmentIds = assessmentIds.concat(externalAssessmentIds);
      const performanceService = service.get('performanceService');
      let minStartDate =
        service.getMinDateOfActivity(classActivities) || startDate;
      let maxEndDate = service.getMaxDateOfActivity(classActivities) || endDate;
      Ember.RSVP.hash({
        activityCollectionPerformanceSummaryItems: collectionIds.length
          ? performanceService.findStudentActivityPerformanceSummaryByIds(
            userId,
            classId,
            collectionIds,
            'collection',
            minStartDate,
            maxEndDate
          )
          : [],
        activityAssessmentPerformanceSummaryItems: assessmentIds.length
          ? performanceService.findStudentActivityPerformanceSummaryByIds(
            userId,
            classId,
            assessmentIds,
            'assessment',
            minStartDate,
            maxEndDate
          )
          : []
      }).then(function(hash) {
        let performances = hash.activityCollectionPerformanceSummaryItems.concat(
          hash.activityAssessmentPerformanceSummaryItems
        );
        performances.forEach(performance => {
          let classActivity = classActivities
            .filterBy(
              'collection.id',
              performance.get('collectionPerformanceSummary.collectionId')
            )
            .objectAt(0);
          if (classActivity) {
            let performanceData = performance.get(
              'collectionPerformanceSummary'
            );
            performanceData.set(
              'playedDate',
              performance.get('activation_date')
            );
            performanceData.set('hasStarted', true);
            classActivity.set('collection.performance', performanceData);
          }
        });
        resolve(classActivities);
      }, reject);
    });
  },

  /**
   * Gets all class activity for the authorized user (student|teacher)
   * @param {string} classId
   * @param {ClassActivity[]} classActivities
   * @param {Date} startDate optional start date, default is now
   * @param {Date} endDate optional end date, default is now
   * @returns {Promise.<ClassActivity[]>}
   */
  findClassActivitiesPerformanceSummary: function(
    classId,
    classActivities,
    startDate = new Date(),
    endDate = new Date()
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let assessmentIds = classActivities
        .filterBy('collection.isAssessment')
        .mapBy('collection.id');
      let collectionIds = classActivities
        .filterBy('collection.isCollection')
        .mapBy('collection.id');
      let externalCollectionIds = classActivities
        .filterBy('collection.isExternalCollection')
        .mapBy('collection.id');
      collectionIds = collectionIds.concat(externalCollectionIds);
      let externalAssessmentIds = classActivities
        .filterBy('collection.isExternalAssessment')
        .mapBy('collection.id');
      assessmentIds = assessmentIds.concat(externalAssessmentIds);
      let offlineActivityIds = classActivities
        .filterBy('contentType', 'offline-activity')
        .mapBy('id');
      const performanceService = service.get('performanceService');
      let minStartDate =
        service.getMinDateOfActivity(classActivities) || startDate;
      let maxEndDate = service.getMaxDateOfActivity(classActivities) || endDate;
      Ember.RSVP.hash({
        activityCollectionPerformanceSummaryItems: collectionIds.length
          ? performanceService.findClassActivityPerformanceSummaryByIds(
            classId,
            collectionIds,
            'collection',
            minStartDate,
            maxEndDate
          )
          : [],
        activityAssessmentPerformanceSummaryItems: assessmentIds.length
          ? performanceService.findClassActivityPerformanceSummaryByIds(
            classId,
            assessmentIds,
            'assessment',
            minStartDate,
            maxEndDate
          )
          : [],
        activityOfflineActivityPerformanceSummaryItems: offlineActivityIds.length
          ? performanceService.findOfflineClassActivityPerformanceSummaryByIds(
            classId,
            offlineActivityIds
          )
          : []
      }).then(function(hash) {
        let performances = hash.activityCollectionPerformanceSummaryItems.concat(
          hash.activityAssessmentPerformanceSummaryItems,
          hash.activityOfflineActivityPerformanceSummaryItems
        );
        performances.forEach(performance => {
          let classActivity = classActivities
            .filter(activity => service.inBetweenDate(activity, performance))
            .filterBy(
              'collection.id',
              performance.get('collectionPerformanceSummary.collectionId')
            )
            .objectAt(0);
          classActivity =
            classActivity ||
            classActivities.findBy('id', performance.dcaContentId) ||
            null;
          if (classActivity) {
            let classActivityIndex = classActivities.indexOf(classActivity);
            let performanceData = performance.get(
              'collectionPerformanceSummary'
            );
            performanceData.set('hasStarted', true);
            classActivities[classActivityIndex].set(
              'collection.performance',
              performanceData
            );
          }
        });
        resolve(classActivities);
      }, reject);
    });
  },

  /**
   * @function fetchStudentsActivityPerformance
   * Method to fetch students activity performance data
   */
  fetchStudentsActivityPerformance(classId, classActivity, startDate, endDate) {
    const service = this;
    const performanceService = service.get('performanceService');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      let activityType =
        classActivity.get('collection.isAssessment') ||
        classActivity.get('collection.isExternalAssessment')
          ? 'assessment'
          : 'collection';
      let activityId = Ember.A([classActivity.get('collection.id')]);
      Ember.RSVP.hash({
        activityStudentsPerformanceData: performanceService.fetchStudentsActivityPerformance(
          classId,
          activityId,
          activityType,
          startDate,
          endDate
        )
      }).then(({ activityStudentsPerformanceData }) => {
        resolve(activityStudentsPerformanceData);
      }, reject);
    });
  },

  /**
   * Remove class activity from class which is added
   * @param {string} classId The class id to delete
   * @param {string} contentId The content id to delete
   * @returns {Promise}
   */
  removeClassActivity: function(classId, contentId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .removeClassActivity(classId, contentId)
        .then(resolve, reject);
    });
  },

  /**
   * Get the users information for the specified activity
   *
   * @param {string} classId
   * @param {string} contentId content uuid
   * @returns {Promise}
   */
  fetchUsersForClassActivity: function(classId, contentId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .fetchUsersForClassActivity(classId, contentId)
        .then(
          function(response) {
            resolve(
              service
                .get('classActivitySerializer')
                .normalizeFetchUsersForClassActivity(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Update the users information for the specified activity
   *
   * @param {string} classId
   * @param {string} contentId
   * @param {Array} list of user ids
   * @returns {Promise}
   */
  addUsersToActivity: function(classId, contentId, users) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .addUsersToActivity(classId, contentId, users)
        .then(resolve, reject);
    });
  },

  /**
   * @function getMonthlyActivitiesCount
   * Method to fetch monthly activities count
   */
  getMonthlyActivitiesCount(classId, month, year) {
    const service = this;
    const classActivityAdapter = service.get('classActivityAdapter');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      classActivityAdapter.getMonthlyActivitiesCount(classId, month, year).then(
        function(activitiesCount) {
          resolve(activitiesCount);
        },
        function(error) {
          reject(error);
        }
      );
    });
  },

  /**
   * Update Mastery Accrual Class Activity
   *
   * @param {string} classId
   * @param {string} classActivityId
   * @param {Boolean} allow_mastery_accrual
   * @returns {boolean}
   */
  updateMasteryAccrualClassActivity: function(
    classId,
    classActivityId,
    allow_mastery_accrual = false
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .updateMasteryAccrualClassActivity(
          classId,
          classActivityId,
          allow_mastery_accrual
        )
        .then(function() {
          resolve(true);
        }, reject);
    });
  },

  getScheduledActivitiesByDate(
    classId,
    requestBody,
    isDefaultShowFW,
    classFramework,
    userId
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getScheduledActivitiesByDate(classId, requestBody)
        .then(function(scheduledActivities) {
          const classActivities = service
            .get('classActivitySerializer')
            .normalizeFindClassActivities(scheduledActivities, classId);
          let uniqueClassIds = classActivities
            .uniqBy('classId')
            .mapBy('classId');
          let taxonomyIds = getTaxonomyIdsBySearchContent(
            classActivities,
            true
          );
          let performancePromise = uniqueClassIds.map(classId => {
            return new Ember.RSVP.Promise(function(
              promiseResolve,
              promiseReject
            ) {
              if (classId) {
                let activitiesByClass = classActivities.filterBy(
                  'classId',
                  classId
                );
                if (userId) {
                  let offlineClassActivities = activitiesByClass
                    .filterBy('contentType', CONTENT_TYPES.OFFLINE_ACTIVITY)
                    .filterBy('isCompleted', true);
                  Ember.RSVP.hash({
                    offlinePerformance: service.findStudentOfflineActivitiesPerformanceSummary(
                      classId,
                      offlineClassActivities,
                      userId
                    ),
                    studentPerformance: service.findStudentActivitiesPerformanceSummary(
                      userId,
                      classId,
                      activitiesByClass,
                      requestBody.start_date,
                      requestBody.end_date
                    ),
                    getcrosswalkCompetency:
                      isDefaultShowFW && taxonomyIds.length
                        ? service.getcrosswalkCompetency(
                          classActivities,
                          classFramework,
                          taxonomyIds
                        )
                        : []
                  }).then(() => {
                    promiseResolve();
                  }, promiseReject);
                } else {
                  Ember.RSVP.hash({
                    activityPerformance: service.findClassActivitiesPerformanceSummary(
                      classId,
                      activitiesByClass,
                      requestBody.start_date,
                      requestBody.end_date
                    ),
                    getcrosswalkCompetency:
                      isDefaultShowFW && taxonomyIds.length
                        ? service.getcrosswalkCompetency(
                          classActivities,
                          classFramework,
                          taxonomyIds
                        )
                        : []
                  }).then(() => {
                    promiseResolve();
                  }, promiseReject);
                }
              }
            });
          });
          Ember.RSVP.all(performancePromise).then(() =>
            resolve(classActivities)
          );
        }, reject);
    });
  },

  getUnScheduledActivitiesByMonthYear(classId, requestBody) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getUnScheduledActivitiesByMonthYear(classId, requestBody)
        .then(function(unScheduledActivities) {
          resolve(
            service
              .get('classActivitySerializer')
              .normalizeFindClassActivities(unScheduledActivities)
          );
        }, reject);
    });
  },

  inBetweenDate(activity, performance) {
    const activationDate = activity.activation_date;
    const endDate = moment(activity.end_date);
    const playedDate = performance.activation_date;
    const isStartDateSameOrBefore = moment(playedDate).isSameOrBefore(
      activationDate,
      'day'
    );
    const isEndDateSameOrAfter = endDate.isSameOrAfter(playedDate, 'day');
    return (
      (isStartDateSameOrBefore || isEndDateSameOrAfter) &&
      activity.collection.id ===
        performance.collectionPerformanceSummary.collectionId &&
      !activity.collection.performance
    );
  },

  /**
   * This method is used to get max date of activity
   * @param {activityList}
   */
  getMaxDateOfActivity(activities) {
    const sortedActivities = activities.sort((a, b) => {
      return new Date(b.end_date).getTime() - new Date(a.end_date).getTime();
    });
    return sortedActivities.length ? sortedActivities[0].end_date : null;
  },

  /**
   * This method is used to get min date of activity
   * @param {activityList}
   */
  getMinDateOfActivity(activities) {
    const sortedActivities = activities.sort((a, b) => {
      return (
        new Date(a.activation_date).getTime() -
        new Date(b.activation_date).getTime()
      );
    });
    return sortedActivities.length ? sortedActivities[0].activation_date : null;
  },

  /**
   * This method is used to get oa student performance
   * @param {classId, oaId, itemId}
   */
  getOaStudentPerformance(classId, oaId, itemId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getOaStudentPerformance(classId, oaId, itemId)
        .then(function(performanceData) {
          resolve(performanceData);
        }, reject);
    });
  },

  /**
   * This method is used to get time spend
   * @param {classId}
   */
  getTimeSpend(classId, startDate, endDate) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getTimeSpend(classId, startDate, endDate)
        .then(function(timeSpent) {
          resolve(timeSpent.data);
        }, reject);
    });
  },

  /**
   * This method is used to get milestone
   * @param {classId}
   */
  getMilestone(classId, startDate, endDate) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getMilestone(classId, startDate, endDate)
        .then(function(milestone) {
          resolve(milestone);
        }, reject);
    });
  },

  /**
   * This method is used to get diagnostic report counts
   * @param {classId}
   */
  getDiagnosticReport(classId, startDate, endDate) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('classActivityAdapter')
        .getDiagnosticReport(classId, startDate, endDate)
        .then(function(diagnosticReport) {
          resolve(diagnosticReport);
        }, reject);
    });
  },

  getcrosswalkCompetency: function(
    classActivities,
    classFramework,
    taxonomyIds
  ) {
    const service = this;
    return service
      .get('taxonomyAdapter')
      .crosswalkCompetency(classFramework, taxonomyIds)
      .then(function(crosswalkResponse) {
        let frameworkCrossWalkComp = service
          .get('taxonomySerializer')
          .normalizeCrosswalkCompetency(crosswalkResponse);
        classActivities.map(activity => {
          let standards = activity.standards;
          standards.map(data => {
            let taxonomyData = frameworkCrossWalkComp.findBy(
              'sourceDisplayCode',
              data.code
            );
            if (taxonomyData) {
              data.code = taxonomyData.targetDisplayCode;
              data.frameworkCode = taxonomyData.targetFrameworkId;
            }
          });
          let collectionStandards = activity.collection.standards;
          collectionStandards.map(data => {
            let taxonomyData = frameworkCrossWalkComp.findBy(
              'sourceDisplayCode',
              data.code
            );
            if (taxonomyData) {
              data.code = taxonomyData.targetDisplayCode;
              data.frameworkCode = taxonomyData.targetFrameworkId;
            }
          });
        });
      });
  }
});
