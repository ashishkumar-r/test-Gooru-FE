import Ember from 'ember';
import CollectionBase from 'gooru-web/models/content/collection-base';
import { validator, buildValidations } from 'ember-cp-validations';
import { CONTENT_TYPES } from 'gooru-web/config/config';

const Validations = buildValidations({
  title: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.external-collection-title-presence'
      })
    ]
  },
  url: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.enter-url'
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

/**
 * Collection model
 * typedef {Object} Collection
 */
export default Ember.Object.extend(Validations, CollectionBase, {
  /**
   * @property {string} indicates it is an collection
   */
  collectionType: 'collection-external',

  /**
   * @property {string}
   */
  url: null,

  /**
   * @property {boolean}
   */
  isExternalCollection: Ember.computed.equal(
    'format',
    CONTENT_TYPES.EXTERNAL_COLLECTION
  )
});
