import { validator, buildValidations } from 'ember-cp-validations';

export default buildValidations({
  description: {
    validators: [
      validator('length', {
        max: 500,
        message: '{{description}}',
        descriptionKey: 'common.errors.resource-description-length'
      })
    ]
  },
  format: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.resource-missing-type'
      })
    ]
  },
  title: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.resource-missing-title'
      }),
      validator('length', {
        max: 50,
        message: '{{description}}',
        descriptionKey: 'common.errors.resource-title-length'
      })
    ]
  },
  url: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.resource-missing-url'
      }),
      validator('format', {
        type: 'url',
        message: '{{description}}',
        descriptionKey: 'common.errors.resource-invalid-url'
      }),
      validator('host')
    ]
  }
});
