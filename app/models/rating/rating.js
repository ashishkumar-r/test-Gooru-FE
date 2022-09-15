import DS from 'ember-data';

/**
 * Rating Model
 *
 * @typedef {Object} Rate
 */
export default DS.Model.extend({
  /**
   * Indicates the rate target. Values for this fields could be 'content' and 'user'.
   * @property {string} target
   */
  target: DS.attr('string'),
  /**
   * Indicates the type of rating. Values for this field are 'star' and 'thumb'.
   * @property {string} type
   */
  type: DS.attr('string'),
  /**
   * Indicates the rating score. For a 'star' type values are [1,2,3,4,5]. For a 'thumb' type values are [-1, 1].
   * @property {string} score
   */
  score: DS.attr('string'),
  /**
   * Indicates the gooruOid for 'content' target or gooruUid for 'user' target which the rating is associated with.
   * @property {string} associatedId
   */
  associatedId: DS.attr('string')
});
