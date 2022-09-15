import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import { ROLES, PLAYER_EVENT_SOURCE } from 'gooru-web/config/config';
import AccessibilitySettingsMixin from 'gooru-web/mixins/accessibility-settings-mixin';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

/**
 * Teacher route
 *
 * @module
 * @augments Ember.Route
 */
export default Ember.Route.extend(
  PrivateRouteMixin,
  ConfigurationMixin,
  AccessibilitySettingsMixin,
  UIHelperMixin,
  {
    queryParams: {
      isDeepLink: false
    },
    // -------------------------------------------------------------------------
    // Dependencies
    performanceService: Ember.inject.service('api-sdk/performance'),

    /**
     * @requires service:api-sdk/course
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * @type {I18nService} Service to retrieve translations information
     */
    i18n: Ember.inject.service(),

    /**
     * @property {Service} Profile service
     */
    profileService: Ember.inject.service('api-sdk/profile'),

    /**
     * @property {Service} tenant service
     */
    tenantService: Ember.inject.service('api-sdk/tenant'),

    session: Ember.inject.service('session'),
    // -------------------------------------------------------------------------
    // Actions

    actions: {
      /**
       * Open the player with the specific currentLocation
       *
       * @function actions:playItem
       * @param {string} currentLocation - All the params for the currentLocation
       */
      studyPlayer: function(currentLocation) {
        const route = this;
        let role = ROLES.STUDENT;
        let source = PLAYER_EVENT_SOURCE.COURSE_MAP;
        let courseId = currentLocation.get('courseId');
        let classId = currentLocation.get('classId');
        let unitId = currentLocation.get('unitId');
        let lessonId = currentLocation.get('lessonId');
        let collectionId = currentLocation.get('collectionId');
        let collectionType = currentLocation.get('collectionType');
        let collectionSubType = currentLocation.get(
          'collection.collectionSubType'
        );
        let pathId = currentLocation.get('collection.pathId') || 0;
        let queryParams = {
          classId,
          unitId,
          lessonId,
          collectionId,
          role,
          source,
          type: collectionType,
          subtype: collectionSubType,
          pathId
        };

        let suggestionPromise = null;
        // Verifies if it is a suggested Collection/Assessment
        if (collectionSubType) {
          suggestionPromise = route
            .get('navigateMapService')
            .startSuggestion(
              courseId,
              unitId,
              lessonId,
              collectionId,
              collectionType,
              collectionSubType,
              pathId,
              classId
            );
        } else {
          suggestionPromise = route
            .get('navigateMapService')
            .startCollection(
              courseId,
              unitId,
              lessonId,
              collectionId,
              collectionType,
              classId
            );
        }

        suggestionPromise.then(() =>
          route.transitionTo('study-player', courseId, {
            queryParams
          })
        );
      },

      /**
       * Triggered when a teacher card menu item is selected
       * @param {string} item
       * @param {string} classId
       */
      selectMenuItem: function(item, classId) {
        const route = this;
        if (item === 'students') {
          route.transitionTo('teacher.class.students-proficiency', classId);
        } else if (item === 'course-map') {
          route.transitionTo('teacher.class.course-map', classId, {
            queryParams: {
              location: null,
              selectedCollectionId: null,
              selectedQuestionId: null,
              selectedUserId: null
            }
          });
        } else if (item === 'class-activities') {
          route.transitionTo('teacher.class.class-activities', classId);
        } else if (item === 'ca-report') {
          route.transitionTo('teacher.class.class-activities', classId, {
            queryParams: {
              tab: 'report'
            }
          });
        } else if (item === 'cm-report') {
          route.transitionTo('teacher.class.course-map', classId, {
            queryParams: {
              tab: 'report'
            }
          });
        } else if (item === 'atc') {
          route.transitionTo('teacher.class.atc', classId);
        } else if (item === 'class-management') {
          route.transitionTo('teacher.class.class-management', classId);
        } else {
          route.transitionTo('teacher-home');
        }
      }
    },

    // -------------------------------------------------------------------------
    // Methods

    /**
     * Get model for the controller
     */
    model: function(params) {
      let route = this;
      route.set('isDeepLink', params.isDeepLink === 'true');
      let myClassessPromise = Ember.RSVP.resolve(
        route.controllerFor('application').loadUserClasses()
      );
      route.setTitle('Instructor Classroom', null);
      return Ember.RSVP.hash({
        myClasses: myClassessPromise,
        preferenceSettings: route.get('profileService').getProfilePreference()
      }).then(function(hash) {
        const myClasses = hash.myClasses;
        route.setAccessibilitySettingsAPI(hash.preferenceSettings);
        const myId = route.get('session.userId');
        const activeClasses = myClasses.getTeacherActiveClasses(myId);
        const archivedClasses = myClasses.getTeacherArchivedClasses();
        const incompleteClasses = myClasses.getTeacherIncompleteClasses();
        if (incompleteClasses.length) {
          let rosterArray = Ember.A([]);
          incompleteClasses.map(data => {
            rosterArray.push(parseInt(data.roster_id));
          });
          return route
            .get('tenantService')
            .getGrade({ roster_ids: rosterArray })
            .then(rostersubject => {
              incompleteClasses.forEach(data => {
                let roaster = rostersubject.roster_grade_subjects.filterBy(
                  'roster_id',
                  parseInt(data.roster_id)
                );
                data.set('rosterData', roaster);
              });
              return {
                activeClasses,
                archivedClasses,
                incompleteClasses,
                preferenceSettings: hash.preferenceSettings
              };
            });
        } else {
          return {
            activeClasses,
            archivedClasses,
            incompleteClasses,
            preferenceSettings: hash.preferenceSettings
          };
        }
      });
    },

    /**
     * Set all controller properties from the model
     * @param controller
     * @param model
     */
    setupController: function(controller, model) {
      controller.set('archivedClasses', model.archivedClasses);
      controller.set('incompleteClasses', model.incompleteClasses);
      controller.set('preferenceSetting', model.preferenceSettings);
      controller.set('activeClasses', model.activeClasses);
      controller.changeLanguage();
      let lastAccessedClassData = controller.getLastAccessedClassData();
      if (model.activeClasses.length) {
        controller.updateLastAccessedClassPosition(lastAccessedClassData.id);
      }
      controller.loadPerformance();
    },

    resetController(controller) {
      controller.set('showActiveClasses', true);
      controller.set('showArchivedClasses', false);
      controller.set('showIncompleteClasses', false);
      controller.set('isActiveClassPerformanceLoaded', false);
      controller.set('isArchivedClassPerformanceLoaded', false);
      controller.set('isIncompleteClassPerformanceLoaded', false);
    }
  }
);
