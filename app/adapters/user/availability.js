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

  urlForQueryRecord: function(query) {
    let namespace = this.get('namespace');
    var type = query.isUsername ? 'username' : 'emailId';
    if (query.isUsername !== undefined) {
      delete query.isUsername;
    }
    return `${namespace}/${type}/availability`;
  }
});
