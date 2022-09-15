import Ember from 'ember';
import PrivateRouteMixin from 'gooru-web/mixins/private-route-mixin';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(PrivateRouteMixin, UIHelperMixin, {
  queryParams: {
    refresh: {
      refreshModel: true
    },
    backUrls: {}
  },

  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {ClassService} Service to retrieve class information
   */
  classService: Ember.inject.service('api-sdk/class'),

  /**
   * @type {PerformanceService} Service to retrieve class performance summary
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  /**
   * @type {CourseService} Service to retrieve course information
   */
  courseService: Ember.inject.service('api-sdk/course'),

  /**
   * @type {UnitService} Service to retrieve unit information
   */
  unitService: Ember.inject.service('api-sdk/unit'),

  /**
   * @type {i18nService} Service to retrieve translations information
   */
  i18n: Ember.inject.service(),

  /**
   * @requires service:api-sdk/competency
   */
  competencyService: Ember.inject.service('api-sdk/competency'),

  /**
   * taxonomy service dependency injection
   * @type {Object}
   */
  taxonomyService: Ember.inject.service('taxonomy'),

  multipleClassService: Ember.inject.service('api-sdk/multiple-class'),

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Triggered when a class menu item is selected
     * @param {string} item
     */
    selectMenuItem: function(item) {
      const route = this;
      const controller = route.get('controller');
      const currentItem = controller.get('menuItem');
      const isPremiumClass = controller.get('isPremiumClass');
      if (item !== currentItem) {
        controller.selectMenuItem(item);
        if (item === 'class-management') {
          route.transitionTo('teacher.class.class-management');
        } else if (item === 'students') {
          route.transitionTo('teacher.class.students-proficiency');
        } else if (item === 'course-map') {
          route.transitionTo('teacher.class.course-map');
        } else if (item === 'performance' && !isPremiumClass) {
          route.transitionTo('teacher.class.performance');
        } else if (item === 'class-activities') {
          route.transitionTo('teacher.class.class-activities');
        } else if (item === 'atc') {
          route.transitionTo('teacher.class.atc');
        } else if (item === 'close') {
          let backurl = this.get('backUrls');
          backurl = backurl || controller.get('backUrls');
          if (backurl) {
            route.transitionTo(backurl);
          } else {
            if (controller.class.isArchived) {
              route.transitionTo('teacher-home'); //, (query - params showArchivedClasses = "true" showActiveClasses = "false") class="back-to" } }
            } else {
              route.transitionTo('teacher-home');
            }
          }
          route.setTitle('Instructor Classroom', null);
        }
      }
    },

    /**
     * Gets a refreshed list of content visible
     */
    updateContentVisible: function(contentId, visible) {
      const route = this;
      const controller = route.get('controller');
      let contentVisibility = controller.get('contentVisibility');
      contentVisibility.setAssessmentVisibility(
        contentId,
        visible ? 'on' : 'off'
      );
    },

    onRefreshData() {
      this.refresh();
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Get model for the controller
   */
  model: function(params) {
    const route = this;
    const classId = params.classId;
    const classPromise = route.get('classService').readClassInfo(classId);
    const membersPromise = route.get('classService').readClassMembers(classId);
    return Ember.RSVP.hash({
      class: classPromise,
      members: membersPromise
    }).then(function(hash) {
      const aClass = hash.class;
      const members = hash.members;
      const courseId = aClass.get('courseId');
      let coursePromise = Ember.RSVP.resolve(Ember.Object.create({}));
      if (courseId) {
        coursePromise = route.get('courseService').fetchById(courseId);
      }
      return Ember.RSVP.hash({
        course: coursePromise,
        secondaryClassesData: route.loadClassesData(aClass.get('setting'))
      }).then(function(hash) {
        const contentVisibility = hash.contentVisibility;
        const course = hash.course;
        const crossWalkFWC = hash.crossWalkFWC || [];
        aClass.set('owner', members.get('owner'));
        aClass.set('collaborators', members.get('collaborators'));
        aClass.set('memberGradeBounds', members.get('memberGradeBounds'));
        aClass.set('members', members.get('members'));
        return {
          class: aClass,
          course,
          members,
          contentVisibility,
          crossWalkFWC,
          secondaryClassesData: hash.secondaryClassesData
        };
      });
    });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    controller.set('class', model.class);
    controller.set('course', model.course);
    controller.set('members', model.members);
    controller.set('secondaryClassesData', model.secondaryClassesData);
    controller.set('class.course', model.course);
    controller.loadCompetencyCompletionStat();
  },

  /**
   * @function loadClassesData
   * Method to load class details for given classIds
   */
  loadClassesData(classSetting) {
    const secondaryClassIds =
      classSetting && classSetting['secondary.classes']
        ? classSetting['secondary.classes'].list
        : Ember.A([]);
    if (secondaryClassIds && secondaryClassIds.length) {
      return this.get('classService').readBulkClassDetails(secondaryClassIds);
    }
    return Ember.RSVP.resolve(Ember.A([]));
  },

  resetController(controller) {
    controller.set('pullUpSecondaryClass', null);
    controller.set('isShowMilestoneReport', false);
    controller.set('selectedSecondaryClass', null);
  }
});
