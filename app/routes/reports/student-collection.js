import Ember from 'ember';
import PublicRouteMixin from 'gooru-web/mixins/public-route-mixin';
import ContextMixin from 'gooru-web/mixins/quizzes/context';
import QuizzesReport from 'quizzes-addon/routes/reports/student-context';
import {
  ROLES,
  PLAYER_EVENT_MESSAGE,
  CONTENT_TYPES
} from 'gooru-web/config/config';

/**
 *
 * Analytics data for a student related to a collection of resources
 * Gathers and passes the necessary information to the controller
 *
 * @module
 * @augments ember/Route
 */
export default QuizzesReport.extend(PublicRouteMixin, ContextMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  /**
   * @property {AssessmentService} Service to retrieve an assessment
   */
  assessmentService: Ember.inject.service('api-sdk/assessment'),

  /**
   * @property {CollectionService} Service to retrieve a collection
   */
  collectionService: Ember.inject.service('api-sdk/collection'),

  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {reportService} Service to retrieve report information
   */
  reportService: Ember.inject.service('api-sdk/report'),

  /**
   * @type {AttemptService} attemptService
   * @property {Ember.Service} Service to send attempt related events
   */
  quizzesAttemptService: Ember.inject.service('quizzes/attempt'),

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    goBack: function() {
      const route = this;
      const controller = route.get('controller');
      let toRoute = controller.get('backUrl');
      toRoute = toRoute || 'index'; //index when refreshing the page, TODO fix
      route.transitionTo(toRoute);
    },
    closePlayer: function() {
      const route = this;
      const controller = route.get('controller');
      controller.set('isShowActivityFeedback', false);
      let isIframeMode = controller.get('isIframeMode');
      if (isIframeMode) {
        window.parent.postMessage(PLAYER_EVENT_MESSAGE.GRU_PUllUP_CLOSE, '*');
      }
    }
  },

  //--------------------------------------------------------------------------
  // Properties

  collectionObj: null,

  // -------------------------------------------------------------------------
  // Methods

  /**
   * @param {{ assessmentId: string, resourceId: string }} params
   */
  model(params) {
    return this.studentCollectionModel(params);
  },

  /**
   * @param {{ assessmentId: string, resourceId: string }} params
   */
  studentCollectionModel: function(params) {
    const route = this;
    const collectionId = params.collectionId;
    const contextId = params.contextId;
    const gooruUId = route.get('session.userData.gooruUId');
    const type = params.type;
    const role = params.role || ROLES.TEACHER;
    const classId = params.classId;

    const isCollection = type === 'collection';
    const isAssessment = type === 'assessment';

    const loadAssessment = !type || isAssessment;
    const loadCollection = !type || isCollection;

    let collection;
    let currentClass;
    let studentTimespentData;
    let totalAttempts;
    let contentVisibility;
    let timeSpentPromise = Ember.RSVP.Promise.resolve([]);
    if (classId && classId !== 'null') {
      const myId = route.get('session.userId');
      const dataParam = {
        classId: params.classId,
        userId: myId,
        to: moment().format('YYYY-MM-DD')
      };
      timeSpentPromise = route
        .get('reportService')
        .fetchStudentTimespentReport(dataParam);
    }

    return Ember.RSVP.hashSettled({
      classPromise:
        classId && classId !== 'null'
          ? route.get('classService').readClassInfo(classId)
          : null,
      membersPromise:
        classId && classId !== 'null'
          ? route.get('classService').readClassMembers(classId)
          : null,
      assessment: loadAssessment
        ? route.get('assessmentService').readAssessment(collectionId)
        : false,
      collection: loadCollection
        ? route.get('collectionService').readCollection(collectionId)
        : false,
      studentTimespentData: timeSpentPromise,
      totalAttempts: route
        .get('quizzesAttemptService')
        .getAttemptIds(contextId, gooruUId),
      visibilityPromise:
        classId && classId !== 'null' && params.courseId
          ? route.get('classService').readClassContentVisibility(classId)
          : null
    })
      .then(function(hash) {
        currentClass = hash.classPromise.value;
        const membersList = hash.membersPromise.value;
        if (currentClass) {
          currentClass.set(
            'memberGradeBounds',
            membersList ? membersList.memberGradeBounds : Ember.A()
          );
        }
        totalAttempts = hash.totalAttempts.value;
        studentTimespentData = hash.studentTimespentData.value;
        contentVisibility = hash.visibilityPromise.value;
        let collectionFound =
          hash.assessment.state === 'rejected' ||
          hash.assessment.value === false;
        collection = collectionFound
          ? hash.collection.value
          : hash.assessment.value;
        return contextId
          ? {
            id: contextId
          }
          : route.createContext(
            params,
            collection,
            params.role === ROLES.STUDENT
          );
      })
      .then(function({ id }) {
        params.profileId = route.get('session.userData.gooruUId');
        params.type = collection.get('collectionType');
        params.contextId = id;
        params.role = role;
        route.set('collectionObj', collection);
        route.set('currentClass', currentClass);
        route.set('totalAttempts', totalAttempts);
        route.set('studentTimespentData', studentTimespentData);
        route.set('contentVisibility', contentVisibility);
        params.thumbnailUrl = collection.get('thumbnailUrl');
        return route.quizzesModel(params);
      });
  },

  setupController(controller, model) {
    this._super(...arguments);
    if (model && model.collection) {
      let collectionObj = this.get('collectionObj');
      let collection = model.collection;
      collection.set('thumbnailUrl', collectionObj.get('thumbnailUrl'));
      controller.set('collection', collection);
      controller.set('collectionObj', collectionObj);
      controller.set('totalAttempts', this.get('totalAttempts'));
      controller.set('currentClass', this.get('currentClass'));
      controller.set('contentVisibility', this.get('contentVisibility'));
    }
    controller.set('studentTimespentData', this.get('studentTimespentData'));
    if (!this.get('session.isAnonymous')) {
      controller.fetchActivityFeedbackCateory();
    }
    let role = controller.get('role');
    let type = controller.get('type');
    let classId = controller.get('classId');
    controller.set('isStudent', role === ROLES.STUDENT);
    if (classId && classId === 'null') {
      controller.set('classId', null);
    }
    if (
      classId !== 'null' &&
      role === ROLES.STUDENT &&
      type === CONTENT_TYPES.ASSESSMENT
    ) {
      controller.findCompletionMinScore();
    }
  }
});
