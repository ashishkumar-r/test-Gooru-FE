import Ember from 'ember';
import CollaboratorAdapter from 'gooru-web/adapters/collaborator/collaborator';

export default Ember.Service.extend({
  init: function() {
    this._super(...arguments);
    this.set(
      'collaboratorAdapter',
      CollaboratorAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * Updates collaborators for courses, collections, assessments
   * @param {string} id entity id
   * @param {string} type could be courses/collections/assessments
   * @param {number[]} userIds
   * @returns {Promise.<boolean>}
   */
  updateCollaborators: function(id, type, userIds) {
    var service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('collaboratorAdapter')
        .updateCollaborators(id, type, userIds)
        .then(function() {
          return resolve(true);
        }, reject);
    });
  },

  /**
   * Updates collaborators for courses
   * @param {string} id course id
   * @param {number[]} userIds
   * @returns {Promise.<boolean>}
   */
  updateCourseCollaborators: function(id, userIds) {
    return this.updateCollaborators(id, 'courses', userIds);
  },

  /**
   * Updates collaborators for collections
   * @param {string} id collection id
   * @param {number[]} userIds
   * @returns {Promise.<boolean>}
   */
  updateCollectionCollaborators: function(id, userIds) {
    return this.updateCollaborators(id, 'collections', userIds);
  },
  /**
   * Updates collaborators for assessments
   * @param {string} id course id
   * @param {number[]} userIds
   * @returns {Promise.<boolean>}
   */
  updateAssessmentCollaborators: function(id, userIds) {
    return this.updateCollaborators(id, 'assessments', userIds);
  }
});
