import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  term: {
    validators: [
      validator('length', {
        min: 3,
        allowBlank: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.search-collections-length'
      })
    ]
  }
});
/**
 * @typedef {Object} Standard
 */
export default Ember.Object.extend(Validations, {
  /**
   * @property {string} Search term for collection searcher
   */
  term: ''
});
