import Ember from 'ember';
import ClassPerformanceSummarySerializer from 'gooru-web/serializers/performance/class-performance-summary';
import ClassPerformanceSummaryAdapter from 'gooru-web/adapters/performance/class-performance-summary';
import CollectionPerformanceSummarySerializer from 'gooru-web/serializers/performance/collection-performance-summary';
import CollectionPerformanceSummaryAdapter from 'gooru-web/adapters/performance/collection-performance-summary';
import ActivityPerformanceSummarySerializer from 'gooru-web/serializers/performance/activity-performance-summary';
import ActivityPerformanceSummaryAdapter from 'gooru-web/adapters/performance/activity-performance-summary';
import CourseCompetencyCompletionAdapter from 'gooru-web/adapters/performance/course-competency-completion';
import CourseCompetencyCompletionSerializer from 'gooru-web/serializers/performance/course-competency-completion';
import MilestonePerformanceAdapter from 'gooru-web/adapters/performance/milestone-performance';
import MilestonePerformanceSerializer from 'gooru-web/serializers/performance/milestone-performance';
import {
  aggregateClassActivityPerformanceSummaryItems,
  aggregateOfflineClassActivityPerformanceSummaryItems
} from 'gooru-web/utils/performance-summary';
import PerformanceAdapter from 'gooru-web/adapters/performance/performance';
import PerformanceSerializer from 'gooru-web/serializers/performance/performance';

/**
 * @typedef {Object} PerformanceService
 */
