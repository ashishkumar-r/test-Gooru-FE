import Ember from 'ember';
import { getObjectsDeepCopy } from 'gooru-web/utils/utils';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
import { CONTENT_TYPES } from 'gooru-web/config/config';

export default Ember.Route.extend(UIHelperMixin, {
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {Service} session service
   */
  session: Ember.inject.service('session'),
  /**

  /**
   * @type {Service} performance service
   */
  performanceService: Ember.inject.service('api-sdk/performance'),
  /**

   * @type {Service} i18n
   */
  i18n: Ember.inject.service(),

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

  /**
   * @property {Service} parseEvent service
   */
  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  /**
   * @requires service:api-sdk/unit0Service
   */
  unit0Service: Ember.inject.service('api-sdk/unit0'),

  // -------------------------------------------------------------------------
  // Attributes

  secondaryClass: null,

  queryParams: {
    activeStudentId: null
  },

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Launch an assessment on-air
     *
     * @function actions:launchOnAir
     */
    launchOnAir: function(collectionId) {
      const currentClass = this.modelFor('teacher.class').class;
      const classId = currentClass.get('id');
      this.transitionTo('reports.collection', classId, collectionId);
    },

    /**
     * Open the player with the specific collection/assessment
     *
     * @function actions:playItem
     * @param {string} unitId - Identifier for a unit
     * @param {string} lessonId - Identifier for lesson
     * @param {string} collection - collection or assessment
     */
    playResource: function(unitId, lessonId, collection) {
      if (collection.get('isExternalAssessment')) {
        window.open(collection.get('url'));
      } else {
        const currentClass = this.modelFor('teacher.class').class;
        const classId = currentClass.get('id');
        const courseId = currentClass.get('courseId');
        const role = 'teacher';
        this.transitionTo(
          'context-player',
          courseId,
          unitId,
          lessonId,
          collection.get('id'),
          {
            queryParams: {
              role: role,
              type: collection.get('collectionType'),
              classId: classId
            }
          }
        );
      }
    },

    /**
     * Edit content action, when clicking Edit content on Class Overview
     * @param {Content/Course}
     */
    editContent: function(id, classId) {
      let queryParams = {
        classId: classId
      };
      this.transitionTo('content.courses.edit', id, {
        queryParams
      });
      const context = {
        classId: classId,
        courseId: id,
        classTitle: this.modelFor('teacher.class').class.title
      };
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.EDIT_COURSE,
        context
      );
    },

    onSelectedClass(secondaryClass) {
      this.set('secondaryClass', secondaryClass);
      this.refresh();
    },

    didTransition() {
      // Load Course performance summary only loading CM tab
      this.get('controller')
        .get('classController')
        .loadCoursePerformanceSummary();
    }
  },

  // -------------------------------------------------------------------------
  // Methods

  beforeModel: function() {
    if (!this.get('secondaryClass')) {
      const currentClass = this.modelFor('teacher.class').class;
      const userId = this.get('session.userId');
      if (currentClass.isTeacher(userId) && !currentClass.get('courseId')) {
        this.transitionTo('teacher.class.add-course');
      }
    }
  },

  model: function(params) {
    const route = this;
    const secondaryClass = route.get('secondaryClass');
    if (secondaryClass) {
      secondaryClass.class.set('isSecondaryClass', true);
    }
    const currentClass = secondaryClass
      ? secondaryClass.class
      : route.modelFor('teacher.class').class;
    route.setTitle('Learning Journey - Course map', currentClass.title);
    const course = secondaryClass
      ? secondaryClass.course
      : route.modelFor('teacher.class').course;
    const units = course.get('children') || [];
    const classMembers = currentClass.get('members');
    const subject = currentClass.get('preference.subject');
    let taxonomyService = route.get('taxonomyService');
    const courseId = currentClass.get('courseId');
    const classId = currentClass.get('id');
    const userId = this.get('session.userId');
    route.fetchUnitsPerformance(userId, classId, courseId, units);
    const unit0Promise = route
      .get('unit0Service')
      .fetchUnit0({ classId, courseId });
    const fwCode = currentClass.get('preference.framework') || 'GUT';
    const milestonePromise = currentClass.get('milestoneViewApplicable')
      ? route.get('courseService').getCourseMilestones(courseId, fwCode)
      : Ember.RSVP.resolve([]);
    const dataParam = {
      classId: currentClass.get('id'),
      to: moment().format('YYYY-MM-DD')
    };
    const timeSpentPromise = route
      .get('reportService')
      .fetchStudentsTimespentSummaryreport(dataParam);
    return Ember.RSVP.hash({
      course: course,
      units: units,
      currentClass: currentClass,
      classMembers: classMembers,
      gradeSubject: subject ? taxonomyService.fetchSubject(subject) : {},
      milestones: milestonePromise,
      classMembersTimespent: timeSpentPromise,
      activeStudentId: params.activeStudentId || null,
      unit0Content: unit0Promise
    });
  },

  /**
   * Set all controller properties from the model
   * @param controller
   * @param model
   */
  setupController: function(controller, model) {
    let units = model.units;
    const hasUnit0Content = units.findBy('isUnit0', true);
    if (!hasUnit0Content) {
      units = Ember.A([...model.unit0Content, ...model.units]);
    }
    controller.set('units', units);
    model.course.set('children', controller.get('units'));
    controller.set('course', model.course);
    controller.set('classMembers', model.classMembers);
    controller.set('currentClass', model.currentClass);
    controller.get('classController').selectMenuItem('course-map');
    controller.set('isStudentCourseMap', false);
    controller.set('gradeSubject', model.gradeSubject);
    controller.set('classController.gradeSubject', model.gradeSubject);
    controller.set('classController.isShowExpandedNav', true);
    controller.set('unit0Content', model.unit0Content);
    let milestones = model.milestones;
    const hasUnit0Milestone = milestones.findBy('isUnit0', true);
    if (!hasUnit0Milestone) {
      milestones = Ember.A([...model.unit0Content, ...model.milestones]);
    }
    controller.set('teacherMilestones', getObjectsDeepCopy(milestones));
    controller.set('studentMilestones', getObjectsDeepCopy(milestones));
    controller.set('milestones', milestones);
    controller.set('classMembersTimespent', model.classMembersTimespent);
    controller.set('isShowGoLive', false);
    if (model.activeStudentId) {
      let activeStudent = model.classMembers.findBy(
        'id',
        model.activeStudentId
      );
      controller.send('onSelectStudent', activeStudent);
      controller.set('activeStudentId', model.activeStudentId);
    }
    controller.changeLanguage();
    controller.loadItemsToGrade();
    controller.init();
    // Load CUL performance only if default view is not Milestone
    controller.getUnitLevelPerformance();
    // Load course content visibility on loading CM tab
    this.get('controller')
      .get('classController')
      .loadCourseContentVisibility();
  },

  resetController(controller) {
    controller.set('tab', null);
    controller.set('studentId', null);
    controller.set('questionItems', null);
    controller.set('isAccepted', false);
    controller.set('itemsToGradeList', Ember.A([]));
    this.set('secondaryClass', null);
    controller.set('activeStudentId', null);
  },

  fetchUnitsPerformance(userId, classId, courseId, units) {
    let route = this;
    Ember.RSVP.hash({
      ucPerformance: route
        .get('performanceService')
        .findStudentPerformanceByCourse(userId, classId, courseId, units, {
          collectionType: CONTENT_TYPES.COLLECTION
        }),
      uaPerformance: route
        .get('performanceService')
        .findStudentPerformanceByCourse(userId, classId, courseId, units, {
          collectionType: CONTENT_TYPES.ASSESSMENT
        })
    }).then(({ ucPerformance, uaPerformance }) => {
      units.forEach(unit => {
        let unitPerformanceAssessment = uaPerformance.findBy(
          'id',
          unit.get('id')
        );
        if (
          !unitPerformanceAssessment ||
          unitPerformanceAssessment.score === null
        ) {
          unitPerformanceAssessment = ucPerformance.findBy(
            'id',
            unit.get('id')
          );
        }
        if (unitPerformanceAssessment) {
          unit.set('performance', unitPerformanceAssessment);
        }
      });
    });
  }
});
