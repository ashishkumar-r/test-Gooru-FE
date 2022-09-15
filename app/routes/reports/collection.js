import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import ContextMixin from 'gooru-web/mixins/quizzes/context';
import QuizzesReport from 'quizzes-addon/routes/reports/context';
import { GO_LIVE_EVENT_MESSAGE } from 'gooru-web/config/config';
/**
 * Route for collection/assessment report
 *
 * Gathers and passes initialization data for class performance
 * from analytics to the controller
 *
 * @module
 * @augments ember/Route
 */
export default QuizzesReport.extend(PrivateRouteMixin, ContextMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  tourService: Ember.inject.service('tours'),

  collectionService: Ember.inject.service('api-sdk/collection'),

  assessmentService: Ember.inject.service('api-sdk/assessment'),

  classService: Ember.inject.service('api-sdk/class'),

  queryParams: {
    isClassActivity: false,
    isCourseMap: false,
    avgScoreData: null
  },

  queryParamsList: null,

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    navigateBack: function() {
      var route = !this.get('history.lastRoute.name')
        ? 'index'
        : this.get('history.lastRoute.url');
      var isClassActivity = this.get('queryParamsList.isClassActivity');
      var isCourseMap = this.get('queryParamsList.isCourseMap');
      if (isClassActivity === 'true' || isCourseMap === 'true') {
        const message = {
          data: GO_LIVE_EVENT_MESSAGE.CLOSE_GO_LIVE_PULLUP
        };
        window.parent.postMessage(message, window.location.origin);
      } else {
        this.transitionTo(route);
      }
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    const route = this;
    const collectionId = params.collectionId;
    const classId = params.classId;
    const anonymous = params.anonymous;
    let collection;
    let collectionType = params.collectionType;
    route.set('queryParamsList', params);

    // Get initialization data from analytics

    let collectionPromise;
    if (
      collectionType === 'assessment' ||
      collectionType === 'assessment-external'
    ) {
      collectionPromise = route
        .get('assessmentService')
        .readAssessment(collectionId);
    } else {
      collectionPromise = route
        .get('collectionService')
        .readCollection(collectionId);
    }

    let classPromise = Ember.RSVP.resolve({});

    if (!route.get('session.isAnonymous')) {
      if (params && params.classId) {
        classPromise = route.get('classService').readClassInfo(classId);
      }
    }

    return collectionPromise
      .then(function(assessment) {
        collection = assessment;
        return route.createContext(params, collection, true);
      })
      .then(function({ id }) {
        params.type = collection.get('collectionType');
        params.contextId = id;
        params.anonymous = anonymous;
        return route.get('classService').readClassMembers(classId);
      })
      .then(classMembers => {
        params.students = classMembers.members;
        return classPromise.then(function(classData) {
          params.currentClass = classData;
          return route.quizzesModel(params).then(model =>
            Object.assign(model, {
              classId
            })
          );
        });
      });
  },

  setupController: function(controller, model) {
    this._super(...arguments);
    controller.set('classId', model.classId);
  }
});
