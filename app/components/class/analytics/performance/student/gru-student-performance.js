import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes
  /**
   * Attribute that computes the element to the specified string.
   *
   * @attribute {String}
   */
  tagName: 'ol',
  /**
   * Array that computes the elements class names to the specified strings in the array.
   *
   * @attribute {Array}
   */
  classNames: ['gru-student-performance-container', 'panel-group'],
  /**
   * Attribute that tells the component that it will contain these attributes.
   *
   * @attribute {Array}
   */
  attributeBindings: ['role', 'aria-multiselectable'],
  /**
   * Attribute that computes the elements 'role' attribute to the specified string.
   *
   * @attribute {String}
   */
  role: 'tablist',
  /**
   * Attribute that computes the elements 'aria-multiselectable' attribute to the specified string.
   *
   * @attribute {String}
   */
  'aria-multiselectable': 'true',

  /**
   * The class content visibility
   * @property {ClassContentVisibility}
   */
  contentVisibility: null,

  // -------------------------------------------------------------------------
  // Actions

  actions: {
    /**
     * @function actions:selectResource
     * @param {string} collection - (collection/assessment)
     */
    selectResource: function(unitId, lessonId, collection) {
      // Send the action so that it bubbles up to the route
      this.sendAction('onSelectResource', unitId, lessonId, collection);
    },

    /**
     * @function actions:viewReport
     * @param {string} collection - Identifier for a resource (collection/assessment)
     */
    viewReport: function(unitId, lessonId, collection) {
      // Send the action so that it bubbles up to the route
      this.sendAction('onViewReport', unitId, lessonId, collection);
    },

    /**
     * Trigger the 'onLocationUpdate' event handler
     *
     * @function actions:updateLocation
     * @param {string} newLocation - String that contains the id of the change
     * @param {string} type - String that says whether its a unit or a lesson
     */
    updateLocation: function(newLocation, type) {
      this.get('onLocationUpdate')(newLocation, type);
    }
  },

  // -------------------------------------------------------------------------
  // Events

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
   * Collection that contains the unit performance models for this unit, class, course and student
   *
   * @property {Ember.Array}
   */
  performances: null,
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
   * Selected UnitId the selected unit's id belongs to
   *
   * @property {String}
   */
  selectedUnitId: null,
  /**
   * Selected LessonId the selected lesson's id belongs to
   *
   * @property {String}
   */
  selectedLessonId: null

  // -------------------------------------------------------------------------

  // Methods
});
