import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  location: [
    validator('presence', {
      presence: true,
      message: '{{description}}',
      descriptionKey: 'common.enter-url'
    }),
    validator('format', {
      type: 'url',
      message: '{{description}}',
      descriptionKey: 'errors.url'
    })
  ],
  fileName: [
    validator('presence', {
      presence: true,
      message: '{{description}}',
      descriptionKey: 'common.referene.name'
    })
  ]
});

/**
 *
 *
 * reference model
 *
 * @typedef {Object} Content/oa/reference
 */
export default Ember.Object.extend(Validations, {
  /**
   * @property {String} id - Gooru id for the unit
   */
  id: null,

  /**
   * @property {String} id- Parent OA id
   */
  oaId: null,

  /**
   * @property {String} type
   */
  type: '',

  /**
   * @property {String} subType
   */
  subType: '',

  /**
   * @property {location} location
   */
  location: null,

  /**
   *
   *
   * @function
   * @return {Content/oa/task}
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

    // Copy the task data
    properties = this.getProperties(properties);

    return this.get('constructor').create(properties);
  },

  /**
   * Copy a list of property values from another reference to override the current ones
   *
   * @function
   * @param {Content/oa/reference} reference
   * @param {String[]} propertyList
   * @return {null}
   */
  merge: function(unit, propertyList = []) {
    var properties = unit.getProperties(propertyList);
    this.setProperties(properties);
  }
});
