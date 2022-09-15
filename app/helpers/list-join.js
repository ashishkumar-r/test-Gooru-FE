import Ember from 'ember';

/**
 * Help to join the array value as string with delimiter
 */
export function listJoin(value, hash) {
  let { delimiter, key, filterKey } = hash;
  let arrayVal = filterKey ? value[0].filterBy(filterKey) : value[0];
  return arrayVal ? arrayVal.mapBy(key).join(delimiter ? delimiter : ' ') : '';
}

export default Ember.Helper.helper(listJoin);
