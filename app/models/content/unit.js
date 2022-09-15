import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  title: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.unit-title-required'
      })
    ]
  }
});

/**
 * Unit model
 *
 * @typedef {Object} Content/Unit
 */
export default Ember.Object.extend(Validations, {
  /**
   * @property {String} id - Gooru id for the unit
   */
  id: null,

  /**
   * @property {String} bigIdeas
   */
  bigIdeas: '',

  /**
   * @property {Content/Lesson[]} children - List of unit lessons
   */
  children: [],

  /**
   * @property {String} essentialQuestions
   */
  essentialQuestions: '',
  /**
   * @property {String} hours
   */
  expectedhours: '',
  /**
   * @property {String} minutes
   */
  expectedminutes: '',

  /**
   * @property {Number} lessonsTotal - total number of lessons in the unit
   */
  lessonCount: 0,

  /**
   * @property {String} sequence - sequence order among other course units
   */
  sequence: 0,

  /**
   * @property {String} title
   */
  title: '',

  /**
   * @property {Object[]} taxonomy - Taxonomy array
   */
  taxonomy: [],

  /**
   * @property {Number} membersCount - number of members in the unit (for analytics)
   */
  membersCount: 0,

  /**
   * @property {sortedLessonResults[]} Lessons sorted by sequence
   */
  sortedLessonResults: Ember.computed('children.[]', function() {
    return this.get('children').sortBy('sequence');
  }),

  /**
   * Return a copy of the unit for editing
   *
   * @function
   * @return {Content/Unit}
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

    // Copy the unit data
    properties = this.getProperties(properties);
    properties.taxonomy = Ember.A(this.get('taxonomy').slice(0));
    return this.get('constructor').create(
      Ember.getOwner(this).ownerInjection(),
      properties
    );
  },

  /**
   * Copy a list of property values from another unit to override the current ones
   *
   * @function
   * @param {Content/Unit} unit
   * @param {String[]} propertyList
   * @return {null}
   */
  merge: function(unit, propertyList = []) {
    var properties = unit.getProperties(propertyList);
    this.setProperties(properties);
  },

  /**
   * Get an specific lesson index of the children
   *
   * @function
   * @param {Lesson} lesson
   * @return {Number}
   */
  getChildLessonIndex: function(lesson) {
    return this.get('sortedLessonResults')
      .mapBy('id')
      .indexOf(lesson.get('id'));
  }
});
