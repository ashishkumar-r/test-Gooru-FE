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
        descriptionKey: 'common.errors.external-assessment-title-presence'
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
 * Assessment model
 * typedef {Object} Assessment
 */
export default Ember.Object.extend(Validations, CollectionBase, {
  /**
   * @property {string} indicates it is an assessment
   */
  collectionType: 'assessment-external',

  /**
   * @property {string}
   */
  url: null,

  /**
   * @property {boolean}
   */
  isExternalAssessment: Ember.computed.equal(
    'format',
    CONTENT_TYPES.EXTERNAL_ASSESSMENT
  ),

  /**
   * @property {integer}
   */
  attempts: -1,

  /**
   * @property {boolean}
   */
  bidirectional: false,

  /**
   * @property {string}
   */
  showFeedback: null,

  /**
   * @property {boolean}
   */
  classroom_play_enabled: null,

  /**
   * @property {string}
   */
  showKey: null,

  toPlayerCollection: function() {
    var collection = this._super(...arguments);
    collection.set('attempts', this.attempts);
    collection.set('bidirectional', this.bidirectional);
    collection.set('showFeedback', this.showFeedback);
    collection.set('showKey', this.showKey);
    return collection;
  }
});
