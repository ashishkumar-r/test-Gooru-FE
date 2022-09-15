import Ember from 'ember';
import MultipleClassAdapter from 'gooru-web/adapters/class/multiple-class';
import MultipleClassSerializer from 'gooru-web/serializers/class/multiple-class';

export default Ember.Service.extend({
  /**
   * @property {MultipleClassAdapter} mulitpleClassAdapter
   */
  mulitpleClassAdapter: null,

  /**
   * @property {MulitpleClassSerializer} mulitpleClassSerializer
   */
  mulitpleClassSerializer: null,

  init() {
    this.set(
      'mulitpleClassAdapter',
      MultipleClassAdapter.create(Ember.getOwner(this).ownerInjection())
    );
    this.set(
      'mulitpleClassSerializer',
      MultipleClassSerializer.create(Ember.getOwner(this).ownerInjection())
    );
  },

  /**
   * @function fetchMultipleClassList
   * @param {UUID} classId
   * Method to fetch mutliple class
   */
  fetchMultipleClassList(classId) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('mulitpleClassAdapter')
        .fetchMultipleClassList(classId)
        .then(multipleClasses => {
          resolve(
            service
              .get('mulitpleClassSerializer')
              .normalizeMulitpleClass(multipleClasses)
          );
        }, reject);
    });
  },
  /**
   * @function updateMultipleClass
   * @param {UUID} classId
   * @param {Object} secondaryclasses
   */
  updateMultipleClass(classId, requestBody) {
    const service = this;
    return new Ember.RSVP.Promise((resolve, reject) => {
      service
        .get('mulitpleClassAdapter')
        .updateMultipleClass(classId, requestBody)
        .then(resolve, reject);
    });
  }
});
