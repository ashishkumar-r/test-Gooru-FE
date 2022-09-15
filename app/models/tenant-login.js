import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  email: [
    validator('presence', {
      presence: true,
      message: '{{description}}',
      descriptionKey: 'common.user.email-error'
    }),
    validator('format', {
      regex: /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i,
      message: '{{description}}',
      descriptionKey: 'common.errors.sign-up-valid-email'
    })
  ]
});

/**
 *
 * @typedef {Object} ProfileModel
 */
export default Ember.Object.extend(Validations, {
  /**
   * @property {string} email - The user email
   */
  email: null
});
