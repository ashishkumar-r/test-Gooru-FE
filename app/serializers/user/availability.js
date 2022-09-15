import DS from 'ember-data';

export default DS.JSONAPISerializer.extend({
  normalizeSingleResponse: function(store, primaryModelClass, payload) {
    var availabilityModel = {
      data: {
        id: payload.gooruUId ? payload.gooruUId : '_availability_',
        type: 'user/availability',
        attributes: {
          confirmStatus: payload.confirmStatus,
          collaboratorCheck: payload.collaboratorCheck,
          availability: payload.availability
        }
      }
    };
    store.push(availabilityModel);

    return availabilityModel;
  }
});
