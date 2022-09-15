import Ember from 'ember';
import LaunchAdapter from 'gooru-web/adapters/launch';

export default Ember.Service.extend({
  launchAdapter: null,

  init: function() {
    this._super(...arguments);
    this.set(
      'launchAdapter',
      LaunchAdapter.create(Ember.getOwner(this).ownerInjection())
    );
  },

  initiateLtiTool: function(toolDetails, resourceId) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve, reject) {
      service
        .get('launchAdapter')
        .initiateLtiTool(toolDetails, resourceId)
        .then(
          function(response) {
            resolve(response);
          },
          function(error) {
            reject(error);
          }
        );
    });
  }
});
