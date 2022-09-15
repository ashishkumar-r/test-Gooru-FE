import Ember from 'ember';
import {
  ROLES,
  PLAYER_EVENT_SOURCE,
  CONTENT_TYPES
} from 'gooru-web/config/config';

export default Ember.Route.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  /**
   * @requires service:api-sdk/learner
   */
  learnerService: Ember.inject.service('api-sdk/learner'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Open the player with the specific collection/assessment
     *
     * @function actions:playItem
     * @param {string} unitId - Identifier for a unit
     * @param {string} lessonId - Identifier for lesson
     * @param {string} item - collection, assessment, lesson or resource
     */
    studyPlayer: function(type, unitId, lessonId, item) {
      const route = this;
      const currentCourse = route.modelFor('student.independent').course;
      const courseId = currentCourse.get('id');

      if (type === 'lesson') {
        route.startLessonStudyPlayer(courseId, unitId, lessonId, item);
      } else if (type === 'resource') {
        route.startResourceStudyPlayer(null, courseId, item);
      } else {
        route.startCollectionStudyPlayer(courseId, unitId, lessonId, item);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Methods
  model: function() {
    const route = this;
    const userId = route.get('session.userId');
    const course = this.modelFor('student.independent').course;
    const units = course.get('children') || [];
    let userLocation = route
      .get('learnerService')
      .fetchLocationCourse(course.get('id'), userId);
    let unitList = route.fetchNonClassUnitPerformance(units);
    return Ember.RSVP.hash({
      course,
      unitList,
      userLocation
    });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    let userLocation = '';
    if (model.userLocation) {
      let unitId = model.userLocation.get('unitId');
      let lessonId = model.userLocation.get('lessonId');
      let collectionId = model.userLocation.get('collectionId');
      userLocation = `${unitId}+${lessonId}+${collectionId}`;
    }
    controller.set('userLocation', userLocation);
    controller.set('units', model.unitList);
    controller.set('course', model.course);
    controller.get('studentIndependentController').selectMenuItem('course-map');
    controller.init();
  },

  resetController(controller) {
    controller.set('tab', null);
  },

  /**
   * Navigates to collection
   * @param {string} courseId
   * @param {string} unitId
   * @param {string} lessonId
   * @param {Collection} collection
   */
  startCollectionStudyPlayer: function(courseId, unitId, lessonId, collection) {
    const route = this;
    let role = ROLES.STUDENT;
    let source = PLAYER_EVENT_SOURCE.INDEPENDENT_ACTIVITY;
    let collectionId = collection.get('id');
    let collectionType = collection.get('collectionType');
    let queryParams = {
      classId: null,
      unitId,
      lessonId,
      collectionId,
      role,
      source,
      type: collectionType,
      isIframeMode: true
    };

    this.get('navigateMapService')
      .startCollection(courseId, unitId, lessonId, collectionId, collectionType)
      .then(function() {
        route.controller.set(
          'playerUrl',
          route
            .get('router')
            .generate('study-player', courseId, { queryParams })
        );
        route.controller.set('isOpenPlayer', true);
        route.controller.set('playerContent', collection);
      });
  },

  /**
   * Navigates to the next lesson collection
   * @param {string} courseId
   * @param {string} unitId
   * @param {string} lessonId
   */
  startLessonStudyPlayer: function(courseId, unitId, lessonId, collection) {
    const route = this;
    const role = ROLES.STUDENT;
    const queryParams = {
      unitId,
      lessonId,
      role,
      source: PLAYER_EVENT_SOURCE.INDEPENDENT_ACTIVITY,
      isIframeMode: true
    };

    this.get('navigateMapService')
      .startLesson(courseId, unitId, lessonId)
      .then(function() {
        route.controller.set(
          'playerUrl',
          route
            .get('router')
            .generate('study-player', courseId, { queryParams })
        );
        route.controller.set('isOpenPlayer', true);
        route.controller.set('playerContent', collection);
      });
  },

  /**
   * Navigates to resourse
   * @param {string} classId
   * @param {string} courseId
   * @param {Resource} resource
   */
  startResourceStudyPlayer: function(classId, courseId, resource) {
    const route = this;
    let queryParams = {
      unitId: resource.get('unitId'),
      lessonId: resource.get('lessonId'),
      collectionId: resource.get('assessmentId'),
      source: PLAYER_EVENT_SOURCE.COURSE_MAP,
      pathId: resource.get('pathId')
    };
    route
      .get('navigateMapService')
      .startResource(
        courseId,
        queryParams.unitId,
        queryParams.lessonId,
        queryParams.collectionId,
        resource.get('id'),
        queryParams.pathId,
        classId
      )
      .then(function() {
        if (classId) {
          queryParams.classId = classId;
        }
        route.transitionTo('resource-player', courseId, resource.id, {
          queryParams
        });
      });
  },

  fetchNonClassUnitPerformance(units) {
    let route = this;
    const currentCourse = route.modelFor('student.independent').course;
    const courseId = currentCourse.get('id');
    return Ember.RSVP.hash({
      unitsPerformance: route
        .get('learnerService')
        .fetchPerformanceCourse(courseId, CONTENT_TYPES.ASSESSMENT)
    }).then(({ unitsPerformance }) => {
      return new Ember.RSVP.Promise(resolve => {
        resolve(route.renderUnitsPerformance(units, unitsPerformance));
      });
    });
  },

  renderUnitsPerformance(units, unitsPerformance) {
    let unitList = Ember.A([]);
    units.forEach(unit => {
      let unitCopy = unit.copy();
      let unitPerformance = unitsPerformance.findBy('unitId', unit.get('id'));
      unitCopy.set('performance', unitPerformance);
      unitList.pushObject(unitCopy);
    });
    return unitList;
  }
});
