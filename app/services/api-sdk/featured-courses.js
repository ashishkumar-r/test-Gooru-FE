import Ember from 'ember';
import FeaturedCourseSerializer from 'gooru-web/serializers/content/featured-courses';
import FeaturedCourseAdapter from 'gooru-web/adapters/content/featured-courses';
/**
 * Service to support the  Featured Courses CRUD operations
 *
 * @typedef {Object} FeaturedCourseService
 */
export default Ember.Service.extend({
  serializer: null,

  adapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'serializer',
      FeaturedCourseSerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'adapter',
      FeaturedCourseAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Returns the independent course list.
   * @returns {Promise.<Milestones>}
   */
  getIndependentCourseList(params) {
    const service = this;
    return service
      .get('adapter')
      .getIndependentCourseList(params)
      .then(function(courseList) {
        return service
          .get('serializer')
          .normalizeIndependentCourseList(courseList);
      });
  },

  /**
   * @function joinPublicClassbyGrade
   * @param {UUID} courseId
   * @param {Object} gradeLowerBound
   * Method to add students into a class
   */
  joinPublicClassbyGrade(courseId, gradeLowerBound, autoJoin) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('adapter')
        .joinPublicClassbyGrade(courseId, gradeLowerBound, autoJoin)
        .then(
          function(response, data, jqXHR) {
            let classId = jqXHR.getResponseHeader('location');
            resolve(
              Ember.Object.create({
                classId: classId
              })
            );
          },
          function(error) {
            reject(error);
          }
        );
    });
  }
});
