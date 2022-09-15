import Ember from 'ember';
import ModalMixin from 'gooru-web/mixins/modal';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import ContextMixin from 'gooru-web/mixins/quizzes/context';
import QuizzesPlayer from 'quizzes-addon/routes/player';
import { ROLES, PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';

/**
 * @typedef { Ember.Route } PlayerRoute
 *
 * @module
 * @augments ember/Route
 */
export default QuizzesPlayer.extend(
  ModalMixin,
  ConfigurationMixin,
  ContextMixin,
  {
    templateName: 'player',

    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * @property {Ember.Service} Service to retrieve an assessment
     */
    assessmentService: Ember.inject.service('api-sdk/assessment'),
    /**
     * @type {ProfileService} Service to retrieve profile information
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * @property {Ember.Service} Service to retrieve a collection
     */
    collectionService: Ember.inject.service('api-sdk/collection'),
    /**
     * @property {Collection} carries a  new collection Object called from the service.
     */
    collectionObj: null,

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
     * @property {Ember.Service} session service
     */
    session: Ember.inject.service('session'),

    /**
     * @type {reportService} Service to retrieve report information
     */
    reportService: Ember.inject.service('api-sdk/report'),

    /**
     * @type {ClassService} Service to retrieve class information
     */
    classService: Ember.inject.service('api-sdk/class'),

    // -------------------------------------------------------------------------
    // Actions
    actions: {
      /**
       * When closing the player
       */
      onClosePlayer: function(transitionTo, courseId) {
        const route = this;
        const controller = route.get('controller');
        const classId = controller.get('classId');
        const $appContainer = Ember.$('.app-container');
        let locationToLoad = null;
        if ($appContainer.hasClass('navigator-on')) {
          $appContainer.removeClass('navigator-on');
        }

        if (transitionTo === 'coursemap' && classId) {
          //If classId available redirectTo course-map
          locationToLoad = `class/${classId}`;
        } else if (transitionTo === 'ILActivity' && courseId) {
          //If courseId is available redirectTo IL course-map
          locationToLoad = `course/${courseId}`;
        }

        if (locationToLoad) {
          window.location = `/student/${locationToLoad}/course-map`;
        } else {
          var redirectTo =
            transitionTo === 'ILActivity'
              ? 'student-independent-learning/studying'
              : !route.get('history.lastRoute.name')
                ? 'index'
                : route.get('history.lastRoute.url');

          let isPreviewReferrer = controller.get('isPreviewReferrer');
          if (
            isPreviewReferrer &&
            (isPreviewReferrer === true || isPreviewReferrer === 'true') &&
            redirectTo !== 'index'
          ) {
            redirectTo =
              redirectTo.indexOf('?') !== -1
                ? `${redirectTo}&isPreviewReferrer=true`
                : `${redirectTo}?isPreviewReferrer=true`;
            route.transitionTo(redirectTo);
          } else {
            if (route.get('session.role') === ROLES.TEACHER) {
              route.defaultTransitionToLibraryBasedOnType();
            } else if (route.get('session.role') === ROLES.STUDENT) {
              route.transitionTo('student-home');
            } else {
              const queryParams = {
                queryParams: { type: 'gooru-catalog' }
              };
              route.transitionTo('library-search', queryParams);
            }
          }
        }
      },

      /**
       * Action triggered to remix the collection
       */
      onRemixCollection: function() {
        let collection = this.get('collectionObj');
        if (this.get('session.isAnonymous')) {
          this.send('showModal', 'content.modals.gru-login-prompt');
        } else {
          var remixModel = {
            content: collection
          };
          if (collection.get('isCollection')) {
            this.send(
              'showModal',
              'content.modals.gru-collection-remix',
              remixModel
            );
          } else {
            this.send(
              'showModal',
              'content.modals.gru-assessment-remix',
              remixModel
            );
          }
        }
      },

      /**
       * When the submission is complete
       */
      onFinish: function() {
        let controller = this.get('controller');
        let source = controller.get('eventContext.source');
        if (source === PLAYER_EVENT_SOURCE.DIAGNOSTIC) {
          this.transitionTo(
            'student.class.proficiency',
            controller.get('classId')
          );
        } else {
          let queryParams = {
            collectionId: controller.get('collection.id'),
            type: controller.get('type'),
            role: controller.get('role'),
            classId: controller.get('classId'),
            contextId: controller.get('contextResult.contextId'),
            isIframeMode: controller.get('isIframeMode')
          };
          const reportController = this.controllerFor(
            'reports.student-collection'
          );
          //this doesn't work when refreshing the page, TODO
          reportController.set('backUrl', this.get('history.lastRoute.url'));
          let isIframe = controller.get('isIframeMode');
          if (isIframe) {
            Ember.$(document.body).addClass('iframe-panel');
          }
          this.transitionTo('reports.student-collection', {
            queryParams
          });
        }
      },

      startAssessment: function() {
        const controller = this.get('controller');
        controller.startAssessment();
      },

      /**
       * Navigates to the assessment report
       */
      navigateToReport: function() {
        const route = this;
        const controller = route.get('controller');
        let context = controller.get('context');
        let collection = controller.get('collection');
        const queryParams = {
          collectionId: context.get('collectionId'),
          userId: controller.get('session.userId'),
          type: collection.get('collectionType'),
          role: controller.get('role')
        };
        if (context.get('classId')) {
          queryParams.classId = context.get('classId');
        }
        if (context.get('courseId')) {
          queryParams.courseId = context.get('courseId');
          queryParams.unitId = context.get('unitId');
          queryParams.lessonId = context.get('lessonId');
        }

        const reportController = route.controllerFor(
          'reports.student-collection'
        );

        //this doesn't work when refreshing the page, TODO
        reportController.set('backUrl', route.get('history.lastRoute.url'));
        route.transitionTo('reports.student-collection', {
          queryParams: queryParams
        });
      },

      /**
       * On navigator remix collection button click
       * @param {Collection} collection
       */
      remixCollection: function(collection) {
        var remixModel = {
          content: collection
        };
        if (collection.get('isCollection')) {
          this.send(
            'showModal',
            'content.modals.gru-collection-remix',
            remixModel
          );
        } else {
          this.send(
            'showModal',
            'content.modals.gru-assessment-remix',
            remixModel
          );
        }
      }
    },

    // -------------------------------------------------------------------------
    // Properties

    // -------------------------------------------------------------------------
    // Methods

    /**
     * @param {{ collectionId: string, resourceId: string }} params
     */
    model(params) {
      return this.playerModel(params);
    },

    setupController(controller, model) {
      this._super(...arguments);
      const isAnonymous = model.isAnonymous;
      const isTeacher = this.get('profile.role') === ROLES.TEACHER;
      controller.set('isTeacher', isTeacher);
      controller.set('isAnonymous', isAnonymous);
      controller.set('class', this.get('classData'));
    },

    /**
     * Loads the player model
     * @param params
     * @returns {Promise.<TResult>}
     */
    playerModel: function(params) {
      const route = this;
      const userId = route.get('session.userId');
      if (userId !== 'anonymous') {
        route
          .get('profileService')
          .readUserProfile(userId)
          .then(function(updatedProfile) {
            route.set('profile', updatedProfile);
          });
      }
      if (!route.get('session.isAnonymous')) {
        if (params && params.classId) {
          const classPromise = params.classId
            ? route.get('classService').readClassInfo(params.classId)
            : Ember.RSVP.resolve({});
          classPromise.then(function(classData) {
            route.set('classData', classData);
          });
        }
      }
      const collectionId = params.collectionId;
      const type = params.type;
      const role = params.role || ROLES.TEACHER;
      params.lessonId =
        params.lessonId === 'undefined' ? null : params.lessonId;
      params.unitId = params.unitId === 'undefined' ? null : params.unitId; // Add more undefined to sanitize as required
      params.sourceUrl = location.host;
      params.partnerId = this.get('session.partnerId');
      params.tenantId = this.get('session.tenantId');
      params.notCheckAttempts = !(
        params.source === PLAYER_EVENT_SOURCE.COURSE_MAP ||
        params.source === PLAYER_EVENT_SOURCE.DAILY_CLASS
      );

      let timeSpentPromise = Ember.RSVP.Promise.resolve([]);
      if (params.classId && !params.isTeacher) {
        let dataParam = {
          classId: params.classId,
          userId: route.get('session.userId'),
          to: moment().format('YYYY-MM-DD')
        };
        timeSpentPromise = route
          .get('reportService')
          .fetchStudentTimespentReport(dataParam);
      }

      return route
        .loadCollection(collectionId, type)
        .then(function(collection) {
          route.set('collectionObj', collection);
          params.type = collection.get('collectionType');
          return route.createContext(
            params,
            collection,
            role === ROLES.STUDENT
          );
        })
        .then(function({ id }) {
          params.contextId = id;
          params.role = route.get('profile.role');
          params.isTeacher = route.get('profile.role') === ROLES.TEACHER;
          params.profileId = route.get('session.userData.gooruUId');
          return timeSpentPromise.then(studentTimespentData => {
            params.studentTimespentData = studentTimespentData;
            params.classData = route.get('classData');
            return route.quizzesModel(params);
          });
        });
    },

    /**
     * Loads the collection
     * @param {string} collectionId
     * @param {string} type
     * @returns {Promise.<Collection>}
     */
    loadCollection: function(collectionId, type) {
      const route = this;
      const isCollection = type === 'collection';
      const isAssessment = type === 'assessment';
      const loadAssessment = isAssessment || !type;
      const loadCollection = isCollection || !type;
      return Ember.RSVP.hashSettled({
        assessment: loadAssessment
          ? route.get('assessmentService').readAssessment(collectionId)
          : false,
        collection: loadCollection
          ? route.get('collectionService').readCollection(collectionId)
          : false
      }).then(function(hash) {
        let collectionFound =
          hash.assessment.state === 'rejected' ||
          hash.assessment.value === false;
        return collectionFound ? hash.collection.value : hash.assessment.value;
      });
    },

    deactivate: function() {
      this.get('controller').resetValues();
    },

    defaultTransitionToLibraryBasedOnType() {
      let route = this,
        defaultRoute = 'library-search',
        myId = this.get('session.userId'),
        type = this.get('controller').get('type'),
        queryParams = {
          profileId: myId,
          type: 'my-content',
          activeContentType: type
        };
      route.transitionTo(defaultRoute, { queryParams });
    }
  }
);
