import ApplicationAdapter from '../application';
import Ember from 'ember';

export default ApplicationAdapter.extend({
  /**
   * @property {string} End-point URI
   */
  namespace: '/api/nucleus-insights/v2',
  //namespace: '/mocked-api/api/nucleus-insights/v2',

  headers: Ember.computed('session.token-api3', function() {
    return {
      Authorization: `Token ${this.get('session.token-api3')}`
    };
  }),

  /**
   * Builds the end-point URL for the queryRecord queryParam
   * Given a Content ID, User ID and Collection Type, returns performance data of each resource/question in Content
   * @param query
   * @returns {string}
   */
  queryRecord: function(query) {
    const options = {
      type: 'GET',
      dataType: 'json',
      headers: this.get('headers'),
      data: {}
    };
    const namespace = this.get('namespace');
    const contentId = query.contentId;
    const collectionType = query.collectionType;
    const unitId = query.unitId;
    const lessonId = query.lessonId;
    const userId = query.userId;
    const classId = query.classId;
    const courseId = query.courseId;
    const sessionId = query.sessionId;
    const pathId = query.pathId;

    delete query.classId;
    delete query.courseId;
    delete query.unitId;
    delete query.lessonId;
    delete query.contentId;
    delete query.collectionType;
    delete query.userId;
    delete query.sessionId;
    delete query.pathId;
    //If there is a session opened we are going to  use only the sessionId to get the data
    let queryParams = pathId
      ? `classGooruId=${classId}&pathId=${pathId}`
      : sessionId
        ? `sessionId=${sessionId}`
        : classId
          ? `classGooruId=${classId}&courseGooruId=${courseId}&unitGooruId=${unitId}&lessonGooruId=${lessonId}`
          : '';

    return Ember.$.ajax(
      `${namespace}/${collectionType}/${contentId}/user/${userId}?${queryParams}`,
      options
    );
  }
});
