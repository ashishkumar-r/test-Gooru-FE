import Ember from 'ember';

/**
 * Task Url
 */
export function taskUrl(url /*, options*/) {
  return url[0].startsWith('http') ? url : `http://${url}`;
}

export default Ember.Helper.helper(taskUrl);
