import ApplicationAdapter from '../application';

export default ApplicationAdapter.extend({
  /**
   * @property {string} End-point URI
   */
  namespace: '/gooruapi/rest/v2/user',
  /**
   * Builds the end-point URL for the queryRecord queryParam
   * @param query
   * @returns {string}
   */
  urlForQueryRecord: function(query, modelName) {
    if (query.isMembersByClass) {
      let classId = query.classId;

      delete query.isMembersByClass;
      delete query.classId;

      return `/gooruapi/rest/v3/class/${classId}/member`;
    } else {
      return this._super(query, modelName);
    }
  }
});
