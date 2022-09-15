import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  performanceService: Ember.inject.service('api-sdk/performance'),

  unitService: Ember.inject.service('api-sdk/unit'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['gru-unit-performance-container'],

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * Load the data for this unit and trigger
     * the 'onLocationUpdate' event handler with the unit information
     *
     * @function actions:selectUnit
     */
    selectUnit: function(unit) {
      const component = this;

      if (this.isSelected()) {
        //When clicking on a unit to close it, remove the unit and lesson query params
        component.get('onLocationUpdate')(null, 'unit');
      } else {
        component.loadLessons(unit.get('id'));
        //When clicking on a unit to open it set the unit query param and the selectedUnitId attribute
        component.get('onLocationUpdate')(unit.get('id'), 'unit');
      }
    },
    /**
     * @function actions:selectResource
     * @param {string} lessonId - Identifier for a lesson
     * @param {string} collection - collection/assessment
     */
    selectResource: function(lessonId, collection) {
      let unitId = this.get('unit.id');
      this.get('onSelectResource')(unitId, lessonId, collection);
    },
    /**
     * @function actions:viewReport
     * @param {string} lessonId - Identifier for a lesson
     * @param {string} collection - collection/assessment
     */
    viewReport: function(lessonId, collection) {
      let unitId = this.get('unit.id');
      this.get('onViewReport')(unitId, lessonId, collection);
    },
    /**
     * Update selected lesson action
     * @param {string} lessonId
     */
    updateSelectedLesson: function(lessonId) {
      const component = this;
      component.notifySelectedLesson(lessonId);
    }
  },

  // -------------------------------------------------------------------------
  // Events

  didInsertElement: function() {
    this.toggleCollapse();
    this.toggleSelected();
    if (this.isSelected()) {
      const unit = this.get('unit');
      this.loadLessons(unit.get('id'));
    }
  },

  // -------------------------------------------------------------------------
  // Properties
  /**
   * Selected option to show when on extra small
   *
   * @property {String}
   */
  selectedOption: null,

  /**
   * The selected filter by from the drop down
   * @property {String}
   */
  selectedFilterBy: null,

  /**
   * Collection that contains the lesson performance models for this unit
   *
   * @property {Ember.Array}
   */
  lessons: null,

  /**
   * Number of the index of this unit
   *
   * @property {Number}
   */
  localIndex: null,

  /**
   * Model of the class this unit belongs to
   *
   * @property {Class}
   */
  classModel: null,

  /**
   * UserID this user belongs to
   *
   * @property {String}
   */
  userId: null,

  /**
   * Currently selected unit Id
   *
   * @property {String}
   */
  selectedUnitId: null,

  /**
   * Currently selected lesson Id
   *
   * @property {String}
   */
  selectedLessonId: null,

  /**
   * Performance model for the unit
   *
   * @property {performance/performance}
   */
  unit: null,

  /**
   * @prop {Boolean}
   * Property that determines whether we are waiting for a promise to get fulfilled.
   */
  isLoading: false,

  /**
   * Indicates if the current unit is the selected one
   * @property {boolean} selected
   */
  selected: Ember.computed('selectedUnitId', 'unit.id', function() {
    return this.isSelected(); //calling method because this property was not refreshed before events, so weird
  }),

  /**
   * The class content visibility
   * @property {ClassContentVisibility}
   */
  contentVisibility: null,

  /**
   * @property {boolean} indicates if the data is filtered by collection
   */
  isFilteredByCollection: Ember.computed.equal(
    'selectedFilterBy',
    'collection'
  ),

  // -------------------------------------------------------------------------
  // Observers
  /**
   * Observes if the selection has changed
   */
  onSelectedUnitChange: Ember.observer('selectedUnitId', 'unit.id', function() {
    this.toggleSelected();
    this.toggleCollapse();
  }),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Get all the lessons for the unit
   *
   * @function
   * @requires api-sdk/lesson#findByClassAndCourseAndUnit
   * @returns {Ember.RSVP.Promise}
   */
  loadLessons: function(unitId) {
    const component = this;
    const classId = this.get('classModel.id');
    const courseId = this.get('classModel.courseId');
    const userId = this.get('userId');
    component.set('isLoading', true);
    component
      .loadData(classId, courseId, unitId, userId)
      .then(function(lessonPerformances) {
        component.set('lessons', lessonPerformances);
        component.set('isLoading', false);
      });
  },

  loadData: function(classId, courseId, unitId, userId) {
    const component = this;
    const filterBy = component.get('selectedFilterBy');
    return component
      .get('unitService')
      .fetchById(courseId, unitId)
      .then(function(unit) {
        const lessons = unit.get('children');
        return component
          .get('performanceService')
          .findStudentPerformanceByUnit(
            userId,
            classId,
            courseId,
            unitId,
            lessons,
            { collectionType: filterBy }
          )
          .then(function(lessonPerformances) {
            component.fixTotalCounts(unitId, lessonPerformances, filterBy);
            return lessonPerformances;
          });
      });
  },

  /**
   * Trigger the 'onLocationUpdate' event handler with the lesson information
   *
   * @function actions:updateLesson
   */
  notifySelectedLesson: function(lessonId) {
    const component = this;
    component.get('onLocationUpdate')(lessonId, 'lesson');
  },

  /**
   * Toggles the collapse/expand
   */
  toggleCollapse: function() {
    const component = this;
    const selected = component.isSelected();

    let collapsibleElement = Ember.$(this.element).find('.lessons-container');
    collapsibleElement.collapse(selected ? 'show' : 'hide');
  },

  /**
   * Toggles selected
   */
  toggleSelected: function() {
    const $element = Ember.$(this.element);
    if (this.isSelected()) {
      $element.addClass('selected');
    } else {
      $element.removeClass('selected');
    }
  },

  /**
   * Indicates if the current unit is selected
   * This method was necessary because the ember computed was not refreshed before the event was trigger
   * @returns {boolean}
   */
  isSelected: function() {
    return this.get('selectedUnitId') === this.get('unit.id');
  },

  fixTotalCounts: function(unitId, performances, filterBy) {
    const controller = this;
    const contentVisibility = controller.get('contentVisibility');
    performances.forEach(function(performance) {
      //overriding totals from core
      const totals =
        filterBy === 'assessment'
          ? contentVisibility.getTotalAssessmentsByUnitAndLesson(
            unitId,
            performance.get('realId')
          )
          : contentVisibility.getTotalCollectionsByUnitAndLesson(
            unitId,
            performance.get('realId')
          );
      performance.set('completionTotal', totals);
    });
  }
});
