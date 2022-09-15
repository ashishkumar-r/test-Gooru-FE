import Ember from 'ember';
import {
  flattenGutToFwCompetency,
  flattenGutToFwDomain
} from 'gooru-web/utils/taxonomy';
export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Attributes

  queryParams: {
    classId: {
      refreshModel: true
    },
    courseId: {
      refreshModel: true
    },
    role: {
      refreshModel: true
    },
    contextId: {
      refreshModel: true
    },
    source: null,
    unitId: null,
    lessonId: null,
    pathId: null,
    ctxPathId: null,
    pathType: null,
    ctxPathType: null,
    milestoneId: null,
    collectionId: null,
    isIframeMode: false
  },
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  /**
   * Competency service dependency injection
   * @type {Object}
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  model: function(params) {
    let route = this;
    route._super(...arguments);
    let studentId = params.userId;
    const classId = params.classId;
    const courseId = params.courseId;
    const contextId = params.contextId || null;
    const isIframeMode = params.isIframeMode;
    return route
      .get('classService')
      .readClassInfo(classId)
      .then(aClass => {
        const frameworkId = aClass.get('preference.framework');
        const subjectId = aClass.get('preference.subject');
        let crossWalkFWCPromise = null;
        if (frameworkId && subjectId) {
          crossWalkFWCPromise = route
            .get('taxonomyService')
            .fetchCrossWalkFWC(frameworkId, subjectId);
        }
        return Ember.RSVP.hash({
          profilePromise: route
            .get('profileService')
            .readUserProfile(studentId),
          coursePromise: route.get('courseService').fetchById(courseId),
          taxonomyCategories: route.get('taxonomyService').getCategories(),
          mapLocation: route.get('navigateMapService').getMapLocation(params),
          userPreference: route.get('profileService').getProfilePreference(),
          crossWalkFWC: crossWalkFWCPromise
        }).then(function(hash) {
          return Ember.Object.create({
            profile: hash.profilePromise,
            categories: hash.taxonomyCategories,
            class: aClass,
            course: hash.coursePromise,
            mapLocation: hash.mapLocation,
            userPreference: hash.userPreference,
            crossWalkFWC: hash.crossWalkFWC,
            contextId,
            isIframeMode
          });
        });
      });
  },

  setupController(controller, model) {
    controller.set('studentProfile', model.get('profile'));
    controller.set('class', model.get('class'));
    controller.set('course', model.get('course'));
    controller.set('taxonomyCategories', model.get('categories'));
    controller.set('mapLocation', model.get('mapLocation'));
    controller.set(
      'userStandardPreference',
      model.get('userPreference.standard_preference')
    );
    controller.set('contextId', model.get('contextId'));
    controller.set('isIframeMode', model.get('isIframeMode'));
    if (model.crossWalkFWC) {
      controller.set(
        'fwCompetencies',
        flattenGutToFwCompetency(model.crossWalkFWC)
      );
      controller.set('fwDomains', flattenGutToFwDomain(model.crossWalkFWC));
    }
    controller.loadData();
  },
  resetController(controller) {
    controller.set('showDomainInfo', false);
    controller.set('showCompetencyInfo', false);
    controller.set('selectedCompetency', null);
    controller.set('mapLocation', null);
    controller.set('source', null);
  }
});
