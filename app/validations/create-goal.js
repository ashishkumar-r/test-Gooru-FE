import { validator, buildValidations } from 'ember-cp-validations';

export default buildValidations({
  title: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'goals.create.error-add-title'
      }),
      validator('length', {
        max: 200,
        message: '{{description}}',
        descriptionKey: 'goals.create.error-length-title'
      }),
      validator('reserved-words')
    ]
  },
  startDate: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'goals.create.error-add-start-date'
      })
    ]
  },
  endDate: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'goals.create.error-add-end-date'
      })
    ]
  },
  status: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'goals.create.error-add-status'
      })
    ]
  },
  reflection: {
    validators: [
      validator('length', {
        max: 2000,
        message: '{{description}}',
        descriptionKey: 'goals.create.error-length-reflection'
      }),
      validator('reserved-words')
    ]
  }
});
