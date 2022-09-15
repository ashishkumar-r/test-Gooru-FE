import Ember from 'ember';

export default Ember.Controller.extend({
  // -------------------------------------------------------------------------
  queryParams: ['action', 'token'],

  profileService: Ember.inject.service('api-sdk/profile'),

  session: Ember.inject.service('session'),

  //confirm-profile-merge service
  ConfirmProfileMergeService: Ember.inject.service('confirm-profile-merge'),

  isShowLinkAccount: false,

  isConfirm: false,

  isReject: false,

  isLinkExpired: false,

  consolidateUserProfiles: null,

  // Events
  init: function() {
    const urlValue = new URL(window.location.href);

    const token = urlValue.searchParams.get('token');
    this.set('token', token);
    this.set('action', urlValue.searchParams.get('action'));
    const userId = this.get('session.userId');
    let promise = this.get('ConfirmProfileMergeService').authenticateWithToken(
      token
    );
    promise.then(response => {
      if (response.status === 401 || response === 401) {
        this.set('isLinkExpired', true);
      } else {
        if (userId !== response.user_id) {
          const queryParams = {
            queryParams: {
              redirectURL: urlValue,
              isConfirmProfile: true
            }
          };
          this.transitionToRoute('logout', queryParams);
        }
        this.set('isShowLinkAccount', true);
      }
    });
    this.fetchConsolidateProfile();
  },

  //Actions
  actions: {
    onConfirm: function() {
      this.get('ConfirmProfileMergeService')
        .getApproveMerge(this.get('token'))
        .then(() => {
          this.set('isShowLinkAccount', false);
          this.set('isConfirm', true);
        });
    },

    onReject: function(userId) {
      this.get('ConfirmProfileMergeService')
        .getRejectMerge(this.get('token'), userId)
        .then(() => {
          this.set('isShowLinkAccount', false);
          this.set('isReject', true);
        });
    },

    onClosePullup: function() {
      this.transitionToRoute('login');
    },

    linkAccount: function() {
      const userId = this.get('session.userId');
      this.transitionToRoute('profile.universal-learner', userId);
    }
  },

  fetchConsolidateProfile() {
    const controller = this;
    const userId = controller.get('session.userId');
    controller
      .get('profileService')
      .consolidateProfile()
      .then(consolidateDetails => {
        let currentUserData;
        if (consolidateDetails && consolidateDetails.length) {
          currentUserData = consolidateDetails.find(item => {
            return item.id === userId && item.status === 'requested';
          });
        }
        controller.set('consolidateUserProfiles', currentUserData);
      });
  }
});
