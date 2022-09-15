import Ember from 'ember';
import UIHelperMixin from 'gooru-web/mixins/ui-helper-mixin';

export default Ember.Route.extend(UIHelperMixin, {
  queryParams: {
    libraryId: {
      refreshModel: true
    },
    type: {
      refreshModel: true
    },
    profileId: {
      refreshModel: true
    },
    isBack: {
      refreshModel: true
    },
    term: {
      refreshModel: true
    },
    isDeepLink: false,
    activeContentType: false
  },

  /**
   * @type {libraryService} Library service object
   */
  libraryService: Ember.inject.service('api-sdk/library'),

  /**
   * @type {ProfileService} Service to retrieve profile information
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  /**
   * @property {Service} session
   */
  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Methods

  model: function(params) {
    this.setTitle('Library Search', params.activeContentType, null, true);
    const libraryId = params.libraryId;
    const profileId = params.profileId
      ? !this.get('session.isAnonymous')
        ? params.profileId
        : null
      : !this.get('session.isAnonymous')
        ? this.get('session.userId')
        : null;
    return Ember.RSVP.hash({
      library: libraryId
        ? this.get('libraryService').fetchById(libraryId)
        : null,
      profile: profileId
        ? this.get('profileService').readUserProfile(profileId)
        : null,
      userPreference: !this.get('session.isAnonymous')
        ? this.get('profileService').getProfilePreference()
        : null
    });
  },

  setupController: function(controller, model) {
    let standardPreference = model.userPreference
      ? model.userPreference.standard_preference
      : null;
    if (standardPreference) {
      let userFreamwork = Object.values(standardPreference)[0];
      controller.set('userPreferenceFreamwork', userFreamwork);
      controller.set('isCrosswalkApplicable', true);
    }
    controller.set('library', model.library);
    controller.set('profile', model.profile);
    if (controller.get('isDeepLink') === 'true') {
      if (
        !controller.get('activeContentType') ||
        controller.get('activeContentType') === 'course'
      ) {
        controller.set('activeContentType', 'collection');
      }
    } else {
      if (!controller.get('activeContentType')) {
        controller.set('activeContentType', 'course');
      }
    }
    controller.initializeSelectedFilter();
    if (controller.get('term')) {
      controller.searchByParams(controller.get('term'));
    } else {
      controller.fetchContent();
    }
  },

  resetController(controller) {
    var queryParams = controller.get('queryParams');
    queryParams.forEach(function(param) {
      controller.set(param, undefined);
    });
    controller.resetProperties();
  }
});
