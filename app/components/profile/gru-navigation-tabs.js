import Ember from 'ember';
import { getRoutePathFirstOccurrence } from 'gooru-web/utils/utils';
import {
  PROFILE_NAV_MENU_ITEMS,
  PROFILE_DROPDOWN
} from 'gooru-web/config/config';
import ConfigurationMixin from 'gooru-web/mixins/configuration';

export default Ember.Component.extend(ConfigurationMixin, {
  // -------------------------------------------------------------------------
  // Dependencies

  session: Ember.inject.service('session'),

  // -------------------------------------------------------------------------
  // Attributes

  classNames: ['profile gru-navigation-tabs'],

  // -------------------------------------------------------------------------
  // Actions
  actions: {
    /**
     *
     * Triggered when an menu item is selected
     * @param item
     */
    selectItem: function(item) {
      this.highlightMenuItem(item);
      if (this.get('onItemSelected')) {
        this.sendAction('onItemSelected', item);
      }
    },

    /**
     *
     * Triggered when the user clicks follow/unfollow button
     */
    toggleFollowingStatus: function() {
      if (this.get('onFollowChanged')) {
        this.sendAction('onFollowChanged');
      }
    }
  },
  // -------------------------------------------------------------------------
  // Events

  /**
   * DidInsertElement ember event
   */
  didInsertElement: function() {
    let component = this;
    let firstOccurancePath = getRoutePathFirstOccurrence();
    var item = PROFILE_NAV_MENU_ITEMS.includes(firstOccurancePath)
      ? firstOccurancePath
      : component.get('selectedMenuItem');
    component.highlightMenuItem(item);
  },

  // -------------------------------------------------------------------------
  // Properties

  /**
   * @property {String|Function} onItemSelected - event handler for when an menu item is selected
   */
  onItemSelected: null,

  /**
   * @property {String} selectedMenuItem - menu Item selected
   */

  selectedMenuItem: null,

  /**
   * @property {boolean} roles is student or not for proficiency tabs view
   */
  isStudent: Ember.computed('profile', function() {
    let component = this;
    return component.get('profile').get('role') === 'student';
  }),

  /**
   * @property {boolean} roles is student or not for proficiency tabs view
   */
  isProficiencyVisible: Ember.computed('profile', function() {
    let component = this;
    let isProficiencyTabVisible = false;
    let isMyProfile = component.get('isMyProfile');
    let isStudentProfile = component.get('isStudent');
    let loggedInUser = component.get('currentLoginUser');
    if (loggedInUser) {
      let isTeacher = loggedInUser.get('role') === 'teacher';
      let isStudent = loggedInUser.get('role') === 'student';
      if (
        isStudentProfile &&
        ((isTeacher && !isMyProfile) || (isStudent && isMyProfile))
      ) {
        isProficiencyTabVisible = true;
      }
    }
    return isProficiencyTabVisible;
  }),

  /**
   * @property {boolean} roles is teacher only view about and proficiency tabs
   */
  isShowTabs: Ember.computed('profile', function() {
    let component = this;
    let isTabsVisible = true;
    let isStudentProfile = component.get('isStudent');
    let isFromLearnerProfile = component.get('isFromLearnerProfile');
    let loggedInUser = component.get('currentLoginUser');
    let source = component.get('source');
    if (loggedInUser) {
      let isTeacher = loggedInUser.get('role') === 'teacher';
      if (
        (isStudentProfile && isTeacher && isFromLearnerProfile) ||
        source === 'study-player'
      ) {
        isTabsVisible = false;
      }
    }
    return isTabsVisible;
  }),

  /**
   * @property {boolean} isShowGuardianInvite is true only show the guardian tab
   */
  isShowGuardianInvite: Ember.computed.alias(
    'configuration.GRU_FEATURE_FLAG.isShowGuardianInvite'
  ),

  // -------------------------------------------------------------------------
  // Methods

  highlightMenuItem: function(item) {
    let text;
    if (item === 'about' && this.get('isMyProfile')) {
      text = PROFILE_DROPDOWN['about-me'];
    } else {
      text = PROFILE_DROPDOWN[item];
      if (!text) {
        text = PROFILE_DROPDOWN.profile;
      }
    }
    this.set('selectedMenuText', text);
    this.$('.profile-menu-item').removeClass('selected');
    this.$(`.profile-menu-item.${item}`).addClass('selected');
  }
});
