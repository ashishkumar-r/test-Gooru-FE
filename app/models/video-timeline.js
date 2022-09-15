import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  startTime: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.start-time'
      }),
      validator('length', {
        min: 8,
        message: '{{description}}',
        descriptionKey: 'timeline-min-character'
      })
    ]
  },
  endTime: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.end-time'
      }),
      validator('length', {
        min: 8,
        message: '{{description}}',
        descriptionKey: 'timeline-min-character'
      })
    ]
  }
});
/**
 * @typedef {Object} Standard
 */
export default Ember.Object.extend(Validations, {
  startTime: '',

  endTime: ''
});
