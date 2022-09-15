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
   * @requires service:api-sdk/resource
   */
  resourceService: Ember.inject.service('api-sdk/resource'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  //-------------------------------------------------------------------------
  // Methods

  beforeModel: function() {
    // TODO: authenticate session with ember-simple-auth, if not send to log in
  },

  model: function(params) {
    var route = this;
    var isRGOsource = params.source
      ? params.source === PLAYER_EVENT_SOURCE.RGO
      : false;
    var resource = this.get('resourceService')
      .readResource(params.resourceId)
      .then(function(resource) {
        return route
          .get('profileService')
          .readUserProfile(resource.owner)
          .then(function(owner) {
            resource.set('owner', owner);
            return Ember.RSVP.resolve(resource);
          });
      });

    return Ember.RSVP.hash({
      resource: resource,
      isRGOsource: isRGOsource
    });
  },

  setupController(controller, model) {
    controller.set('resource', model.resource);
    controller.set('isRGOsource', model.isRGOsource);
  }
});
