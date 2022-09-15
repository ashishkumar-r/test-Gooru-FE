import Ember from 'ember';

export default Ember.Component.extend({
  // -------------------------------------------------------------------------
  // Dependencies

  // -------------------------------------------------------------------------
  // Attributes
  classNames: ['gru-tenant-theme'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {},

  // -------------------------------------------------------------------------
  // Events

  // -------------------------------------------------------------------------
  // Method
  // -------------------------------------------------------------------------
  // Properties
  /**
   * @property {Tenant} tenant information
   */
  tenant: null,

  /**
   * @property {*} theme settings
   */
  theme: Ember.computed.alias('tenant.theme')
});
