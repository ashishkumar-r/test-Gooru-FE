import ApplicationAdapter from '../application';

export default ApplicationAdapter.extend({
  /**
   * @property {string} End-point URI
   */
  namespace: '/gooruapi/rest/v2',

  /**
   * Builds the end-point URL for the findRecord queryParam, params are optional
   * @param modelName
   * @param id
   * @param snapshot
   * @returns {string}
   */

  urlForFindRecord: function(id) {
    let namespace = this.get('namespace');
    return `${namespace}/content/${id}/rating/star`;
  },
  /**
   * Builds the end-point URL for the createRecord queryParam
   * @param modelName
   * @param snapshot
   * @returns {string}
   */

  urlForCreateRecord: function() {
    let namespace = this.get('namespace');
    return `${namespace}/rating`;
  }
});
