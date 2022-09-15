import BaseValidator from 'ember-cp-validations/validators/base';
import Ember from 'ember';

export default BaseValidator.extend({
  profileService: Ember.inject.service('api-sdk/profile'),

  validate(value) {
    if (value) {
      return this.get('profileService').checkGoogleUsername(value).then(
        function() {
          return true;
        },
        function(error) {
          return error;
        }
      );
    } else {
      return true;
    }
  }
});
