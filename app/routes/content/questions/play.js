import Ember from 'ember';
import { PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';

export default Ember.Route.extend({
  queryParams: {
    source: {
      refreshModel: true
    }
  },
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @requires service:api-sdk/course
   */
  questionService: Ember.inject.service('api-sdk/question'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  // -------------------------------------------------------------------------
  // Methods

  beforeModel: function() {
    // TODO: authenticate session with ember-simple-auth, if not send to log in
  },

  model: function(params) {
    var route = this;
    var isRGOsource = params.source
      ? params.source === PLAYER_EVENT_SOURCE.RGO
      : false;
    var question = this.get('questionService')
      .readQuestion(params.questionId)
      .then(function(question) {
        return route
          .get('profileService')
          .readUserProfile(question.owner)
          .then(function(owner) {
            question.set('owner', owner);
            return Ember.RSVP.resolve(question);
          });
      });
    return Ember.RSVP.hash({
      question: question,
      isRGOsource: isRGOsource
    });
  },

  setupController(controller, model) {
    controller.set('question', model.question);
    controller.set('isRGOsource', model.isRGOsource);
  }
});
