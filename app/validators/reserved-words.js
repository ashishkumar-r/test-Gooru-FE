import BaseValidator from 'ember-cp-validations/validators/base';
import ConfigurationMixin from 'gooru-web/mixins/configuration';
import Ember from 'ember';

export default BaseValidator.extend(ConfigurationMixin, {
  i18n: Ember.inject.service(),

  validate(value) {
    if (value) {
      let reservedWord = this.get('reservedWords').find(function(item) {
        return item === value;
      });
      return reservedWord
        ? this.get('i18n').t('sign-up.error-username-taken').string
        : true;
    } else {
      return true;
    }
  }
});
