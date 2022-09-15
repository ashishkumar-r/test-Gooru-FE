import Ember from 'ember';

export default Ember.Controller.extend({
  parentController: Ember.inject.controller('profile'),

  /**
   * @requires {profileService} Service to retrieve a profile
   */
  profileService: Ember.inject.service('api-sdk/profile'),

  userProfile: Ember.computed.alias('parentController.profile'),

  userPreference: Ember.computed.alias('parentController.userPreference'),

  userProfiles: Ember.A(),

  /**
   * @property {boolean} roles is student or not for proficiency tabs view
   */
  isStudent: Ember.computed('userProfile', function() {
    let component = this;
    return component.get('userProfile').get('role') === 'student';
  }),

  init() {
    this._super(...arguments);
    this.fetchProfile();
  },

  fetchProfile() {
    const controller = this;
    controller
      .get('profileService')
      .consolidateProfile()
      .then(consolidateDetails => {
        let userDetails = Ember.A();
        if (consolidateDetails && consolidateDetails.length) {
          let currentUserDatas = consolidateDetails.filter(
            profile => profile.status === 'complete'
          );
          if (currentUserDatas && currentUserDatas.length) {
            controller.set('userProfiles', currentUserDatas);
          } else {
            userDetails.push(controller.get('userProfile'));
            controller.set('userProfiles', userDetails);
          }
        } else {
          userDetails.push(controller.get('userProfile'));
          controller.set('userProfiles', userDetails);
        }
      });
  },
  actions: {
    openPortfolioContainer(index) {
      if (event.type === 'keypress') {
        if (
          $(`.profile-portfolio-container #profile-${index}`).hasClass('in')
        ) {
          $(`.profile-portfolio-container #profile-${index}`).removeClass('in');
        } else {
          $(`.profile-portfolio-container #profile-${index}`).addClass('in');
          $(`.profile-portfolio-container #profile-${index}`).css(
            'height',
            'auto'
          );
        }
      }
    }
  }
});
