import { validator, buildValidations } from 'ember-cp-validations';

export default buildValidations({
  username: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.add-username'
      }),
      validator('length', {
        min: 4,
        max: 254,
        message: '{{description}}',
        descriptionKey: 'common.errors.username-length'
      }),
      validator('reserved-words')
    ]
  },

  firstName: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.sign-up-first-name'
      }),
      validator('length', {
        min: 2,
        message: '{{description}}',
        descriptionKey: 'common.errors.sign-up-name-length'
      })
    ]
  },

  lastName: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.sign-up-last-name'
      }),
      validator('length', {
        min: 2,
        message: '{{description}}',
        descriptionKey: 'common.errors.sign-up-name-length'
      })
    ]
  },

  password: [
    validator('presence', {
      presence: true,
      message: '{{description}}',
      descriptionKey: 'common.errors.password-required'
    }),
    /*  allowing any character for now
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
    /*  allowing any character for now
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
  ],

  email: [
    validator('format', {
      regex: /^(([^<>()[\].,;:\s@"]+(\.[^<>()[\].,;:\s@"]+)*)|(".+"))@(([^<>()[\].,;:\s@"]+\.)+[^<>()[\].,;:\s@"]{2,})$/i,
      message: '{{description}}',
      descriptionKey: 'common.errors.sign-up-valid-email'
    })
  ]
});
