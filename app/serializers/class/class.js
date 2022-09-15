import Ember from 'ember';
import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  /**
   * Normalize the response of a query request
   * @param store store
   * @param primaryModelClass model name
   * @param payload the response from the server
   * @returns {Object}
   */
  normalizeQueryResponse: function(store, primaryModelClass, payload) {
    var serializer = this;
    var classModel = { data: [] };
    var results = payload.searchResult;
    var hasResults = results && results.length > 0;

    if (hasResults) {
      results.forEach(function(result) {
        this.push(serializer.normalizeClass(result));
      }, classModel.data);
    }
    return classModel;
  },

  /**
   * Normalize the response of a findRecord request
   * @param store store
   * @param primaryModelClass model name
   * @param payload the response from the server
   * @returns {Object}
   */
  normalizeFindRecordResponse: function(store, primaryModelClass, payload) {
    return { data: this.normalizeClass(payload) };
  },

  /**
   * Normalize a single class payload
   * @param payload is a single class payload
   * @returns {Object}
   */
  normalizeClass: function(payload) {
    return {
      id: payload.classUid,
      type: 'class/class',
      attributes: {
        name: payload.name,
        code: payload.classCode,
        subject: 'Math',
        // TODO: These four properties have harcoded values until endpoint is ready to provide us this data.
        greetings:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
        description:
          'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        startDate: '9.2.2015',
        endDate: '12.15.2015',
        grades: payload.grades,
        visibility: payload.visibility,
        course: payload.courseGooruOid,
        totalMembers: payload.memberCount,
        teachers: this.normalizeTeachers(Ember.A([payload.user]))
      }
    };
  },

  /**
   * Normalize an array of teachers payload
   * @param payload the teachers payload
   * @returns {Object[]}
   */
  normalizeTeachers: function(payload) {
    var result = Ember.A([]);
    payload.forEach(function(teacher) {
      this.push({
        id: teacher.gooruUId,
        username: teacher.username,
        avatarUrl: teacher.profileImageUrl
      });
    }, result);
    return result;
  }
});
