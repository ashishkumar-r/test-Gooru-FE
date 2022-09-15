import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import { CLASS_SKYLINE_INITIAL_DESTINATION } from 'gooru-web/config/config';
import LearningJourneyMixin from 'gooru-web/mixins/learning-journey-mixin';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(
  PrivateRouteMixin,
  LearningJourneyMixin,
  UIHelperMixin,
  {
    // -------------------------------------------------------------------------
    // Dependencies

    /**
     * route0 Service to perform route0 data operations
     */
    route0Service: Ember.inject.service('api-sdk/route0'),

    /**
     * rescope service to fetch rescope contents
     */
    rescopeService: Ember.inject.service('api-sdk/rescope'),

    /**
     * taxonomy service dependency injection
     * @type {Object}
     */
    taxonomyService: Ember.inject.service('api-sdk/taxonomy'),

    /**
     * @type {CourseService} Service to retrieve course information
     */
    courseService: Ember.inject.service('api-sdk/course'),

    /**
     * @type {reportService} Service to retrieve report information
     */
    reportService: Ember.inject.service('api-sdk/report'),

    // -------------------------------------------------------------------------
    // Methods
    beforeModel() {
      const route = this;
      let isPremiumCourse = route.modelFor('student.class').isPremiumCourse;
      const currentClass = route.modelFor('student.class').class;
      const isMilestoneViewEnabledForTenant = route.isMilestoneViewEnabled(
        currentClass.preference,
        currentClass.setting
      );
      if (isPremiumCourse) {
        let skylineInitialState = route.modelFor('student.class')
          .skylineInitialState;
        let destination = skylineInitialState.get('destination');
        if (
          destination === CLASS_SKYLINE_INITIAL_DESTINATION.classSetupInComplete
        ) {
          return route.transitionTo('student.class.setup-in-complete');
        } else if (
          destination === CLASS_SKYLINE_INITIAL_DESTINATION.showDirections ||
          destination === CLASS_SKYLINE_INITIAL_DESTINATION.ILPInProgress
        ) {
          return route.transitionTo('student.class.proficiency');
        } else if (
          destination === CLASS_SKYLINE_INITIAL_DESTINATION.diagnosticPlay
        ) {
          return route.transitionTo('student.class.diagnosis-of-knowledge');
        }
        if (!isMilestoneViewEnabledForTenant) {
          return route.transitionTo('student.class.course-map');
        }
      }
    },

    model: function(params) {
      const route = this;
      const currentClass = route.modelFor('student.class').class;
      route.setTitle('Learning Journey - Milestones', currentClass.title);
      const course = route.modelFor('student.class').course;
      const isRoute0Applicable = currentClass.get('route0Applicable');
      const courseId = currentClass.get('courseId');
      const fwCode = currentClass.get('preference.framework') || 'GUT';
      const classId = currentClass.id;
      const myId = route.get('session.userId');
      let proficiencyData = params.isProficiencyValue;
      const dataParam = {
        classId: classId,
        userId: myId,
        to: moment().format('YYYY-MM-DD')
      };
      let studentTimeSpendPromise = Ember.RSVP.resolve({});
      if (proficiencyData === 'true') {
        studentTimeSpendPromise = route
          .get('reportService')
          .fetchStudentTimespentReport(dataParam);
      }
      const milestonePromise = route
        .get('courseService')
        .getCourseMilestones(courseId, fwCode);
      let route0Promise = Ember.RSVP.resolve({});
      const courseIdContext = {
        courseId: currentClass.courseId,
        classId: currentClass.id
      };
      const subject = currentClass.get('preference.subject');
      let taxonomyService = route.get('taxonomyService');
      if (isRoute0Applicable) {
        route0Promise = route.checkAndRetrieveRoute0ContentsByStatus(
          courseIdContext
        );
      }
      return Ember.RSVP.hash({
        currentClass: currentClass,
        course: course,
        route0: route0Promise,
        milestones: milestonePromise,
        studentTimeSpend: studentTimeSpendPromise,
        proficiencyStatus: proficiencyData === 'true',
        rescopedContents: route.getRescopedContents(courseIdContext),
        gradeSubject: subject ? taxonomyService.fetchSubject(subject) : {}
      });
    },

    /**
     * @function getRescopedContents
     * Method to get rescoped contents
     */
    getRescopedContents(courseIdContext) {
      let component = this;
      return Ember.RSVP.hash({
        rescopedContents: component
          .get('rescopeService')
          .getSkippedContents(courseIdContext)
      })
        .then(rescopedContents => {
          return rescopedContents.rescopedContents;
        })
        .catch(function() {
          return {};
        });
    },

    checkAndRetrieveRoute0ContentsByStatus(courseIdContext) {
      const route = this;
      return new Ember.RSVP.Promise(function(resolve, reject) {
        route
          .get('route0Service')
          .fetchInClass(courseIdContext)
          .then(route0Contents => {
            resolve(route0Contents.milestones);
          }, reject);
      });
    },

    /**
     * Set all controller properties from the model
     * @param controller
     * @param model
     */
    setupController: function(controller, model) {
      controller.set('class', model.currentClass);
      controller.set('route0Milestones', model.route0);
      controller.set('course', model.course);
      controller.set('rescopedContents', model.rescopedContents);
      controller.set('gradeSubject', model.gradeSubject);
      controller.set('milestones', model.milestones);
      controller.set('proficiencyStatus', model.proficiencyStatus);
      controller.set('studentTimeSpend', model.studentTimeSpend);
      controller.get('studentClassController').selectMenuItem('course-map');
      controller.loadSelfGradeItems();
    }
  }
);
