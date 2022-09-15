import Ember from 'ember';
import { PARSE_EVENTS } from 'gooru-web/config/parse-event';

export default Ember.Controller.extend({
  profileService: Ember.inject.service('api-sdk/profile'),

  session: Ember.inject.service('session'),

  parseEventService: Ember.inject.service('api-sdk/parse-event/parse-event'),

  isGuestAccount: Ember.computed.alias('session.isGuest'),

  searchResults: null,

  isShowSearchResults: false,

  isShowConfirmPullup: false,

  userEnteredValue: '',

  consolidateUserProfiles: null,

  isShowSearch: false,

  isLoading: false,

  isSelected: false,

  isShowCode: false,

  currentProfile: null,

  isShowEnterCode: false,

  isShowVerifyButton: null,

  notifications: Ember.inject.service(),

  isShowImpersonate: Ember.computed(function() {
    let impersonate;
    if (window.frameElement) {
      impersonate = window.parent.impersonate;
    }
    return impersonate;
  }),
  //--------------------------------------------------------------------------
  // Events

  init() {
    const controller = this;
    controller._super(...arguments);
  },

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    onStudentProfiles() {
      const controller = this;
      let text = this.get('userEnteredValue');
      if (text) {
        controller.set('isLoading', true);
        controller
          .get('profileService')
          .readUsersProfileByUsername(text)
          .then(studentDetail => {
            controller.set('isShowSearchResults', true);
            controller.set('isShowSearch', false);
            controller.set('isLoading', false);
            const userId = controller.get('session.userId');
            let studentDetails = studentDetail.filter(
              profile =>
                profile.id !== userId &&
                profile.get('universalProfileStatus') === null
            );
            controller.set('searchResults', studentDetails);
            controller
              .get('parseEventService')
              .postParseEvent(PARSE_EVENTS.IDENTIFY_MY_ACCOUNT);
          });
      }
    },

    onSearch(e) {
      const controller = this;
      controller.set('userEnteredValue', e.target.value);
      let keyCode =
        typeof event.which === 'number' ? event.which : event.keyCode;
      if (keyCode === 13) {
        controller.send('onStudentProfiles');
      }
    },

    onClearSearch() {
      const controller = this;
      controller.set('userEnteredValue', '');
      controller.set('searchResults', Ember.A());
    },

    onClickUserProfile(searchResult) {
      const controller = this;
      searchResult.set('isChecked', true);
      let selectedUser = controller
        .get('searchResults')
        .filterBy('isChecked')
        .mapBy('id');
      controller.set('isSelected', selectedUser && selectedUser.length);
    },

    onClickRemoveUserProfile(searchResult) {
      const controller = this;
      searchResult.set('isChecked', false);
      let selectedUser = controller
        .get('searchResults')
        .filterBy('isChecked')
        .mapBy('id');
      controller.set('isSelected', selectedUser && selectedUser.length);
    },

    onMergeUserProfile() {
      const controller = this;
      controller.set('isShowSearchResults', false);
      controller.set('isShowSearch', false);
      let selectedUser = controller
        .get('searchResults')
        .filterBy('isChecked')
        .mapBy('id');
      let user_ids = selectedUser;
      const warningMessage = controller.get('i18n').t('merged-warning-msg')
        .string;
      controller
        .get('profileService')
        .mergeUserProfile(user_ids)
        .then(() => {
          controller.set('isShowConfirmPullup', true);
          controller.fetchConsolidateProfile(false);
        })
        .catch(function(error) {
          if (error.status === 409) {
            controller.get('notifications').warning(warningMessage);
          }
        });
    },

    closeConfirmPullup() {
      this.set('isShowConfirmPullup', false);
      this.send('onClearSearch');
    },

    onResendMail(userId) {
      const controller = this;
      controller.get('profileService').resendEmail(userId);
    },

    onCancelRequest(userId) {
      const controller = this;
      controller
        .get('profileService')
        .cancelRequest(userId)
        .then(() => {
          controller.fetchConsolidateProfile(false);
        });
    },

    onViewCode(currentProfile) {
      const controller = this;
      controller.set('isShowCode', true);
      controller.set('currentProfile', currentProfile);
    },

    onDismissViewCode() {
      const controller = this;
      controller.set('isShowCode', false);
      controller.set('currentProfile', null);
    },

    clickEvent(first, last, currInput) {
      const val = document.getElementById(currInput).value;
      if (val) {
        document.getElementById(last).focus();
      }
      this.send('clickEvents');
    },

    clickEvents() {
      const first = document.getElementById('first').value;
      const second = document.getElementById('second').value;
      const third = document.getElementById('third').value;
      const fourth = document.getElementById('fourth').value;
      const fifth = document.getElementById('fifth').value;
      const sixth = document.getElementById('sixth').value;

      if (first && second && third && fourth && fifth && sixth) {
        this.set(
          'isShowVerifyButton',
          `${first}${second}${third}${fourth}${fifth}${sixth}`
        );
      } else {
        this.set('isShowVerifyButton', null);
      }
    },

    onShowSearch() {
      this.set('isShowSearch', true);
      this.get('parseEventService').postParseEvent(
        PARSE_EVENTS.ADD_LINKED_ACCOUNT
      );
    },

    onCloseSearch() {
      this.set('isShowSearch', false);
      this.send('onClearSearch');
    },

    onCloseSearchResult() {
      this.set('isShowSearch', true);
      this.set('isShowSearchResults', false);
      this.send('onClearSearch');
    },

    onEnterCode(currentProfile) {
      this.set('isShowEnterCode', true);
      this.set('currentProfile', currentProfile);
    },

    onVerifyCode() {
      const controller = this;
      const codes = controller.get('isShowVerifyButton');
      controller.set('isLoading', true);
      const warningMessage = controller.get('i18n').t('invalid-code').string;
      let queryParams = {
        mode: 'code',
        code: codes
      };
      controller
        .get('profileService')
        .verifyCode(queryParams)
        .then(() => {
          controller.fetchConsolidateProfile(false);
          controller.send('onCloseEnterCode');
        })
        .catch(function(error) {
          controller.set('isLoading', false);
          if (error.status === 400) {
            controller.get('notifications').warning(warningMessage);
          }
        });
    },

    onCloseEnterCode() {
      this.set('isShowEnterCode', false);
      this.set('currentProfile', null);
      this.set('isLoading', false);
    }
  },
  //--------------------------------------------------------------------------
  // Methods

  fetchConsolidateProfile(isInitialLoading) {
    const controller = this;
    const userId = controller.get('session.userId');
    controller
      .get('profileService')
      .consolidateProfile()
      .then(consolidateDetails => {
        if (consolidateDetails && consolidateDetails.length) {
          let currentUserDatas = consolidateDetails.find(item => {
            return (
              item.id === userId &&
              item.status === 'requested' &&
              item.mode === 'email'
            );
          });
          if (currentUserDatas) {
            consolidateDetails.removeObject(currentUserDatas);
          }

          let removeCurrentUserData = consolidateDetails.find(item => {
            return item.id === userId && item.status === 'complete';
          });
          if (removeCurrentUserData) {
            consolidateDetails.removeObject(removeCurrentUserData);
          }
        }

        let currentUserData;
        if (consolidateDetails && consolidateDetails.length === 1) {
          currentUserData = consolidateDetails.find(item => {
            return item.id === userId && item.status === 'complete';
          });
        }
        controller.set(
          'consolidateUserProfiles',
          currentUserData ? null : consolidateDetails.sortBy('status').reverse()
        );
        controller.set(
          'consolidateUserProfiles',
          consolidateDetails.sortBy('status').reverse()
        );
        if (isInitialLoading) {
          controller.currentUserProfile();
        }
      });
  },
  currentUserProfile() {
    const controller = this;
    const userId = controller.get('session.userId');
    controller
      .get('profileService')
      .readUserProfile(userId)
      .then(function(updatedProfile) {
        controller.set('profile', updatedProfile);
      });
  }
});
