import { validator, buildValidations } from 'ember-cp-validations';

export default buildValidations({
  oldPassword: [
    validator('presence', {
      presence: true,
      message: '{{description}}',
      descriptionKey: 'common.errors.password-required'
    }),
    /* allowing any character for now
    validator('format', {
      regex: /^[a-z0-9]+$/i,
      message: '{{description}}',
      descriptionKey: 'common.errors.password-special-characters'
    }),
*/
    validator('length', {
      min: 5,
      max: 14,
      message: '{{description}}',
      descriptionKey: 'common.errors.password-length'
    })
  ],

  newPassword: [
    validator('presence', {
      presence: true,
      message: '{{description}}',
      descriptionKey: 'change-password.new-password-required'
    }),
    validator('length', {
      min: 5,
      max: 14,
      message: '{{description}}',
      descriptionKey: 'common.errors.password-length'
    })
    /* allowing any character for now
    validator('format', {
      regex: /^[a-z0-9]+$/i,
      message: '{{description}}',
      descriptionKey: 'common.errors.password-special-characters'
    }),
*/
    /*  validator('confirmation', {
      on: 'password',
      message: '{{description}}',
      descriptionKey: 'common.errors.password-not-match'
    }) */
  ],

  confirmPassword: [
    validator('presence', {
      presence: true,
      message: '{{description}}',
      descriptionKey: 'common.errors.password-confirm'
    }),
    validator('confirmation', {
      on: 'newPassword',
      message: '{{description}}',
      descriptionKey: 'common.errors.password-not-match'
    })
  ]
});
