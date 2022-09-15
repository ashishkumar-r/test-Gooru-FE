import Ember from 'ember';
import StoreMixin from '../../mixins/store';
import CourseSerializer from 'gooru-web/serializers/content/course';
import CourseAdapter from 'gooru-web/adapters/content/course';

/**
 * Service to support the Course CRUD operations
 *
 * @typedef {Object} CourseService
 */
export default Ember.Service.extend(StoreMixin, {
  serializer: null,

  adapter: null,

  courseContainer: {},

  /**
   * @requires service:api-sdk/lesson
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  /**
   * @requires service:api-sdk/unit
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * @property {Service} profileService
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  init: function() {
    this._super(...arguments);
    this.set(
      'serializer',
      CourseSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'adapter',
      CourseAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Creates a new course
   *
   * @param courseModel The Course model to be saved
   * @returns {Promise}
   */
  createCourse: function(courseModel) {
    var courseData = this.get('serializer').serializeCreateCourse(courseModel);

    return this.get('adapter')
      .createCourse({
        body: courseData
      })
      .then(function(courseId) {
        courseModel.set('id', courseId);
        return courseModel;
      })
      .catch(function(error) {
        return error;
      });
  },

  /**
   * Returns a course by id
   * @param {string} courseId
   * @returns {Promise|Content/Course}
   */
  fetchById: function(courseId, allowCachedCourse) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      const courseContainer = service.get('courseContainer');
      if (allowCachedCourse && courseContainer[courseId]) {
        resolve(courseContainer[courseId]);
      } else {
        return service
          .get('adapter')
          .getCourseById(courseId)
          .then(function(courseData) {
            let course = service.get('serializer').normalizeCourse(courseData);
            courseContainer[courseId] = course;

            resolve(courseContainer[courseId]);
          })
          .catch(function(error) {
            reject(error);
          });
      }
    });
  },

  /**
   * Fetch course  details wihtout profile Informations
   *
   */

  fetchByIdWithOutProfile: function(courseId) {
    const service = this;
    return service
      .get('adapter')
      .getCourseById(courseId)
      .then(function(courseData) {
        let course = service.get('serializer').normalizeCourse(courseData);
        return course;
      })
      .catch(function(error) {
        return error;
      });
  },

  /**
   * Fetch course card level detail
   *
   */

  fetchCoursesCardData: function(courses) {
    const service = this;
    if (courses && courses.length > 0) {
      /*      let resultObj = [];
      courses.forEach(it => {
        let course = {
          courseId: it,
          title: 'My Test Course',
          thumbnailUrl:
            'http://cdn.gooru.org/a6ff0d51-7770-439a-b703-7af60f4f111c.png'
        };
        resultObj.push(course);
      });

      return Ember.RSVP.resolve(resultObj);
*/
      return service
        .get('adapter')
        .getCourseCards(courses)
        .then(function(courseCardsData) {
          let courses = service
            .get('serializer')
            .normalizeCourseCards(courseCardsData);
          return courses;
        })
        .catch(function(error) {
          return error;
        });
    } else {
      return Ember.RSVP.resolve([]);
    }
  },

  /**
   * Update existing course
   *
   * @param courseModel The Course model to update
   * @returns {Promise|Content/Course} Course model updated
   */
  updateCourse: function(courseModel, updateAll = true) {
    var courseData = this.get('serializer').serializeUpdateCourse(
      courseModel,
      updateAll
    );
    return this.get('adapter')
      .updateCourse({
        courseId: courseModel.get('id'),
        course: courseData
      })
      .then(function() {
        return courseModel;
      })
      .catch(function(error) {
        return error;
      });
  },

  /**
   * Updates the course title
   *
   * @param courseId the id of the course to be updated
   * @param title
   * @returns {Promise}
   */
  updateCourseTitle: function(courseId, title) {
    const service = this;
    let serializedData = service
      .get('serializer')
      .serializeUpdateCourseTitle(title);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .updateCourse({
          courseId: courseId,
          course: serializedData
        })
        .then(resolve, reject);
    });
  },
  /**
   * Delete course
   *
   * @param courseId The Course id to delete
   * @returns {Ember.RSVP.Promise}
   */
  deleteCourse: function(courseId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .deleteCourse(courseId)
        .then(resolve, reject);
    });
  },

  /**
   * Copies a course by id
   * @param {string} courseId
   * @returns {Ember.RSVP.Promise}
   */
  copyCourse: function(courseId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .copyCourse(courseId)
        .then(function(responseData, textStatus, request) {
          resolve(request.getResponseHeader('location'));
        }, reject);
    });
  },

  /**
   * Reorder course units
   *
   * @param courseId the id of the Course to be updated
   * @param {string[]} unitIds
   * @returns {Promise}
   */
  reorderCourse: function(courseId, unitIds) {
    const service = this;
    let serializedData = service
      .get('serializer')
      .serializeReorderCourse(unitIds);
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .reorderCourse(courseId, serializedData)
        .then(resolve, reject);
    });
  },

  /**
   * Returns the assessment|collection course structure
   * @param {string} courseId
   * @param {string} collectionType collection|assessment
   * @returns {Promise.<Content/Course>}
   */
  getCourseStructure: function(courseId, collectionType) {
    const service = this;
    return service
      .get('adapter')
      .getCourseStructure(courseId, collectionType)
      .then(function(courseData) {
        return service
          .get('serializer')
          .normalizeCourseStructure(courseData, collectionType);
      });
  },

  /**
   * Returns the milestones for the course.
   * @param {string} courseId
   * @param {string} fwCode
   * @returns {Promise.<Milestones>}
   */
  getCourseMilestones(courseId, fwCode, class_id, user_id) {
    const service = this;
    return service
      .get('adapter')
      .getCourseMilestones(courseId, fwCode, class_id, user_id)
      .then(function(courseData) {
        return service
          .get('serializer')
          .normalizeCourseMilestones(courseData, fwCode);
      });
  },

  /**
   * Update co-teacher for course
   * @param courseId
   * @param collaboratorIds the teacher ids
   * @returns {Promise}
   */
  updateCollaborators(courseId, collaboratorIds) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .updateCollaborators(courseId, collaboratorIds)
        .then(resolve, reject);
    });
  },

  /**
   * Returns the lessons for the course milestone.
   * @param {string} courseId
   * @param {string} milestoneId
   * @returns {Promise.<Lessons>}
   */
  getCourseMilestoneLessons(courseId, milestoneId) {
    const service = this;
    return service
      .get('adapter')
      .getCourseMilestoneLessons(courseId, milestoneId)
      .then(function(courseData) {
        return service
          .get('serializer')
          .normalizeCourseMilestoneLessons(courseData, milestoneId);
      });
  },

  getPublisherList(Pubisherlimit) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .getPublisherList(Pubisherlimit)
        .then(function(payload) {
          resolve(service.get('serializer').normalizePublisherList(payload));
        }, reject);
    });
  },
  getReadActivity(requestParams) {
    const service = this;
    return service
      .get('adapter')
      .getReadActivity(requestParams)
      .then(function(courseData) {
        return courseData;
      });
  },
  NotLinkedActivity(requestParams) {
    const service = this;
    return service
      .get('adapter')
      .NotLinkedActivity(requestParams)
      .then(function(courseData) {
        return courseData;
      });
  }
});
