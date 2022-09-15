import Ember from 'ember';

/**
 * Create Object based on key on value specially used to create path params
 * @property {Array} value help to read the object value
 * @property {Object} hash having numer of keys and values
 */
export function getObject(value, hash) {
  const obj = {};
  obj[value[0]] = hash;
  return obj;
}

export default Ember.Helper.helper(getObject);
