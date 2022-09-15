import Ember from 'ember';
import AccordionMixin from '../../../mixins/gru-accordion';
import { CONTENT_TYPES } from 'gooru-web/config/config';
import TenantSettingsMixin from 'gooru-web/mixins/tenant-settings-mixin';
var isUpdatingLocation = false;

export default Ember.Component.extend(AccordionMixin, TenantSettingsMixin, {
  classNames: ['gru-accordion', 'unit-suggestions', 'gru-accordion-unit'],
  classNameBindings: [
    'isExpanded:expanded',
    'curComponentId',
    'isDashboardView:hidden'
  ],

  /**
   * @requires service:session
   */
  session: Ember.inject.service('session'),

  /**
   * @requires service:api-sdk/performance
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  curComponentId: Ember.computed(function() {
    return `u-${this.get('model.unitId')}`;
  }),
  /**
   * @prop {String[]} parsedLocation - Location the user has navigated to
   * parsedLocation[0] - unitId
   * parsedLocation[1] - lessonId
   * parsedLocation[2] - resourceId
   */
  parsedLocation: [],
  /**
   * @prop {String} userLocation - Location of a user in a course
   */
  userLocation: null,

  /**
   * Help to know is is this loaded from student dashboard
   * @type {Boolean}
   */
  isStudentDashboard: false,

  isDashboardView: Ember.computed('model', function() {
    return !this.get('model.isResumeUnit') && this.get('isStudentDashboard');
  }),

  collectionCount: Ember.computed('model', function() {
    return this.get('model.collections').filter(
      item =>
        item.collectionType === 'collection' ||
        item.collectionType === 'collection-external'
    ).length;
  }),

  assessmentCount: Ember.computed('model', function() {
    return this.get('model.collections').filter(
      item =>
        item.collectionType === 'assessment' ||
        item.collectionType === 'assessment-external'
    ).length;
  }),

  /**
   * @property {Boolean}
   */
  isShowUnitPlan: false,

  actions: {
    /**
     * @function studyNow
     * @param {string} type - lesson or collection
     * @param {string} lesson - lesson id
     * @param {string} item - collection, assessment, lesson or resource
     * @see components/class/overview/gru-accordion-lesson
     */
    studyNow: function(type, lesson, item) {
      let unitId = this.get('model.unitId');
      this.get('onStudyNow')(type, unitId, lesson, item);
    },
    /**
     * Load the data for this unit (data should only be loaded once) and trigger
     * the 'onLocationUpdate' event handler with the unit information
     *
     * @function actions:selectUnit
     */
    selectUnit: function(unitId) {
      if (!isUpdatingLocation) {
        let newLocation = this.get('isExpanded') ? '' : unitId;
        this.get('onLocationUpdate')(newLocation);
      } else if (!this.get('isExpanded')) {
        this.getLessonsPerformance();
      }
    },
    /**
     * @function actions:selectItem
     * @param {string} collection - collection or assessment
     * @see components/class/overview/gru-accordion-lesson
     */
    selectResource: function(lessonId, collection) {
      let unitId = this.get('model.id');
      this.get('onSelectResource')(unitId, lessonId, collection);
    },

    /**
     * Trigger the 'onLocationUpdate' event handler with the unit and lesson information
     *
     * @function actions:updateLesson
     */
    updateLesson: function(lessonId) {
      const newLocation = lessonId
        ? `${this.get('model.id')}+${lessonId}`
        : this.get('model.id');
      this.get('onLocationUpdate')(newLocation);
    },

    showUnitPlan(container, elementId) {
      let component = this;
      this.$(`.${container}`).slideToggle();
      component.$(`#${elementId}-heading`).toggleClass('expandPanel');
      component.set('isExpanded', true);
      component.set('isShowUnitPlan', true);
    }
  },

  /**
   * Computed Property to extract framework code from settings
   * @return {String}
   */
  fwCode: Ember.computed('class', function() {
    let preference = this.get('class.preference');
    return preference != null ? preference.get('framework') : null;
  }),

  /**
   * Observe changes to 'parsedLocation' to update the accordion's status
   * (expanded/collapsed).
   */
  parsedLocationChanged: Ember.observer('parsedLocation.[]', function() {
    const parsedLocation = this.get('parsedLocation');

    if (parsedLocation.length) {
      isUpdatingLocation = true;

      let unitId = parsedLocation[0];
      this.updateAccordionById(unitId);

      isUpdatingLocation = false;
    }
  }),

  selectResource: function(lessonId, collection) {
    let unitId = this.get('model.id');
    this.get('onSelectResource')(unitId, lessonId, collection);
  },
  // -------------------------------------------------------------------------
  // Events
  setupComponent: Ember.on('didInsertElement', function() {
    const component = this;
    this.$().on('hide.bs.collapse', function(e) {
      e.stopPropagation();
      component.set('isExpanded', false);
      component.set('isShowUnitPlan', false);
    });

    this.$().on('show.bs.collapse', function(e) {
      e.stopPropagation();
      component.set('isExpanded', true);
    });
    Ember.run.scheduleOnce('afterRender', this, this.parsedLocationChanged);
  }),

  getLessonsPerformance() {
    const component = this;
    let performanceService = component.get('performanceService');
    let userId =
      component.get('session.role') === 'student'
        ? component.get('session.userId')
        : component.get('studentId');
    let classId = component.get('class').id;
    let courseId = component.get('course').id;
    let fwCode = component.get('fwCode');
    let milestoneId = component.get('model.milestoneId');
    let lessons = component.getLessons(component.get('model'));
    Ember.RSVP.hash({
      performanceAssessment: performanceService.getLessonsPerformanceByMilestoneId(
        classId,
        courseId,
        milestoneId,
        CONTENT_TYPES.ASSESSMENT,
        userId,
        fwCode
      ),
      performanceCollection: performanceService.getLessonsPerformanceByMilestoneId(
        classId,
        courseId,
        milestoneId,
        CONTENT_TYPES.COLLECTION,
        userId,
        fwCode
      )
    }).then(({ performanceAssessment, performanceCollection }) => {
      if (!component.isDestroyed) {
        component.setLessonPerformanceData(
          CONTENT_TYPES.COLLECTION,
          lessons,
          performanceCollection
        );
        component.setLessonPerformanceData(
          CONTENT_TYPES.ASSESSMENT,
          lessons,
          performanceAssessment
        );
      }
    });
  },

  setLessonPerformanceData(type, lessons, lessonsPerformance) {
    lessonsPerformance.forEach(lessonPerformance => {
      let lessonId = lessonPerformance.get('lessonId');
      let lesson = lessons.findBy('lessonId', lessonId);
      if (lesson) {
        const performance = lessonPerformance.get('performance');
        const score = performance.get('scoreInPercentage');
        const timeSpent = performance.get('timeSpent');
        const completionDone = performance.get('completedCount');
        const completionTotal = performance.get('totalCount');
        const hasStarted = score > 0 || timeSpent > 0;
        const isCompleted =
          completionDone > 0 && completionDone >= completionTotal;
        performance.set('score', score);
        performance.set('hasStarted', hasStarted);
        performance.set('isCompleted', isCompleted);
        performance.set('completionDone', completionDone);
        performance.set('completionTotal', completionTotal);
        lesson.set('performance', performance);
        lesson.set('isAssessment', true);
        if (type === CONTENT_TYPES.ASSESSMENT) {
          lesson.set('isAssessment', false);
        }
      }
    });
    this.set('lessons', lessons);
  },

  getLessons(unit) {
    return unit.lessons.map(lesson => {
      lesson.id = lesson.lessonId;
      return Ember.Object.create(lesson);
    });
  }
});
