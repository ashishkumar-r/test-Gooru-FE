import Ember from 'ember';
import OfflineActivitySerializer from 'gooru-web/serializers/offline-activity/offline-activity';
import OAAnaltyicsAdapter from 'gooru-web/adapters/offline-activity/oa-analytics';
export default Ember.Service.extend({
  /**
   * @property {oaAnaltyicsAdapter} oaAnaltyicsAdapter
   */
  oaAnaltyicsAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'offlineActivitySerializer',
      OfflineActivitySerializer.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'oaAnaltyicsAdapter',
      OAAnaltyicsAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Get the list of OA with the count of students, that the teacher needs to grade for a given class
   * @param {string} classId
   * @param {string} userId
   * @returns {Object}
   */
  getOAToGrade(classId, userId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('oaAnaltyicsAdapter')
        .getOAToGrade(classId, userId)
        .then(function(payload) {
          const oaGradeItems = service
            .get('offlineActivitySerializer')
            .normalizeOAGradeItems(payload);
          resolve(oaGradeItems);
        }, reject);
    });
  },

  /**
   * Get the list of Students to-be graded for a given Offline Activity
   * @param {string} classId
   * @param {string} activityId
   * @returns {Object}
   */
  getStudentListToGrade(classId, activityId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('oaAnaltyicsAdapter')
        .getStudentListToGrade(classId, activityId)
        .then(function(payload) {
          const oaGradeItems = service
            .get('offlineActivitySerializer')
            .normalizeStudentsForActivity(payload);
          resolve(oaGradeItems);
        }, reject);
    });
  },

  /**
   * Get the list of Students to-be graded for a given Offline Activity
   * @param {string} classId
   * @param {string} activityId
   * @returns {Object}
   */
  getSubmissionsToGrade(classId, activityId, studentId, dataParam = undefined) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('oaAnaltyicsAdapter')
        .getSubmissionsToGrade(classId, activityId, studentId, dataParam)
        .then(function(payload) {
          const oaSubmitedData = service
            .get('offlineActivitySerializer')
            .normalizeSubmissionGrade(payload);
          resolve(oaSubmitedData);
        }, reject);
    });
  },

  submitOAGrade(userGrade) {
    let data = this.get('offlineActivitySerializer').serializeRubricGrades(
      userGrade
    );
    return this.get('oaAnaltyicsAdapter').submitOAGrade(data);
  },

  /**
   * @function getOaCompletedStudents
   * @param {UUID} classId
   * @param {UUID} oaId
   * @param {UUID} itemId CA content ID
   */
  getOaCompletedStudents(
    classId,
    oaId,
    itemId = undefined,
    dataParam = undefined
  ) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('oaAnaltyicsAdapter')
        .getOaCompletedStudents(classId, oaId, itemId, dataParam)
        .then(function(payload) {
          resolve(
            service
              .get('offlineActivitySerializer')
              .serializeOaCompletedStudents(payload)
          );
        }, reject);
    });
  }
});
