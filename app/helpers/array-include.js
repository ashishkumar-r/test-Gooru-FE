import Ember from 'ember';

// Help to get object by index
export default Ember.Helper.helper(function([array, index]) {
  return !!(array && Array.isArray(array) && array.includes(index));
});
