import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import {
  CLASS_SKYLINE_INITIAL_DESTINATION,
  CONTENT_TYPES,
  PLAYER_EVENT_MESSAGE,
  ROLES,
  DIAGNOSTIC_LESSON_SUGGESTION_EVENTS,
  DEPENDENT_LESSON_SUGGESTION_EVENTS
} from 'gooru-web/config/config';

export default Ember.Route.extend(PrivateRouteMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  queryParams: {
    collectionId: {
      refreshModel: true
    }
  },

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

  /**
   * @property {Ember.Service} Service to retrieve an assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {Ember.Service} Service to retrieve a collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  offlineActivityService: Ember.inject.service(
    'api-sdk/offline-activity/offline-activity'
  ),

  /**
   * @type {UnitService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {UnitService} Service to retrieve unit information
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * @type {LessonService} Service to retrieve lesson information
   */
  lessonService: Ember.inject.service('api-sdk/lesson'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {SkylineInitialService} Service to retrieve skyline initial service
   */
  skylineInitialService: Ember.inject.service('api-sdk/skyline-initial'),

  /**
   * @type {reportService} Service to retrieve report information
   */
  reportService: Ember.inject.service('api-sdk/report'),

  learningToolService: Ember.inject.service('api-sdk/learning-tools'),

  // -------------------------------------------------------------------------
  // Methods

  beforeModel(transition) {
    this._super(...arguments);
    if (!this.get('session.isAnonymous')) {
      const queryParams = transition.queryParams;
      if (queryParams && queryParams.classId) {
        return this.doCheckClassDestination(queryParams.classId);
      }
    }
  },

  model: function(params) {
    const route = this;
    window.currentlyPlayingClass = null;
    return route
      .get('navigateMapService')
      .getMapLocation(params)
      .then(function(mapLocation) {
        const courseId = mapLocation.get('context.courseId');
        const unitId = mapLocation.get('context.unitId');
        const lessonId = mapLocation.get('context.lessonId');
        params.collectionId =
          params.collectionId ||
          mapLocation.get('context.itemId') ||
          mapLocation.get('context.collectionId');
        //override the context if next API return's any collection suggestions

        const lessonSuggestionStates = [
          ...Object.values(DIAGNOSTIC_LESSON_SUGGESTION_EVENTS),
          ...Object.values(DEPENDENT_LESSON_SUGGESTION_EVENTS)
        ];
        const isLessonSuggestion =
          lessonSuggestionStates.includes(mapLocation.get('context.status')) ||
          mapLocation.get('context.diagnostic') ||
          mapLocation.get('context.source');

        if (
          mapLocation.get('suggestions') &&
          mapLocation.get('suggestions').length > 0
        ) {
          const suggestions = mapLocation.get('suggestions')[0];
          params.collectionId = suggestions.get('id');
          params.type = suggestions.get('type');
        }
        const contentType = params.type;
        let timeSpentPromise = Ember.RSVP.Promise.resolve([]);
        if (params.classId && route.get('session.role') === ROLES.STUDENT) {
          let dataParam = {
            classId: params.classId,
            userId: route.get('session.userId'),
            to: moment().format('YYYY-MM-DD')
          };
          timeSpentPromise = route
            .get('reportService')
            .fetchStudentTimespentReport(dataParam);
        }

        return Ember.RSVP.hash({
          //loading breadcrumb information and navigation info
          course: !isLessonSuggestion
            ? route.get('courseService').fetchById(courseId)
            : null,
          unit: !isLessonSuggestion
            ? route.get('unitService').fetchById(courseId, unitId)
            : null,
          lesson: !isLessonSuggestion
            ? route.get('lessonService').fetchById(courseId, unitId, lessonId)
            : null,
          collection:
            contentType === CONTENT_TYPES.EXTERNAL_COLLECTION
              ? route
                .get('collectionService')
                .readExternalCollection(params.collectionId)
              : contentType === CONTENT_TYPES.OFFLINE_ACTIVITY
                ? route
                  .get('offlineActivityService')
                  .readActivity(params.collectionId)
                : route
                  .get('assessmentService')
                  .readExternalAssessment(params.collectionId),
          studentTimespentData: timeSpentPromise
        }).then(function(hash) {
          //setting query params using the map location
          params.type =
            params.type ||
            mapLocation.get('context.itemType') ||
            mapLocation.get('context.collectionType');
          params.classId = params.classId || mapLocation.get('context.classId');
          params.unitId = params.unitId || mapLocation.get('context.unitId');
          params.lessonId =
            params.lessonId || mapLocation.get('context.lessonId');
          params.pathId = params.pathId || mapLocation.get('context.pathId');
          params.collectionSubType =
            params.subtype || mapLocation.get('context.collectionSubType');
          if (!isLessonSuggestion) {
            // Set the correct unit sequence number
            hash.course.children.find((child, index) => {
              let found = false;
              if (child.get('id') === hash.unit.get('id')) {
                found = true;
                hash.unit.set('sequence', index + 1);
              }
              return found;
            });

            // Set the correct lesson sequence number
            hash.unit.children.find((child, index) => {
              let found = false;
              if (child.get('id') === hash.lesson.get('id')) {
                found = true;
                hash.lesson.set('sequence', index + 1);
              }
              return found;
            });
          }

          let collection = hash.collection;
          let learningToolId = collection.get('learningToolId')
            ? collection.get('learningToolId')
            : null;
          return Ember.RSVP.hash({
            toolDetails: learningToolId
              ? route
                .get('learningToolService')
                .getLearningToolInformation(learningToolId)
              : null
          }).then(({ toolDetails }) => {
            return Ember.RSVP.hash({
              course: hash.course,
              unit: hash.unit,
              lesson: hash.lesson,
              collection: collection,
              mapLocation,
              collectionId: params.collectionId,
              type: params.type,
              studentTimespentData: hash.studentTimespentData,
              toolDetails,
              isLUContent: !!learningToolId
            });
          });
        });
      });
  },

  setupController(controller, model) {
    window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_LOADING_COMPLETED, '*');
    window.currentlyPlayingClass = this.get('class');
    this._super(...arguments);
    const isAnonymous = model.isAnonymous;
    const mapLocation = model.mapLocation;
    const isLUContent = model.isLUContent;
    controller.setProperties({
      course: model.course,
      unit: model.unit,
      lesson: model.lesson,
      collection: model.collection,
      showConfirmation:
        model.collection &&
        !(model.collection.get('isCollection') || isAnonymous), //TODO: move to computed
      mapLocation: model.mapLocation,
      classId: mapLocation.get('context.classId'),
      //setting query params variables using the map location
      unitId: mapLocation.get('context.unitId'),
      lessonId: mapLocation.get('context.lessonId'),
      collectionId: model.collectionId,
      type: model.type,
      content: mapLocation.content,
      class: this.get('class'),
      studentTimespentData: model.studentTimespentData,
      toolDetails: model.toolDetails,
      isLUContent: isLUContent
    });
    //calling to controllers method
    controller.fetchActivityFeedbackCateory();
    controller.initial();
    if (isLUContent) {
      controller.LUContentURLGeneration();
    }
  },

  deactivate: function() {
    this.get('controller').resetValues();
  },

  resetController(controller) {
    controller.set('isShowOaLandingPage', true);
  },

  doCheckClassDestination(classId) {
    const route = this;
    const classPromise = classId
      ? route.get('classService').readClassInfo(classId)
      : Ember.RSVP.resolve({});
    return classPromise.then(function(classData) {
      route.set('class', classData);
      if (route.findClassIsPermium(classData)) {
        return route
          .get('skylineInitialService')
          .fetchState(classId)
          .then(skylineInitialState => {
            let destination = skylineInitialState.get('destination');
            if (
              destination ===
              CLASS_SKYLINE_INITIAL_DESTINATION.classSetupInComplete
            ) {
              return route.transitionTo(
                'student.class.setup-in-complete',
                classId
              );
            } else if (
              destination ===
                CLASS_SKYLINE_INITIAL_DESTINATION.showDirections ||
              destination === CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress
            ) {
              return route.transitionTo('student.class.proficiency', classId);
            } else if (
              destination === CLASS_SKYLINE_INITIAL_DESTINATION.diagnosticPlay
            ) {
              return route.transitionTo(
                'student.class.diagnosis-of-knowledge',
                classId
              );
            }
          });
      }
    });
  },

  /**
   * Method used to identify course is permium or not
   * @return {Boolean}
   */
  findClassIsPermium(aClass) {
    let setting = aClass.get('setting');
    let isPremiumCourse = setting ? setting['course.premium'] : false;
    return isPremiumCourse;
  }
});
