import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';
/**
 * Library route
 *
 * @module
 * @augments Ember.Route
 */

export default Ember.Route.extend(UIHelperMixin, {
  queryParams: {
    isDeepLink: false
  },
  // -------------------------------------------------------------------------
  // Dependencies
  /**
   * @type {searchService} Search service object
   */
  searchService: Ember.inject.service('api-sdk/search'),

  /**
   * @type {libraryService} Library service object
   */
  libraryService: Ember.inject.service('api-sdk/library'),

  /**
   * @property {Service} session
   */
  session: Ember.inject.service('session'),

  /**
   * @property {Service} tenant
   */
  tenantService: Ember.inject.service('api-sdk/tenant'),

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    this.setTitle('Library', null, null, true);
    this.set('isDeepLink', params.isDeepLink === 'true');
    return Ember.RSVP.hash({
      libraries: this.get('libraryService').fetchLibraries(),
      tenantSettings: this.get('tenantService').getActiveTenantSetting(),
      session: this.get('session')
    });
  },

  setupController: function(controller, model) {
    controller.set('libraries', model.libraries);
    controller.set('session', model.session);
    controller.set(
      'showGooruCatalog',
      this.getGooruCatalogVisibility(model.tenantSettings)
    );
    this.resetFilter();
  },

  resetFilter() {
    const router = this;
    const userId = router.get('session.userId');
    if (userId) {
      window.localStorage.removeItem(`${userId}_search_filter`);
    }
  },

  getGooruCatalogVisibility(tenantSettings) {
    if (tenantSettings && tenantSettings.library_visibility) {
      return tenantSettings.library_visibility.hide_gooru_catalog !== true;
    }
    return true;
  }
});
