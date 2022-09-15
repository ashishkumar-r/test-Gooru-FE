import { validator, buildValidations } from 'ember-cp-validations';

export default buildValidations({
  password: [
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

  rePassword: [
    validator('presence', {
      presence: true,
      message: '{{description}}',
      descriptionKey: 'common.errors.password-confirm'
    }),
    /* allowing any character for now
    validator('format', {
      regex: /^[a-z0-9]+$/i,
      message: '{{description}}',
      descriptionKey: 'common.errors.password-special-characters'
    }),
*/
    validator('confirmation', {
      on: 'password',
      message: '{{description}}',
      descriptionKey: 'common.errors.password-not-match'
    })
  ]
});
