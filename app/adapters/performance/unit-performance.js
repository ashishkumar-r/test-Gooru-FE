import ApplicationAdapter from '../application';

export default ApplicationAdapter.extend({
  /**
   * @property {string} End-point URI
   */
  namespace: '/api/nucleus-insights/v2',

  /**
   * Builds the end-point URL for queryRecord method
   * @param query
   * @returns {string}
   */
  urlForQuery: function(query) {
    var namespace = this.get('namespace');
    var classId = query.classId;
    var courseId = query.courseId;

    delete query.classId;
    delete query.courseId;

    return `${namespace}/class/${classId}/course/${courseId}/performance`;
  }
});
