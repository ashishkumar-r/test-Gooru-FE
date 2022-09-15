import Ember from 'ember';
import { getSubjectIdFromSubjectBucket } from 'gooru-web/utils/utils';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import { CLASS_SKYLINE_INITIAL_DESTINATION } from 'gooru-web/config/config';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(PrivateRouteMixin, UIHelperMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @property {Ember.Service} Service to retrieve an assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

  /**
   * @type {SkylineInitialService} Service to retrieve skyline initial service
   */
  skylineInitialService: Ember.inject.service('api-sdk/skyline-initial'),

  // -------------------------------------------------------------------------
  // Properties

  /**
   * Subject associated with the course
   * @type {String}
   */
  subject: Ember.computed.alias('course.subject'),

  /**
   * Extract subject code from subject
   * @return {String}
   */
  subjectCode: Ember.computed('subject', function() {
    if (this.get('subject')) {
      return getSubjectIdFromSubjectBucket(this.get('subject'));
    }
  }),

  // -------------------------------------------------------------------------
  // Methods

  beforeModel() {
    const route = this;
    let skylineInitialState = route.modelFor('student.class')
      .skylineInitialState;
    const currentClass = route.modelFor('student.class').class;
    const classId = currentClass.get('id');
    return route
      .get('skylineInitialService')
      .fetchState(classId)
      .then(skylineInitialStateRes => {
        skylineInitialState.set(
          'destination',
          skylineInitialStateRes.get('destination')
        );
        skylineInitialState.set(
          'context',
          skylineInitialStateRes.get('context')
        );
        route.set('skylineInitialState', skylineInitialState);
        let destination = skylineInitialState.get('destination');
        if (destination === CLASS_SKYLINE_INITIAL_DESTINATION.courseMap) {
          return route.transitionTo('student.class.course-map');
        } else if (
          destination === CLASS_SKYLINE_INITIAL_DESTINATION.classSetupInComplete
        ) {
          return route.transitionTo('student.class.setup-in-complete');
        } else if (
          destination === CLASS_SKYLINE_INITIAL_DESTINATION.showDirections ||
          destination === CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress
        ) {
          return route.transitionTo('student.class.proficiency');
        }
      });
  },

  model() {
    const route = this;
    const currentClass = route.modelFor('student.class').class;
    const studentClass = route.modelFor('student.class');
    Ember.set(studentClass, 'isDisableNavbar', true);
    route.setTitle('Diagnostic', currentClass.title);
    const course = route.modelFor('student.class').course;
    route.set('course', course);
    const subjectCode = route.get('subjectCode');
    let skylineInitialState = route.modelFor('student.class')
      .skylineInitialState;
    let diagnosticId = skylineInitialState.get('context.diagnosticId');
    return Ember.RSVP.hash({
      course: course,
      subject: route.get('taxonomyService').fetchSubject(subjectCode),
      assessment: route.get('assessmentService').readAssessment(diagnosticId),
      class: currentClass
    });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.set('class', model.class);
    controller.set('course', model.course);
    controller.set('subject', model.subject);
    controller.set('assessment', model.assessment);
  }
});
