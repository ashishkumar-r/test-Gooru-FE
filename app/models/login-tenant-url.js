import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  url: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.resource-missing-url'
      })
    ]
  }
});

/**
 *
 * @typedef {Object} ProfileModel
 */
export default Ember.Object.extend(Validations, {
  /**
   * @property {string} email - The user email
   */
  url: null
});