export default Ember.Service.extend({
  store: Ember.inject.service(),

  /**
   * @property {Ember.Service} Service to retrieve analytics data
   */
  analyticsService: Ember.inject.service('api-sdk/analytics'),

  /**
   * @property {Ember.Service} Service to search for resources
   */
  searchService: Ember.inject.service('api-sdk/search'),

  /**
   * @property {Ember.Service} Service to get the Taxonomy data
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @property {ClassPerformanceSummarySerializer}
   */
  classPerformanceSummarySerializer: null,

  /**
   * @property {ClassPerformanceSummaryAdapter}
   */
  classPerformanceSummaryAdapter: null,

  /**
   * @property {CollectionPerformanceSummarySerializer}
   */
  collectionPerformanceSummarySerializer: null,

  /**
   * @property {CollectionPerformanceSummaryAdapter}
   */
  collectionPerformanceSummaryAdapter: null,

  /**
   * @property {ActivityPerformanceSummarySerializer}
   */
  activityPerformanceSummarySerializer: null,

  /**
   * @property {ActivityPerformanceSummaryAdapter}
   */
  activityPerformanceSummaryAdapter: null,

  /**
   * @property {courseCompetencyCompletionAdapter}
   */
  courseCompetencyCompletionAdapter: null,

  /**
   * @property {performanceAdapter}
   */
  performanceAdapter: null,

  // -------------------------------------------------------------------------
  // Events

  init: function() {
    this._super(...arguments);
    this.set(
      'classPerformanceSummarySerializer',
      ClassPerformanceSummarySerializer.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'classPerformanceSummaryAdapter',
      ClassPerformanceSummaryAdapter.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'collectionPerformanceSummarySerializer',
      CollectionPerformanceSummarySerializer.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'collectionPerformanceSummaryAdapter',
      CollectionPerformanceSummaryAdapter.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'activityPerformanceSummarySerializer',
      ActivityPerformanceSummarySerializer.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'activityPerformanceSummaryAdapter',
      ActivityPerformanceSummaryAdapter.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'courseCompetencyCompletionAdapter',
      CourseCompetencyCompletionAdapter.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'courseCompetencyCompletionSerializer',
      CourseCompetencyCompletionSerializer.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'performanceAdapter',
      PerformanceAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'performanceSerializer',
      PerformanceSerializer.create(Ember.getOwner(this).ownerInjection())
    );

    this.set(
      'milestonePerformanceSerializer',
      MilestonePerformanceSerializer.create(
        Ember.getOwner(this).ownerInjection()
      )
    );
    this.set(
      'milestonePerformanceAdapter',
      MilestonePerformanceAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Gets a student's assessment result for a specific collection.
   * @param context
   * @param loadStandards
   * @returns {Promise.<AssessmentResult>}
   */
  findAssessmentResultByCollectionAndStudent: function(context) {
    const service = this;

    const params = {
      collectionType: context.collectionType,
      contentId: context.collectionId,
      userId: context.userId,
      sessionId: context.sessionId
    };
    if (context.classId) {
      params.classId = context.classId;
      params.courseId = context.courseId;
      params.unitId = context.unitId;
      params.lessonId = context.lessonId;
      params.pathId = context.pathId;
    }
    return new Ember.RSVP.Promise(function(resolve) {
      return service
        .get('studentCollectionAdapter')
        .queryRecord(params)
        .then(
          function(payload) {
            const assessmentResult = service
              .get('studentCollectionPerformanceSerializer')
              .normalizeStudentCollection(payload);
            resolve(assessmentResult);
          },
          function() {
            resolve(undefined);
          }
        );
    });
  },

  /**
   * Gets the unit performance data for a specific user, class and course.
   * @param userId
   * @param classId
   * @param courseId
   * @param units
   * @param options
   * @returns {Promise.<UnitPerformance[]>}
   */
  findStudentPerformanceByCourse: function(
    userId,
    classId,
    courseId,
    units,
    options = {
      collectionType: 'assessment'
    }
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getPerformanceForUnits(
          classId,
          courseId,
          options.collectionType,
          userId
        )
        .then(
          function(response) {
            resolve(
              service
                .get('performanceSerializer')
                .normalizeCoursemapPerformance(response, options.collectionType)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets the lesson performance data for a specific user, class, course and unit.
   * @param userId
   * @param classId
   * @param courseId
   * @param unitId
   * @param lessons
   * @param options
   * @returns {Promise.<LessonPerformance[]>}
   */
  findStudentPerformanceByUnit: function(
    userId,
    classId,
    courseId,
    unitId,
    lessons,
    options = {
      collectionType: 'assessment'
    }
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getPerformanceForLessons(
          classId,
          courseId,
          unitId,
          options.collectionType,
          userId
        )
        .then(
          function(response) {
            resolve(
              service
                .get('performanceSerializer')
                .normalizeCoursemapPerformance(response, options.collectionType)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets the collection performance data for a specific user, class, course, unit and lesson.
   * @param userId
   * @param classId
   * @param courseId
   * @param unitId
   * @param lessonId
   * @param collections
   * @param options
   * @returns {Promise.<CollectionPerformance[]>}
   */
  findStudentPerformanceByLesson: function(
    userId,
    classId,
    courseId,
    unitId,
    lessonId,
    collections,
    options = {
      collectionType: 'assessment'
    }
  ) {
    const service = this;

    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('collectionPerformanceSummaryAdapter')
        .getCollectionsPerformanceByLessonId(
          classId,
          courseId,
          unitId,
          lessonId,
          options.collectionType,
          userId
        )
        .then(
          function(response) {
            resolve(
              service
                .get('performanceSerializer')
                .normalizeCoursemapPerformance(response, options.collectionType)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets the data for al the performances in class.
   * @param objectsWithTitle
   * @param performances
   * @returns {Promise.<CollectionPerformance[]>}
   */
  matchTitlesWithPerformances: function(objectsWithTitle, performances) {
    return performances.map(function(performance) {
      const objectWithTitle = objectsWithTitle.findBy(
        'id',
        performance.get('id')
      );
      if (objectWithTitle) {
        performance.set('title', objectWithTitle.get('title'));
      }
      return performance;
    });
  },

  /**
   * Gets the data for al the performances in class.
   * @param objectsWithTitle
   * @param performances
   * @returns {Promise.<CollectionPerformance[]>}
   */
  matchCourseMapWithPerformances: function(
    objectsWithTitle,
    performances,
    type,
    routeType
  ) {
    const service = this;
    return objectsWithTitle.map(function(object) {
      let objectWithTitle = performances.findBy('id', object.get('id'));
      if (objectWithTitle) {
        objectWithTitle.set('title', object.get('title'));
        objectWithTitle.set('model', object);
      } else {
        objectWithTitle = service.getPerformanceRecordByType(
          type,
          object,
          routeType
        );
        objectWithTitle.set('model', object);
      }
      return objectWithTitle;
    });
  },

  /**
   * Gets the perfomrmance object by type.
   * @param type
   * @param object
   * @returns {Promise.<performance[]>}
   */
  getPerformanceRecordByType: function(type, object, routeType) {
    const id = object.get('id');
    const store = this.get('store');
    let modelName = null;
    let record = this.getPerformanceRecord(type, object);

    if (type === 'unit') {
      modelName = 'performance/unit-performance';
    } else if (type === 'lesson') {
      modelName = 'performance/lesson-performance';
    } else {
      modelName = `performance/${routeType}collection-performance`;
    }

    const found = store.recordIsLoaded(modelName, id);
    if (found) {
      const foundRecord = store.recordForId(modelName, id);
      store.unloadRecord(foundRecord);
    }
    let newRecord = store.createRecord(modelName, record);
    if (type === 'collection') {
      newRecord.set('collectionType', object.get('collectionType'));
    }

    return newRecord;
  },

  /**
   * Gets the perfomrmance object by type.
   * @param type
   * @param object
   * @returns {object}
   */
  getPerformanceRecord: function(type, object) {
    return {
      id: object.get('id'),
      title: object.get('title'),
      type: type,
      completionTotal: 0,
      completionDone: 0,
      url: object.get('url'),
      attempts: 0
    };
  },

  /**
   * Gets the unit teacher performance data for a specific class and course.
   * @param classId
   * @param courseId
   * @param students
   * @param options
   * @returns {Promise.<UnitPerformance[]>}
   */
  findClassPerformance: function(
    classId,
    courseId,
    students,
    units,
    options = {
      collectionType: 'assessment'
    }
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getTeacherClassPerformance(classId, courseId, options.collectionType)
        .then(
          function(response) {
            resolve(
              service
                .get('performanceSerializer')
                .normalizeTeacherUnitLessonPerformance(
                  response,
                  options.collectionType,
                  units
                )
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Gets the lesson teacher performance data for a specific class, course and unit.
   * @param classId
   * @param courseId
   * @param unitId
   * @param students
   * @param options
   * @returns {Promise.<LessonPerformance[]>}
   */
  findClassPerformanceByUnit: function(
    classId,
    courseId,
    unitId,
    students,
    lessons,
    options = {
      collectionType: 'assessment'
    }
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getTeacherPerformanceForUnit(
          classId,
          courseId,
          options.collectionType,
          unitId
        )
        .then(
          function(response) {
            resolve(
              service
                .get('performanceSerializer')
                .normalizeTeacherUnitLessonPerformance(
                  response,
                  options.collectionType,
                  lessons
                )
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },
  /**
   * Gets the lesson teacher performance data for a specific class, course and unit.
   * @param classId
   * @param courseId
   * @param unitId
   * @param students
   * @param options
   * @returns {Promise.<ClassLessonPerformance[]>}
   */
  findCourseMapPerformanceByUnit: function(
    classId,
    courseId,
    unitId,
    options = {
      collectionType: 'assessment'
    }
  ) {
    const service = this;
    service.get('store').unloadAll('performance/student-performance');
    service.get('store').unloadAll('performance/class-lesson-performance');
    return service
      .get('store')
      .query('performance/class-lesson-performance', {
        collectionType: options.collectionType,
        classId: classId,
        courseId: courseId,
        unitId: unitId
      })
      .then(function(lessonPerformances) {
        return lessonPerformances;
      });
  },

  /**
   * Gets the collection teacher performance data for a specific class, course, unit and lesson.
   * @param classId
   * @param courseId
   * @param unitId
   * @param lessonId
   * @param students
   * @param options
   * @returns {Promise.<CollectionPerformance[]>}
   */
  findClassPerformanceByUnitAndLesson: function(
    classId,
    courseId,
    unitId,
    lessonId,
    students,
    options = {
      collectionType: 'assessment'
    }
  ) {
    const service = this;
    service.get('store').unloadAll('performance/student-performance');
    service.get('store').unloadAll('performance/class-collection-performance');
    return service
      .get('store')
      .queryRecord('performance/class-collection-performance', {
        collectionType: options.collectionType,
        classId: classId,
        courseId: courseId,
        unitId: unitId,
        lessonId: lessonId
      })
      .then(function(collectionPerformances) {
        return service.matchStudentsWithPerformances(
          students,
          collectionPerformances
        );
      });
  },

  /**
   **  Gets the collection teacher performance data for a specific class, course, unit and lesson.
   * @param classId
   * @param courseId
   * @param unitId
   * @param lessonId
   * @param options
   * @returns {Promise.<ClassCollectionPerformance[]>}
   */
  findCourseMapPerformanceByUnitAndLesson: function(
    classId,
    courseId,
    unitId,
    lessonId,
    options = {
      collectionType: 'assessment'
    }
  ) {
    const service = this;
    service.get('store').unloadAll('performance/student-performance');
    service.get('store').unloadAll('performance/class-collection-performance');
    return service
      .get('store')
      .queryRecord('performance/class-collection-performance', {
        collectionType: options.collectionType,
        classId: classId,
        courseId: courseId,
        unitId: unitId,
        lessonId: lessonId
      })
      .then(function(collectionPerformances) {
        return collectionPerformances;
      });
  },

  /**
   * Gets the class performance summary by student class ids
   * @param studentId
   * @param classIds
   */
  findClassPerformanceSummaryByStudentAndClassIds: function(
    studentId,
    classIds
  ) {
    const service = this;
    if (classIds && classIds.length) {
      return service
        .get('classPerformanceSummaryAdapter')
        .findClassPerformanceSummaryByStudentAndClassIds(studentId, classIds)
        .then(function(data) {
          return service
            .get('classPerformanceSummarySerializer')
            .normalizeAllClassPerformanceSummary(data);
        });
    } else {
      return Ember.RSVP.resolve([]);
    }
  },

  /**
   * Gets the class performance summary by class ids
   * This method is used by teachers to get their class summary performance
   * @param classIds
   */
  findClassPerformanceSummaryByClassIds: function(classIds) {
    const service = this;
    if (classIds && classIds.length) {
      return service
        .get('classPerformanceSummaryAdapter')
        .findClassPerformanceSummaryByClassIds(classIds)
        .then(function(data) {
          return service
            .get('classPerformanceSummarySerializer')
            .normalizeAllClassPerformanceSummary(data);
        });
    } else {
      return Ember.RSVP.resolve([]);
    }
  },

  matchStudentsWithPerformances: function(students, classPerformance) {
    const service = this;
    const studentPerformanceData = classPerformance.get(
      'studentPerformanceData'
    );
    let matchedStudentPerformanceData = students.map(function(student) {
      let studentPerformance = studentPerformanceData.findBy(
        'user.id',
        student.get('id')
      );
      if (studentPerformance) {
        studentPerformance.set('user', service.getUserRecord(student));
      } else {
        studentPerformance = service.getStudentPerformanceRecord(student);
      }
      return studentPerformance;
    });
    classPerformance.set(
      'studentPerformanceData',
      matchedStudentPerformanceData
    );
    return classPerformance;
  },

  getStudentPerformanceRecord: function(student) {
    const service = this;
    let studentPerformance = service.getRecord(
      'performance/student-performance',
      student.get('id')
    );
    studentPerformance.set('user', service.getUserRecord(student));
    return studentPerformance;
  },

  getUserRecord: function(user) {
    const service = this;
    let userRecord = service.getRecord('user/user', user.get('id'));
    userRecord.set('username', user.get('username'));
    userRecord.set('firstName', user.get('firstName'));
    userRecord.set('lastName', user.get('lastName'));
    return userRecord;
  },

  getRecord: function(modelName, id) {
    const store = this.get('store');
    const found = store.recordIsLoaded(modelName, id);
    return found
      ? store.recordForId(modelName, id)
      : store.createRecord(modelName, {
        id: id
      });
  },

  /**
   * Searches student collection performance by course, class, unit, lesson and type
   * Criteria values are not required except for courseId
   *
   * @param {string} studentId
   * @param {{ courseId: string, classId: string, unitId: string, lessonId: string, collectionType: string }} criteria
   * @returns {Promise}
   */
  searchStudentCollectionPerformanceSummary: function(studentId, criteria) {
    const service = this;
    return service
      .get('collectionPerformanceSummaryAdapter')
      .searchStudentCollectionPerformanceSummary(studentId, criteria)
      .then(function(data) {
        return service
          .get('collectionPerformanceSummarySerializer')
          .normalizeAllCollectionPerformanceSummary(data);
      });
  },

  /**
   * Searches student collection performance by course, unit, lesson and type. Only courseId param is required.
   *
   * @param {string} userId
   * @param {string} courseId
   * @param {string} lessonId
   * @param {string} unitId
   * @param {string} collectionType
   */
  findMyPerformance: function(
    userId,
    courseId,
    lessonId,
    unitId,
    collectionType = 'assessment'
  ) {
    let service = this;
    return service
      .get('collectionPerformanceSummaryAdapter')
      .findMyPerformance(userId, courseId, lessonId, unitId, collectionType)
      .then(function(data) {
        return service
          .get('collectionPerformanceSummarySerializer')
          .normalizeAllILCollectionPerformanceSummary(data);
      });
  },

  /**
   * Finds collection performance summary for the ids provided
   * @param {string} userId user id
   * @param {string[]} collectionIds
   * @param {string} collectionType collection|assessment
   * @param {string} classId optional class id filter
   * @param {string} timePeriod optional time period filter
   * @returns {Ember.RSVP.Promise.<CollectionPerformanceSummary[]>}
   */
  findCollectionPerformanceSummaryByIds: function(
    userId,
    collectionIds,
    collectionType,
    classId = undefined,
    timePeriod = undefined
  ) {
    const service = this;
    return service
      .get('collectionPerformanceSummaryAdapter')
      .findCollectionPerformanceSummaryByIds(
        userId,
        collectionIds,
        collectionType,
        classId,
        timePeriod
      )
      .then(function(data) {
        return service
          .get('collectionPerformanceSummarySerializer')
          .normalizeAllCollectionPerformanceSummary(data);
      });
  },

  /**
   * Finds class activity performance summary for the ids provided
   * @param {string} classId optional class id filter
   * @param {string[]} activityIds
   * @param {string} activityType collection|assessment
   * @param {Date} startDate optional start date, default is now
   * @param {Date} endDate optional end date, default is now
   * @returns {Ember.RSVP.Promise.<ActivityPerformanceSummary[]>}
   */
  findClassActivityPerformanceSummaryByIds: function(
    classId,
    activityIds,
    activityType,
    startDate = new Date(),
    endDate = new Date()
  ) {
    const service = this;
    return service
      .get('activityPerformanceSummaryAdapter')
      .findClassActivityPerformanceSummaryByIds(
        undefined,
        classId,
        activityIds,
        activityType,
        startDate,
        endDate
      )
      .then(function(data) {
        const activities = service
          .get('activityPerformanceSummarySerializer')
          .normalizeAllActivityPerformanceSummary(data);
        return aggregateClassActivityPerformanceSummaryItems(activities);
      });
  },

  /**
   * @function fetchStudentsActivityPerformance
   * Method to fetch students activity performance
   */
  fetchStudentsActivityPerformance(
    classId,
    activityId,
    activityType,
    startDate = new Date(),
    endDate = new Date()
  ) {
    const service = this;
    return service
      .get('activityPerformanceSummaryAdapter')
      .findClassActivityPerformanceSummaryByIds(
        undefined,
        classId,
        activityId,
        activityType,
        startDate,
        endDate
      )
      .then(function(data) {
        const activities = service
          .get('activityPerformanceSummarySerializer')
          .normalizeAllActivityPerformanceSummary(data);
        return activities;
      });
  },

  /**
   * Finds class activity performance summary for the ids provided
   * @param {string} userId user id
   * @param {string} classId optional class id filter
   * @param {string[]} activityIds
   * @param {string} activityType collection|assessment
   * @param {Date} startDate optional start date, default is now
   * @param {Date} endDate optional end date, default is now
   * @returns {Ember.RSVP.Promise.<ActivityPerformanceSummary[]>}
   */
  findStudentActivityPerformanceSummaryByIds: function(
    userId,
    classId,
    activityIds,
    activityType,
    startDate = new Date(),
    endDate = new Date()
  ) {
    const service = this;
    return service
      .get('activityPerformanceSummaryAdapter')
      .findClassActivityPerformanceSummaryByIds(
        userId,
        classId,
        activityIds,
        activityType,
        startDate,
        endDate
      )
      .then(function(data) {
        return service
          .get('activityPerformanceSummarySerializer')
          .normalizeAllActivityPerformanceSummary(data);
      });
  },

  /**
   * Find the course competency completion data
   * @param  {String} studentId   Logged in student id
   * @param  {String} courseIds Course id's to find the competency completion
   * @return {Object} It returns the serialized course competency completion data
   */
  findCourseCompetencyCompletionByCourseIds: function(studentId, courseIds) {
    const service = this;
    if (courseIds && courseIds.length) {
      return service
        .get('courseCompetencyCompletionAdapter')
        .findCourseCompetencyCompletionByCourseIds(studentId, courseIds)
        .then(function(data) {
          return service
            .get('courseCompetencyCompletionSerializer')
            .normalizeAllCourseCompetencyCompletion(data);
        });
    } else {
      return Ember.RSVP.resolve([]);
    }
  },

  /**
   * Get the student collection performance data new ui
   * @param  {String} classId
   * @param  {String} courseId
   */
  getStudentsCollectionPerformance: function(
    classId,
    courseId,
    unitId,
    lessonId,
    type
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getStudentsCollectionPerformance(
          classId,
          courseId,
          unitId,
          lessonId,
          type
        )
        .then(function(response) {
          resolve(
            service
              .get('performanceSerializer')
              .normalizeGetStudentsCollectionPerformance(response)
          );
        }, reject);
    });
  },

  /**
   * Get performance of user  resource in assessments
   * @returns {Promise.<[]>}
   */
  getUserPerformanceResourceInAssessment: function(
    userId,
    courseId,
    unitId,
    lessonId,
    collectionId,
    sessionId,
    classId
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getUserPerformanceResourceInAssessment(
          userId,
          courseId,
          unitId,
          lessonId,
          collectionId,
          sessionId,
          classId
        )
        .then(function(response) {
          resolve(
            service
              .get('performanceSerializer')
              .normalizeUserPerformanceResourceInAssessment(response)
          );
        }, reject);
    });
  },

  /**
   * Get performance of user  resource in collection
   * @returns {Promise.<[]>}
   */
  getUserPerformanceResourceInCollection: function(
    userId,
    courseId,
    unitId,
    lessonId,
    collectionId,
    sessionId,
    classId
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getUserPerformanceResourceInCollection(
          userId,
          courseId,
          unitId,
          lessonId,
          collectionId,
          sessionId,
          classId
        )
        .then(function(response) {
          resolve(
            service
              .get('performanceSerializer')
              .normalizeUserPerformanceResourceInCollection(response)
          );
        }, reject);
    });
  },

  updateCollectionOfflinePerformance(performanceData) {
    let service = this;
    let performanceAdapter = service.get('performanceAdapter');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      performanceAdapter
        .updateCollectionOfflinePerformance(performanceData)
        .then(function(response) {
          resolve(response);
        }, reject);
    });
  },

  /**
   * @function getCAPerformanceData
   * performance Data of Class Activities for ALL classes of a Student/Teacher
   */
  getCAPerformanceData(classIds, userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getCAPerformanceData(classIds, userId)
        .then(
          function(response) {
            resolve(
              service
                .get('performanceSerializer')
                .normalizeCAPerformanceData(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function getPerformanceForMilestones
   * Get Performance Data for course milestones
   */
  getPerformanceForMilestones(
    classId,
    courseId,
    collectionType,
    userUid,
    fwCode
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('milestonePerformanceAdapter')
        .getPerformanceForMilestones(
          classId,
          courseId,
          collectionType,
          userUid,
          fwCode
        )
        .then(
          function(response) {
            resolve(
              service
                .get('milestonePerformanceSerializer')
                .normalizePerformanceDataForMilestones(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function getPerformanceByMilestoneId
   * Get Performance Data by  milestone Id
   */
  getLessonsPerformanceByMilestoneId(
    classId,
    courseId,
    milestoneId,
    collectionType,
    userUid,
    fwCode
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('milestonePerformanceAdapter')
        .getLessonsPerformanceByMilestoneId(
          classId,
          courseId,
          milestoneId,
          collectionType,
          userUid,
          fwCode
        )
        .then(
          function(response) {
            resolve(
              service
                .get('milestonePerformanceSerializer')
                .normalizeLessonsPerformanceDataForMilestone(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function getCollectionsPerformanceByLessonId
   * Get Collection Performance Data by  lesson Id
   */
  getCollectionsPerformanceByLessonId(
    classId,
    courseId,
    unitId,
    lessonId,
    collectionType,
    userUid
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('collectionPerformanceSummaryAdapter')
        .getCollectionsPerformanceByLessonId(
          classId,
          courseId,
          unitId,
          lessonId,
          collectionType,
          userUid
        )
        .then(
          function(response) {
            resolve(
              service
                .get('collectionPerformanceSummarySerializer')
                .normalizeCollectionsPerformanceDataForLesson(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   *  @function overwriteCollectionPerformance
   * Method to overwrite collection performance
   */
  overwriteCollectionPerformance(performanceData) {
    const service = this;
    const performanceAdapter = service.get('performanceAdapter');
    return new Ember.RSVP.Promise(function(resolve, reject) {
      performanceAdapter
        .overwriteCollectionPerformance(performanceData)
        .then(function(response) {
          resolve(response);
        }, reject);
    });
  },

  /**
   * @function getPerformanceForUnits
   * Get units Performance Data for route0
   */
  getPerformanceForUnits(classId, courseId, collectionType, userUid) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getPerformanceForUnits(classId, courseId, collectionType, userUid)
        .then(
          function(response) {
            resolve(
              service
                .get('performanceSerializer')
                .normalizeUnitsPerformanceDataForCourse(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * @function getPerformanceForLessons
   * Get lessons Performance Data for route0
   */
  getPerformanceForLessons(classId, courseId, unitId, collectionType, userUid) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('performanceAdapter')
        .getPerformanceForLessons(
          classId,
          courseId,
          unitId,
          collectionType,
          userUid
        )
        .then(
          function(response) {
            resolve(
              service
                .get('performanceSerializer')
                .normalizeLessonsPerformanceDataForUnit(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  },

  /**
   * Get performance of offline class activity
   * @returns {Promise.<[]>}
   */
  findOfflineClassActivityPerformanceSummaryByIds: function(
    classId,
    oaIds,
    userId,
    doAggregate = true
  ) {
    const service = this;
    return service
      .get('activityPerformanceSummaryAdapter')
      .findOfflineClassActivityPerformanceSummaryByIds(classId, oaIds, userId)
      .then(function(data) {
        let activities = service
          .get('activityPerformanceSummarySerializer')
          .normalizeAllActivityPerformanceSummary(data);
        if (doAggregate) {
          return aggregateOfflineClassActivityPerformanceSummaryItems(
            activities
          );
        } else {
          return activities;
        }
      });
  },

  /**
   * Get performance of suggestion
   * @returns {Promise.<[]>}
   */
  fecthSuggestionPerformance: function(context) {
    const service = this;
    return service
      .get('performanceAdapter')
      .getSuggestionPerformance(context)
      .then(data => {
        return service
          .get('collectionPerformanceSummarySerializer')
          .normalizeAllCollectionPerformanceSummary(data);
      });
  },

  /**
   * Get visibility settings
   */
  getVisibilitySettings: function(classId) {
    return this.get('performanceAdapter')
      .getVisibilitySettings(classId)
      .then(data => {
        return data.learners_data_visibility;
      });
  },

  /**
   * @function getPerformanceForMilestoneUnits
   * Get Performance Data for course milestone units
   */
  getPerformanceForMilestoneUnits(
    classId,
    courseId,
    collectionType,
    userUid,
    fwCode
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('milestonePerformanceAdapter')
        .getPerformanceForMilestoneUnits(
          classId,
          courseId,
          collectionType,
          userUid,
          fwCode
        )
        .then(
          function(response) {
            resolve(
              service
                .get('milestonePerformanceSerializer')
                .normalizePerformanceDataForMilestoneUnits(response)
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  }
});
