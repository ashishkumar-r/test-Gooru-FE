import Ember from 'ember';
/**
 * Teacher Scale Indicator
 *
 * Component responsible for showing the Performance Scale Indicator in the teacher page.
 *
 * @module
 * @augments ember/Component
 */
export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies
  performanceService: Ember.inject.service('api-sdk/performance'),

  lessonService: Ember.inject.service('api-sdk/lesson'),

  // -------------------------------------------------------------------------
  // Attributes
  /**
   * Array that computes the elements class names to the specified strings in the array.
   *
   * @attribute {Array}
   */
  classNames: ['gru-lesson-performance-container'],
  /**
   * Attribute that computes the element to the specified string.
   *
   * @attribute {String}
   */
  tagName: 'div',

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     *
     * Change the arrow's direction
     *
     * @function actions:selectUnit
     */
    selectLesson: function(lesson) {
      const component = this;
      if (component.isSelected()) {
        this.get('onSelectLesson')();
      } else {
        this.get('onSelectLesson')(lesson.get('id'));
      }
    },

    /**
     * @function actions:selectResource
     * @param {string} collection - (collection/assessment)
     */
    selectResource: function(collection) {
      let lessonId = this.get('lesson.id');
      this.get('onSelectResource')(lessonId, collection);
    },

    /**
     * @function actions:viewReport
     * @param {string} collection - Identifier for a resource (collection/assessment)
     */
    viewReport: function(collection) {
      let lessonId = this.get('lesson.id');
      this.get('onViewReport')(lessonId, collection);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didInsertElement: function() {
    this.toggleCollapse();
  },
  // -------------------------------------------------------------------------
  // Observers
  /**
   * Observes if the selection has changed
   */
  expandCollapse: Ember.observer('selectedLessonId', 'lesson.id', function() {
    this.toggleCollapse();
  }),

  // -------------------------------------------------------------------------
  // Properties
  /**
   * Selected option to show when on extra small
   *
   * @property {String}
   */
  selectedOption: null,
  /**
   *  Performance models for this lesson, unit, class, course and student
   *
   * @property {LessonPerformance}
   */
  lesson: null,
  /**
   * Number of the index of this lesson
   *
   * @property {Number}
   */
  localIndex: null,
  /**
   * Number of the index of this lessons data parent.
   *
   * @property {Number}
   */
  index: null,
  /**
   * UserID this user belongs to
   *
   * @property {String}
   */
  userId: null,

  /**
   * SelectedLessonId the currently selected lesson ID(Query Param)
   *
   * @property {String}
   */
  selectedLessonId: null,

  /**
   * Indicates if the current lesson is the selected one
   * @property {boolean} selected
   */
  selected: Ember.computed('selectedLessonId', 'lesson.id', function() {
    return this.isSelected(); //calling the method because the property was not refreshed before events
  }),

  /**
   * The class content visibility
   * @property {ClassContentVisibility}
   */
  contentVisibility: null,

  /**
   * The selected filter by from the drop down
   * @property {String}
   */
  selectedFilterBy: null,

  /**
   * @property {boolean} indicates if the data is filtered by collection
   */
  isFilteredByCollection: Ember.computed.equal(
    'selectedFilterBy',
    'collection'
  ),

  /**
   * @property {Class}
   */
  class: null,

  /**
   * @property {UnitPerformance}
   */
  unit: null,

  /**
   * @property {boolean} indicates if data is loading
   */
  loading: false,

  // -------------------------------------------------------------------------
  // Methods
  /**
   * Toggles the collapse/expand
   */
  toggleCollapse: function() {
    let selected = this.isSelected();
    let collapsibleElement = Ember.$(this.element).find(
      '.collections-container'
    );
    collapsibleElement.collapse(selected ? 'show' : 'hide');
    if (selected) {
      this.loadData();
    }
  },

  /**
   * Indicates if the current lesson is selected
   * This method was necessary because the ember computed was not refreshed before the event was trigger
   * @returns {boolean}
   */
  isSelected: function() {
    return this.get('selectedLessonId') === this.get('lesson.id');
  },

  /**
   * Loads the lesson children performance data
   */
  loadData: function() {
    const component = this;
    const lessonPerformance = component.get('lesson');
    const lessonId = lessonPerformance.get('id');
    const unitId = component.get('unit.id');
    const courseId = component.get('class.courseId');
    const filterBy = component.get('selectedFilterBy');
    const classId = component.get('class.id');
    const userId = component.get('userId');

    component.set('loading', true);
    return component
      .get('lessonService')
      .fetchById(courseId, unitId, lessonId)
      .then(function(lesson) {
        const collections = lesson.get('children').filter(function(collection) {
          return component.isCollectionFilterable(collection, filterBy);
        });
        return component
          .get('performanceService')
          .findStudentPerformanceByLesson(
            userId,
            classId,
            courseId,
            unitId,
            lessonId,
            collections,
            { collectionType: filterBy }
          )
          .then(function(collectionPerformances) {
            lessonPerformance.set('collections', collectionPerformances);
            component.set('loading', false);
          });
      });
  },

  /**
   * Verifies is the collection is filterable according to the filterBy param value.
   * When the filterBy is an 'assessment' we verify if collection format is 'assessment' or 'assessment-external'.
   *
   * @param collection the collection
   * @param filterBy the filter by option
   * @returns {boolean} Returns true is the collection is filterable.
   */
  isCollectionFilterable: function(collection, filterBy) {
    return (
      filterBy === 'both' || collection.get('format').indexOf(filterBy) !== -1
    );
  }
});
