import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  title: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'oa.task.task-title-required'
      })
    ]
  }
});

/**
 *
 *
 * Task model
 *
 * @typedef {Object} Content/Unit
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
   * @property {String} title
   */
  title: null,

  /**
   * @property {String} description
   */
  description: '',

  /**
   * @property {Object[]} submission - submission array
   */
  oaTaskSubmissions: [],

  /**
   * @property {Number} submissionCount - number of submission in the task
   */
  submissionCount: 0,

  /**
   * Return a task of the unit for editing
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
    let oaTaskSubmissions = this.get('oaTaskSubmissions');
    properties.oaTaskSubmissions = oaTaskSubmissions.slice(0);
    return this.get('constructor').create(properties);
  },

  /**
   * Copy a list of property values from another task to override the current ones
   *
   * @function
   * @param {Content/oa/task} task
   * @param {String[]} propertyList
   * @return {null}
   */
  merge: function(unit, propertyList = []) {
    var properties = unit.getProperties(propertyList);
    this.setProperties(properties);
  }
});
