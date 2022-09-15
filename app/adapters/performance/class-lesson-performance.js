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
    const namespace = this.get('namespace');
    const classId = query.classId;
    const courseId = query.courseId;
    const unitId = query.unitId;

    delete query.classId;
    delete query.courseId;
    delete query.unitId;

    return `${namespace}/class/${classId}/course/${courseId}/unit/${unitId}/performance`;
  }
});
