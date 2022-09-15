import Ember from 'ember';
import { validator, buildValidations } from 'ember-cp-validations';

export default class {
  constructor() {
    this.validations = {
      description: {
        validators: [
          validator('length', {
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
        disabled: Ember.computed('model.format', function() {
          return this.get('model.format') === 'html';
        }),
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
    };
  }

  /**
   * Get the corresponding validations for certain validation keys
   * @param {String[]} propertyList (e.g. ['format', 'title'])
   * @returns {Mixin} validation mixin
   */
  getValidationsFor(propertyList) {
    var result = {};

    for (let i = 0; i < propertyList.length; i++) {
      let key = propertyList[i];
      result[key] = this.validations[key];
    }
    return buildValidations(result);
  }

  /**
   * Get all the validations for the class's validation keys
   * @returns {Mixin} validation mixin
   */
  getAllValidations() {
    return buildValidations(this.validations);
  }
}
