import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  email: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.user.email-error'
      }),
      validator('format', {
        type: 'email',
        message: '{{description}}',
        descriptionKey: 'common.errors.user-email-presence'
      })
    ]
  }
});
/**
 * Profile model for the email verification
 *
 * @typedef {Object} ProfileModel
 */
export default Ember.Object.extend(Validations, {
  /**
   * @property {string} email - Resend email
   */
  email: null
});
