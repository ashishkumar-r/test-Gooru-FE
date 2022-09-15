import ApplicationAdapter from '../application';

export default ApplicationAdapter.extend({
  /**
   * @property {string} End-point URI
   */
  //namespace: '/mocked-api/insights/api/v2',
  namespace: '/api/nucleus-insights/v2',

  /**
   * Builds the end-point URL for the queryRecord queryParam
   * @param query
   * @returns {string}
   */
  urlForQueryRecord: function(query) {
    var namespace = this.get('namespace');
    var classId = query.classId;
    var courseId = query.courseId;

    delete query.classId;
    delete query.courseId;

    return `${namespace}/class/${classId}/course/${courseId}/performance`;
  }
});
