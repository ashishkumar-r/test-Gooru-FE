import Ember from 'ember';

export default Ember.Route.extend({
  // --------------------------------------------------------
  // Dependencies

  queryParams: {
    selectedItem: {
      refreshModel: true
    }
  },

  // -----------------------------------------------------------------
  // Hooks
  model(params) {
    let route = this;
    const activeComponent = params.selectedItem
      ? params.selectedItem
      : 'milestone';
    let currentClass = route.modelFor('teacher.class').class;
    return {
      currentClass,
      activeComponent
    };
  },

  setupController(controller, model) {
    controller.set('currentClass', model.currentClass);
    controller.set('activeComponent', model.activeComponent);
  }
});
