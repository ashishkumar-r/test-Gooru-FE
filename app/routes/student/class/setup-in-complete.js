import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import { CLASS_SKYLINE_INITIAL_DESTINATION } from 'gooru-web/config/config';

export default Ember.Route.extend(PrivateRouteMixin, {
  // -------------------------------------------------------------------------
  // Methods

  beforeModel() {
    const route = this;
    let skylineInitialState = route.modelFor('student.class')
      .skylineInitialState;
    let destination = skylineInitialState.get('destination');
    if (destination === CLASS_SKYLINE_INITIAL_DESTINATION.courseMap) {
      return route.transitionTo('student.class.course-map');
    } else if (
      destination === CLASS_SKYLINE_INITIAL_DESTINATION.diagnosticPlay
    ) {
      return route.transitionTo('student.class.diagnosis-of-knowledge');
    } else if (
      destination === CLASS_SKYLINE_INITIAL_DESTINATION.showDirections ||
      destination === CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress
    ) {
      return route.transitionTo('student.class.proficiency');
    }
  }
});
