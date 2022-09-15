import Ember from 'ember';
export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {performanceService} Service to retrieve milestone performance information
   */
  performanceService: Ember.inject.service('api-sdk/performance'),

  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Methods

  /**
   * Get visibility settings
   */
  getVisibilitySettings: function(classId) {
    return this.get('performanceService')
      .getVisibilitySettings(classId)
      .then(data => {
        return data;
      });
  },

  /**
   * Get active tenant setting
   */
  getActiveTenantSetting: function() {
    return this.get('tenantService')
      .getActiveTenantSetting()
      .then(data => {
        return data.enable_learners_data_visibilty_pref === 'on';
      });
  },

  /**
   * Get tenant setting
   */
  getTenantSetting: function() {
    return this.get('tenantService')
      .getActiveTenantSetting()
      .then(data => {
        return data;
      });
  }
});
