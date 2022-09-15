import Ember from 'ember';
/* import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  taskSubmissionSubType: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.activity-title-presence'
      })
    ]
  },
  taskSubmissionType: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.activity-title-presence'
      })
    ]
  }
}); */

/**
 * Submission model
 *
 * @typedef {Object} Content/Unit
 */
export default Ember.Object.extend(
  /* Validations, */ {
    /**
     * @property {String} id - Gooru id for the submission
     */
    id: null,

    /**
     * @property {String} id- Parent OA task id
     */
    oaTaskId: null,

    /**
     * @property {String} type of task submission
     */
    taskSubmissionType: '',

    /**
     * @property {String} SubType of task submission
     */
    taskSubmissionSubType: '',

    /**
     * Return a copy of the submission for editing
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

      // Copy the submission data
      properties = this.getProperties(properties);
      //properties.taxonomy = Ember.A(this.get('taxonomy').slice(0));
      return this.get('constructor').create(properties);
    },

    /**
     * Copy a list of property values from another submission to override the current ones
     *
     * @function
     * @param {Content/oa/task/submission} submission
     * @param {String[]} propertyList
     * @return {null}
     */
    merge: function(unit, propertyList = []) {
      var properties = unit.getProperties(propertyList);
      this.setProperties(properties);
    }
  }
);
