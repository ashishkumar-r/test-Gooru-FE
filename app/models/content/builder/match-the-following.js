import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

const Validations = buildValidations({
  leftValue: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.match-the-following-answer'
      })
    ]
  },
  rightValue: {
    validators: [
      validator('presence', {
        presence: true,
        message: '{{description}}',
        descriptionKey: 'common.errors.match-the-following-answer'
      })
    ]
  }
});

/**
 * match the following model
 * typedef {Object} MatchTheFollowing
 */
const MatchTheFollowing = Ember.Object.extend(Validations, {
  /**
   * @property {Number} sequence - The order sequence of the answer
   */
  sequence: 0,

  /**
   * @property {String} leftValue - Left side answer text
   */
  leftValue: null,

  /**
   * @property {String} rightValue - Right side answer text
   */
  rightValue: null,

  /**
   * @property {String} leftValueFormat - The answer format
   */
  leftValueFormat: null,

  /**
   * @property {String} rightValueFormat - The answer format
   */
  rightValueFormat: null,

  /**
   * @property {String} rightValShuffleOrder - The answer order
   */
  rightValShuffleOrder: null,

  /**
   * Return a copy of the answer
   *
   * @function
   * @return {Answer}
   */
  copy: function() {
    var properties = [];
    var enumerableKeys = Object.keys(this);
    for (let i = 0; i < enumerableKeys.length; i++) {
      let key = enumerableKeys[i];
      let value = Ember.typeOf(this.get(key));
      if (
        value === 'string' ||
        value === 'number' ||
        value === 'boolean' ||
        value === 'array' ||
        value === 'instance' ||
        value === 'object'
      ) {
        properties.push(key);
      }
    }

    // Copy the question data
    properties = this.getProperties(properties);

    return MatchTheFollowing.create(
      Ember.getOwner(this).ownerInjection(),
      properties
    );
  }
});

export default MatchTheFollowing;
