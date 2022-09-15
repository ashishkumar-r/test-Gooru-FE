import Ember from 'ember';
import CollectionBase from 'gooru-web/models/content/collection-base';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  title: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.collection-title-presence'
      })
    ]
  }
});

/**
 * Collection model
 * typedef {Object} Collection
 */
export default Ember.Object.extend(Validations, CollectionBase, {
  /**
   * @property {string} indicates it is an collection
   */
  collectionType: 'collection'
});
