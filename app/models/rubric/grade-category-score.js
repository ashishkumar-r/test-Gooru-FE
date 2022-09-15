import Ember from 'ember';

/**
 * Grade Category Score model
 *
 * @typedef {Object} GradeCategoryScore
 */
export default Ember.Object.extend({
  /**
   * @property {String} title
   */
  title: null,
  /**
   * @property {String} level obtained
   */
  levelObtained: null,

  /**
   * @property {Integer} Max score for the level
   */
  levelMaxScore: null,

  /**
   * @property {Integer} Score for the level
   */
  levelScore: null,

  /**
   * @property {String} level comment
   */
  levelComment: null,

  /**
   * If the category has scores
   * @property {Boolean}
   */
  hasScore: Ember.computed('levelScore', function() {
    const score = this.get('levelScore');
    return !!score || score === 0;
  })
});
