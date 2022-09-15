import Ember from 'ember';

/**
 * 21-century-skills model
 *
 * @typedef {Object} CenturySkill
 */
var CenturySkill = Ember.Object.extend({
  /**
   * @property {String} id
   */
  id: null,

  /**
   * @property {String} label
   */
  label: '',

  /**
   * @property {Boolean} It says if the skill is in hewlettDeepLearningModel category
   */
  hewlettDeepLearningModel: false,

  /**
   * @property {Boolean} It says if the skill is in conleyFourKeysModel category
   */
  conleyFourKeysModel: false,

  /**
   * @property {Boolean} It says if the skill is in p21FrameworkModel category
   */
  p21FrameworkModel: false,

  /**
   * @property {Boolean} It says if the skill is in nationalResearchCenterModel category
   */
  nationalResearchCenterModel: false,

  /**
   * @property {String} Century Skills group
   */
  group: null
});

export default CenturySkill;
