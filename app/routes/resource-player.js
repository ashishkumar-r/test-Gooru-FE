import Ember from 'ember';
import QuizzesResourcePlayer from 'quizzes-addon/routes/resource-player';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import { ROLES } from 'gooru-web/config/config';

/**
 * Study Player Route
 *
 * The context player route extends the player route to provide the study player
 * controller with additional information available only to signed-in users
 *
 * @module
 * @extends PlayerRoute
 */
export default QuizzesResourcePlayer.extend(PrivateRouteMixin, {
  templateName: 'resource-player',

  /**
   * @type {SessionService} Service to retrieve session information
   */
  session: Ember.inject.service('session'),

  /**
   * @property {NavigateMapService}
   */
  navigateMapService: Ember.inject.service('api-sdk/navigate-map'),

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
   * @type {AssessmentService} Service to retrieve assessment information
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @type {CollectionService} Service to retrieve collection information
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * When the next button is clicked
     */
    onNext: function() {
      let controller = this.get('controller');
      let queryParams = {
        role: ROLES.STUDENT,
        source: controller.get('source')
      };
      let classId = controller.get('classId');
      if (classId) {
        queryParams.classId = classId;
      }
      const navigateMapService = this.get('navigateMapService');
      navigateMapService
        .getStoredNext()
        .then(mapLocation => navigateMapService.next(mapLocation.context))
        .then(mapLocation => {
          let status = (mapLocation.get('context.status') || '').toLowerCase();
          if (status === 'done') {
            controller.set('isDone', true);
          } else {
            this.transitionTo('study-player', controller.get('course.id'), {
              queryParams
            });
          }
        });
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @param {{ collectionId: string, resourceId: string }} params
   */
  model(params) {
    const route = this;
    const { classId, courseId, collectionUrl, isIframeMode } = params;
    const navigateMapService = this.get('navigateMapService');
    return navigateMapService.getMapLocation(params).then(currentContext => {
      const unitId = currentContext.get('context.unitId');
      const lessonId = currentContext.get('context.lessonId');
      const collectionId = currentContext.get('context.collectionId');
      const collectionType =
        currentContext.get('context.collectionType') ||
        currentContext.get('context.itemType');
      params.unitId = unitId;
      params.lessonId = lessonId;
      params.collectionId = collectionId;
      params.pathId = currentContext.get('context.pathId');
      params.sourceUrl = location.host;
      params.partnerId = this.get('session.partnerId');
      params.tenantId = this.get('session.tenantId');
      params.ctxPathType = currentContext.get('context.ctxPathType');
      const ctxPathType = params.ctxPathType;

      return Ember.RSVP.hash({
        //loading breadcrumb information and navigation info
        course: route.get('courseService').fetchById(courseId),
        unit:
          ctxPathType && ctxPathType !== 'route0'
            ? route.get('unitService').fetchById(courseId, unitId)
            : null,
        lesson:
          ctxPathType && ctxPathType !== 'route0'
            ? route.get('lessonService').fetchById(courseId, unitId, lessonId)
            : null,
        collection: this.loadCollection(collectionId, collectionType)
      }).then(hash => {
        // Set the correct unit sequence number
        hash.course.children.find((child, index) => {
          let found = false;
          if (hash.unit) {
            if (child.get('id') === hash.unit.get('id')) {
              found = true;
              hash.unit.set('sequence', index + 1);
            }
          }

          return found;
        });

        // Set the correct lesson sequence number
        if (hash.unit) {
          hash.unit.children.find((child, index) => {
            let found = false;
            if (child.get('id') === hash.lesson.get('id')) {
              found = true;
              hash.lesson.set('sequence', index + 1);
            }
            return found;
          });
        }

        let { course, unit, lesson, collection } = hash;
        return this.quizzesModel(params).then(quizzesModel =>
          Object.assign(quizzesModel, {
            course,
            unit,
            lesson,
            collection,
            classId,
            collectionUrl,
            isIframeMode
          })
        );
      });
    });
  },

  setupController(controller, model) {
    controller.setProperties({
      course: model.course,
      unit: model.unit,
      lesson: model.lesson,
      classId: model.classId,
      collection: model.collection,
      collectionUrl: model.collectionUrl,
      isIframeMode: model.isIframeMode
    });
    this._super(...arguments);
  },

  loadCollection: function(collectionId, type) {
    const route = this;
    const isCollection = type === 'collection';
    const isAssessment = type === 'assessment';
    const loadAssessment = !type || isAssessment;
    const loadCollection = !type || isCollection;

    return Ember.RSVP.hashSettled({
      assessment: loadAssessment
        ? route.get('assessmentService').readAssessment(collectionId)
        : false,
      collection: loadCollection
        ? route.get('collectionService').readCollection(collectionId)
        : false
    }).then(function(hash) {
      let collectionFound =
        hash.assessment.state === 'rejected' || hash.assessment.value === false;
      return collectionFound
        ? hash.collection.value
          ? hash.collection.value.toPlayerCollection()
          : undefined
        : hash.assessment.value
          ? hash.assessment.value.toPlayerCollection()
          : undefined;
    });
  }
});
