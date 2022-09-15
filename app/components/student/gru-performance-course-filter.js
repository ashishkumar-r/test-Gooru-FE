import Ember from 'ember';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
/**
 * Student performance course filter
 *
 * Component responsible to show the student  performance course filter.
 * @see controllers/student/class/performance.js
 * @augments ember/Component
 */
export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-performance-course-filter'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     * Expand filter panel
     */
    expandPanel: function(filterType, obj) {
      let component = this;
      switch (filterType) {
      case 'course':
        this.toggleProperty('isCourseFiltersExpanded');
        break;
      case 'lesson':
        this.toggleProperty('isLessonFiltersExpanded');
        break;
      case 'unit':
        component.get('units').forEach(function(item) {
          if (item.get('isUnitFiltersExpanded')) {
            item.set('isUnitFiltersExpanded', false);
          }
        });
        obj.set('lessons', obj.sortedLessonResults);
        if (obj.get('lessons').length > 0) {
          component.set('lessonId', obj.get('lessons').objectAt(0).id);
          component.set('unitId', obj.id);
          component.set('unit', obj);
          component.set('isUnitFiltersExpanded', true);
          component.set('newlessonId', obj.get('lessons').objectAt(0).id);
          this.sendAction('onSelectUnit', obj.id);
          this.sendAction('onUpdateReport');
          this.sendAction(
            'onSelectLesson',
            obj.get('lessons').objectAt(0).id
          );
          obj.set('isUnitFiltersExpanded', true);
        }
        break;
      }
    },
    /**
     * Selects the lesson
     * @param lessonId
     */
    selectLesson: function(lessonId) {
      this.set('lessonId', lessonId);
      this.sendAction('onSelectLesson', lessonId);
      this.sendAction('onUpdateReport');
    },
    /**
     * Selects the unit
     * @param unitId
     */
    selectUnit: function(unitId) {
      this.set('unitId', unitId);
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
        courseId: component.get('filterCriteria.courseId')
      });
    }
  },

  // -------------------------------------------------------------------------
  // Properties

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
  isUnitFiltersExpanded: true,
  /**
   * @property {Boolean} isLessonFiltersExpanded
   */
  isLessonFiltersExpanded: true,

  /**
   * Selected lesson
   * @property {Lesson}
   */
  lesson: Ember.computed('unit.sortedLessonResults.[]', 'lessonId', function() {
    const lessons = this.get('unit.sortedLessonResults') || [];
    return lessons.findBy('id', this.get('lessonId'));
  }),

  /**
   * @property {Lesson[]}
   */
  lessons: Ember.computed(
    'unit.sortedLessonResults.[]',
    'lessonId',
    function() {
      return this.get('unit.sortedLessonResults');
    }
  ),

  /**
   * @property {string}
   */
  lessonId: Ember.computed('unit.sortedLessonResults.[]', function() {
    return this.get('unit.sortedLessonResults.firstObject.id');
  }),
  /**
   * @property {string}
   */
  newlessonId: Ember.computed('unit.sortedLessonResults.[]', function() {
    return this.get('unit.sortedLessonResults.firstObject.id');
  }),

  /**
   * Selected course
   * @property {Course}
   */
  selectedCourse: null,

  /**
   * Indicate if show course tab
   * @property {Boolean}
   */
  showCourse: true,

  /**
   * Selected unit
   * @property {Unit}
   */
  unit: Ember.computed(
    'selectedCourse.sortedUnitResults.[]',
    'unitId',
    function() {
      const units = this.get('selectedCourse.sortedUnitResults') || [];
      return units.findBy('id', this.get('unitId'));
    }
  ),

  /**
   * @property {Unit[]}
   */
  units: Ember.computed('selectedCourse.sortedUnitResults.[]', function() {
    return this.get('selectedCourse.sortedUnitResults');
  }),

  /**
   * @property {string}
   */
  unitId: Ember.computed('selectedCourse.sortedUnitResults.[]', function() {
    return this.get('selectedCourse.sortedUnitResults.firstObject.id');
  })
});
