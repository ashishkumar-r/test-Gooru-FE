import Ember from 'ember';
/**
 *  Lookup Value for a given key
 * @param {ienum} source
 * @param {string} searchProp
 * @param {string} searchVal
 * @param {string} destProp
 */
export function getValue(source1, searchhash) {
  let { destProp, searchProp, searchVal, source } = searchhash;
  let result =
    source && source.length > 0
      ? source.filter(tg => tg[searchProp] === searchVal)
      : null;

  let filterRes =
      result &&
      (result.hasOwnProperty(destProp)
        ? result
        : result.length > 0 && result[0].hasOwnProperty(destProp)
          ? result[0]
          : null),
    retval = filterRes ? filterRes[destProp] : searchVal;
  return retval;
}

export default Ember.Helper.helper(getValue);
