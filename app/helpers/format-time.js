import Ember from 'ember';
import { formatTime as formatMilliseconds } from 'gooru-web/utils/utils';

/**
 * Give format to a time value
 */
export function formatTime(value /*, hash*/) {
  var time = value[0];
  var hasDigit = value[1] || false;
  return formatMilliseconds(time, hasDigit);
}

export default Ember.Helper.helper(formatTime);
