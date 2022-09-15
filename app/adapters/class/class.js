import ApplicationAdapter from '../application';

export default ApplicationAdapter.extend({
  /**
   * @property {string} End-point URI
   */
  namespace: '/gooruapi/rest/v3/class',

  /**
   * Builds the end-point URL for the queryRecord queryParam
   * @param query
   * @returns {string}
   */
  urlForQuery: function(query) {
    let namespace = this.get('namespace');
    let type = query.isStudent ? 'study' : 'teach';

    delete query.isStudent;

    return `${namespace}/${type}`;
  }
});
