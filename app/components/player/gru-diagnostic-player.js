import Ember from 'ember';
import { getObjectCopy } from 'gooru-web/utils/utils';

export default Ember.Component.extend({
  // ------------------------------------------------------------------
  // Attributes

  classNames: ['gru-diagnostic-player'],

  // -------------------------------------------------------------------
  // Dependencies

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  // -------------------------------------------------------------------
  // Properties

  milestones: Ember.A(),

  class: null,

  preference: Ember.computed('class', function() {
    return this.get('class.preference');
  }),

  mapLocation: null,

  diagnosticDetails: Ember.computed('mapLocation.context', function() {
    return this.get('mapLocation.context.diagnostic') || null;
  }),

  isDiagnosticEnd: false,

  contentVisibility: null,

  isFailed: false,

  isPathLoading: false,

  hideLandingText: false,

  endObserver: Ember.observer('isDiagnosticEnd', function() {
    let component = this;
    let routerCheckLooper = component.get('routerCheckLooper');
    if (component.get('isDiagnosticEnd') && !routerCheckLooper) {
      component.set(
        'routerCheckLooper',
        setInterval(() => component.checkRouterPath(component), 5000)
      );
    }
  }),

  routerCheckLooper: null,

  loopingCount: 0,

  currentClass: null,

  // ------------------------------------------------------------------
  // Hooks

  didInsertElement() {
    this.disableConfirmText();
  },

  didDestroyElement() {
    clearInterval(this.get('routerCheckLooper'));
  },

  // -------------------------------------------------------------------
  // Methods

  fetchMilestoneDetails() {
    let component = this;
    component.set('isLoading', true);
    const classId = component.get('class.id');

    Ember.RSVP.hash({
      members: component.get('classService').readClassMembers(classId),
      contentVisibility: component
        .get('classService')
        .readClassContentVisibility(classId)
    }).then(({ members, contentVisibility }) => {
      component.set('isLoading', false);
      component.set('contentVisibility', contentVisibility);
      let aClass = getObjectCopy(component.get('class'));
      aClass.set('memberGradeBounds', members.memberGradeBounds);
      component.set('currentClass', aClass);
    });
  },

  checkRouterPath(component) {
    if (!component.get('isDestroyed')) {
      if (component.get('loopingCount') <= 3) {
        component.incrementProperty('loopingCount');
        component.set('isPathLoading', true);
        const navigateMapService = component.get('navigateMapService');
        const diagnostic = component.get('diagnosticDetails') || {};
        const params = {
          sessionId: diagnostic.session_id
        };
        navigateMapService.generateStudentRoute(params).then(result => {
          if (result.status === 'complete') {
            component.set('isPathLoading', false);
            component.fetchMilestoneDetails();
            clearInterval(component.get('routerCheckLooper'));
          } else if (result.status === 'failed') {
            component.set('isFailed', true);
            clearInterval(component.get('routerCheckLooper'));
          }
        });
      } else {
        component.set('isFailed', true);
        component.set('isPathLoading', false);
        clearInterval(component.get('routerCheckLooper'));
      }
    }
  },

  disableConfirmText() {
    const component = this;
    setTimeout(() => {
      component.set('hideLandingText', true);
    }, 5000);
  }
});
