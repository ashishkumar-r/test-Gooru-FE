import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

export default buildValidations({
  title: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.rubric-title-presence'
      })
    ]
  },
  url: {
    validators: [
      validator('format', {
        disabled: Ember.computed.not('model.url'),
        type: 'url',
        message: '{{description}}',
        descriptionKey: 'common.errors.resource-invalid-url'
      })
    ]
  }
});
