import Ember from 'ember';

/**
 * @typedef {Object} StoreMixin
 */
export default Ember.Mixin.create({
  /**
   * @property {Store} Store service
   */
  store: Ember.inject.service()
});
