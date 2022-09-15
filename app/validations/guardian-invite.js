import { validator, buildValidations } from 'ember-cp-validations';

export default buildValidations({
  firstName: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.guardian-first-name'
      })
    ]
  },

  lastName: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.guardian-last-name'
      })
    ]
  },

  relationshipId: [validator('presence', true)],

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
