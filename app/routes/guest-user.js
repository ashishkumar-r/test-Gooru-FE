import Ember from 'ember';
export default Ember.Route.extend({
  queryParams: {
    redirecturi: {
      refreshModel: true
    }
  },
  model(params) {
    return params;
  },
  setupController: function(controller, model) {
    model.userType =
      model.userType === 'student' || model.userType === 'teacher'
        ? model.userType
        : 'student';

    let url = model.redirecturi ? model.redirecturi : null;
    controller.get('guestController').send('authenticate', model.userType, url);
  }
});
