import Ember from 'ember';

export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/course
   */
  rubricService: Ember.inject.service('api-sdk/rubric'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    var route = this;
    var rubric = this.get('rubricService')
      .getRubric(params.rubricId)
      .then(function(rubric) {
        return route
          .get('profileService')
          .readUserProfile(rubric.owner)
          .then(function(owner) {
            rubric.set('owner', owner);
            return Ember.RSVP.resolve(rubric);
          });
      });
    return Ember.RSVP.hash({
      rubric
    });
  },

  setupController(controller, model) {
    controller.set('rubric', model.rubric);
  }
});
