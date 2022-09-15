import Ember from 'ember';
import CourseCompetencyCompletion from 'gooru-web/models/performance/course-competency-completion';

/**
 * normalizeCourseCompetencyCompletion Serializer Methods for course competency completion
 * @property {Object}
 */
export default Ember.Object.extend({

  /**
   * Normalize an array of CourseCompetencyCompletion
   *
   * @param {Json} Response data from REST API request
   * @returns {CourseCompetencyCompletion[]}
   */
  normalizeAllCourseCompetencyCompletion: function(data) {
    const serializer = this;
    if (data && Ember.isArray(data.usageData)) {
      return data.usageData.map(function(courseCompetencyCompletion) {
        return serializer.normalizeCourseCompetencyCompletion(courseCompetencyCompletion);
      });
    } else {
      return [];
    }
  },

  /**
   * Normalize the course competency completion data to it's model
   * @param  {Json}  Json response data for course competency completion
   * @return {Object} Create model object for course competency completion
   */
  normalizeCourseCompetencyCompletion: function (data) {
    return CourseCompetencyCompletion.create(data);
  }

});
