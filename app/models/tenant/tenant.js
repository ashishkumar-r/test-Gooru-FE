import Ember from 'ember';
/**
 * Model for tenant information
 *
 * @typedef {Object} Tenant
 *
 */
export default Ember.Object.extend({
  /**
   * @property {string}
   */
  id: null,

  /**
   * @property {*} settings
   */
  settings: {},

  /**
   * @property {*} theme settings
   */
  theme: Ember.computed.alias('settings.theme')
});
