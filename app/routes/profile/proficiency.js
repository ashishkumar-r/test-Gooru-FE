import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(PrivateRouteMixin, UIHelperMixin, {
  setupController(controller) {
    controller.set('userId', controller.get('parentController.profile.id'));
    //Make the proficiency tab get selected
    controller.get('parentController').selectMenuItem('proficiency');
    controller.initialize();
  },

  resetController(controller) {
    controller.set('showProficiencyChart', false);
    controller.set('showPullOut', false);
  },
  model: function() {
    this.setTitle('Proficiency', null, true);
  }
});
