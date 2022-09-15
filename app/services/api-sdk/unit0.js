import Ember from 'ember';
import Unit0Adapter from 'gooru-web/adapters/unit0/unit0';
import Unit0Serializer from 'gooru-web/serializers/unit0/unit0';

export default Ember.Service.extend({
  unit0Adapter: null,

  unit0Serializer: null,

  init() {
    this.set(
      'unit0Adapter',
      Unit0Adapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'unit0Serializer',
      Unit0Serializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * @return {Promise} fetchUnit0 has the list of domains for the student
   **/
  fetchUnit0(params) {
    const service = this;
    return new Ember.RSVP.Promise(function(resolve) {
      service
        .get('unit0Adapter')
        .fetchUnit0(params)
        .then(
          function(responseData) {
            let unit0 = service
              .get('unit0Serializer')
              .normalizeUnit0(responseData);
            resolve(unit0);
          },
          function() {
            resolve([]);
          }
        );
    });
  }
});
