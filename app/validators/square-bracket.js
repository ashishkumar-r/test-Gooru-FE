import BaseValidator from 'ember-cp-validations/validators/base';
import Ember from 'ember';
import { validateSquareBracket } from 'gooru-web/utils/utils';

const SquareBracket = BaseValidator.extend({
  /**
   * @property {Service} I18N service
   */
  i18n: Ember.inject.service(),

  /**
   * Validate string by checking square bracket formation
   * @param {value} value string to validate
   * @param {options} options
   * @param {model} model check question type
   * @return {Boolean}
   */
  validate(value, options, model) {
    let type = 'FIB';
    var isValidFormat = validateSquareBracket(value);
    var isFIB = model.get('type') === type;
    if (isFIB) {
      return isValidFormat
        ? true
        : this.get('i18n').t(options.messageKey).string;
    }
    return true;
  }
});

export default SquareBracket;
