import ApplicationAdapter from '../application';

export default ApplicationAdapter.extend({
  /**
   * @property {string} End-point URI
   */
  namespace: '/gooruapi/rest/v3',

  /**
   * Builds the end-point URL for the findRecord queryParam, params are optional
   * @param modelName
   * @param id
   * @param snapshot
   * @returns {string}
   */
  urlForFindRecord: function(id) {
    let namespace = this.get('namespace');
    let includeItemParam = 'includeItems=true';
    let includeLastModifiedUserParam = 'includeLastModifiedUser=true';

    return `${namespace}/collection/${id}?${includeItemParam}&${includeLastModifiedUserParam}`;
  },
  /**
   * Builds the end-point URL for the queryRecord queryParam
   * @param query
   * @returns {string}
   */
  urlForQueryRecord: function(query) {
    let namespace = this.get('namespace');
    let classId = query.classId;
    let courseId = query.courseId;
    let unitId = query.unitId;
    let lessonId = query.lessonId;

    delete query.classId;
    delete query.courseId;
    delete query.unitId;
    delete query.lessonId;

    return `${namespace}/class/${classId}/course/${courseId}/unit/${unitId}/lesson/${lessonId}`;
  }
});
