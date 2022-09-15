import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
/**
 * Student performance filter panel
 *
 * Component responsible to show the student performance filter panel.
 * @see controllers/student/performance.js
 * @augments ember/Component
 */
export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes

  classNames: [
    'gru-performance-filter-panel',
    'col-md-2',
    'col-sm-4',
    'col-xs-12'
  ],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Expand filter panel
     */
    expandPanel: function(filterType) {
      switch (filterType) {
      case 'activity':
        this.toggleProperty('isActivityFiltersExpanded');
        break;
      case 'course':
        this.toggleProperty('isCourseFiltersExpanded');
        break;
      case 'lesson':
        this.toggleProperty('isLessonFiltersExpanded');
        break;
      case 'subject':
        this.toggleProperty('isSubjectFiltersExpanded');
        break;
      case 'time-period':
        this.toggleProperty('isTimePeriodFiltersExpanded');
        break;
      case 'unit':
        this.toggleProperty('isUnitFiltersExpanded');
        break;
      }
    },
    /**
     * Select Activity
     * @param activity option
     */
    selectActivity: function(activity) {
      this.set('activityFilter', activity);
    },
    /**
     * Selects the course
     * @param courseId
     */
    selectCourse: function(courseId) {
      this.set('courseId', courseId);
      this.set('unitId', null);
      this.set('lessonId', null);
      this.sendAction('onSelectCourse', courseId);
    },
    /**
     * Selects the lesson
     * @param lessonId
     */
    selectLesson: function(lessonId) {
      this.set('lessonId', lessonId);
      this.sendAction('onSelectLesson', lessonId);
    },
    /**
     * Selects the unit
     * @param unitId
     */
    selectUnit: function(unitId) {
      this.set('unitId', unitId);
      this.set('lessonId', null);
      this.sendAction('onSelectUnit', unitId);
    },

    /**
     * Loads report data
     */
    updateReport: function() {
      this.sendAction('onUpdateReport');
    }
  },

  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  init: function() {
    let component = this;
    component._super(...arguments);

    if (component.get('filterCriteria')) {
      component.setProperties({
        courseId: component.get('filterCriteria.courseId'),
        unitId: component.get('filterCriteria.unitId'),
        lessonId: component.get('filterCriteria.lessonId')
      });
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * Activities filter options
   */
  activities: ['study'],
  /**
   * Activity Filter selected
   */
  activityFilter: 'study',

  /**
   * @property {string}
   */
  courseId: null,

  /**
   * filter Criteria
   * @property {string}
   */
  filterCriteria: null,

  /**
   * @property {Boolean} isCourseFiltersExpanded
   */
  isCourseFiltersExpanded: true,

  /**
   * @property {Boolean} isUnitFiltersExpanded
   */
  isUnitFiltersExpanded: false,
  /**
   * @property {Boolean} isLessonFiltersExpanded
   */
  isLessonFiltersExpanded: false,

  /**
   * @property {Boolean} isActivityFiltersExpanded
   */
  isActivityFiltersExpanded: false,

  /**
   * @property {Boolean} isTimePeriodFiltersExpanded
   */
  isTimePeriodFiltersExpanded: false,

  /**
   * @property {Boolean} isSubjectFiltersExpanded
   */
  isSubjectFiltersExpanded: false,

  /**
   * Selected lesson
   * @property {Lesson}
   */
  lesson: Ember.computed('unit.children.[]', 'lessonId', function() {
    const lessons = this.get('unit.children') || [];
    return lessons.findBy('id', this.get('lessonId'));
  }),

  /**
   * @property {Lesson[]}
   */
  lessons: Ember.computed('unit.children.[]', 'lessonId', function() {
    return this.get('unit.children');
  }),

  /**
   * @property {string}
   */
  lessonId: null,

  /**
   * Selected course
   * @property {Course}
   */
  selectedCourse: null,

  /**
   * Computed property that indicates if show the activity option selected
   */
  showActivitySubcategory: Ember.computed(
    'activityFilter',
    'isActivityFiltersExpanded',
    function() {
      return (
        this.get('activityFilter') && !this.get('isActivityFiltersExpanded')
      );
    }
  ),

  /**
   * Selected unit
   * @property {Unit}
   */
  unit: Ember.computed('selectedCourse.children.[]', 'unitId', function() {
    const units = this.get('selectedCourse.children') || [];
    return units.findBy('id', this.get('unitId'));
  }),

  /**
   * @property {Unit[]}
   */
  units: Ember.computed('selectedCourse.children.[]', function() {
    return this.get('selectedCourse.children');
  }),

  /**
   * @property {string}
   */
  unitId: null

  // -------------------------------------------------------------------------
  // Methods
});
