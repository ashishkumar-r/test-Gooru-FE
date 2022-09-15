import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  title: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.lesson-title-required'
      })
    ]
  }
});

/**
 * Lesson model
 *
 * @typedef {Object} Content/Lesson
 */
export default Ember.Object.extend(Validations, {
  /**
   * @property {Number} assessmentCount - total number of assessments in the lesson
   */
  assessmentCount: Ember.computed('children.[]', function() {
    return this.get('children').filter(
      item =>
        item.format === 'assessment' || item.format === 'assessment-external'
    ).length;
  }),

  /**
   * @property {Content/LessonItem[]} children - List of collections/assessments
   */
  children: Ember.A([]),

  /**
   * @property {Number} collectionCount - total number of collections in the lesson
   */
  collectionCount: Ember.computed('children.[]', function() {
    return this.get('children').filter(
      item =>
        item.format === 'collection' || item.format === 'collection-external'
    ).length;
  }),

  /**
   * @property {String} id - Gooru id for the lesson
   */
  id: '',

  /**
   * @property {String} sequence - sequence order among other unit lessons
   */
  sequence: 0,

  /**
   * @property {String} standards - List of taxonomy terms
   */
  taxonomy: [],

  /**
   * @property {String} title
   */
  title: '',

  /**
   * @property {LessonPlanModel} lessonPlan
   */
  lessonPlan: null,
  /**
   * @property {Number} membersCount - number of members in the lesson (for analytics)
   */
  membersCount: 0,

  /**
   * @property {sortedCollectionResults[]} Collections sorted by sequence
   */
  sortedCollectionResults: Ember.computed('children.[]', function() {
    return this.get('children').sortBy('sequence');
  }),

  /**
   * This property is not always available, it contains the lesson performance information
   * @see components/class/overview/gru-accordion-unit.js
   * @propery {LessonPerformance|Ember.Object}
   */
  performance: null,

  /**
   * Return a copy of the lesson for editing
   *
   * @function
   * @return {Content/Lesson}
   */
  copy: function() {
    var properties = [];
    var enumerableKeys = Object.keys(this);

    for (let i = 0; i < enumerableKeys.length; i++) {
      let key = enumerableKeys[i];
      let value = Ember.typeOf(this.get(key));

      // Copy null values as well to avoid triggering the validation on empty input fields
      if (
        value === 'string' ||
        value === 'number' ||
        value === 'boolean' ||
        value === 'null'
      ) {
        properties.push(key);
      }
    }

    // Copy the lesson data
    properties = this.getProperties(properties);
    return this.get('constructor').create(
      Ember.getOwner(this).ownerInjection(),
      properties
    );
  },

  /**
   * Copy a list of property values from another lesson to override the current ones
   *
   * @function
   * @param {Content/Lesson} lesson
   * @param {String[]} propertyList
   * @return {null}
   */
  merge: function(lesson, propertyList = []) {
    var properties = lesson.getProperties(propertyList);
    this.setProperties(properties);
  },
  /**
   * @property {String} etlHrs
   */
  etlHrs: '',
  /**
   * @property {String} etlMins
   */
  etlMins: '',
  /**
   * @property {String} computedHours
   */
  computedHours: '',
  /**
   * @property {String} computedMinutes
   */
  computedMinutes: ''
});
