import Ember from 'ember';
export default Ember.Mixin.create({
  // -------------------------------------------------------------------------
  // Dependencies

  /**
   * @type {tenantService} Service to fetch the tenant related information.
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Methods

  isMilestoneViewEnabled(preference, setting) {
    const tenantSetting = this.get('tenantService').getStoredTenantSetting();
    const subject =
      preference && preference.framework && preference.subject
        ? `${preference.framework}.${preference.subject}`
        : null;
    const parsedTenantSettings = JSON.parse(tenantSetting);
    const isMilestoneViewEnabledForTenant =
      setting && setting.enable_milestone_view !== undefined
        ? setting.enable_milestone_view
        : !(
          parsedTenantSettings &&
            parsedTenantSettings.enable_milestone_view_at_fw_level &&
            parsedTenantSettings.enable_milestone_view_at_fw_level[subject] ===
              false
        );
    return isMilestoneViewEnabledForTenant;
  }
});
