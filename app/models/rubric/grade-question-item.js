import Ember from 'ember';

/**
 * Grade Question Item model
 *
 * @typedef {Object} Grade Question Item
 */
export default Ember.Object.extend({
  /**
   * @property {String} unitId
   */
  unitId: null,

  /**
   * @property {String} lessonId
   */
  lessonId: null,

  /**
   * @property {String} collectionId
   */
  collectionId: null,

  /**
   * @property {String} collectionType
   */
  collectionType: null,

  /**
   * @property {String} resourceId
   */
  resourceId: null,

  /**
  * @property {number} studentCount
  */
  studentCount: null
});
